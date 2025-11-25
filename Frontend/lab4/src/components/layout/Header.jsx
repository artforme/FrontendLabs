import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import SearchBar from "../search/SearchBar.jsx";
import SearchSuggestions from "../search/SearchSuggestions.jsx";
import SearchSubmit from "../search/SearchSubmit.jsx";
import LocationBadge from "../search/LocationBadge.jsx";

import { useGeoLocation } from "../../hooks/useGeoLocation";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useWeather } from "../../context/WeatherContext";

import "../../styles/Header.css";

const Header = () => {
  const { i18n } = useTranslation();
  const { searchWeather, loading } = useWeather();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [recentSearches, setRecentSearches] = useLocalStorage(
    "weather_recent_searches",
    [],
  );

  const { location, coords } = useGeoLocation(i18n.language);

  const addToHistory = useCallback(
    (item) => {
      const newItem = typeof item === "string" ? { name: item } : item;
      if (!newItem.name) return;

      setRecentSearches((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];

        const filtered = safePrev.filter(
          (i) => i.name.toLowerCase() !== newItem.name.toLowerCase(),
        );

        return [newItem, ...filtered].slice(0, 5);
      });
    },
    [setRecentSearches],
  );

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = () => {
    const term = searchTerm.trim();

    if (!term) {
      searchWeather(null);
      setShowSuggestions(false);
      return;
    }

    if (loading) return;
    if (term.toLowerCase() === "detecting...") return;

    searchWeather(term);
    addToHistory(term);
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (item) => {
    setSearchTerm(item.name);
    setShowSuggestions(false);

    if (item.lat && item.lon) {
      searchWeather({ lat: item.lat, lon: item.lon, name: item.name });
    } else {
      searchWeather(item.name);
    }

    addToHistory(item);
  };

  const handleLocationClick = (city) => {
    if (loading) return;
    if (!city || city.toLowerCase() === "detecting...") return;

    setSearchTerm(city);
    setShowSuggestions(false);

    if (coords) {
      searchWeather({ lat: coords.latitude, lon: coords.longitude });
    } else if (location.city) {
      searchWeather(location.city);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".header__search")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__location">
          <LocationBadge
            city={location.city}
            country={location.country}
            onClick={handleLocationClick}
          />
        </div>

        <div className="header__search">
          <div className="search-container">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onSubmit={handleSearchSubmit}
            />

            {showSuggestions && (
              <SearchSuggestions
                query={searchTerm}
                recentSearches={recentSearches}
                onSelect={handleSuggestionSelect}
                onClear={handleClearHistory}
              />
            )}
          </div>
        </div>

        <div className="header__submit">
          <SearchSubmit onClick={handleSearchSubmit} />
        </div>
      </div>
    </header>
  );
};

export default Header;
