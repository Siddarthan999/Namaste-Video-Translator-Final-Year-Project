import React, { useState, useEffect, useContext } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../components/FireBase";
import AuthContext from '../components/AuthContext';
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import '../Styles/Home.css';

function Home() {
    const [videoUrls, setVideoUrls] = useState([]);
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();
    const videosListRef = authData ? ref(storage, `${authData.email}/`) : null;

    useEffect(() => {
        if (!authData) {
            const timer = setTimeout(() => {
                toast.error("Authentication Failed. Login to Access.");
                navigate('/login');
            }, 0);

            return () => clearTimeout(timer);
        } else {
            // If authenticated, fetch video URLs
            listAll(videosListRef).then((response) => {
                const urls = response.items.map((item) => getDownloadURL(item));
                Promise.all(urls).then((urls) => {
                    setVideoUrls(urls);
                });
            });
        }
    }, [authData, navigate, videosListRef]);

    if (!authData) return null; // Render nothing if not authenticated (prevents rendering issues)

    return (
        <React.Fragment>
            <Navbar />
            <div className="Home">
                <h2 className="title">TRANSLATED VIDEOS</h2>
                {videoUrls.map((url, index) => (
                    <div key={index} className="video-container">
                        <video controls src={url} alt={`Uploaded video ${index}`} />
                    </div>
                ))}
            </div>
        </React.Fragment>
    );
}

export default Home;
