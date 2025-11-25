import { useTranslation } from "react-i18next";

import "../../styles/SearchSubmit.css";

const SearchSubmit = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <button className="search-submit-btn" onClick={onClick}>
      {t("search_button")}
    </button>
  );
};

export default SearchSubmit;
