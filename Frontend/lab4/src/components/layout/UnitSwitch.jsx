import { useUnit } from "../../context/UnitContext";

import "../../styles/UnitSwitch.css";

const UnitSwitch = () => {
  const { Metric, toggleUnit } = useUnit();

  return (
    <div className="unit-switch" onClick={toggleUnit}>
      <span className={Metric === "metric" ? "active" : ""}>°C</span>
      <span className="separator">/</span>
      <span className={Metric === "imperial" ? "active" : ""}>°F</span>
    </div>
  );
};

export default UnitSwitch;
