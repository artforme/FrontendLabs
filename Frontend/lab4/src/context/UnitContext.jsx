import { createContext, useContext } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
  const [unit, setUnit] = useLocalStorage("weather_app_unit", "metric");

  const toggleUnit = () => {
    setUnit((prev) => {
      return prev === "metric" ? "imperial" : "metric";
    });
  };

  const value = {
    unit,
    toggleUnit,
    Metric: unit,
    symbol: unit === "metric" ? "°C" : "°F",
    speedSymbol: unit === "metric" ? "m/s" : "mph",
  };

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
};

export const useUnit = () => {
  const context = useContext(UnitContext);

  if (!context) {
    throw new Error("useUnit must be used within a UnitProvider");
  }

  return context;
};
