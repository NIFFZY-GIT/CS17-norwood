'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/lib/types';
import ItemCard from '@/components/dashboard/ItemCard';
import AddItemModal from '@/components/dashboard/AddItemModal';
import { PlusCircle, Loader2, Package as PackageIcon } from 'lucide-react';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/items');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch items');
        }
        const data: Item[] = await res.json();
        setItems(
          data.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }))
        );
      // FIX 1: Change 'any' to 'unknown' and add a type check.
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching items.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleOpenModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(prev => prev.filter(i => i._id !== id));
    // FIX 2: Change 'any' to 'unknown' and add a type check.
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while deleting the item.');
      }
    }
  };

  const handleSaved = (savedItem: Item, isEdit: boolean) => {
    const itemWithDate = { ...savedItem, createdAt: new Date(savedItem.createdAt) };
    if (isEdit) {
      setItems(prev => prev.map(i => (i._id === itemWithDate._id ? itemWithDate : i)));
    } else {
      setItems(prev => [itemWithDate, ...prev]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <PackageIcon className="w-7 h-7 text-sky-500 mr-2" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            My Items
          </h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Add New Item
        </button>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-sky-500" size={48} />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {items.length === 0 ? (
            <div className="text-center py-10">
              <PackageIcon size={64} className="mx-auto text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                No items yet!
              </h2>
              <p className="text-slate-500">Click “Add New Item” to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item._id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onItemSaved={handleSaved}
        editingItem={editingItem}
      />
    </>
  );
}