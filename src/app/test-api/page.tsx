'use client';

import { useState, useEffect } from 'react';

interface TestItem {
  _id: string;
  name: string;
  category: string;
  [key: string]: unknown;
}

export default function TestPage() {
  const [data, setData] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('TEST PAGE: useEffect running');
    const fetchData = async () => {
      try {
        console.log('TEST PAGE: Starting fetch');
        const res = await fetch('/api/items?includeImages=false&limit=5');
        console.log('TEST PAGE: Response status:', res.status);
        const items = await res.json();
        console.log('TEST PAGE: Received items:', items.length);
        setData(items);
      } catch (error) {
        console.error('TEST PAGE: Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  console.log('TEST PAGE: Rendering with data length:', data.length);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">API Test Page</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Found {data.length} items</p>
          <ul className="mt-4">
            {data.map((item: TestItem) => (
              <li key={item._id} className="mb-2">
                {item.name} - {item.category}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
