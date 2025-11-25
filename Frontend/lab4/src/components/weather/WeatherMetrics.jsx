import { useTranslation } from "react-i18next";

import { useUnit } from "../../context/UnitContext";

import "../../styles/Dashboard.css";

const WeatherMetrics = ({ data }) => {
  const { t } = useTranslation();
  const { speedSymbol } = useUnit();

  if (!data) return null;

  const { main, wind, visibility } = data;

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <span>{t("feels_like")}</span>
        <strong>{Math.round(main.feels_like)}°</strong>
      </div>
      <div className="metric-card">
        <span>{t("humidity")}</span>
        <strong>{main.humidity}%</strong>
      </div>
      <div className="metric-card">
        <span>{t("wind")}</span>
        <strong>
          {wind.speed} {speedSymbol}
        </strong>
      </div>
      <div className="metric-card">
        <span>{t("pressure")}</span>
        <strong>{main.pressure} hPa</strong>
      </div>
      <div className="metric-card">
        <span>{t("visibility")}</span>
        <strong>{(visibility / 1000).toFixed(1)} km</strong>
      </div>
      <div className="metric-card">
        <span>Min / Max</span>
        <strong>
          {Math.round(main.temp_min)}° / {Math.round(main.temp_max)}°
        </strong>
      </div>
    </div>
  );
};

export default WeatherMetrics;
