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
  const [audioFile, setAudioFile] = useState(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState(null);
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

  const handleAudioChange = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
    setTranslatedAudioUrl(null); // Reset translated audio URL when a new file is selected
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setSelectedLanguage(languageCodesData[0][selectedLanguage] || null);
  };

  const handleUpload = () => {
    if (!audioFile || !selectedLanguage || !authData) {
      alert('Please select an audio file, choose a language, and ensure you are logged in.');
      return;
    }

    document.getElementById("uploadBtn").disabled = true;
    const processingElement = document.getElementById("processing");
    processingElement.classList.add("loader");

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', JSON.stringify(selectedLanguage));
    formData.append('authData', JSON.stringify(authData));

    axios.post(`http://localhost:3500/upload`, formData, { responseType: 'blob' })
      .then(response => {
        console.log('Response:', response);
        const translatedAudioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const translatedAudioUrl = URL.createObjectURL(translatedAudioBlob);
        setTranslatedAudioUrl(translatedAudioUrl); // Set translated audio URL
        
        // Directly use translatedAudioBlob for uploading
        const audioRef = ref(storage, `${authData.email}/${audioFile.name + v4()}`);
        toast.success('Audio has been Translated! Press Play to listen!');
        return uploadBytes(audioRef, translatedAudioBlob);
      })
      .then(snapshot => {
        return getDownloadURL(snapshot.ref);
      })
      .then(url => {
        setTranslatedAudioUrl(url);
      })
      .catch(error => {
        console.error('Error uploading audio:', error);
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
              accept="audio/*" 
              onChange={handleAudioChange} 
            />
            {audioFile && (
              <div className="language-selector">
                <label htmlFor="language-dropdown" className='lang-title'>Select Language To Translate</label>
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
              disabled={!audioFile || !selectedLanguage || uploading}
            >
              Upload
            </button>
            <div id="processing"></div>
          </div>
          <div className="audio-container">
            {translatedAudioUrl ? (
              <audio controls src={translatedAudioUrl} />
            ) : (
              audioFile && <audio controls src={URL.createObjectURL(audioFile)} />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default VideoUploaderComponent;
