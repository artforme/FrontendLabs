import { useTranslation } from "react-i18next";

import "../../styles/SearchSuggestions.css";

const RecentSearches = ({ items, onSelect, onClear }) => {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="search-suggestions">
      <li className="suggestion-header">
        <span>{t("recent_searches")}</span>

        <span
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          className="clear-history-btn"
        >
          {t("clear_history")}
        </span>
      </li>

      {items.map((item, index) => (
        <li
          key={`recent-${index}`}
          className="suggestion-item"
          onClick={() => onSelect(item)}
        >
          <svg
            className="recent-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>

          <span className="suggestion-city">{item.name}</span>
          {item.country && (
            <span className="suggestion-country">{item.country}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default RecentSearches;
