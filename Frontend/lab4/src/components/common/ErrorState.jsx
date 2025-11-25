import { useTranslation } from "react-i18next";

import { useWeather } from "../../context/WeatherContext";

import "../../styles/States.css";

const ErrorState = ({ message }) => {
  const { t } = useTranslation();
  const { refetch } = useWeather();

  const handleRetry = () => {
    if (typeof refetch === "function") {
      refetch();
    } else {
      console.error("❌ [ErrorState] refetch is not a function!", refetch);
    }
  };

  let displayMessage = message;
  if (message === "Failed to fetch" || message?.includes("Network")) {
    displayMessage = t("network_error");
  }

  return (
    <div className="state-container error">
      <p className="state-icon">⚠️</p>
      <p>{t("error_fetching", "Error fetching weather data")}</p>

      {displayMessage && <span className="error-detail">{displayMessage}</span>}

      <button className="retry-button" onClick={handleRetry}>
        {t("try_again", "Try again")}
      </button>
    </div>
  );
};

export default ErrorState;
