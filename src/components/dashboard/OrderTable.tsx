// src/components/dashboard/OrderTable.tsx
import { AdminOrder } from '@/lib/types';
import { Eye, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

type Status = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// A more visually distinct color palette for statuses
const statusColors: Record<Status, string> = {
  PENDING: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  SHIPPED: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DELIVERED: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400',
  CANCELLED: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400',
};

const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColors[status]}`}>
    {status}
  </span>
);

type OrderTableProps = {
  orders: AdminOrder[];
  onViewDetails: (order: AdminOrder) => void;
  onDelete: (orderId: string) => void;
};

export default function OrderTable({ orders, onViewDetails, onDelete }: OrderTableProps) {
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Order ID copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCopy(order._id)}
                    title="Click to copy full Order ID"
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    <span className="font-mono">#{order._id.substring(0, 8)}</span>
                    <Copy size={14} className="opacity-50" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="font-medium text-slate-900 dark:text-white">{order.shippingDetails.fullName}</div>
                  <div className="text-slate-500 dark:text-slate-400">{order.customer?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm"><StatusBadge status={order.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onViewDetails(order)} title="View Details" className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 mr-4 p-1">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => onDelete(order._id)} title="Delete Order" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}