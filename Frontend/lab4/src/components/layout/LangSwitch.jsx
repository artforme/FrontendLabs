import { useTranslation } from "react-i18next";

import "../../styles/Switches.css";

const LangSwitch = () => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language ? i18n.language.split("-")[0] : "en";

  const toggle = (event) => {
    event.stopPropagation();

    const newLang = currentLang === "ru" ? "en" : "ru";

    i18n.changeLanguage(newLang);
  };

  return (
    <div className="lang-switch" onClick={toggle}>
      <span className={currentLang === "ru" ? "active" : ""}>RU</span>
      <span className="separator">/</span>
      <span className={currentLang === "en" ? "active" : ""}>EN</span>
    </div>
  );
};

export default LangSwitch;
