import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../components/AuthContext'; 
import './VideoUploaderComponent.css';
import languageCodesData from '../components/LanguageData';

const VideoUploaderComponent = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [translatedVideoUrl, setTranslatedVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  
  const { authData } = useContext(AuthContext);

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
    var element = document.getElementById("processing");
    element.classList.add("loader");

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
  })
  .catch(error => {
    console.error('Error uploading video:', error);
  })
  .finally(() => {
    setUploading(false);
    document.getElementById("uploadBtn").disabled = false;
    element.classList.remove("loader");
  });
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>NAMASTE 🙏🏽 VIDEO TRANSLATOR</h1>
        {authData && <h2>Welcome, {authData.firstName}!</h2>}
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
  );
};

export default VideoUploaderComponent;
