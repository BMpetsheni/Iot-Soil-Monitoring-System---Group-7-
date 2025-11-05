import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { SoilData } from '../types';

interface ChartComponentProps {
  data: SoilData[];
  dataKey: keyof SoilData;
  strokeColor: string;
  title: string;
}

const parseOracleDate = (dateStr: string): Date => {
  const months: { [key: string]: number } = {
    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
  };

  try {
    const upperDateStr = dateStr.toUpperCase();
    const parts = upperDateStr.split(' ');
    const dateParts = parts[0].split('-');
    
    const day = parseInt(dateParts[0], 10);
    const month = months[dateParts[1]];
    const year = parseInt(dateParts[2], 10);

    if (isNaN(day) || month === undefined || isNaN(year)) {
        return new Date(0); // Invalid date
    }
    
    return new Date(year, month, day);
  } catch (e) {
    return new Date(0); // Invalid date
  }
};


const formatDate = (dateStr: string) => {
    try {
        const date = parseOracleDate(dateStr);
        if (isNaN(date.getTime()) || date.getTime() === 0) {
            const datePart = dateStr.split(' ')[0];
            return datePart;
        };
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
        const datePart = dateStr.split(' ')[0];
        return datePart;
    }
};

export const LineChartComponent: React.FC<ChartComponentProps> = ({ data, dataKey, strokeColor, title }) => {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm h-96">
      <h3 className="text-lg font-semibold text-on-surface mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="corrected_created_at" 
            tickFormatter={formatDate} 
            angle={-30} 
            textAnchor="end"
            height={50}
            tick={{ fill: '#475569', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(2px)',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


interface BarChartComponentProps {
  data: { name: string, value: number, color: string }[];
  title: string;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, title }) => {
    return (
        <div className="bg-surface p-6 rounded-xl shadow-sm h-96">
            <h3 className="text-lg font-semibold text-on-surface mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(2px)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                        }}
                    />
                    <Bar dataKey="value">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};