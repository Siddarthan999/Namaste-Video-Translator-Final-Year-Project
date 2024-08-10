import React, { useContext }from 'react'
import {BrowserRouter as Router, Routes, Route, Link, Form} from 'react-router-dom';
import AuthContext from '../components/AuthContext';
import '../Styles/Navbar.css';

export default function Navbar() {
  const { authData } = useContext(AuthContext);
  return (
    <React.Fragment>
      <div className='header'>
        <h2 className='title-name'>Welcome Back, {authData.firstName + ' ' +authData.lastName}</h2>
        <Link to={'/dashboard'} className='link'>Dashboard</Link>
        <Link to={'/home'} className='link'>Home</Link>
        <Link to={'/login'} className='link'>Log Out</Link>
      </div>
    </React.Fragment>
  )
}
