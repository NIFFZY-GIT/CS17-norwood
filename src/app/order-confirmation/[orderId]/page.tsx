// src/app/order-confirmation/[orderId]/page.tsx
'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, CheckCircle, AlertTriangle, Home } from 'lucide-react';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface ShippingDetails {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

interface Order {
    _id: string;
    totalAmount: number;
    status: string;
    shippingDetails: ShippingDetails;
    items: OrderItem[];
    createdAt: string;
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) {
                    // Try to get error message, but handle cases where response isn't JSON
                    let errorMessage = 'Failed to fetch order details.';
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch {
                        // If parsing fails, use the status text or default message
                        errorMessage = `HTTP ${res.status}: ${res.statusText || 'Failed to fetch order details.'}`;
                    }
                    throw new Error(errorMessage);
                }
                
                // Check if response has content before parsing
                const text = await res.text();
                if (!text) {
                    throw new Error('Empty response from server');
                }
                
                const data: Order = JSON.parse(text);
                setOrder(data);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white text-center p-4">
                <AlertTriangle className="text-red-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold mb-2">Error Loading Order</h1>
                <p className="text-gray-400 mb-6">{error}</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors">
                    <Home size={18} />
                    <span>Back to Shopping</span>
                </Link>
            </div>
        );
    }
    
    if (!order) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
                        <h1 className="text-3xl font-bold text-white">Thank you for your order!</h1>
                        <p className="text-gray-400 mt-2">
                            Your order has been placed successfully. A confirmation email has been sent to {order.shippingDetails.email}.
                        </p>
                    </div>

                    <div className="border-b border-t border-gray-700 py-4 text-sm text-gray-300 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div><strong className="block text-white">Order Number</strong> #{order._id.substring(0, 8)}</div>
                        <div><strong className="block text-white">Order Date</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                        <div><strong className="block text-white">Order Status</strong> <span className="capitalize bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs font-semibold">{order.status.toLowerCase()}</span></div>
                    </div>
                    
                    <div className="my-8">
                        <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
                        <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item.productId} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-700">
                                        <Image 
                                            src={item.image && item.image.startsWith('data:') ? item.image : '/placeholder-image.png'} 
                                            alt={item.name} 
                                            width={64} 
                                            height={64} 
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-image.png';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                           <h3 className="font-semibold mb-2">Shipping To</h3>
                           <address className="not-italic text-gray-300 text-sm leading-relaxed">
                                {order.shippingDetails.fullName}<br/>
                                {order.shippingDetails.address}<br/>
                                {order.shippingDetails.city}, {order.shippingDetails.postalCode}<br/>
                                {order.shippingDetails.country}
                           </address>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                {/* FIX: Ensured all span tags are correctly written as JSX tags */}
                                <div className="flex justify-between"><span className="text-gray-300">Subtotal</span><span>${order.totalAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-300">Shipping</span><span>Free</span></div>
                                <div className="border-t border-gray-700 my-2"></div>
                                <div className="flex justify-between font-bold text-base"><span className="text-white">Total</span><span>${order.totalAmount.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/Products" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors">
                            <Home size={18} />
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}