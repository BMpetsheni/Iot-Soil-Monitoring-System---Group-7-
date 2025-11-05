import { SoilData, WeatherData } from '../types';

/**
 * Fetches soil data from the live Oracle APEX API.
 * This function now makes a real network request.
 */
export const fetchSoilData = async (): Promise<SoilData[]> => {
  try {
    const response = await fetch('https://oracleapex.com/ords/g3_data/groups/data/7');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    // The API returns data within an "items" array
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch soil data:', error);
    // Re-throw the error to be caught by the data context
    throw error;
  }
};

/**
 * Helper function to interpret WMO weather codes from the Open-Meteo API.
 * @param code The WMO weather code.
 * @returns An object containing a user-friendly description and a Material Symbols icon name.
 */
const getWeatherInfoFromCode = (code: number): { description: string; icon: string } => {
  const weatherMap: { [key: number]: { description: string; icon: string } } = {
    0: { description: 'Clear sky', icon: 'wb_sunny' },
    1: { description: 'Mainly clear', icon: 'wb_sunny' },
    2: { description: 'Partly cloudy', icon: 'partly_cloudy_day' },
    3: { description: 'Overcast', icon: 'cloud' },
    45: { description: 'Fog', icon: 'foggy' },
    48: { description: 'Depositing rime fog', icon: 'foggy' },
    51: { description: 'Light drizzle', icon: 'grain' },
    53: { description: 'Moderate drizzle', icon: 'grain' },
    55: { description: 'Dense drizzle', icon: 'grain' },
    56: { description: 'Light freezing drizzle', icon: 'ac_unit' },
    57: { description: 'Dense freezing drizzle', icon: 'ac_unit' },
    61: { description: 'Slight rain', icon: 'rainy' },
    63: { description: 'Moderate rain', icon: 'rainy' },
    65: { description: 'Heavy rain', icon: 'rainy' },
    66: { description: 'Light freezing rain', icon: 'ac_unit' },
    67: { description: 'Heavy freezing rain', icon: 'ac_unit' },
    71: { description: 'Slight snow fall', icon: 'weather_snowy' },
    73: { description: 'Moderate snow fall', icon: 'weather_snowy' },
    75: { description: 'Heavy snow fall', icon: 'weather_snowy' },
    77: { description: 'Snow grains', icon: 'weather_snowy' },
    80: { description: 'Slight rain showers', icon: 'rainy' },
    81: { description: 'Moderate rain showers', icon: 'rainy' },
    82: { description: 'Violent rain showers', icon: 'rainy' },
    85: { description: 'Slight snow showers', icon: 'weather_snowy' },
    86: { description: 'Heavy snow showers', icon: 'weather_snowy' },
    95: { description: 'Thunderstorm', icon: 'thunderstorm' },
    96: { description: 'Thunderstorm with hail', icon: 'thunderstorm' },
    99: { description: 'Thunderstorm with heavy hail', icon: 'thunderstorm' },
  };
  return weatherMap[code] || { description: 'Unknown', icon: 'help' };
};

/**
 * Fetches live weather data from the Open-Meteo API for Franschhoek.
 */
export const fetchWeatherData = async (): Promise<WeatherData> => {
  const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-33.9091&longitude=19.1214&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max&forecast_days=4&timezone=Africa/Johannesburg';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.statusText}`);
    }
    const data = await response.json();

    const currentWeatherInfo = getWeatherInfoFromCode(data.current.weather_code);

    const formattedData: WeatherData = {
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      rainfall: data.daily.precipitation_sum[0], // Today's total precipitation
      windSpeed: Math.round(data.current.wind_speed_10m),
      description: currentWeatherInfo.description,
      icon: currentWeatherInfo.icon,
      forecast: [],
    };

    const forecastDays = ['Tomorrow', 'In 2 days', 'In 3 days'];
    for (let i = 1; i <= 3; i++) {
        const forecastWeatherInfo = getWeatherInfoFromCode(data.daily.weather_code[i]);
        formattedData.forecast.push({
            day: forecastDays[i - 1],
            temp: Math.round(data.daily.temperature_2m_max[i]),
            icon: forecastWeatherInfo.icon,
            description: forecastWeatherInfo.description,
            humidity: Math.round(data.daily.relative_humidity_2m_mean[i]),
            windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
        });
    }

    return formattedData;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
};