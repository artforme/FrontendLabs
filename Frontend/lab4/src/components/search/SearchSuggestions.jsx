import { useTranslation } from "react-i18next";

import { useSearchSuggestions } from "../../hooks/useSearchSuggestions";

import RecentSearches from "./RecentSearches";

import "../../styles/SearchSuggestions.css";

const SearchSuggestions = ({ query, recentSearches, onSelect, onClear }) => {
  const { t, i18n } = useTranslation();
  const { suggestions, loading, shouldFetch } = useSearchSuggestions(query);

  const showRecent = !query || query.trim() === "";

  if (showRecent) {
    return (
      <RecentSearches
        items={recentSearches}
        onSelect={onSelect}
        onClear={onClear}
      />
    );
  }

  if (!shouldFetch) {
    return null;
  }

  const getLocalizedName = (item) => {
    const currentLang = i18n.language ? i18n.language.split("-")[0] : "en";

    return item.local_names?.[currentLang] || item.name;
  };

  return (
    <ul className="search-suggestions">
      {loading && (
        <li className="suggestion-item disabled">
          {t("loading", "Loading...")}
        </li>
      )}

      {!loading && (!suggestions || suggestions.length === 0) && (
        <li className="suggestion-item disabled">
          {t("no_results", "Nothing found")}
        </li>
      )}

      {!loading &&
        suggestions?.map((item, index) => {
          const displayName = getLocalizedName(item);
          return (
            <li
              key={`${item.name}-${item.lat}-${index}`}
              className="suggestion-item"
              onClick={() => onSelect({ ...item, name: displayName })}
            >
              <span className="suggestion-city">{displayName}</span>
              <span className="suggestion-country">
                {item.state ? `${item.state}, ` : ""}
                {item.country}
              </span>
            </li>
          );
        })}
    </ul>
  );
};

export default SearchSuggestions;
