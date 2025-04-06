import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlay } from "react-icons/fa";
import { useUserData } from "../../context/UserDataProvider";
import { checkData } from "../../helpers/encryptionHelper";
import "./UserCard.css";

const UserCard = ({ name, image, role_id }) => {
    const [validRole, setValidRole] = useState(false);
    const { isLoggedIn } = useUserData();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchRole = async () => {
            if (isLoggedIn) {
                const checkedRoleUser = await checkData(3);
                if (checkedRoleUser) {
                    setValidRole(true);
                }
            } else {
                setValidRole(true);
            }
        };

        fetchRole();
    }, [isLoggedIn]);

    if (!validRole) return null;

    return (
        <div className="card artist-card text-white position-relative">
            <div className="position-relative">
                <img
                    src={image || "https://via.placeholder.com/300x300?text=Artist"}
                    alt={name}
                    className="card-img-top"
                />
                {role_id === 2 && (
                    <div className="play-icon position-absolute top-50 start-50 translate-middle">
                        <FaPlay size={24} />
                    </div>
                )}
            </div>
            <div className="card-body text-center">
                <h5 className="card-title mb-1">{name}</h5>
                <p className="card-text text-muted">
                    {(role_id === 2)?t("UserCard.artist"):t("UserCard.profile")}
                </p>
            </div>
        </div>
    );
};

export default UserCard;