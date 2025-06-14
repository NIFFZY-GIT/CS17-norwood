// src/components/dashboard/AddItemModal.tsx
'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { X, ImagePlus, Loader2, ScanLine } from 'lucide-react';
import { Item } from '@/lib/types';
import NextImage from 'next/image';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSaved: (savedItem: Item, isEditing: boolean) => void; // Renamed from onItemAdded
  editingItem?: Item | null; // Item to edit, if any
}

interface ItemPayload {
  name: string;
  description: string;
  itemCode: string;
  imageBase64?: string; // Optional for PUT if image not changed
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function AddItemModal({ 
  isOpen, 
  onClose, 
  onItemSaved, 
  editingItem 
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!editingItem;

  useEffect(() => {
    if (isOpen) {
        if (isEditing && editingItem) {
            setName(editingItem.name);
            setDescription(editingItem.description);
            setItemCode(editingItem.itemCode);
            // For editing, imageBase64 state tracks if a *new* image is selected or if original is kept.
            // Initially, it holds the original image. If user selects a new one, this state changes.
            // If user deselects, it might become undefined (meaning "no new image selected").
            setImageBase64(editingItem.imageBase64); 
            setImagePreview(editingItem.imageBase64);
        } else {
            resetFormFields();
        }
        // Clear file input visually
        const fileInput = document.getElementById('itemImageFile') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
    }
  }, [isOpen, editingItem, isEditing]);

  const resetFormFields = () => {
    setName('');
    setDescription('');
    setItemCode('');
    setImageBase64(undefined);
    setImagePreview(undefined);
    setError('');
    const fileInput = document.getElementById('itemImageFile') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };
  
  const handleModalClose = () => {
    // Resetting form fields on close is generally good practice if not handled by useEffect on open
    // resetFormFields(); // This can be done here, or rely on useEffect to set state when opening.
    // Let's ensure useEffect on `isOpen` handles the reset/population.
    onClose(); 
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      // No file selected (e.g., user cleared selection)
      // Revert to original image if editing, or clear if adding new.
      const originalImage = isEditing && editingItem ? editingItem.imageBase64 : undefined;
      setImageBase64(originalImage); // Revert data to original or undefined
      setImagePreview(originalImage); // Revert preview to original or undefined
      e.target.value = ''; // Ensure file input is cleared
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image is too large (max 2MB).');
        e.target.value = ''; 
        // Revert to original image if editing, or clear if adding new.
        const originalImage = isEditing && editingItem ? editingItem.imageBase64 : undefined;
        setImageBase64(originalImage);
        setImagePreview(originalImage);
        return;
    }
    setError(''); 

    try {
        const dataUrl = await fileToDataUrl(file);
        setImageBase64(dataUrl); // New image data for submission
        setImagePreview(dataUrl); // Preview of the new image
    } catch (err) {
        console.error("Error converting file to Base64:", err);
        setError('Failed to process image. Please try again.');
        // Revert to original on error as well
        const originalImage = isEditing && editingItem ? editingItem.imageBase64 : undefined;
        setImageBase64(originalImage);
        setImagePreview(originalImage);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation: Name, description, item code are always required.
    // Image is required for NEW items.
    // If editing, imageBase64 (current image in state) might be the original or a new one.
    // The Item type itself declares imageBase64 as non-optional.
    if (!name || !description || !itemCode ) {
      setError('Name, description, and item code are required.');
      setIsLoading(false);
      return;
    }

    // If adding a new item, imageBase64 (the one in state) must be present.
    // If editing an item, imageBase64 (the one in state) must be present (it could be the original or a new one).
    // Our Item type requires imageBase64.
    if (!imageBase64) {
        setError('An image is required.');
        setIsLoading(false);
        return;
    }


    const payload: ItemPayload = {
      name,
      description,
      itemCode,
    };

    // Only send imageBase64 if it's different from the original one during an edit,
    // or if it's a new item.
    // For simplicity, we can always send it if it's present in the state.
    // The API PUT can be smart enough to not update if it's the same, or just overwrite.
    // However, to optimize, only send if it has changed OR it's a new item.
    // Current setup: send imageBase64 if it's in the state.
    if (isEditing) {
        // If image has changed or was initially set (it always is for editingItem as per Item type)
        if (imageBase64 !== editingItem?.imageBase64 || !editingItem?.imageBase64) { // Send if changed or if somehow original was null/empty
            payload.imageBase64 = imageBase64;
        } else if (imageBase64 && editingItem?.imageBase64 && imageBase64 === editingItem.imageBase64) {
            // Image is the same, don't send it in payload to avoid unnecessary update/transfer.
            // API will not update imageBase64 field if not present in payload.
        } else {
            // This case implies imageBase64 state is set, editingItem.imageBase64 is not,
            // which shouldn't happen if editingItem is a valid Item.
            // Or imageBase64 state is not set, which is caught by earlier validation.
             payload.imageBase64 = imageBase64; // Default to sending if in doubt
        }
    } else { // New item
        payload.imageBase64 = imageBase64; // imageBase64 is guaranteed by validation above for new items
    }


    const endpoint = isEditing ? `/api/items/${editingItem!._id}` : '/api/items'; // editingItem._id is safe here
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedItemData: Item = await res.json();
        // Ensure createdAt is a Date object if API returns string
        if (typeof savedItemData.createdAt === 'string') {
            savedItemData.createdAt = new Date(savedItemData.createdAt);
        }
        onItemSaved(savedItemData, isEditing);
        handleModalClose(); 
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} item.`);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentImageSrc = imagePreview || (isEditing && editingItem?.imageBase64);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
            <input id="itemName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-sky-500 focus:border-sky-500" placeholder="e.g., Cool Gadget" required />
          </div>

          <div>
            <label htmlFor="itemCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ScanLine className="w-5 h-5 text-slate-400" /></div>
              <input id="itemCode" type="text" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-sky-500 focus:border-sky-500" placeholder="e.g., SKU12345" required />
            </div>
          </div>

          <div>
            <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea id="itemDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-sky-500 focus:border-sky-500" placeholder="Describe your item..." required />
          </div>
          
          <div>
            <label htmlFor="itemImageFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Item Image
              {isEditing && imageBase64 && imageBase64 === editingItem?.imageBase64 && ' (Current image selected)'}
              {isEditing && imageBase64 && imageBase64 !== editingItem?.imageBase64 && ' (New image selected)'}
            </label>
            <div className="flex items-center space-x-3">
                <ImagePlus className="w-6 h-6 text-slate-400 flex-shrink-0" />
                <input
                    id="itemImageFile"
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-sky-50 dark:file:bg-slate-700 file:text-sky-700 dark:file:text-sky-300
                                hover:file:bg-sky-100 dark:hover:file:bg-slate-600 cursor-pointer"
                    // HTML5 required is tricky with conditional logic and file inputs.
                    // The JS validation `if (!imageBase64)` handles it for new items.
                />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF, WEBP. Max 2MB for demo.</p>
          </div>

          {currentImageSrc && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isEditing && imageBase64 === editingItem?.imageBase64 ? 'Current Image Preview:' : 'Image Preview:'}
              </p>
              <div className="relative w-full h-48 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden flex items-center justify-center">
                <NextImage src={currentImageSrc} alt="Image preview" layout="fill" objectFit="contain" className="bg-slate-100 dark:bg-slate-700" unoptimized />
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center disabled:opacity-70 mt-6">
            {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
            {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Item')}
          </button>
        </form>
        <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-md text-center">
            <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Important Note:</strong> Storing images as Base64 directly in the database is only for demonstration.
                For production, use a dedicated file storage service and store image URLs.
            </p>
        </div>
      </div>
    </div>
  );
}