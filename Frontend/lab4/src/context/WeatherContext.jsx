import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";

import { useUnit } from "./UnitContext";

import { useCurrentWeather } from "../hooks/useCurrentWeather";
import { useForecast } from "../hooks/useForecast";
import { useAirQuality } from "../hooks/useAirQuality";

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { unit } = useUnit();
  const [searchParams, setSearchParams] = useState(null);
  const lang = i18n.language ? i18n.language.split("-")[0] : "en";

  let lat = null;
  let lon = null;
  let city = null;

  if (searchParams) {
    if (typeof searchParams === "string") {
      city = searchParams;
    } else {
      lat = searchParams.lat;
      lon = searchParams.lon;
      city = searchParams.name;
    }
  }

  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useCurrentWeather(lat, lon, city, unit, lang);

  const finalLat = weatherData?.coord?.lat;
  const finalLon = weatherData?.coord?.lon;

  const {
    data: forecastData,
    loading: forecastLoading,
    refetch: refetchForecast,
  } = useForecast(finalLat, finalLon, unit, lang);

  const {
    data: aqiData,
    loading: aqiLoading,
    refetch: refetchAQI,
  } = useAirQuality(finalLat, finalLon);

  const handleSearch = useCallback((params) => {
    setSearchParams((prev) => {
      if (JSON.stringify(params) === JSON.stringify(prev)) return prev;

      return params;
    });
  }, []);

  const refetchAll = useCallback(() => {
    refetchWeather();

    if (finalLat && finalLon) {
      refetchForecast();
      refetchAQI();
    }
  }, [refetchWeather, refetchForecast, refetchAQI, finalLat, finalLon]);

  const isLoading = searchParams
    ? weatherLoading || forecastLoading || aqiLoading
    : false;

  const value = useMemo(
    () => ({
      weatherData,
      forecastData,
      aqiData,
      loading: isLoading,
      error: weatherError,
      searchWeather: handleSearch,
      refetch: refetchAll,
      hasData: !!weatherData,
    }),
    [
      weatherData,
      forecastData,
      aqiData,
      isLoading,
      weatherError,
      handleSearch,
      refetchAll,
    ],
  );

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);

  if (!context)
    throw new Error("useWeather must be used within a WeatherProvider");

  return context;
};
