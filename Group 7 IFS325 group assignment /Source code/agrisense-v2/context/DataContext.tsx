import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { SoilData, WeatherData, Recommendation } from '../types';
import { fetchSoilData, fetchWeatherData } from '../services/apiService';
import { getDetailedRecommendations, getHomePageActionable } from '../services/geminiService';

interface DataContextType {
  soilData: SoilData[];
  latestSoilData: SoilData | null;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  recommendations: Recommendation[];
  recommendationsLoading: boolean;
  regenerateRecommendations: () => Promise<void>;
  aiActionable: string;
  aiActionableLoading: boolean;
  regenerateAiActionable: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to parse the custom Oracle date format
const parseOracleDate = (dateStr: string): Date => {
  const months: { [key: string]: number } = {
    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
  };
  
  // Format: "27-OCT-2025 14:49:04"
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
    const second = parseInt(timeParts[2], 10);

    if ([day, month, year, hour, minute, second].some(isNaN)) {
        return new Date(0); // Return epoch if parsing fails
    }

    return new Date(year, month, day, hour, minute, second);
  } catch (e) {
      console.error(`Failed to parse date: ${dateStr}`, e);
      return new Date(0); // Return epoch on error
  }
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soilData, setSoilData] = useState<SoilData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);
  const [aiActionable, setAiActionable] = useState<string>('');
  const [aiActionableLoading, setAiActionableLoading] = useState<boolean>(false);

  const regenerateRecommendations = useCallback(async () => {
    if (soilData.length > 0 && weatherData) {
      setRecommendationsLoading(true);
      try {
        const result = await getDetailedRecommendations(soilData, weatherData);
        setRecommendations(result);
      } catch (err) {
        console.error("Failed to generate recommendations.", err);
        setRecommendations([{
          title: "AI Analysis Failed",
          description: "Could not generate AI recommendations. Please check your connection and API key configuration, then try regenerating.",
          priority: 'High'
        }]);
      } finally {
        setRecommendationsLoading(false);
      }
    }
  }, [soilData, weatherData]);

  const regenerateAiActionable = useCallback(async () => {
    if (soilData.length > 0 && weatherData) {
      setAiActionableLoading(true);
      try {
        const actionable = await getHomePageActionable(soilData[0], weatherData);
        setAiActionable(actionable);
      } catch (err) {
        console.error("Failed to generate actionable insight.", err);
        setAiActionable("Could not generate AI insight. Please check connection and API key.");
      } finally {
        setAiActionableLoading(false);
      }
    }
  }, [soilData, weatherData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [soil, weather] = await Promise.all([fetchSoilData(), fetchWeatherData()]);
      
      const sortedSoil = soil.sort((a, b) => parseOracleDate(b.corrected_created_at).getTime() - parseOracleDate(a.corrected_created_at).getTime());
      
      setSoilData(sortedSoil);
      setWeatherData(weather);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Polling for new soil data every 15 seconds
  useEffect(() => {
    const pollSoilData = async () => {
      try {
        const newSoilData = await fetchSoilData();
        const sortedSoil = newSoilData.sort((a, b) => parseOracleDate(b.corrected_created_at).getTime() - parseOracleDate(a.corrected_created_at).getTime());
        
        setSoilData(currentSoilData => {
          // Only update if there's new data and it's different from the current latest
          if (sortedSoil.length > 0 && (currentSoilData.length === 0 || sortedSoil[0].corrected_created_at !== currentSoilData[0].corrected_created_at)) {
            return sortedSoil;
          }
          // Otherwise, return the existing state to avoid unnecessary re-renders
          return currentSoilData;
        });
      } catch (err) {
        // Silently log polling errors to not disrupt UX
        console.error("Failed to poll soil data:", err);
      }
    };

    const intervalId = setInterval(pollSoilData, 15000);

    return () => {
      clearInterval(intervalId); // Cleanup on component unmount
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Pre-fetch AI features only when base data is first loaded.
  useEffect(() => {
    if (soilData.length > 0 && weatherData && !loading) {
      // Pre-fetch recommendations only if they haven't been fetched yet.
      if (recommendations.length === 0) {
        regenerateRecommendations();
      }
      
      // Generate the AI actionable insight only if it hasn't been generated yet.
      // User can still regenerate manually with the button.
      if (!aiActionable) {
        regenerateAiActionable();
      }
    }
  }, [soilData, weatherData, loading, recommendations.length, aiActionable, regenerateRecommendations, regenerateAiActionable]);


  const latestSoilData = soilData.length > 0 ? soilData[0] : null;

  return (
    <DataContext.Provider value={{ soilData, latestSoilData, weatherData, loading, error, recommendations, recommendationsLoading, regenerateRecommendations, aiActionable, aiActionableLoading, regenerateAiActionable }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};