import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../components/AuthContext'; 
import '../Styles/VideoUploaderComponent.css';
import Navbar from './Navbar';
import languageCodesData from '../components/LanguageData';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../components/FireBase";
import { v4 } from "uuid";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const VideoUploaderComponent = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [translatedVideoUrl, setTranslatedVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authData) {
      const timer = setTimeout(() => {
        toast.error("Authentication Failed. Login to Access.");
        navigate('/login');
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [authData, navigate]);

  const languageOptions = Object.keys(languageCodesData[0]).map((language) => (
    <option key={language} value={language}>
      {languageCodesData[0][language].language_name}
    </option>
  ));

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
    setTranslatedVideoUrl(null); // Reset translated video URL when a new file is selected
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setSelectedLanguage(languageCodesData[0][selectedLanguage] || null);
  };

  const handleUpload = () => {
    if (!videoFile || !selectedLanguage || !authData) {
      alert('Please select a video file, choose a language, and ensure you are logged in.');
      return;
    }

    document.getElementById("uploadBtn").disabled = true;
    const processingElement = document.getElementById("processing");
    processingElement.classList.add("loader");

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('language', JSON.stringify(selectedLanguage));
    formData.append('authData', JSON.stringify(authData));

    axios.post('http://localhost:3500/upload', formData, { responseType: 'blob' })
      .then(response => {
        console.log('Response:', response);
        const translatedVideoBlob = new Blob([response.data], { type: 'video/mp4' });
        const translatedVideoUrl = URL.createObjectURL(translatedVideoBlob);
        setTranslatedVideoUrl(translatedVideoUrl); // Set translated video URL
        
        // Directly use translatedVideoBlob for uploading
        const videoRef = ref(storage, `${authData.email}/${videoFile.name + v4()}`);
        toast.success('Video has been Translated! Press Play to watch!');
        return uploadBytes(videoRef, translatedVideoBlob);
      })
      .then(snapshot => {
        return getDownloadURL(snapshot.ref);
      })
      .then(url => {
        setTranslatedVideoUrl(url);
      })
      .catch(error => {
        console.error('Error uploading video:', error);
      })
      .finally(() => {
        setUploading(false);
        document.getElementById("uploadBtn").disabled = false;
        processingElement.classList.remove("loader");
      });
  };

  // If not authenticated, don't render the component
  if (!authData) return null;

  return (
    <React.Fragment>
      <Navbar/>
      <div className="App">
        <div className="App-header">
          <h1>NAMASTE 🙏🏽 VIDEO TRANSLATOR</h1>    
          <div className="upload-container">
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleVideoChange} 
            />
            {videoFile && (
              <div className="language-selector">
                <label htmlFor="language-dropdown">Select Language To Translate</label>
                <select 
                  id="language-dropdown" 
                  onChange={handleLanguageChange} 
                  value={selectedLanguage ? selectedLanguage.language_name : ""}
                >
                  <option value="">-- Select --</option>
                  {languageOptions}
                </select>
              </div>
            )}
            <button 
              onClick={handleUpload} 
              id="uploadBtn" 
              className={selectedLanguage ? "upload-btn-active" : "upload-btn-inactive"}
              disabled={!videoFile || !selectedLanguage || uploading}
            >
              Upload
            </button>
            <div id="processing"></div>
          </div>
          <div className="video-container">
            {translatedVideoUrl ? (
              <video controls src={translatedVideoUrl} />
            ) : (
              videoFile && <video controls src={URL.createObjectURL(videoFile)} />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default VideoUploaderComponent;
