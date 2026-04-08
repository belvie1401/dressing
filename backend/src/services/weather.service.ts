import axios from 'axios';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  wind_speed: number;
}

interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: city,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
      lang: 'fr',
    },
  });

  const data = response.data;

  return {
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    city: data.name,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
  };
}

export async function getForecast(city: string): Promise<ForecastDay[]> {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      q: city,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
      lang: 'fr',
      cnt: 40, // 5 days × 8 intervals
    },
  });

  const data = response.data;

  // Group by day and get daily min/max
  const dailyMap = new Map<string, { temps: number[]; descriptions: string[]; icons: string[] }>();

  for (const entry of data.list) {
    const date = entry.dt_txt.split(' ')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { temps: [], descriptions: [], icons: [] });
    }
    const day = dailyMap.get(date)!;
    day.temps.push(entry.main.temp);
    day.descriptions.push(entry.weather[0].description);
    day.icons.push(entry.weather[0].icon);
  }

  const forecast: ForecastDay[] = [];
  for (const [date, day] of dailyMap) {
    forecast.push({
      date,
      temp_min: Math.round(Math.min(...day.temps)),
      temp_max: Math.round(Math.max(...day.temps)),
      description: day.descriptions[Math.floor(day.descriptions.length / 2)],
      icon: day.icons[Math.floor(day.icons.length / 2)],
    });
  }

  return forecast.slice(0, 5);
}
