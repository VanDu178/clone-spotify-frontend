import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSpotify } from "react-icons/fa";
import { GoBell, GoHomeFill } from "react-icons/go";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import { useUserData } from "../../context/UserDataProvider";
import { useUser } from "../../context/UserProvider";
import { checkData } from "../../helpers/encryptionHelper";
import "./Header.css";

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, setIsLoggedIn, userData } = useUserData();
  const [activeLang, setActiveLang] = useState(i18n.language);
  const navigate = useNavigate();
  const { getUserInfo } = useUser();
  const [userPanelState, setUserPanelState] = useState(false);
  const [validRole, setValidRole] = useState(false);
  const { debouncedSetKeyword } = useSearch();

  useEffect(() => {
    const fetchRole = async () => {
      if (isLoggedIn) {
        getUserInfo();
        //nếu đang login thì check role phải user không
        const checkedRoleUser = await checkData(3);
        if (checkedRoleUser) {
          setValidRole(true);
        }
      } else {
        //nếu không login thì hiển thị
        setValidRole(true);
      }
    };

    fetchRole();
  }, [isLoggedIn]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setActiveLang(lng);
  };

  const getButtonClass = (lang) => {
    return activeLang === lang ? "hd-lang-on" : "hd-lang-off";
  };

  const toggleUserPanel = () => {
    setUserPanelState((prevState) => !prevState);
  }

  const logout = async () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("secrect_key");
    setIsLoggedIn(false);
  };


  useEffect(() => {
    if (!userPanelState) return;
    const handleClickOutside = (event) => {
      if (!event.target.closest(".hd-user-profile")) {
        setUserPanelState(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [userPanelState]);

  if (!validRole) {
    return null;
  }
  return (
    <header className="hd-spotify-header">
      <div className="hd-logo">
        <FaSpotify size={32} color="white" title="Spotify" />
        <div className="hd-home-search">
          <button className="hd-home-button">
            <GoHomeFill color="white" size={36} title="Home" />
          </button>
          <div className="hd-search-bar">
            <div className="hd-search-icon">
              <IoSearchOutline size={24} color="white" title="Search" />
            </div>
            <input type="text" placeholder={t("header2.searchPlaceholder")} onChange={(e) => debouncedSetKeyword(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="hd-premium-download">
        <nav className="hd-nav-links hd-premium" title={t("header2.upgradeToPremium")}>
          <button onClick={() => navigate("/user/premium")}>
            <span>{t("header2.explorePremium")}</span>
          </button>
        </nav>
        <nav className="hd-nav-links hd-download">
          <button>
            <MdOutlineDownloadForOffline size={20} color="white" />
            {t("header2.installApp")}
          </button>
        </nav>
        <nav className="hd-nav-links hd-news com-glow-zoom">
          <button>
            <GoBell size={20} color="white" title={t("header2.news")} />
          </button>
        </nav>
        <nav className="hd-nav-links hd-language">
          <button
            className={`${getButtonClass("vi")} glow-zoom`}
            onClick={() => changeLanguage("vi")}
            disabled={activeLang === "vi"}
          >
            VI
          </button>
          <button
            className={`${getButtonClass("en")} glow-zoom`}
            onClick={() => changeLanguage("en")}
            disabled={activeLang === "en"}
          >
            EN
          </button>
        </nav>
      </div>

      {isLoggedIn ? (
        <div className="hd-user-profile com-vertical-align" onClick={toggleUserPanel}>
          <img src={userData.image_path ? userData.image_path : "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid"} alt="User" />
          {userPanelState && (
            <div className="hd-user-menu">
              <ul>
                <button onClick={() => { navigate("/account/overview"); }}>{t("header2.account")}</button>
                <button>{t("header2.profile")}</button>
                <button onClick={() => navigate("/premium")}>{t("header2.upgradeToPremium")}</button>
                <button>{t("header2.support")}</button>
                <button>{t("header2.privateSession")}</button>
                <button>{t("header2.setting")}</button>
                <button onClick={logout}>{t("header2.logout")}</button>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <a className="hd-login" href="/login">
          {t("header2.login")}
        </a>
      )}
    </header >
  );
};

export default Header;