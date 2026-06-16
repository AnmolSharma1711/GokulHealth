import { useState, useEffect } from 'react';
import { useRazorpay } from "react-razorpay";
import { Profile, CustomerDetails, Order } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { db } from '../../store/MockDatabase';
import { Clock, ShieldCheck, Stethoscope, Home, ClipboardList } from 'lucide-react';

interface Props {
  user: Profile;
  details: CustomerDetails;
}

const SERVICES = [
  { id: 'nurse_12h', title: 'Nursing Staff (12 hours)', basePrice: 15000, icon: Stethoscope },
  { id: 'nurse_24h', title: 'Nursing Staff (24 hours)', basePrice: 28000, icon: Stethoscope },
  { id: 'physiotherapy', title: 'Physiotherapist', basePrice: 12000, icon: Stethoscope },
  { id: 'o2_concentrator', title: 'Oxygen Concentrator', basePrice: 4500, icon: ShieldCheck },
  { id: 'hospital_bed', title: 'Hospital Bed (Motorized)', basePrice: 6000, icon: ShieldCheck },
];

export function CustomerDashboard({ user }: Props) {
  const [currentTab, setCurrentTab] = useState<'book' | 'orders'>('book');
  const { Razorpay } = useRazorpay();
  
  // Booking State
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  // Orders State
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  const fetchMyOrders = async () => {
    const orders = await db.getOrdersByCustomer(user.id);
    setMyOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  useEffect(() => {
    if (currentTab === 'orders') {
      fetchMyOrders();
      const interval = setInterval(fetchMyOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [currentTab, user.id]);

  const activeService = SERVICES.find((s) => s.id === selectedService);
  
  const calculatePrice = () => {
    if (!activeService) return 0;
    const baseTotal = activeService.basePrice * durationMonths;
    const discount = durationMonths >= 6 ? 0.15 : durationMonths >= 3 ? 0.10 : 0;
    return Math.round(baseTotal * (1 - discount));
  };

  const lockedPrice = calculatePrice();

  const handleCreateOrder = async () => {
    if (!activeService) return;
    setIsBooking(true);
    
    const newOrder: Order = {
      id: crypto.randomUUID(),
      customer_id: user.id,
      employee_id: null,
      service_device_type: activeService.title,
      duration_months: durationMonths,
      locked_price: lockedPrice,
      payment_status: 'paid', // We'll save it as paid only after Razorpay succeeds
      order_status: 'unassigned',
      created_at: new Date().toISOString(),
    };

    setPendingOrder(newOrder);
    setShowPayment(true);
    setIsBooking(false);
  };

  const handleRazorpayPayment = () => {
    if (!pendingOrder) return;
    
    const options = {
      key: "rzp_test_T2DKoMwVosyxaj", // User provided test key
      amount: (pendingOrder.locked_price * 100).toString(), // amount in paise
      currency: "INR",
      name: "JanSahayak",
      description: `Payment for ${pendingOrder.service_device_type}`,
      handler: async (response: any) => {
        // Payment successful - Now we create the order in DB
        await db.createOrder(pendingOrder);
        
        // Trigger push notification to customer
        await db.createNotification(
          "Payment Received ✅",
          `Your payment of ₹${pendingOrder.locked_price.toLocaleString()} was successful. Your order is placed!`,
          'customer',
          user.id
        );
        
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        setPendingOrder(null);
        setShowPayment(false);
        setSelectedService(null);
        setDurationMonths(1);
        setCurrentTab('orders');
        fetchMyOrders();
      },
      prefill: {
        name: user.name || "Customer",
        contact: user.phone_number || "",
      },
      theme: {
        color: "#4f46e5",
      },
    };

    const rzp = new Razorpay(options as any);
    
    rzp.on("payment.failed", function (response: any) {
      alert(`Payment Failed: ${response.error.description}`);
    });
    
    rzp.open();
  };

  const renderBookingTab = () => {
    if (showPayment && pendingOrder) {
      return (
        <Card className="max-w-md mx-auto mt-8 border-primary-200">
          <CardHeader>
            <CardTitle className="text-xl text-center">Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-sm text-slate-500">Amount to Pay</p>
              <p className="text-3xl font-bold text-slate-900">₹{pendingOrder.locked_price.toLocaleString()}</p>
            </div>
            
            <div className="space-y-3">
              <Button fullWidth onClick={handleRazorpayPayment} className="bg-indigo-600 hover:bg-indigo-700">
                Pay Securely with Razorpay
              </Button>
              <Button fullWidth variant="ghost" onClick={() => setShowPayment(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Book a Service or Device</h2>
          <p className="text-sm text-slate-500 mt-1">Select what you need and lock in your price.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SERVICES.map((service) => {
            const isSelected = selectedService === service.id;
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col items-start ${
                  isSelected 
                    ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 bg-primary-50 shadow-md' 
                    : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                <h3 className="font-semibold text-sm text-slate-900 leading-tight">{service.title}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">₹{service.basePrice.toLocaleString()}/mo</p>
              </button>
            );
          })}
        </div>

        {selectedService && activeService && (
          <Card className="bg-gradient-to-br from-white to-slate-50 border-primary-100 shadow-sm rounded-xl overflow-hidden mt-4">
            <CardContent className="p-5">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    Select Duration
                  </h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                      className="w-full accent-primary-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>1 Mo</span>
                      <span className="text-primary-600 font-bold bg-primary-100 px-2.5 py-0.5 rounded-full">
                        {durationMonths} Months
                      </span>
                      <span>12 Mo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Locked Price</p>
                      <p className="text-2xl font-bold text-slate-900 leading-none">
                        ₹{lockedPrice.toLocaleString()}
                      </p>
                    </div>
                    {durationMonths >= 3 && (
                      <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md">
                        {durationMonths >= 6 ? '15% OFF' : '10% OFF'}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    fullWidth 
                    size="md" 
                    onClick={handleCreateOrder}
                    disabled={isBooking}
                  >
                    {isBooking ? 'Processing...' : 'Lock Price & Pay'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderOrdersTab = () => {
    if (myOrders.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No active orders</h3>
          <p className="text-slate-500 max-w-md mx-auto">You haven't booked any services or devices yet. Head over to the Book tab to get started.</p>
          <Button className="mt-6" onClick={() => setCurrentTab('book')}>Book a Service</Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Orders</h2>
          <p className="text-slate-500 mt-1">Track the status of your requested services.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {myOrders.map(order => {
            const isCompleted = order.order_status === 'completed';
            const isAssigned = order.order_status === 'assigned' || isCompleted;

            return (
              <Card key={order.id} className={`border-l-4 ${isCompleted ? 'border-l-green-500' : isAssigned ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">{order.service_device_type}</h3>
                      <p className="text-sm text-slate-500">Duration: {order.duration_months} Months • Total: ₹{order.locked_price.toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      isCompleted ? 'bg-green-100 text-green-700' : 
                      isAssigned ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="relative pt-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
                    <div 
                      className={`absolute top-1/2 left-0 h-1 transition-all duration-500 -translate-y-1/2 z-0 rounded-full ${isCompleted ? 'w-full bg-green-500' : isAssigned ? 'w-1/2 bg-blue-500' : 'w-0'}`} 
                    />
                    
                    <div className="relative z-10 flex justify-between">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${'bg-primary-600 text-white'}`}>
                          1
                        </div>
                        <span className="text-xs font-semibold mt-2 text-slate-700">Requested</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-500 ${isAssigned ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          2
                        </div>
                        <span className={`text-xs font-semibold mt-2 ${isAssigned ? 'text-slate-700' : 'text-slate-400'}`}>Assigned</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-500 ${isCompleted ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          3
                        </div>
                        <span className={`text-xs font-semibold mt-2 ${isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>Completed</span>
                      </div>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24">
      {currentTab === 'book' ? renderBookingTab() : renderOrdersTab()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 pb-safe">
        <button 
          onClick={() => setCurrentTab('book')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'book' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Book</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('orders')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'orders' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="relative">
            <ClipboardList className="w-6 h-6" />
            {myOrders.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
          </div>
          <span className="text-xs font-medium">My Orders</span>
        </button>
      </div>
    </div>
  );
}
