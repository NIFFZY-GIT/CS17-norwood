// src/app/dashboard/orders/page.tsx (or your correct path)
'use client';

import { useState, useEffect } from 'react';
import { AdminOrder } from '@/lib/types';
import { ShoppingCart, Loader2, PackageSearch } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import OrderTable from '@/components/dashboard/OrderTable';
import OrderDetailsModal from '@/components/dashboard/OrderDetailsModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    // ... (fetch logic remains the same)
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch orders');
        setOrders(await res.json());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleViewDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    // ... (delete logic remains the same)
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    const originalOrders = [...orders];
    setOrders(prev => prev.filter(o => o._id !== orderId));
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete order');
      toast.success('Order deleted successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
      setOrders(originalOrders);
    }
  };

  const handleOrderUpdated = (updatedOrder: AdminOrder) => {
    setOrders(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));
    setSelectedOrder(updatedOrder); // Keep modal updated with latest info
  };
  
  return (
    <>
      <Toaster position="top-right" richColors />
      <header className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/10 p-2 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-sky-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Customer Orders
          </h1>
        </div>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-sky-500" size={48} />
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <PackageSearch size={48} className="mx-auto text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No Orders Found</h2>
              <p className="text-slate-500 mt-2">When a customer places an order, it will appear here.</p>
            </div>
          ) : (
            <OrderTable 
              orders={orders}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </>
  );
}