import "../../styles/Dashboard.css";

const ForecastDayCard = ({ item }) => {
  const date = new Date(item.dt * 1000);
  const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
  const iconUrl = `https://openweathermap.org/img/wn/${item.icon}.png`;

  return (
    <div className="forecast-card">
      <span className="forecast-day">{dayName}</span>
      <img src={iconUrl} alt={item.description} title={item.description} />
      <div className="forecast-temp-container">
        <span className="forecast-temp-max">{Math.round(item.max)}°</span>
        <span className="forecast-temp-min">{Math.round(item.min)}°</span>
      </div>
    </div>
  );
};

export default ForecastDayCard;
