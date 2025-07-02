// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, X, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

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
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  //const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      
      try {
        const res = await fetch('/api/cart');
        
        // Successful response (200-299)
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
          calculateTotal(data);
          return;
        }
        
        // Unauthorized (401) - not logged in
        if (res.status === 401) {
          setCartItems([]);
          return;
        }
        
        // Other error statuses
        // const errorData = await res.json();
        //throw new Error(errorData.error || 'Failed to fetch cart');
        
      } catch (err) {
        console.error('Cart fetch error:', err);
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
  if (newQuantity < 1) return;
  
  try {
    const res = await fetch(`/api/cart?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update quantity');
    }
    
    const updatedCart = cartItems.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    toast.success('Quantity updated');
  } catch (error) {
    console.error('Update quantity error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
  }
};

const removeItem = async (id: string) => {
  try {
    const res = await fetch(`/api/cart?id=${id}`, {
      method: 'DELETE',
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to remove item');
    }
    
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    toast.success('Item removed from cart');
  } catch (error) {
    console.error('Remove item error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to remove item');
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
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ShoppingCart size={28} />
          Your Cart
        </h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Start shopping to add items to your cart</p>
            <Link 
              href="/products" 
              className="inline-block bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg divide-y divide-gray-700">
                {cartItems.map((item) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <p className="text-amber-400 font-bold my-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600"
                        >
                          -
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors mt-6">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  
}