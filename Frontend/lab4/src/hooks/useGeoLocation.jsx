import { useState, useEffect } from "react";

export const useGeoLocation = (lang = "en") => {
  const [location, setLocation] = useState({
    city: "Detecting...",
    country: "",
    loaded: false,
  });

  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      handleError({ message: "Geolocation not supported" });

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        handleError(err);
      },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;

    const langCode = lang ? lang.slice(0, 2) : "en";

    const fetchCityName = async () => {
      try {
        const { latitude, longitude } = coords;
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${langCode}`;

        const response = await fetch(url);
        const data = await response.json();

        setLocation({
          city: data.city || data.locality || "Unknown",
          country: data.countryCode || "",
          loaded: true,
        });
      } catch (err) {
        setError("Failed to fetch city name");
        setLocation((prev) => ({
          ...prev,
          loaded: true,
          city: "Unknown Location",
        }));
      }
    };

    fetchCityName();
  }, [coords, lang]);

  const handleError = (error) => {
    setError(error.message);
    setLocation({
      city: "",
      country: "",
      loaded: true,
    });
  };

  return { location, coords, error };
};
