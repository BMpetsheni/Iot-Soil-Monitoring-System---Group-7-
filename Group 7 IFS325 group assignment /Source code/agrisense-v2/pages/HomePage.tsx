import React from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';

const HomePage: React.FC = () => {
  const { latestSoilData, weatherData, loading, error, aiActionable, aiActionableLoading, regenerateAiActionable } = useData();

  const formatTimestamp = (dateStr: string | undefined): string => {
    if (!dateStr) return 'No date available';

    const months: { [key: string]: number } = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    
    try {
        const upperDateStr = dateStr.toUpperCase();
        const parts = upperDateStr.split(' ');
        const dateParts = parts[0].split('-'); // ["27", "OCT", "2025"]
        const timeParts = parts[1].split(':'); // ["14", "49", "04"]
        
        const day = parseInt(dateParts[0], 10);
        const month = months[dateParts[1]];
        const year = parseInt(dateParts[2], 10);
        
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);

        if ([day, month, year, hour, minute].some(isNaN)) {
            return dateStr; // fallback to original string
        }

        const date = new Date(year, month, day, hour, minute);
        return `Last reading: ${date.toLocaleString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        })}`;
    } catch (e) {
        console.error(`Failed to parse timestamp: ${dateStr}`, e);
        return `Last reading: ${dateStr}`; // fallback
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader message="Fetching latest data..." /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-on-surface">Farm Overview</h1>
      
      {/* Soil Data Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-2xl font-semibold text-on-surface">Latest Soil Conditions</h2>
            <p className="text-sm text-on-surface-secondary mt-1 sm:mt-0">
                {formatTimestamp(latestSoilData?.corrected_created_at)}
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {latestSoilData && (
            <>
              <StatCard icon="water_drop" label="Moisture" value={latestSoilData.moisture} unit="%" colorClass="bg-blue-500" />
              <StatCard icon="thermostat" label="Temperature" value={latestSoilData.temperature} unit="°C" colorClass="bg-orange-500" />
              <StatCard icon="science" label="pH Level" value={latestSoilData.ph} colorClass="bg-purple-500" />
              <StatCard icon="compost" label="Nitrogen (N)" value={latestSoilData.nitrogen} unit="mg/kg" colorClass="bg-green-500" />
              <StatCard icon="eco" label="Phosphorus (P)" value={latestSoilData.phosphorus} unit="mg/kg" colorClass="bg-teal-500" />
              <StatCard icon="filter_vintage" label="Potassium (K)" value={latestSoilData.potassium} unit="mg/kg" colorClass="bg-red-500" />
              <StatCard icon="bolt" label="Conductivity" value={latestSoilData.ec} unit="μS/cm" colorClass="bg-yellow-500" />
            </>
          )}
        </div>
      </div>

      {/* Weather Section */}
      <div>
        <h2 className="text-2xl font-semibold text-on-surface mb-4">Weather Forecast for the Franschhoek Region</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weatherData && (
            <>
              {/* Current Weather Card */}
              <div className="bg-surface rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-1">
                <p className="font-bold text-on-surface">Now</p>
                <span className="material-symbols-outlined text-5xl text-yellow-500">{weatherData.icon}</span>
                <p className="text-4xl font-bold text-on-surface">{weatherData.temperature}°C</p>
                <p className="text-base text-on-surface-secondary h-10">{weatherData.description}</p>
                <div className="flex space-x-4 pt-2 text-sm text-on-surface-secondary">
                  <span>Hum: {weatherData.humidity}%</span>
                  <span>Wind: {weatherData.windSpeed}km/h</span>
                </div>
              </div>
              {/* Forecast Cards */}
              {weatherData.forecast.map(day => (
                <div key={day.day} className="bg-surface rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-1">
                  <p className="font-bold text-on-surface">{day.day}</p>
                  <span className="material-symbols-outlined text-5xl text-secondary">{day.icon}</span>
                  <p className="text-4xl font-bold text-on-surface">{day.temp}°C</p>
                  <p className="text-base text-on-surface-secondary h-10">{day.description}</p>
                  <div className="flex space-x-4 pt-2 text-sm text-on-surface-secondary">
                    <span>Hum: {day.humidity}%</span>
                    <span>Wind: {day.windSpeed}km/h</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* AI Actionable Card */}
      <div className="bg-surface rounded-xl shadow-sm p-6 border-l-4 border-primary">
        <div className="flex items-start">
          <span className="material-symbols-outlined text-3xl text-primary mr-4">auto_awesome</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-on-surface">AI Actionable Insight</h2>
              <button
                onClick={regenerateAiActionable}
                disabled={aiActionableLoading}
                className="p-1.5 rounded-full text-secondary hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                aria-label="Regenerate insight"
              >
                {aiActionableLoading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined">refresh</span>
                )}
              </button>
            </div>
            {aiActionableLoading && !aiActionable ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-on-surface-secondary">Generating today's top tip...</p>
              </div>
            ) : (
              <p className="text-on-surface-secondary">{aiActionable}</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;