import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MusicPlayerControls from "../../components/MusicPlayerControls/MusicPlayerControls";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import SideBar from "../../components/Sidebar/LeftSideBar";
import "./Main.css";
import { useUserData } from "../../context/UserDataProvider";
import { useIsVisiableRootModal } from "../../context/IsVisiableRootModal";

import Forbidden from "../../components/Error/403/403";
import { checkData } from "../../helpers/encryptionHelper";
import Loading from "../../components/Loading/Loading";
import { useTranslation } from "react-i18next";
import RootModal from '../../components/Modal/RootModal/RootModal';
import { useLocation } from "react-router-dom"; // Import useLocation

const Main = ({ children }) => {
    const { isLoggedIn } = useUserData();
    const [validRole, setValidRole] = useState(true);
    const [IsCheckingRole, setIsCheckingRole] = useState(true);
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isVisiableRootModal, setIsVisiableRootModal } = useIsVisiableRootModal();
    const location = useLocation(); // Get current URL location

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsVisiableRootModal(false);
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchRole = async () => {
            setIsCheckingRole(true);
            if (isLoggedIn) {
                //nếu đang login thì check role phải artist hoặc admin không nếu đúng thì không cho hiển thị
                const checkedRoleArtist = await checkData(2);
                const checkedRoleAdmin = await checkData(1);
                if (checkedRoleArtist || checkedRoleAdmin) {
                    setValidRole(false);
                    setIsCheckingRole(false);
                }
            }
            setIsCheckingRole(false);
        };

        fetchRole();
    }, [isLoggedIn]);

    useEffect(() => {
        if (isVisiableRootModal) {
            openModal();
        }
        else {
            closeModal();
        }
    }, [isVisiableRootModal]);

    if (IsCheckingRole) {
        return <Loading message={t("utils.loading")} height="110" />;
    }

    if (!validRole) {
        return <Forbidden />;
    }
    return (
        <div className="main-container">
            <header className="main-header">
                <Header />
            </header>
            <div className="main-content">
                <div className="sidebar-container">
                    <SideBar />
                </div>
                <div
                    className={
                        !location.pathname.includes("/chat")
                            ? "main-content-container"
                            : "main-content-container-chat"
                    }
                >
                    <RootModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                    />
                    {children}
                    {location.pathname.includes("/chat") || !location.pathname.includes("/play-video") && <Footer />} {/* Updated to use includes */}
                </div>
            </div>
            <MusicPlayerControls />
        </div>
    );
};

export default Main;