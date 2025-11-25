import { useTranslation } from "react-i18next";

import "../../styles/Dashboard.css";

const SunCycle = ({ sys, timezone }) => {
  const { t } = useTranslation();

  const formatTime = (timestamp) => {
    const date = new Date((timestamp + timezone) * 1000);

    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  return (
    <div className="weather-card sun-cycle">
      <div className="sun-item">
        <span className="sun-label">{t("sunrise")}</span>
        <span className="sun-time">{formatTime(sys.sunrise)}</span>
        <span className="sun-icon">🌅</span>
      </div>
      <div className="separator-line" />
      <div className="sun-item">
        <span className="sun-label">{t("sunset")}</span>
        <span className="sun-time">{formatTime(sys.sunset)}</span>
        <span className="sun-icon">🌇</span>
      </div>
    </div>
  );
};

export default SunCycle;
