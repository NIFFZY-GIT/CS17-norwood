// src/components/dashboard/DashboardChart.tsx
'use client';

import { ChartData } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardChartProps {
  data: ChartData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
       <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Items Added (Last 7 Days)
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10, // Adjust to make Y-axis labels visible
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800
                borderColor: 'rgba(51, 65, 85, 1)', // slate-700
                color: '#fff',
                borderRadius: '0.5rem',
              }}
              cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} // slate-500 with opacity
            />
            <Legend wrapperStyle={{fontSize: '14px'}} />
            <Bar dataKey="count" name="New Items" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}