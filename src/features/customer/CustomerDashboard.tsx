import { useState } from 'react';
import { Profile, CustomerDetails, Order } from '../../types/database';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { db } from '../../store/MockDatabase';
import { Clock, ShieldCheck, Stethoscope } from 'lucide-react';

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
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

  const activeService = SERVICES.find((s) => s.id === selectedService);
  
  // Dynamic Price Calculation (with discount for longer duration)
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
      payment_status: 'pending',
      order_status: 'unassigned',
      created_at: new Date().toISOString(),
    };

    try {
      await db.createOrder(newOrder);
      setPendingOrder(newOrder);
      setShowPayment(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBooking(false);
    }
  };

  const handleSimulatePayment = async (status: 'paid' | 'failed') => {
    if (!pendingOrder) return;
    await db.updatePaymentStatus(pendingOrder.id, status);
    if (status === 'paid') {
      alert('Payment Successful! Your order has been placed.');
      setPendingOrder(null);
      setShowPayment(false);
      setSelectedService(null);
      setDurationMonths(1);
    } else {
      alert('Payment Failed. Please try again.');
    }
  };

  if (showPayment && pendingOrder) {
    return (
      <Card className="max-w-md mx-auto mt-8 border-primary-200">
        <CardHeader>
          <CardTitle className="text-xl text-center">Payment Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-sm text-slate-500">Amount to Pay</p>
            <p className="text-3xl font-bold text-slate-900">₹{pendingOrder.locked_price.toLocaleString()}</p>
          </div>
          
          <div className="space-y-3">
            <Button fullWidth onClick={() => handleSimulatePayment('paid')} className="bg-green-600 hover:bg-green-700">
              Simulate Successful Payment (UPI/Card)
            </Button>
            <Button fullWidth variant="outline" onClick={() => handleSimulatePayment('failed')} className="border-red-200 text-red-600 hover:bg-red-50">
              Simulate Failed Payment
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
        <h2 className="text-2xl font-bold text-slate-900">Book a Service or Device</h2>
        <p className="text-slate-500 mt-1">Select what you need and lock in your price.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => {
          const isSelected = selectedService === service.id;
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                isSelected 
                  ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 bg-primary-50 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-8 h-8 mb-4 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
              <h3 className="font-semibold text-slate-900">{service.title}</h3>
              <p className="text-sm text-slate-500 mt-1">From ₹{service.basePrice.toLocaleString()}/mo</p>
            </button>
          );
        })}
      </div>

      {selectedService && activeService && (
        <Card className="bg-gradient-to-br from-white to-slate-50 border-primary-100 shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  Select Duration
                </h3>
                <div className="flex flex-col gap-4">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>1 Month</span>
                    <span className="text-primary-600 font-bold bg-primary-100 px-3 py-1 rounded-full">
                      {durationMonths} Months
                    </span>
                    <span>12 Months</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Locked Total Price</p>
                    <p className="text-4xl font-bold text-slate-900 mt-1">
                      ₹{lockedPrice.toLocaleString()}
                    </p>
                  </div>
                  {durationMonths >= 3 && (
                    <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md mb-1">
                      {durationMonths >= 6 ? '15% OFF' : '10% OFF'}
                    </div>
                  )}
                </div>
                
                <Button 
                  fullWidth 
                  size="lg" 
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
}
