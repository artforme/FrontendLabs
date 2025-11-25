import "../../styles/CurrentWeatherCard.css";

const CurrentWeatherCard = ({ data }) => {
  if (!data) return null;

  const { main, weather, name, sys } = data;
  const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

  return (
    <div className="weather-card current-weather">
      <div className="weather-header">
        <div>
          <h2 className="city-name">
            {name}, {sys.country}
          </h2>
          <p className="weather-desc">{weather[0].description}</p>
        </div>
        <img src={iconUrl} alt={weather[0].main} className="weather-icon" />
      </div>

      <div className="weather-body">
        <div className="temp-container">
          <span className="temperature">{Math.round(main.temp)}°</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
