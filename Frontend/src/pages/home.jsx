import React, { useState, useEffect, useContext } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../components/FireBase";
import AuthContext from '../components/AuthContext';
import Navbar from "./Navbar";
import '../Styles/Home.css'

function Home() {
    const [videoUrls, setVideoUrls] = useState([]);
    const { authData } = useContext(AuthContext);
    const videosListRef = ref(storage, `${authData.email}/`);

    useEffect(() => {
        listAll(videosListRef).then((response) => {
            const urls = response.items.map((item) => getDownloadURL(item));
            Promise.all(urls).then((urls) => {
                setVideoUrls(urls);
            });
        });
    }, [authData.email]);

    return (
        <React.Fragment>
        {<Navbar/>}
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
