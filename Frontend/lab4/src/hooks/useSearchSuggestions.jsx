import { useMemo } from "react";
import { useDebounce } from "./useDebounce"; // Убедитесь, что путь верный
import { useFetchJson } from "./useFetchJson"; // Убедитесь, что путь верный

export const useSearchSuggestions = (query) => {
  const API_KEY = import.meta.env.VITE_OWM_API_KEY;

  const debouncedQuery = useDebounce(query, 500);

  const shouldFetch = debouncedQuery && debouncedQuery.length > 2;

  const url = useMemo(() => {
    if (!shouldFetch) {
      return null;
    }

    return `https://api.openweathermap.org/geo/1.0/direct?q=${debouncedQuery}&limit=5&appid=${API_KEY}`;
  }, [debouncedQuery, shouldFetch, API_KEY]);

  const { data, loading, error } = useFetchJson(url, [debouncedQuery]);

  return {
    suggestions: data,
    loading,
    error,
    shouldFetch,
  };
};
