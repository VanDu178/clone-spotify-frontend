import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../config/axiosConfig";
import MusicSlider from "../../components/MusicSlider/MusicSlider";
import { Row, Col, ListGroup } from "react-bootstrap";
import { useSong } from "../../context/SongProvider";
import { useIsPlaying } from "../../context/IsPlayingProvider";
import { usePlaylist } from "../../context/PlaylistProvider";
import SongItem from "../../components/SongItem/SongItem";
import { useUserData } from "../../context/UserDataProvider";
import { hash, checkData } from "../../helpers/encryptionHelper";
import Forbidden from "../../components/Error/403/403";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { useIsVisiableRootModal } from "../../context/IsVisiableRootModal";
import "./PublicProfile.css";
import { Flashlight } from "lucide-react";

const PublicProfile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    inFor: {},
    playlists: [],
    albums: [],
    popularSongs: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isArtist, setIsArtist] = useState(false);
  const { idSong, setIdSong } = useSong();
  const { addSong, clearPlaylist } = usePlaylist();
  const { isPlaying, setIsPlaying } = useIsPlaying();
  const { setIsVisiableRootModal } = useIsVisiableRootModal();
  const { isLoggedIn } = useUserData();
  const [validRole, setValidRole] = useState(false);
  // const [IsCheckingRole, setIsCheckingRole] = useState(false);
  const popularRef = useRef(null);
  const albumsRef = useRef(null);
  const aboutRef = useRef(null);
  const { profileId } = useParams();

  useEffect(() => {
    const fetchRole = async () => {
      setIsLoading(true);
      if (isLoggedIn) {
        //nếu đang login thì check role phải user không
        const checkedRoleUser = await checkData(3);
        if (checkedRoleUser) {
          setValidRole(true);
          setIsLoading(false);
        }
      } else {
        //nếu không login thì hiển thị
        setValidRole(false);
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    fetchRole();
  }, [isLoggedIn]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null); // Clear previous error
      try {
        await fetchProfile();
        if (isArtist) {
          await Promise.all([fetchAlbums(), fetchPopularSongs()]);
        } else {
          await fetchPlaylists();
        }
        // setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu hồ sơ.");
        // setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [profileId, isArtist]);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get(`/public-profile/${profileId}/`);
      if (response?.status === 200) {
        setIsArtist(response?.data?.role?.name === "artist");
        setProfile((prevState) => ({
          ...prevState,
          inFor: response?.data,
        }));
      }
    } catch (error) {
      throw new Error("Không thể tải thông tin hồ sơ.");
    }
  };

  const fetchPopularSongs = async () => {
    try {
      const response = await axiosInstance.get(
        `/public-profile/popular-songs/${profileId}/`
      );
      if (response?.status === 200) {
        setProfile((prevState) => ({
          ...prevState,
          popularSongs: response?.data?.songs,
        }));
        clearPlaylist();
        response?.data?.songs?.forEach((song) => {
          addSong({ id: song.id });
        });
      }
    } catch (err) {
      throw new Error("Không thể tải danh sách bài hát phổ biến.");
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await axiosInstance.get(
        `/public-profile/albums/${profileId}/`
      );
      if (response?.status === 200) {
        setProfile((prevState) => ({
          ...prevState,
          albums: response?.data,
        }));
      }
    } catch (err) {
      throw new Error("Không thể tải album.");
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axiosInstance.get(
        `/public-profile/playlists/${profileId}/`
      );
      if (response?.status === 200) {
        setProfile((prevState) => ({
          ...prevState,
          playlists: response?.data,
        }));
      }
    } catch (err) {
      throw new Error("Không thể tải playlist.");
    }
  };

  const togglePlay = () => {
    if (isLoggedIn) {
      if (profile.popularSongs && profile.popularSongs.length > 0 && idSong) {
        setIsPlaying(!isPlaying);
      } else if (profile.popularSongs.length > 0) {
        setIdSong(profile.popularSongs[0].id);
        setIsPlaying(true);
      }
    } else {
      setIsVisiableRootModal(true);
    }
  };

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!validRole) {
    return <Forbidden />;
  }

  if (isLoading) {
    return <Loading message={t("utils.loading")} height="80" />;
  }

  return (
    <div className="public-profile-container">
      <div className="public-profile-header">
        <div className="public-profile-header-content">
          <img
            src={
              profile?.inFor?.image_path || "../../images/default-avt-img.jpeg"
            }
            alt={profile?.inFor?.name}
            className="public-profile-avatar"
            onError={(e) => {
              e.target.onerror = null; // tránh vòng lặp nếu fallback cũng lỗi
              e.target.src = "../../images/default-avt-img.jpeg";
            }}
          />
          <div className="public-profile-info">
            <span className="public-profile-type">
              {isArtist ? t("publicProfile.artist") : t("publicProfile.user")}
            </span>
            <div className="public-profile-name-container">
              <h2 className="public-profile-name">{profile?.inFor?.name}</h2>
              {isArtist && (
                <div className="public-profile-verified-artist">
                  <span className="public-profile-verified-check">✔</span>
                  <span className="public-profile-verified-text">
                    {t("publicProfile.verified_artist")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="public-profile-content">
        {isArtist && (
          <div className="public-profile-play-controls">
            <button
              className="public-profile-play-pause-btn"
              onClick={togglePlay}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
          </div>
        )}

        <div className="public-profile-tabs">
          <div className="public-profile-tab-list">
            {isArtist ? (
              <>
                <button
                  className="public-profile-tab"
                  onClick={() => scrollToSection(popularRef)}
                >
                  {t("publicProfile.popular")}
                </button>
                <button
                  className="public-profile-tab"
                  onClick={() => scrollToSection(albumsRef)}
                >
                  {t("publicProfile.albums")}
                </button>
                <button
                  className="public-profile-tab"
                  onClick={() => scrollToSection(aboutRef)}
                >
                  {t("publicProfile.about")}
                </button>
              </>
            ) : (
              <button className="public-profile-tab active">
                {t("publicProfile.playlists")}
              </button>
            )}
          </div>

          {isArtist ? (
            <div className="public-profile-tab-content" ref={popularRef}>
              <section className="public-profile-section">
                <h2 className="public-profile-section-title">
                  {t("publicProfile.popular")}
                </h2>
                <ListGroup variant="flush">
                  <ListGroup.Item className="public-profile-song-header">
                    <Row>
                      <Col xs={1}>#</Col>
                      <Col xs={5}>{t("playlist.title")}</Col>
                      <Col xs={2}>{t("playlist.time")}</Col>
                    </Row>
                  </ListGroup.Item>
                  {profile?.popularSongs?.map((song, index) => {
                    song.order = ++index;
                    return (
                      <SongItem key={song.id} songId={song.id} song={song} />
                    );
                  })}
                </ListGroup>
              </section>

              <section className="public-profile-section" ref={albumsRef}>
                <h2 className="public-profile-section-title">
                  {t("publicProfile.albums")}
                </h2>
                {profile?.albums && profile.albums.length > 0 ? (
                  <div className="public-profile-card-group public-profile-card-group-scroll">
                    <MusicSlider items={profile.albums} type="albums" />
                  </div>
                ) : (
                  <p>{t("publicProfile.no_albums")}</p>
                )}
              </section>

              <section className="public-profile-section" ref={aboutRef}>
                <h2 className="public-profile-section-title">
                  {t("publicProfile.about")}
                </h2>
                <p className="public-profile-bio">
                  {profile?.inFor?.bio || t("publicProfile.no_bio")}
                </p>
              </section>
            </div>
          ) : (
            <div className="public-profile-tab-content">
              <section className="public-profile-section">
                <h2 className="public-profile-section-title">
                  {t("publicProfile.playlists")}
                </h2>
                <div className="public-profile-card-group public-profile-card-group-scroll">
                  <MusicSlider items={profile?.playlists} type="playlists" />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
