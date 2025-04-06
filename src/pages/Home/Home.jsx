import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Forbidden from "../../components/Error/403/403";
import Loading from "../../components/Loading/Loading";
import axiosInstance from "../../config/axiosConfig";
import { useSearch } from "../../context/SearchContext";
import { useUserData } from "../../context/UserDataProvider";
import { checkData } from "../../helpers/encryptionHelper";
import HomeTabs from "../HomeTabs/HomeTabs";
import "./Home.css";

const Home = () => {
    const { t } = useTranslation();

    // State để lưu trữ danh sách playlists và albums từ API
    const [playlists, setPlaylists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true); // Trạng thái loading
    const { isLoggedIn } = useUserData();
    const [validRole, setValidRole] = useState(false);

    const { searchKeyword } = useSearch(); 

    const [selectedType, setSelectedType] = useState("all");

    useEffect(() => {
        const fetchRole = async () => {
            if (isLoggedIn) {
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

    // Hàm gọi API để lấy danh sách trending playlists và albums
    useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                // Gọi API để lấy danh sách trending playlists
                const playlistResponse = await axiosInstance.get("/trending/playlists/");
                console.log("playlist data", playlistResponse.data);
                setPlaylists(playlistResponse.data.trending_playlists);

                const songResponse = await axiosInstance.get("/trending/songs/");
                console.log("song data", songResponse.data);
                setSongs(songResponse.data.trending_songs);

                // Gọi API để lấy danh sách trending albums
                const albumResponse = await axiosInstance.get("/trending/albums/");
                setAlbums(albumResponse.data.trending_albums);
                console.log("album data", albumResponse.data);
            } catch (error) {
                console.error("Error fetching trending data:", error.response ? error.response.data : error.message);
            } finally {
                setLoading(false); // Tắt trạng thái loading sau khi gọi API xong
            }
        };

        fetchTrendingData(); 
    }, []); // Chỉ chạy một lần khi component mount

    // Hiển thị loading nếu dữ liệu chưa được tải
    if (loading) {
        return <Loading message={t("utils.loading")} height="60" />;
    }

    if (!validRole) {
        return <Forbidden />;
    }

    const isSearching = searchKeyword && searchKeyword.trim().length > 0;

    return (
        <div className="col home-content">
            <div className="p-3 border rounded-3 home-content">
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="d-flex justify-content-center">
                        <button className="custom-btn active mx-2">{t("home.all")}</button>
                        <button className="custom-btn mx-2">{t("home.music")}</button>
                        <button className="custom-btn mx-2">{t("home.album")}</button>
                        <button className="custom-btn mx-2">{t("home.playlists")}</button>
                        <button className="custom-btn mx-2">{t("home.artist")}</button>
                        <button className="custom-btn mx-2">{t("home.podcast")}</button>
                        <button className="custom-btn mx-2">{t("home.category")}</button>
                        <button className="custom-btn mx-2">{t("home.profile")}</button>
                    </div>
                </nav>

                <div id="content-viewer">
                    {/* <div className="card-group card-group-scroll">
                        <MusicSlider items={playlists} type="playlist" />
                    </div>
                    <div className="card-group card-group-scroll">
                        <MusicSlider items={albums} type="album" />
                    </div>
                    <div className="card-group card-group-scroll">
                        <MusicSlider items={songs} type="song" />
                    </div> */}
                    
                    {/* Nếu có search thì hiển thị search tab */}
                    {isSearching ? (
                        <HomeTabs type={selectedType} keyword={searchKeyword} isSearch />
                    ) : (
                        <>
                            {/* Nếu không search thì hiển thị nội dung gốc */}
                            <HomeTabs type={selectedType} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;