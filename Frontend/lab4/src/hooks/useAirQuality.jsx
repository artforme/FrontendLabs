import { useMemo } from "react";

import { useFetchJson } from "./useFetchJson";

export const useAirQuality = (lat, lon) => {
  const API_KEY = import.meta.env.VITE_OWM_API_KEY;

  const url = useMemo(() => {
    if (!lat || !lon) return null;

    return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  }, [lat, lon, API_KEY]);

  return useFetchJson(url);
};
