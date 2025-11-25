import { useMemo } from "react";
import { useFetchJson } from "./useFetchJson";

export const useCurrentWeather = (lat, lon, city, unit, lang) => {
  const API_KEY = import.meta.env.VITE_OWM_API_KEY;

  const url = useMemo(() => {
    if ((!lat || !lon) && !city) {
      return null;
    }

    const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    const params = `units=${unit}&lang=${lang}&appid=${API_KEY}`;

    if (lat && lon) {
      return `${baseUrl}?lat=${lat}&lon=${lon}&${params}`;
    }

    if (city) {
      return `${baseUrl}?q=${city}&${params}`;
    }

    return null;
  }, [lat, lon, city, unit, lang, API_KEY]);

  return useFetchJson(url);
};
