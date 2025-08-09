'use client';

import { useState, useEffect } from 'react';

interface DebugItem {
  name?: string;
  _id?: string;
  [key: string]: unknown;
}

export default function DebugProductsPage() {
  const [data, setData] = useState<DebugItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Debug: useEffect started');
    
    const fetchData = async () => {
      try {
        console.log('Debug: Making API call...');
        const response = await fetch('/api/items');
        console.log('Debug: Response received', response.status);
        
        const result = await response.json();
        console.log('Debug: Data parsed', { type: typeof result, isArray: Array.isArray(result), length: result?.length });
        
        setData(result);
      } catch (err) {
        console.error('Debug: Error occurred', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  console.log('Debug: Rendering component', { loading, error, dataType: typeof data, dataLength: Array.isArray(data) ? data.length : 'Not array' });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Products API</h1>
      
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Type:</strong> {typeof data}</p>
            <p><strong>Is Array:</strong> {Array.isArray(data) ? 'Yes' : 'No'}</p>
            <p><strong>Length:</strong> {Array.isArray(data) ? data.length : 'N/A'}</p>
            
            {Array.isArray(data) && data.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">First Item:</h3>
                <pre className="text-sm bg-white p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(data[0], null, 2)}
                </pre>
              </div>
            )}
            
            {Array.isArray(data) && (
              <div className="mt-4">
                <h3 className="font-semibold">All Items Names:</h3>
                <ul className="list-disc list-inside">
                  {data.map((item: DebugItem, index: number) => (
                    <li key={index}>{item.name || 'Unnamed'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
