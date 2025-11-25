import { useTranslation } from "react-i18next";

import "../../styles/States.css";

const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <div className="state-container empty">
      <p className="state-icon">🌤️</p>
      <p>{t("empty_state_text", "Enter a city to see the weather")}</p>
    </div>
  );
};

export default EmptyState;
