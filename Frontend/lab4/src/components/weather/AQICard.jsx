import { useTranslation } from "react-i18next";

import "../../styles/Dashboard.css";

const AQICard = ({ data }) => {
  const { t } = useTranslation();

  if (!data || !data.list || !data.list[0]) return null;

  const aqiIndex = data.list[0].main.aqi;

  const getStatus = (index) => {
    const keys = ["good", "fair", "moderate", "poor", "very_poor"];

    return t(`aqi_${keys[index - 1]}`);
  };

  const getColor = (index) => {
    const colors = ["#4ade80", "#a3e635", "#facc15", "#f87171", "#991b1b"];

    return colors[index - 1] || "#ccc";
  };

  return (
    <div className="weather-card aqi-card">
      <h3>{t("aqi_title")}</h3>
      <div className="aqi-content">
        <div
          className="aqi-badge"
          style={{ backgroundColor: getColor(aqiIndex) }}
        >
          {aqiIndex}
        </div>
        <span className="aqi-status">{getStatus(aqiIndex)}</span>
      </div>
    </div>
  );
};

export default AQICard;
