import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Forbidden from "../../components/Error/403/403";
import { useUserData } from "../../context/UserDataProvider";
import { checkData } from "../../helpers/encryptionHelper";
import AlbumCard from "../AlbumCard/AlbumCard";
import Loading from "../Loading/Loading";
import PlaylistCard from "../PlaylistCard/PlaylistCard";
import SongItem from "../SongItem/SongItem";
import UserCard from "../UserCard/UserCard";
import "./HomeTabs.css";

const HomeTabs = ({ type, keyword }) => {
    const { t } = useTranslation();
    const { isLoggedIn } = useUserData();
    const [validRole, setValidRole] = useState(true);
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState({
        songs: false,
        playlists: false,
        albums: false,
        artists: false,
        users: false,
    }
    );
    const [page, setPage] = useState({
        songs: 0,
        playlists: 0,
        albums: 0,
        artists: 0,
        users: 0,
    });
    const [hasMore, setHasMore] = useState({
        songs: true,
        playlists: true,
        albums: true,
        artists: true,
        users: true,
    });
    const limit = 10;

    const fetchSongs = async () => {
        if (loading.songs || !hasMore.songs) return;
        setLoading(prev => ({ ...prev, songs: true }));
        try {
            const offset = page.songs * limit;
            const response = await axios.get(`/api/search/`, {
                params: { type: "songs", keyword, limit, offset },
            });
            if (response.data) {
                setSongs((prev) => [...prev, ...response.data.songs]);
                const hasMoreData = response.data.songs.length === limit;
                setHasMore(prev => ({ ...prev, songs: hasMoreData }));
                setPage((prev) => ({...prev, songs: prev.songs + 1}));
            } else {
                setHasMore(prev => ({ ...prev, songs: false }));
            }
        } catch (error) {
            console.error("Error fetching songs: ", error);
        } finally {
            setLoading(prev => ({ ...prev, songs: false }));
        }
    };

    const fetchPlaylists = async () => {
        if (loading.playlists || !hasMore.playlists) return;
        setLoading(prev => ({ ...prev, playlists: true }));
        try {
            const offset = page.playlists * limit;
            const response = await axios.get(`/api/search/`, {
                params: { type: "playlists", keyword, limit, offset },
            });
            if (response.data) {
                setPlaylists((prev) => [...prev, ...response.data.playlists]);
                const hasMoreData = response.data.playlists.length === limit;
                setHasMore(prev => ({ ...prev, playlists: hasMoreData }));
                setPage((prev) => ({...prev, playlists: prev.playlists + 1}));
            } else {
                setHasMore(prev => ({ ...prev, playlists: false }));
            }
        } catch (error) {
            console.error("Error fetching playlists: ", error);
        } finally {
            setLoading(prev => ({ ...prev, playlists: false }));
        }
    };

    const fetchAlbums = async () => {
        if (loading.albums || !hasMore.albums) return;
        setLoading(prev => ({ ...prev, albums: true }));
        try {
            const offset = page.albums * limit;
            const response = await axios.get(`/api/search/`, {
                params: { type: "albums", keyword, limit, offset },
            });
            if (response.data) {
                setAlbums((prev) => [...prev, ...response.data.albums]);
                const hasMoreData = response.data.albums.length === limit;
                setHasMore(prev => ({ ...prev, albums: hasMoreData }));
                setPage((prev) => ({...prev, albums: prev.albums + 1}));
            } else {
                setHasMore(prev => ({ ...prev, albums: false }));
            }
        } catch (error) {
            console.error("Error fetching albums: ", error);
        } finally {
            setLoading(prev => ({ ...prev, albums: false }));
        }
    };

    const fetchUsers = async () => {
        if (loading.users || !hasMore.users) return;
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const offset = page.users * limit;
            const response = await axios.get(`/api/search/`, {
                params: { type: "users", keyword, limit, offset },
            });
            if (response.data) {
                setUsers((prev) => [...prev, ...response.data.users]);
                const hasMoreData = response.data.users.length === limit;
                setHasMore(prev => ({ ...prev, users: hasMoreData }));
                setPage((prev) => ({...prev, users: prev.users + 1}));
            } else {
                setHasMore(prev => ({ ...prev, users: false }));
            }
        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    const fetchArtists = async () => {
        if (loading.artists || !hasMore.artists) return;
        setLoading(prev => ({ ...prev, artists: true }));
        try {
            const offset = page.artists * limit;
            const response = await axios.get(`/api/search/`, {
                params: { type: "artists", keyword, limit, offset },
            });
            if (response.data) {
                setArtists((prev) => [...prev, ...response.data.artists]);
                const hasMoreData = response.data.artists.length === limit;
                setHasMore(prev => ({ ...prev, artists: hasMoreData }));
                setPage((prev) => ({...prev, artists: prev.artists + 1}));
            } else {
                setHasMore(prev => ({ ...prev, artists: false }));
            }
        } catch (error) {
            console.error("Error fetching artists: ", error);
        } finally {
            setLoading(prev => ({ ...prev, artists: false }));
        }
    };

    const fetchData = () =>{
        const map = {
            [t("home.playlist")]: fetchPlaylists,
            [t("home.music")]: fetchSongs,
            [t("home.artist")]: fetchArtists,
            [t("home.album")]: fetchAlbums,
            [t("home.profile")]: fetchUsers
        };
        const func = map[type];
        if (func) func();
        else {
            fetchSongs(); fetchArtists(); fetchPlaylists(); fetchAlbums(); fetchUsers();
        }      
    };

    useEffect(() => {
        const fetchRole = async () => {
            if (isLoggedIn) {
                const checkedRoleUser = await checkData(3);
                setValidRole(checkedRoleUser);
            } else {
                setValidRole(true);
            }
        };
        fetchRole();
    }, [isLoggedIn]);

    useEffect(() => {
        fetchData();
    }, [validRole, keyword]);

    useEffect(() => {
        setSongs([]); setPlaylists([]); setAlbums([]); setArtists([]); setUsers([]);
        setPage({ songs: 0, playlists: 0, albums: 0, artists: 0, users: 0 });
        setHasMore({ songs: true, playlists: true, albums: true, artists: true, users: true });
    }, [keyword, type]);

    useEffect(() => {
        const handleScroll = () => {
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const threshold = document.documentElement.scrollHeight - window.innerHeight * 0.5;
        if (scrollPosition >= threshold) fetchData();
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [type, keyword, validRole, loading, hasMore]);

    if (!validRole) return <Forbidden/>;
    const isLoading = Object.values(loading).some((value) => value);
    if (isLoading) {
        return <Loading message={t("utils.loading")} height="60" />;
    }

    const renderContent = () => {
        switch (type) {
            case t("home.playlist"):
                return (
                    <div className="playlist-content">
                        {playlists.map((playlist) => (
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                        ))}
                    </div>
                );

            case t("home.music"):
                return (
                    <div className="container mt-4">
                        <h3 className="text-white">Danh Sách Bài Hát</h3>
                        <ListGroup variant="flush">
                            {songs.map((song) => (
                                <SongItem key={song.songId} song={song} songId={song.songId} />
                            ))}
                        </ListGroup>
                    </div>
                );

            case t("home.artist"):
                return (
                    <div className="container mt-4">
                        <div className="row">
                            {artists.map((artist) => (
                                <UserCard key={artist.id} name={artist.name} image={artist.image} role_id={artist.role_id}/>
                            ))}
                        </div>
                    </div>
                );

            case t("home.album"):
                return (
                    <div className="container mt-4">
                        <div className="row">
                            {albums.map((album) => (
                                <AlbumCard key={album.id} title={album.title} image={album.image} artist={album.artist} />
                            ))}
                        </div>
                    </div>
                );

            case t("home.profile"):
                return (
                    <div className="container mt-4">
                        <div className="row">
                            {users.map((user) => (
                                <UserCard key={user.id} name={user.name} image={user.image} role_id={user.role_id}/>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return <div className="home-tabs-container">{renderContent()}</div>;
};

export default HomeTabs;
