import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { LineChartComponent, BarChartComponent } from '../components/ChartComponent';
import Loader from '../components/Loader';
import { SoilData } from '../types';

type ChartableKeys = 'moisture' | 'temperature' | 'ph' | 'ec' | 'nitrogen' | 'phosphorus' | 'potassium';

const chartConfig: Record<ChartableKeys, { color: string, title: string }> = {
  moisture: { color: '#3b82f6', title: 'Moisture Trend (%)' },
  temperature: { color: '#f97316', title: 'Temperature Trend (°C)' },
  ph: { color: '#8b5cf6', title: 'pH Level Trend' },
  ec: { color: '#eab308', title: 'Conductivity Trend (μS/cm)' },
  nitrogen: { color: '#22c55e', title: 'Nitrogen Trend (mg/kg)' },
  phosphorus: { color: '#14b8a6', title: 'Phosphorus Trend (mg/kg)' },
  potassium: { color: '#ef4444', title: 'Potassium Trend (mg/kg)' },
};

// Helper function to parse the custom Oracle date format
const parseOracleDate = (dateStr: string): Date => {
  const months: { [key: string]: number } = {
    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
  };
  try {
    const upperDateStr = dateStr.toUpperCase();
    const parts = upperDateStr.split(' ');
    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');
    const day = parseInt(dateParts[0], 10);
    const month = months[dateParts[1]];
    const year = parseInt(dateParts[2], 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = parseInt(timeParts[2], 10);
    if ([day, month, year, hour, minute, second].some(isNaN)) {
        return new Date(0);
    }
    return new Date(year, month, day, hour, minute, second);
  } catch (e) {
      console.error(`Failed to parse date: ${dateStr}`, e);
      return new Date(0);
  }
};


const DashboardPage: React.FC = () => {
  const { soilData, loading, error } = useData();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<SoilData[]>([]);

  // Effect to populate chart data when the main soilData loads.
  // By default, it shows all data.
  useEffect(() => {
    if (soilData.length > 0) {
      // Sort oldest to newest for correct chart display
      const sorted = [...soilData].sort((a, b) => parseOracleDate(a.corrected_created_at).getTime() - parseOracleDate(b.corrected_created_at).getTime());
      setFilteredData(sorted);
    }
  }, [soilData]);


  const handleFilter = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter from the original full dataset
    const sorted = [...soilData].sort((a, b) => parseOracleDate(a.corrected_created_at).getTime() - parseOracleDate(b.corrected_created_at).getTime());

    const filtered = sorted.filter(item => {
      const itemDate = parseOracleDate(item.corrected_created_at);
      return itemDate >= start && itemDate <= end;
    });
    setFilteredData(filtered);
  };
  
  const resetFilter = () => {
    // Clear date input fields
    setStartDate('');
    setEndDate('');
    
    // Reset charts to show all data
    if (soilData.length > 0) {
      const sorted = [...soilData].sort((a, b) => parseOracleDate(a.corrected_created_at).getTime() - parseOracleDate(b.corrected_created_at).getTime());
      setFilteredData(sorted);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader message="Loading historical data..." /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }
  
  const latestFilteredData = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
  const nutrientData = latestFilteredData ? [
    { name: 'Nitrogen (N)', value: latestFilteredData.nitrogen, color: '#22c55e' },
    { name: 'Phosphorus (P)', value: latestFilteredData.phosphorus, color: '#14b8a6' },
    { name: 'Potassium (K)', value: latestFilteredData.potassium, color: '#ef4444' }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-on-surface">Analytics Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="startDate" className="text-sm font-medium text-on-surface-secondary">From:</label>
            <input 
                type="date" 
                id="startDate" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md shadow-sm text-sm" 
            />
            <label htmlFor="endDate" className="text-sm font-medium text-on-surface-secondary">To:</label>
            <input 
                type="date" 
                id="endDate" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md shadow-sm text-sm"
            />
            <button
                onClick={handleFilter}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors"
            >
                Filter
            </button>
            <button
                onClick={resetFilter}
                className="px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
            >
                Reset
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Main Moisture Chart - spanning two columns on large screens */}
        <div className="md:col-span-2 xl:col-span-2">
            <LineChartComponent
              data={filteredData}
              dataKey="moisture"
              strokeColor={chartConfig.moisture.color}
              title={chartConfig.moisture.title}
            />
        </div>
        
        {/* NPK Bar Chart */}
        <div>
            <BarChartComponent 
              data={nutrientData}
              title="Nutrient Levels (Latest in Range)"
            />
        </div>

        {/* Other line charts */}
        <LineChartComponent
          data={filteredData}
          dataKey="temperature"
          strokeColor={chartConfig.temperature.color}
          title={chartConfig.temperature.title}
        />
        <LineChartComponent
          data={filteredData}
          dataKey="ph"
          strokeColor={chartConfig.ph.color}
          title={chartConfig.ph.title}
        />
        <LineChartComponent
          data={filteredData}
          dataKey="ec"
          strokeColor={chartConfig.ec.color}
          title={chartConfig.ec.title}
        />
        <LineChartComponent
          data={filteredData}
          dataKey="phosphorus"
          strokeColor={chartConfig.phosphorus.color}
          title={chartConfig.phosphorus.title}
        />
        <LineChartComponent
          data={filteredData}
          dataKey="potassium"
          strokeColor={chartConfig.potassium.color}
          title={chartConfig.potassium.title}
        />
      </div>
    </div>
  );
};

export default DashboardPage;