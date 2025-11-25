import { useMemo } from "react";

import { useFetchJson } from "./useFetchJson";

export const useForecast = (lat, lon, unit, lang) => {
  const API_KEY = import.meta.env.VITE_OWM_API_KEY;

  const url = useMemo(() => {
    if (!lat || !lon) return null;

    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&lang=${lang}&appid=${API_KEY}`;
  }, [lat, lon, unit, lang, API_KEY]);

  return useFetchJson(url);
};
