import React, { useState } from 'react';
import axios from 'axios';
import './VideoUploaderComponent.css';

const VideoUploaderComponent = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
    document.getElementById("uploadBtn").disabled = !file;
  };

  const handleUpload = () => {
    if (!videoFile) {
      alert('Please select a video file.');
      return;
    }
    document.getElementById("uploadBtn").disabled = true;
    var element = document.getElementById("processing");
    element.classList.add("loader");

    const formData = new FormData();
    formData.append('video', videoFile);

    axios.post('http://localhost:3500/upload', formData)
      .then(response => {
        console.log('Response:', response.data);
        // Handle response from server as needed
      })
      .catch(error => {
        console.error('Error uploading video:', error);
        // Handle error
      })
      .finally(() => {
        setUploading(false);
        document.getElementById("uploadBtn").disabled = false;
      });
  };

  return (
    <div className="App">
        <div className="App-header">
          <h1>NAMASTE 🙏🏽 VIDEO TRANSLATOR</h1>
          <div className="upload-container">
            <input type="file" accept="video/*" onChange={handleVideoChange}/>
            <button onClick={handleUpload} id="uploadBtn" disabled={!videoFile || uploading}>Upload</button>
            <div id="processing"></div>
          </div>
          <div className="video-container">
            {videoFile && <video controls src={URL.createObjectURL(videoFile)} />}
          </div>
        </div>
    </div>
  );
};

export default VideoUploaderComponent;