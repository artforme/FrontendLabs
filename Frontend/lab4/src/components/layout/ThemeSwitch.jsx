import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import "../../styles/ThemeSwitch.css";

const ThemeSwitch = () => {
  const [active, setActive] = useLocalStorage("ThemeSwitch", false);
  const { t } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add("inverted-theme");
    } else {
      root.classList.remove("inverted-theme");
    }
  }, [active]);

  const toggle = () => {
    setActive((prev) => !prev);
  };

  return (
    <div className="theme-switch-container" onClick={toggle}>
      <div className={`toggle-track ${active ? "active" : ""}`}>
        <div className="toggle-thumb" />
      </div>

      <span className="theme-status__text">
        {/* Исправлено: t() вместо translation() */}
        {active ? t("dark_mode", "Dark Mode") : t("light_mode", "Light Mode")}
      </span>
    </div>
  );
};

export default ThemeSwitch;
