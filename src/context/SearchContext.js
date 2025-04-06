import debounce from "lodash/debounce";
import { createContext, useContext, useMemo, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchKeyword, setSearchKeyword] = useState("");

    // debounce chỉ gọi setSearchKeyword sau 300ms không đổi input
    const debouncedSetKeyword = useMemo(() => debounce((value) => {
        setSearchKeyword(value);
    }, 300), []);

    return (
        <SearchContext.Provider value={{ searchKeyword, debouncedSetKeyword }}>
        {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
