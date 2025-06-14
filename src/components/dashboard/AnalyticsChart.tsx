// src/components/dashboard/AnalyticsChart.tsx
'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react'; // For loading/error states

interface ChartDataItem {
  name: string;
  newItems: number;
  itemViews: number;
  // Add other metrics if your API returns them
}

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analytics/trends');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch analytics data');
        }
        const data: ChartDataItem[] = await res.json();
        setChartData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
        console.error("Error fetching analytics data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg h-96 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={40} />
        <p className="mt-3 text-slate-600 dark:text-slate-400">Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg h-96 flex flex-col items-center justify-center">
        <AlertTriangle className="text-red-500" size={40} />
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mt-3">Error Loading Data</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">{error}</p>
        {/* Optional: Add a retry button */}
      </div>
    );
  }
  
  if (chartData.length === 0) {
     return (
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg h-96 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Analytics Data Available</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">There&apos;s no data to display for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg h-96 flex flex-col"> {/* Added flex-col */}
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex-shrink-0">Daily Trends (Last 7 Days)</h3>
      <div className="flex-grow min-h-0"> {/* Added flex-grow and min-h-0 for ResponsiveContainer */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData} // Use fetched data
            margin={{
              top: 5,
              right: 25, // Increased right margin slightly
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="dark:stroke-slate-700 stroke-slate-300" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'currentColor' }} 
              className="text-xs text-slate-600 dark:text-slate-400" 
              interval={0} // Show all labels if space allows, or adjust as needed
              angle={-30} // Angle labels if they overlap
              dy={10}     // Adjust vertical position
            />
            <YAxis 
              tick={{ fill: 'currentColor' }} 
              className="text-xs text-slate-600 dark:text-slate-400"
              allowDecimals={false} // No decimals for counts
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(var(--background-rgb, 255 255 255), 0.95)', // Ensure CSS vars are defined
                borderColor: 'rgba(var(--foreground-rgb, 0 0 0), 0.2)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px 12px',
                color: 'rgb(var(--foreground-rgb, 0 0 0))'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: 'rgb(var(--foreground-rgb, 0 0 0))' }}
              itemStyle={{ fontSize: '0.875rem' }}
              formatter={(value: number, name: string) => [`${value}`, name]} // Simple formatter
            />
            <Legend wrapperStyle={{ color: 'currentColor', paddingTop: '10px', fontSize: '0.875rem' }} />
            <Line 
                type="monotone" 
                dataKey="newItems" // Updated dataKey
                stroke="#38bdf8" // Sky blue
                strokeWidth={2.5} 
                activeDot={{ r: 7, strokeWidth: 2, fill: '#0ea5e9' }} 
                name="New Items Added"
                dot={{ r: 3, fill: '#38bdf8' }}
            />
            <Line 
                type="monotone" 
                dataKey="itemViews" // Updated dataKey
                stroke="#818cf8" // Indigo
                strokeWidth={2.5} 
                activeDot={{ r: 7, strokeWidth: 2, fill: '#6366f1' }} 
                name="Item Views"
                dot={{ r: 3, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Make sure CSS variables are defined in your global CSS for light/dark mode tooltip:
// :root {
//   --background-rgb: 255, 255, 255; /* For light mode tooltip background */
//   --foreground-rgb: 15, 23, 42;   /* slate-900, for light mode tooltip text */
// }
// .dark {
//   --background-rgb: 30, 41, 59;    /* slate-800, for dark mode tooltip background */
//   --foreground-rgb: 248, 250, 252; /* slate-50, for dark mode tooltip text */
// }