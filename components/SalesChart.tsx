import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesData } from '../types';

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363d', borderRadius: '8px' }}
            itemStyle={{ color: '#14B8A6' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#14B8A6" 
            strokeWidth={2} 
            dot={{ r: 3, fill: '#14B8A6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;