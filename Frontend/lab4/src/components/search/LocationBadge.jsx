import { useTranslation } from "react-i18next";
import { useMemo } from "react";

import "../../styles/LocationBadge.css";

const LocationBadge = ({ city, country, onClick }) => {
  const { t, i18n } = useTranslation();

  const isDetectingRaw = city?.toLowerCase() === "detecting...";
  const displayCity = isDetectingRaw ? t("detecting") : city;

  const displayCountry = useMemo(() => {
    if (!country || isDetectingRaw) return "";

    try {
      const regionNames = new Intl.DisplayNames([i18n.language], {
        type: "region",
      });

      return regionNames.of(country);
    } catch (e) {
      return country;
    }
  }, [country, i18n.language, isDetectingRaw]);

  const handleClick = () => {
    if (onClick && !isDetectingRaw) {
      onClick(city);
    }
  };

  return (
    <div
      className={`location-badge ${isDetectingRaw ? "detecting" : ""}`}
      onClick={handleClick}
      title={
        isDetectingRaw ? t("location_detecting_title") : t("location_title")
      }
    >
      <svg
        className="location-icon"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
      <div className="location-text">
        <span className="location-city">{displayCity}</span>
        {!isDetectingRaw && (
          <span className="location-country">{displayCountry}</span>
        )}
      </div>
    </div>
  );
};

export default LocationBadge;
