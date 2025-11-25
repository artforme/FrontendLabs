import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import ForecastDayCard from "./ForecastDayCard";

import "../../styles/Dashboard.css";

const ForecastList = ({ data }) => {
  const { t } = useTranslation();

  const dailyForecast = useMemo(() => {
    if (!data || !data.list) return [];

    const days = {};

    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];

      if (!days[date]) {
        days[date] = {
          dt: item.dt,
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      } else {
        days[date].min = Math.min(days[date].min, item.main.temp_min);
        days[date].max = Math.max(days[date].max, item.main.temp_max);

        if (item.dt_txt.includes("12:00")) {
          days[date].icon = item.weather[0].icon;
          days[date].description = item.weather[0].description;
        }
      }
    });

    return Object.values(days).slice(0, 5);
  }, [data]);

  if (!dailyForecast.length) return null;

  return (
    <div className="weather-card forecast-container">
      <h3 className="forecast-title">{t("forecast_title")}</h3>
      <div className="forecast-list">
        {dailyForecast.map((item) => (
          <ForecastDayCard key={item.dt} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ForecastList;
