import { useTranslation } from "react-i18next";

import "../../styles/States.css";

const Loader = () => {
  const { t } = useTranslation();

  return (
    <div className="state-container">
      <div className="spinner"></div>
      <p>{t("loading_message")}</p>
    </div>
  );
};

export default Loader;
