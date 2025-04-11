import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { checkData } from "../../../helpers/encryptionHelper";
import { useUserData } from "../../../context/UserDataProvider";
import Cookies from "js-cookie";
import './SideBar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [activeLang, setActiveLang] = useState(i18n.language);
    const { isLoggedIn, setIsLoggedIn } = useUserData();
    const [validRole, setValidRole] = useState(false);

    useEffect(() => {
        const fetchRole = async () => {
            if (isLoggedIn) {
                //nếu đang login thì check role phải artist không
                const checkedRoleUser = await checkData(2);
                if (checkedRoleUser) {
                    setValidRole(true);
                }
            }
        };

        fetchRole();
    }, [isLoggedIn]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setActiveLang(lng);
    };

    // Danh sách menu items với đường dẫn tương ứng
    const menuItems = [
        { name: t('artist.sidebar.music'), path: '/artist/songs' },
        { name: t('artist.sidebar.profile'), path: '/artist/my-profile' },
        { name: t('artist.sidebar.upload'), path: '/artist/upload' },
        { name: t('artist.sidebar.album'), path: '/artist/albums' },

    ];

    // Hàm xử lý khi nhấp vào menu item
    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = async () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("secrect_key");
        setIsLoggedIn(false);
        navigate("/");
    };

    if (!validRole || !isLoggedIn) {
        return null;
    }

    return (
        <div className="artist-sidebar">
            <div className="artist-sidebar-logo">
                <h2>{t('artist.sidebar.portal_title')}</h2>
            </div>
            <hr></hr>
            <nav className="artist-sidebar-menu">
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item.name}
                            className={`artist-sidebar-menu-item ${location.pathname === item.path ? 'active' : ''
                                }`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            </nav>
            <hr />
            <nav className="artist-sidebar-lang-nav">
                <span className={`lang-toggle-bg ${activeLang === 'en' ? 'move-right' : ''}`}></span>
                <button
                    className={`artist-sidebar-lang-button ${activeLang === 'vi' ? 'active' : ''}`}
                    onClick={() => changeLanguage('vi')}
                    disabled={activeLang === 'vi'}
                >
                    VI
                </button>
                <button
                    className={`artist-sidebar-lang-button ${activeLang === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                    disabled={activeLang === 'en'}
                >
                    EN
                </button>
            </nav>
            {/* Nút Logout */}
            <div className="admin-sidebar-logout">
                <button className="admin-sidebar-logout-button" onClick={handleLogout}>
                    {t('utils.logout')}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;