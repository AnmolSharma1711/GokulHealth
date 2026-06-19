import { useState, useEffect } from 'react';
import { Profile, CustomerDetails, Order, Service } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { db } from '../../store/MockDatabase';
import { Clock, ShieldCheck, Stethoscope, Home, ClipboardList, Zap, User, PhoneCall } from 'lucide-react';
import { ProfileEditor } from '../../components/common/ProfileEditor';

interface Props {
  user: Profile;
  details: CustomerDetails;
}



export function CustomerDashboard({ user }: Props) {
  const [currentTab, setCurrentTab] = useState<'book' | 'orders' | 'profile'>('book');
  
  // Booking State
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timeEachDay, setTimeEachDay] = useState<string>('Morning');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [serviceDetails, setServiceDetails] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<Record<string, Profile>>({});
  const [services, setServices] = useState<Service[]>([]);

  const loadServices = async () => {
    const data = await db.getServices();
    setServices(data);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const formatDuration = (start?: string, end?: string, fallbackMonths?: number) => {
    if (!start || !end) return `${fallbackMonths || 1} Month(s)`;
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 1) return '1 Day';
    if (diffDays < 30) return `${diffDays} Days`;
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    if (remainingDays === 0) return `${months} Month${months > 1 ? 's' : ''}`;
    return `${months} Month${months > 1 ? 's' : ''} ${remainingDays} Day${remainingDays > 1 ? 's' : ''}`;
  };

  const fetchMyOrders = async () => {
    const orders = await db.getOrdersByCustomer(user.id);
    setMyOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    
    const empIds = [...new Set(orders.map(o => o.employee_id).filter(Boolean))] as string[];
    if (empIds.length > 0) {
      const emps = await Promise.all(empIds.map(id => db.getProfileById(id)));
      const empMap: Record<string, Profile> = {};
      emps.forEach(emp => {
        if (emp) empMap[emp.id] = emp;
      });
      setAssignedEmployees(empMap);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await db.cancelOrder(orderId, user.id);
        fetchMyOrders();
      } catch (err: any) {
        alert("Failed to cancel: " + err.message);
      }
    }
  };

  useEffect(() => {
    if (currentTab === 'orders') {
      fetchMyOrders();
      const interval = setInterval(fetchMyOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [currentTab, user.id]);

  const activeService = services.find((s) => s.id === selectedService);
  
  const calculatePrice = () => {
    if (!activeService || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let baseTotal = 0;
    if (activeService.pricing_type === 'hourly') {
      const hoursPerDay = timeEachDay === '24 Hours' ? 24 : 12;
      baseTotal = activeService.price * hoursPerDay * diffDays;
    } else if (activeService.pricing_type === 'monthly') {
      const dailyRate = activeService.price / 30;
      baseTotal = dailyRate * diffDays;
    } else {
      // default daily
      baseTotal = activeService.price * diffDays;
    }
    
    const discount = diffDays >= 180 ? 0.15 : diffDays >= 90 ? 0.10 : 0;
    return Math.round(baseTotal * (1 - discount));
  };

  const lockedPrice = calculatePrice();

  const handleCreateOrder = async () => {
    if (!activeService) return;
    setIsBooking(true);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = end >= start ? Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      customer_id: user.id,
      employee_id: null,
      service_device_type: activeService.title,
      duration_months: Math.ceil(diffDays / 30) || 1,
      start_date: startDate,
      end_date: endDate,
      time_each_day: timeEachDay,
      patient_age: Number(patientAge) || 0,
      service_details: serviceDetails,
      locked_price: lockedPrice,
      payment_status: 'paid', // We'll save it as paid only after Razorpay succeeds
      order_status: 'unassigned',
      created_at: new Date().toISOString(),
    };

    setPendingOrder(newOrder);
    setShowPayment(true);
    setIsBooking(false);
  };

  const handleSuccessPayment = async (paymentId: string) => {
    if (!pendingOrder) return;
    await db.createOrder(pendingOrder);
    await db.createNotification(
      "Payment Received ✅",
      `Your payment of ₹${pendingOrder.locked_price.toLocaleString()} was successful. Your order is placed!`,
      'customer',
      user.id
    );
    alert(`Payment Successful! Payment ID: ${paymentId}`);
    setPendingOrder(null);
    setShowPayment(false);
    setSelectedService(null);
    setStartDate('');
    setEndDate('');
    setTimeEachDay('Morning');
    setPatientAge('');
    setServiceDetails('');
    setCurrentTab('orders');
    fetchMyOrders();
  };

  const handleRazorpayPayment = () => {
    if (!pendingOrder) return;
    const options = {
      key: "rzp_test_T30W1pnw6sZpM8",
      amount: Math.round(pendingOrder.locked_price * 100).toString(),
      currency: "INR",
      name: "JanSahayak",
      description: `Payment for ${pendingOrder.service_device_type}`,
      handler: async (response: any) => {
        handleSuccessPayment(response.razorpay_payment_id);
      },
      prefill: {
        name: user.name || "Customer",
        contact: user.phone_number || "",
      },
      theme: { color: "#4f46e5" },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      alert(`Failed to initialize Razorpay: ${err?.message || err}`);
      console.error('Razorpay Error:', err);
    }
  };

  const renderBookingTab = () => {
    if (showPayment && pendingOrder) {
      return (
        <Card className="glass-card max-w-md mx-auto mt-8 border-primary-200 animate-fade-in-up">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-primary-100 rounded-t-xl">
            <CardTitle className="text-xl text-center text-primary-900">Complete Your Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm text-center">
              <p className="text-sm text-slate-500 font-medium">Amount to Pay</p>
              <p className="text-4xl font-black text-slate-900 mt-2 text-gradient">₹{pendingOrder.locked_price.toLocaleString()}</p>
            </div>
            
            <div className="space-y-3">
              <Button fullWidth onClick={handleRazorpayPayment} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 py-6 text-lg">
                Pay Securely with Razorpay
              </Button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <Button 
                fullWidth 
                variant="outline" 
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 py-6 text-lg group"
                onClick={() => handleSuccessPayment("TEST_BYPASS_" + Math.random().toString(36).substring(2, 10).toUpperCase())}
              >
                <Zap className="w-5 h-5 mr-2 group-hover:text-emerald-500 transition-colors" />
                Simulate Payment (Test Mode)
              </Button>

              <Button fullWidth variant="ghost" onClick={() => setShowPayment(false)} className="mt-2">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="glass p-6 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="relative">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Book a Service</h2>
            <p className="text-slate-500 dark:text-slate-300 mt-2 text-lg">Select what you need and lock in your guaranteed price.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {services.map((service) => {
            const isSelected = selectedService === service.id;
            let Icon = Stethoscope;
            if (service.icon === 'ShieldCheck') Icon = ShieldCheck;
            
            return (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left w-full ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md ring-2 ring-primary-500/50' 
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${isSelected ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight break-words">{service.title}</h3>
                  </div>
                </div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 sm:text-right mt-1 sm:mt-0 ml-[60px] sm:ml-0 flex-shrink-0">
                  ₹{service.price.toLocaleString()}
                  <span className="text-sm font-bold text-slate-400 lowercase ml-1">/{service.pricing_type === 'daily' ? 'day' : service.pricing_type === 'hourly' ? 'hour' : service.pricing_type === 'monthly' ? 'month' : service.pricing_type}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedService && activeService && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card dark:glass-dark border-primary-100 dark:border-primary-500/30 rounded-3xl relative shadow-2xl animate-fade-in-up">
              <button 
                onClick={() => setSelectedService(null)} 
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
              >
                ✕
              </button>
              <CardContent className="p-1">
                <div className="grid md:grid-cols-2 gap-0 bg-gradient-to-br from-white/60 dark:from-slate-800/40 to-slate-50/60 dark:to-slate-900/40 rounded-3xl overflow-hidden">
                <div className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    Service Details
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                        <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value > endDate) {
                            setEndDate(e.target.value);
                          }
                        }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                        <input type="date" value={endDate} min={startDate || new Date().toISOString().split('T')[0]} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Shift Timing</label>
                        <select value={timeEachDay} onChange={e => setTimeEachDay(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="24 Hours">24 Hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Patient Age</label>
                        <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value ? parseInt(e.target.value) : '')} placeholder="e.g. 65" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Additional Requirements</label>
                      <textarea value={serviceDetails} onChange={e => setServiceDetails(e.target.value)} placeholder="Type of service needed, medical conditions..." className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-20 resize-none"></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-600 text-white p-8 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"></div>
                  
                  <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                      <p className="text-primary-100 font-medium mb-1">Locked Price</p>
                      <p className="text-4xl font-black tracking-tight">
                        ₹{lockedPrice.toLocaleString()}
                      </p>
                    </div>
                    {startDate && endDate && (() => {
                      const days = Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      if (days >= 90) {
                        return (
                          <div className="bg-emerald-400 text-emerald-950 text-xs font-black px-3 py-1.5 rounded-lg shadow-lg transform rotate-3">
                            {days >= 180 ? '15% OFF' : '10% OFF'}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleCreateOrder}
                    disabled={isBooking || !startDate || !endDate || lockedPrice <= 0}
                    className="bg-white text-primary-700 hover:bg-slate-50 shadow-xl shadow-black/10 py-6 text-lg relative z-10 disabled:opacity-50"
                  >
                    {isBooking ? 'Processing...' : 'Lock Price & Pay'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    );
  };

  const renderOrdersTab = () => {
    if (myOrders.length === 0) {
      return (
        <div className="text-center py-24 glass rounded-3xl animate-fade-in-up">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ClipboardList className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">No active orders</h3>
          <p className="text-slate-500 max-w-md mx-auto text-lg">You haven't booked any services or devices yet. Head over to the Book tab to get started.</p>
          <Button size="lg" className="mt-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20" onClick={() => setCurrentTab('book')}>Book a Service</Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="glass p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h2>
          <p className="text-slate-500 mt-2 text-lg">Track the real-time status of your requested services.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {myOrders.map(order => {
            const isCancelled = order.order_status === 'cancelled' || (order.service_details && order.service_details.startsWith('[CANCELLED]'));
            const isCompleted = order.order_status === 'completed' && !isCancelled;
            const isAssigned = order.order_status === 'assigned' || isCompleted;

            return (
              <Card key={order.id} className={`glass-card overflow-hidden border-l-4 ${isCancelled ? 'border-l-red-500' : isCompleted ? 'border-l-emerald-500' : isAssigned ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h3 className="font-bold text-2xl text-slate-900 tracking-tight">{order.service_device_type}</h3>
                      <p className="text-slate-500 mt-1 font-medium">Duration: {formatDuration(order.start_date, order.end_date, order.duration_months)} • Total: <span className="text-slate-900 font-bold">₹{order.locked_price.toLocaleString()}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                        isCancelled ? 'bg-red-100 text-red-700' : 
                        isCompleted ? 'bg-emerald-100 text-emerald-700' : 
                        isAssigned ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {isCancelled ? 'cancelled' : order.order_status}
                      </span>
                      {isAssigned && order.employee_id && assignedEmployees[order.employee_id] && (
                        <div className="flex items-center gap-3 mt-2 bg-slate-50 border border-slate-100 p-2 pr-4 rounded-full">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                            <img 
                              src={assignedEmployees[order.employee_id].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedEmployees[order.employee_id].name || 'Employee')}&background=e0e7ff&color=4f46e5&size=128&bold=true`} 
                              alt="Employee" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {assignedEmployees[order.employee_id].name}
                          </span>
                          <a href={`tel:${assignedEmployees[order.employee_id].phone_number}`} className="flex items-center justify-center bg-indigo-100 text-indigo-700 hover:bg-indigo-200 p-1.5 rounded-full transition-colors ml-2">
                            <PhoneCall className="w-3 h-3" />
                          </a>
                          <span className="text-xs font-bold text-slate-500 ml-1">
                            {assignedEmployees[order.employee_id].phone_number}
                          </span>
                        </div>
                      )}
                      {!isCompleted && !isCancelled && (
                        <Button variant="outline" className="mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full md:w-auto" onClick={() => handleCancelOrder(order.id)}>
                          Cancel Appointment
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="relative pt-6 pb-2">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isCancelled ? 'w-full bg-red-500' : isCompleted ? 'w-full bg-emerald-500' : isAssigned ? 'w-1/2 bg-blue-500' : 'w-0'}`} 
                      />
                    </div>
                    
                    <div className="relative z-10 flex justify-between px-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-md transition-all duration-300 ${'bg-indigo-600 text-white ring-4 ring-indigo-50'}`}>
                          1
                        </div>
                        <span className="text-xs font-bold mt-3 text-slate-800 uppercase tracking-wide">Requested</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-md transition-all duration-500 ${isAssigned ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                          2
                        </div>
                        <span className={`text-xs font-bold mt-3 uppercase tracking-wide transition-colors ${isAssigned ? 'text-slate-800' : 'text-slate-400'}`}>Assigned</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-md transition-all duration-500 ${isCancelled ? 'bg-red-600 text-white ring-4 ring-red-50' : isCompleted ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                          3
                        </div>
                        <span className={`text-xs font-bold mt-3 uppercase tracking-wide transition-colors ${isCancelled ? 'text-red-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                          {isCancelled ? 'Cancelled' : 'Completed'}
                        </span>
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

  const renderContent = () => {
    if (currentTab === 'profile') {
      return <ProfileEditor profile={user} />;
    }
    if (currentTab === 'book') return renderBookingTab();
    return renderOrdersTab();
  };

  return (
    <div className="space-y-8 pb-28">
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/50 dark:border-slate-800 px-6 pt-4 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-black/20 rounded-t-3xl transition-colors duration-300">
        <button 
          onClick={() => setCurrentTab('book')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${currentTab === 'book' ? 'text-primary-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${currentTab === 'book' ? 'bg-primary-50' : ''}`}>
            <Home className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Services</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('orders')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${currentTab === 'orders' ? 'text-primary-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`relative p-2 rounded-xl ${currentTab === 'orders' ? 'bg-primary-50' : ''}`}>
            <ClipboardList className="w-6 h-6" />
            {myOrders.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">My Orders</span>
        </button>

        <button 
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${currentTab === 'profile' ? 'text-primary-600 transform -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${currentTab === 'profile' ? 'bg-primary-50' : ''}`}>
            <User className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  );
}
