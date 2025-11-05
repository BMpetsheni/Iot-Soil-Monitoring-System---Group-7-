export interface SoilData {
  group_id: number;
  moisture: number;
  temperature: number;
  ec: number; // Electrical Conductivity
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  valid: string;
  corrected_created_at: string; // e.g., "27-OCT-2025 14:49:04"
}

export interface WeatherForecast {
  day: string;
  temp: number;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number; // in mm
  windSpeed: number; // in km/h
  description: string;
  icon: string; // e.g., 'sunny', 'cloudy'
  forecast: WeatherForecast[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
