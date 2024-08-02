import React, { useState, useContext } from 'react';
import axios from 'axios';
import './VideoUploaderComponent.css';
import { UserContext } from '../components/UserContext'; // Import the context
import { toast } from "react-hot-toast";

const VideoUploaderComponent = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(UserContext); // Get user data from context

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

    setUploading(true);
    document.getElementById("uploadBtn").disabled = true;
    var element = document.getElementById("processing");
    element.classList.add("loader");

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('email', user.email);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('phoneNumber', user.phoneNumber);

    axios.post('http://localhost:3500/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log('Response:', response.data);
        toast.success('Upload successful!');
      })
      .catch(error => {
        console.error('Error uploading video:', error);
        toast.error('Error uploading video. Please try again.');
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
        <div className="upload-container">
          <input type="file" accept="video/*" onChange={handleVideoChange}/>
          <button onClick={handleUpload} id="uploadBtn" disabled={!videoFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
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
