// app/checkout/page.tsx
'use client';

// FIX: Import additional types from React
import { useEffect, useState, FormEvent, ChangeEvent, ElementType, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, ShoppingBag, User as UserIcon, Mail, Phone, Home } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface UserSessionData {
  userId: string;
  email: string;
}

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

// FIX: Define a proper interface for the FormInput props
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ElementType; // This type accepts any React component, perfect for icons
  error?: string; // error is optional
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sri Lanka',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const cartRes = await fetch('/api/cart');
        if (!cartRes.ok) {
          if (cartRes.status === 401) {
            toast.error("You must be logged in to checkout.");
            router.push('/login');
          } else {
            throw new Error('Failed to fetch cart items.');
          }
          return;
        }
        
        const cartData: CartItem[] = await cartRes.json();
        if (cartData.length === 0) {
          toast.info("Your cart is empty. Redirecting to products page.");
          router.push('/products');
          return;
        }
        setCartItems(cartData);
        calculateTotal(cartData);

        const sessionRes = await fetch('/api/session'); 
        if (sessionRes.ok) {
          const sessionData: UserSessionData = await sessionRes.json();
          setFormData(prev => ({ ...prev, email: sessionData.email || '' }));
        }

      } catch (err) {
        console.error('Checkout page fetch error:', err);
        toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

  const calculateTotal = (items: CartItem[]) => {
    const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Placing your order...");

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingDetails: formData,
          cartItems: cartItems,
        }),
      });

      const result = await res.json();
      toast.dismiss();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to place order.');
      }

      toast.success("Order placed successfully! Redirecting...");
      router.push(`/order-confirmation/${result.orderId}`);

    } catch (error) {
      toast.dismiss();
      console.error('Order submission error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  // FIX: The component is now strongly typed with FormInputProps instead of any
  const FormInput = ({ id, label, icon: Icon, error, ...props }: FormInputProps) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          id={id}
          className={`w-full bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Secure Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-gray-800 p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3"><UserIcon size={24} />Shipping Information</h2>
            <div className="space-y-5">
              <FormInput id="fullName" name="fullName" type="text" label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} error={errors.fullName} icon={UserIcon} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput id="email" name="email" type="email" label="Email Address" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} error={errors.email} icon={Mail} />
                <FormInput id="phone" name="phone" type="tel" label="Phone Number" placeholder="+94 12 345 6789" value={formData.phone} onChange={handleInputChange} error={errors.phone} icon={Phone} />
              </div>
              <FormInput id="address" name="address" type="text" label="Street Address" placeholder="123 Galle Road" value={formData.address} onChange={handleInputChange} error={errors.address} icon={Home} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput id="city" name="city" type="text" label="City" placeholder="Colombo" value={formData.city} onChange={handleInputChange} error={errors.city} icon={Home} />
                <FormInput id="postalCode" name="postalCode" type="text" label="Postal Code" placeholder="00500" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} icon={Home} />
                <FormInput id="country" name="country" type="text" label="Country" value={formData.country} onChange={handleInputChange} error={errors.country} icon={Home} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3"><ShoppingBag size={22} />Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4 divide-y divide-gray-700">
                {cartItems.map(item => (
                  <div key={item._id} className="flex items-center gap-4 pt-3">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-300"><span>Shipping</span><span className="text-green-400">Free</span></div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting || total === 0}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
                <span>{isSubmitting ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}</span>
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}