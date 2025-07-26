// src/components/dashboard/OrderDetailsModal.tsx (Complete and Corrected)
import { useState } from 'react';
import { AdminOrder } from '@/lib/types';
// FIX: Import the missing Phone and Home icons
import { X, Loader2, User, Mail, Phone, Home, Copy } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

type OrderDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder;
  onOrderUpdated: (updatedOrder: AdminOrder) => void;
};

// A small reusable component for info sections
const InfoSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">{title}</h3>
        {children}
    </div>
);

const ORDER_STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function OrderDetailsModal({ isOpen, onClose, order, onOrderUpdated }: OrderDetailsModalProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleStatusUpdate = async () => {
    if (currentStatus === order.status) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to update status");
      toast.success("Order status updated!");
      onOrderUpdated({ ...order, status: currentStatus });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Full Order ID copied!');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-start z-50 p-4 pt-16 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col mb-8">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Order Details</h2>
            <button onClick={() => handleCopy(order._id)} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-mono mt-1">
              {order._id} <Copy size={12} />
            </button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow bg-slate-50 dark:bg-slate-800/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <InfoSection title="Items Ordered">
                <ul className="space-y-4">
                  {order.items.map(item => (
                    <li key={item.productId} className="flex items-center gap-4 text-sm">
                      <Image src={item.image || '/placeholder-image.png'} alt={item.name} width={56} height={56} className="rounded-md object-cover bg-slate-200 flex-shrink-0"/>
                      <div className="flex-grow">
                        <p className="font-semibold text-slate-800 dark:text-white">{item.name}</p>
                        <p className="text-slate-500 dark:text-slate-400">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </InfoSection>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InfoSection title="Order Summary">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Subtotal</span> <span>${order.totalAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Shipping</span> <span>Free</span></div>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                  <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white"><span>Total</span> <span>${order.totalAmount.toFixed(2)}</span></div>
                </div>
              </InfoSection>

              <InfoSection title="Customer & Shipping Details">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400 flex-shrink-0" /> 
                    <span className="text-slate-700 dark:text-slate-200">{order.shippingDetails.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400 flex-shrink-0" /> 
                    <span className="text-slate-700 dark:text-slate-200">{order.shippingDetails.email}</span>
                  </div>
                  {/* FIX: Uncommented this line to show the phone number */}
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400 flex-shrink-0" /> 
                    <span className="text-slate-700 dark:text-slate-200">{order.shippingDetails.phone || 'N/A'}</span>
                  </div>
                  {/* FIX: Uncommented this section to show the full address */}
                  <div className="flex items-start gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
                    <Home size={16} className="text-slate-400 mt-0.5 flex-shrink-0" /> 
                    <address className="not-italic text-slate-700 dark:text-slate-200 leading-snug">
                      {order.shippingDetails.address || 'N/A'}<br/>
                      {order.shippingDetails.city}, {order.shippingDetails.postalCode}<br/>
                      {order.shippingDetails.country}
                    </address>
                  </div>
                </div>
              </InfoSection>
            </div>
          </div>
        </main>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
           <div className="flex items-center gap-2">
            <label htmlFor="status" className="font-semibold text-slate-700 dark:text-slate-300">Update Status:</label>
            <select
              id="status"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as AdminOrder['status'])}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating || currentStatus === order.status}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center w-full sm:w-auto transition-all duration-200 ease-in-out disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isUpdating ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
          </button>
        </footer>
      </div>
    </div>
  );
}