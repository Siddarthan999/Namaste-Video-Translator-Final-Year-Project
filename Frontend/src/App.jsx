import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import SignUp from './pages/signup';
import VideoUploaderComponent from './pages/VideoUploaderComponent';
import './Styles/App.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import Home from './pages/home';
import Logout from './pages/logout';

function App() {
  return (
      <AuthProvider>
      <Router>
        <Toaster position='bottom-right' toastOptions={{duration: 2000}}/>
        <Routes>
          <Route path='/' element={<Navigate to="/login" />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/dashboard' element={<VideoUploaderComponent />} />
          <Route path='/home' element={<Home/>} />
          <Route path='/logout' element={<Logout/>} />
        </Routes>
      </Router>
      </AuthProvider>
  );
}

export default App;