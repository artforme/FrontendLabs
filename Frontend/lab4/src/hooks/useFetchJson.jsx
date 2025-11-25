import { useState, useEffect, useCallback } from "react";

export const useFetchJson = (url, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    if (!url) {
      setData(null);
      setLoading(false);

      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        return response.json();
      })
      .then((jsonData) => {
        if (jsonData.cod && Number(jsonData.cod) !== 200) {
          throw new Error(jsonData.message || "API Error");
        }

        setData(jsonData);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setData(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    const cleanup = fetchData();

    return cleanup;
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
};
