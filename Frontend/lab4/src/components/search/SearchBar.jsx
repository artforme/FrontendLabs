import { useTranslation } from "react-i18next";

import "../../styles/SearchBar.css";

const SearchBar = ({ value, onChange, onSubmit, onFocus }) => {
  const { t } = useTranslation();

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder={t("search_placeholder")}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
      />
    </div>
  );
};

export default SearchBar;
