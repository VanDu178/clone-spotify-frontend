import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Button, ListGroup, Image } from "react-bootstrap";
import { FaMusic, FaPause, FaPlay } from "react-icons/fa";
import { useSong } from "../../context/SongProvider";
import { useIsPlaying } from "../../context/IsPlayingProvider";
import { checkData } from "../../helpers/encryptionHelper";
import { useUserData } from "../../context/UserDataProvider";
import "./SongItem.css";

const SongItem = ({ songId, song }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { idSong, setIdSong } = useSong();
    const { isPlaying, setIsPlaying } = useIsPlaying();
    const [validRole, setValidRole] = useState(false);
    const { isLoggedIn } = useUserData();
    useEffect(() => {
        const fetchRole = async () => {
            if (isLoggedIn) {
                //nếu đang login thì check role phải user không
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

    const handlePlay = () => {
        setIdSong(songId);
        setIsPlaying(!isPlaying);
    }

    if (!validRole) {
        return null;
    }
    return (
        <ListGroup.Item
            className={`song-item ${idSong === songId && isPlaying ? "active" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Row className="align-items-center">
                <Col xs={1}>
                    {idSong === songId && isPlaying ? (
                        isHovered ? (
                            <Button variant="link" className="p-0 text-white" onClick={() => setIsPlaying(false)}>
                                <FaPause />
                            </Button>
                        ) : (
                            <FaMusic className="text-white" />
                        )
                    ) : isHovered ? (
                        <Button variant="link" className="p-0 text-white" onClick={handlePlay}>
                            <FaPlay />
                        </Button>
                    ) : (
                        song.order
                    )}
                </Col>
                <Col xs={5} className="d-flex align-items-center">
                    <Image src={song.image_path} rounded fluid style={{ width: "50px", height: "50px", marginRight: "10px" }} />
                    <div className="song-info">
                        <div className="song-title">{song.title}</div>
                        <div className="song-artist">{song.artist}</div>
                    </div>
                </Col>
                <Col xs={3}>{song.album}</Col>
                <Col xs={2}>{song.duration}</Col>
            </Row>
        </ListGroup.Item>
    );
};


export default SongItem;