// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, X, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
          calculateTotal(data);
          return;
        }
        if (res.status === 401) {
          setCartItems([]);
          calculateTotal([]);
          return;
        }
        throw new Error("Failed to load cart.");

      } catch (err) {
        console.error('Cart fetch error:', err);
        toast.error(err instanceof Error ? err.message : "Could not load your cart.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  const calculateTotal = (items: CartItem[]) => {
    const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // If quantity is reduced to 0, treat it as a removal
      removeItem(id);
      return; // FIX: Added a return statement to stop execution here
    };
    
    const originalCart = [...cartItems];
    const updatedCart = cartItems.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    
    try {
      const res = await fetch(`/api/cart?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update quantity');
      toast.success('Quantity updated');

    } catch (error) {
      console.error('Update quantity error:', error);
      // The socket error will be caught here. The message is a strong indicator
      // of an external issue (browser extension, firewall).
      toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
      setCartItems(originalCart);
      calculateTotal(originalCart);
    }
  };

  const removeItem = async (id: string) => {
    const originalCart = [...cartItems];
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    toast.success('Item removed from cart');
    
    try {
      const res = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove item');
      
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
      setCartItems(originalCart);
      calculateTotal(originalCart);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 flex items-center gap-2"
        >
          <ShoppingCart size={28} />
          Your Cart
        </motion.h1>
        
        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-gray-800 p-10 rounded-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link 
              href="/products" 
              className="inline-block bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg divide-y divide-gray-700 shadow-lg">
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                      <Image
                        src={item.image} 
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <p className="text-amber-400 font-bold my-1 text-base">
                        ${item.price.toFixed(2)}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-auto">
                        <label htmlFor={`quantity-${item._id}`} className="text-sm text-gray-400">Quantity:</label>
                        <div className="flex items-center">
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-l-md hover:bg-gray-600 transition-colors"
                            >
                              -
                            </button>
                            <span id={`quantity-${item._id}`} className="w-10 h-8 flex items-center justify-center bg-gray-900/50 font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-r-md hover:bg-gray-600 transition-colors"
                            >
                              +
                            </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-lg p-6 sticky top-6 shadow-lg"
              >
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <Link href="/checkout" legacyBehavior>
                    <a className="w-full block text-center bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors mt-6">
                      Proceed to Checkout
                    </a>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}