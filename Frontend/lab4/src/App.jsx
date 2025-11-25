import AppShell from "./components/layout/AppShell";
import Header from "./components/layout/Header";

import CurrentWeatherCard from "./components/weather/CurrentWeatherCard";
import WeatherMetrics from "./components/weather/WeatherMetrics";
import SunCycle from "./components/weather/SunCycle";
import ForecastList from "./components/weather/ForecastList";
import AQICard from "./components/weather/AQICard";

import Loader from "./components/common/Loader";
import ErrorState from "./components/common/ErrorState";
import EmptyState from "./components/common/EmptyState";

import ThemeSwitch from "./components/layout/ThemeSwitch.jsx";
import LangSwitch from "./components/layout/LangSwitch.jsx";
import UnitSwitch from "./components/layout/UnitSwitch.jsx";

import { UnitProvider } from "./context/UnitContext";
import { WeatherProvider, useWeather } from "./context/WeatherContext";

import "./styles/Dashboard.css";

const Dashboard = () => {
  const { weatherData, forecastData, aqiData, loading, error } = useWeather();

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (!weatherData) return <EmptyState />;

  return (
    <div className="dashboard-grid">
      <div className="main-column">
        <CurrentWeatherCard data={weatherData} />
        <WeatherMetrics data={weatherData} />
        <ForecastList data={forecastData} />
      </div>
      <div className="side-column">
        <SunCycle sys={weatherData.sys} timezone={weatherData.timezone} />
        <AQICard data={aqiData} />
      </div>
    </div>
  );
};

const AppContent = () => {
  const { hasData } = useWeather();

  const layoutMode = hasData ? "results-mode" : "search-mode";

  return (
    <AppShell>
      <div className={`app-layout-wrapper ${layoutMode}`}>
        <div className="app-theme-toggle-position">
          <LangSwitch />
          <UnitSwitch />
          <ThemeSwitch />
        </div>

        <Header />

        <main className="main-content">
          <Dashboard />
        </main>
      </div>
    </AppShell>
  );
};

const App = () => {
  return (
    <UnitProvider>
      <WeatherProvider>
        <AppContent />
      </WeatherProvider>
    </UnitProvider>
  );
};

export default App;
