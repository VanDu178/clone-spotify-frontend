import React, { useState, useEffect } from "react";
import Sidebar from '../../components/Artist/SideBar/SideBar';
import './ArtistLayout.css';
import { useUserData } from "../../context/UserDataProvider";
import Forbidden from "../../components/Error/403/403";
import { checkData } from "../../helpers/encryptionHelper";

const ArtistLayout = ({ children }) => {

    const { isLoggedIn } = useUserData();
    const [validRole, setValidRole] = useState(false);
    useEffect(() => {
        const fetchRole = async () => {
            if (isLoggedIn) {
                //nếu đang login thì check role phải artist  không nếu đúng thì không cho hiển thị
                const checkedRoleArtist = await checkData(2);
                if (checkedRoleArtist) {
                    setValidRole(true);
                }
            }
        };

        fetchRole();
    }, [isLoggedIn]);

    if (!validRole) {
        return <Forbidden />;
    }

    return (
        <div className="artist-layout">
            <Sidebar />
            <div className="artist-content">
                {children}
            </div>
        </div>
    );
};

export default ArtistLayout;
