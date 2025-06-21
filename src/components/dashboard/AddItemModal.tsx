'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { X, ImagePlus, Loader2, ScanLine, DollarSign, FolderKanban } from 'lucide-react';
import { Item } from '@/lib/types';
import NextImage from 'next/image';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSaved: (savedItem: Item, isEditing: boolean) => void;
  editingItem?: Item | null;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function AddItemModal({ isOpen, onClose, onItemSaved, editingItem }: AddItemModalProps) {
  // State for all fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Item['currency']>('LKR');
  const [inStock, setInStock] = useState(true);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editingItem;

  // Effect to populate or reset form
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingItem) {
        setName(editingItem.name);
        setDescription(editingItem.description);
        setItemCode(editingItem.itemCode ?? '');
        setCategory(editingItem.category);
        setImageBase64(editingItem.imageBase64);
        setImagePreview(editingItem.imageBase64);
        setPrice(editingItem.price);
        setCurrency(editingItem.currency);
        setInStock(editingItem.inStock);
        setOriginalPrice(editingItem.originalPrice || '');
      } else {
        setName('');
        setDescription('');
        setItemCode('');
        setCategory('');
        setImageBase64(undefined);
        setImagePreview(undefined);
        setPrice('');
        setCurrency('LKR');
        setInStock(true);
        setOriginalPrice('');
      }
      setError('');
      const fileInput = document.getElementById('itemImageFile') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    }
  }, [isOpen, editingItem, isEditing]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large (max 2MB).');
      e.target.value = '';
      return;
    }
    setError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      setImageBase64(dataUrl);
      setImagePreview(dataUrl);
    } catch (error) {
      console.error("Error converting file to Base64:", error);
      setError('Failed to process image.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name || !description || !imageBase64 || price === '' || !category) {
      setError('Name, description, image, price, and category are required.');
      setIsLoading(false);
      return;
    }
    
    const numericPrice = parseFloat(String(price));
    const numericOriginalPrice = originalPrice ? parseFloat(String(originalPrice)) : undefined;

    if (numericOriginalPrice && numericOriginalPrice <= numericPrice) {
      setError('Original price must be greater than the current price.');
      setIsLoading(false);
      return;
    }

    const payload: Partial<Omit<Item, '_id'>> = {
      name, description, itemCode, category, imageBase64,
      price: numericPrice,
      currency,
      inStock,
      originalPrice: numericOriginalPrice,
    };

    if (isEditing && editingItem && imageBase64 === editingItem.imageBase64) {
      delete payload.imageBase64;
    }

    const endpoint = isEditing ? `/api/items/${editingItem!._id}` : '/api/items';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'An error occurred while saving.');
      const savedItemData: Item = await res.json();
      onItemSaved(savedItemData, isEditing);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      console.error("Submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" aria-label="Close modal"><X size={24} /></button>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="itemName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label><input id="itemName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" placeholder="e.g., Fiery Crunch Nuts" required /></div>
          
          <div>
            <label htmlFor="itemCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FolderKanban className="w-5 h-5 text-slate-400" /></div>
              <input id="itemCategory" type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" placeholder="e.g., Spicy Snacks, Limited Edition" required />
            </div>
          </div>
          
          <div><label htmlFor="itemCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Code</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ScanLine className="w-5 h-5 text-slate-400" /></div><input id="itemCode" type="text" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" placeholder="e.g., FCN-001" /></div></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="itemPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="w-5 h-5 text-slate-400" /></div><input id="itemPrice" type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" placeholder="19.99" required step="0.01" min="0" /></div></div>
            <div><label htmlFor="itemCurrency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label><select id="itemCurrency" value={currency} onChange={(e) => setCurrency(e.target.value as Item['currency'])} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"><option value="LKR">LKR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
          </div>
          
          <div><label htmlFor="itemOriginalPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Original Price (for sales)</label><input id="itemOriginalPrice" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" placeholder="Optional, e.g., 24.99" step="0.01" min="0" /></div>
          
          <div className="flex items-center pt-2"><input id="inStock" type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" /><label htmlFor="inStock" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Item is in stock and available for purchase</label></div>
          
          <div><label htmlFor="itemDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label><textarea id="itemDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" placeholder="Describe your item..." required /></div>

          <div><label htmlFor="itemImageFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Image</label><div className="flex items-center space-x-3"><ImagePlus className="w-6 h-6 text-slate-400 flex-shrink-0" /><input id="itemImageFile" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleFileChange} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-slate-700 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-slate-600 cursor-pointer" /></div></div>
          
          {imagePreview && <div className="mt-4"><p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image Preview:</p><div className="relative w-full h-48 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden flex items-center justify-center"><NextImage src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" className="bg-slate-100 dark:bg-slate-700" unoptimized /></div></div>}

          <button type="submit" disabled={isLoading} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-6">{isLoading && <Loader2 className="animate-spin mr-2" size={20} />}{isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Item')}</button>
        </form>
        <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-md text-center"><p className="text-xs text-amber-700 dark:text-amber-300"><strong>Note:</strong> Storing images as Base64 in the DB is for demo purposes. For production, use a dedicated file storage service.</p></div>
      </div>
    </div>
  );
}