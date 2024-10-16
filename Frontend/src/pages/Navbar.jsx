import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../components/AuthContext';
import '../Styles/Navbar.css';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { authData } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <React.Fragment>
      <div className='header'>
        {/* <img src={logo} alt="logo" /> */}
        <h2 className='title-name'>Welcome Back, {authData.firstName + ' ' + authData.lastName}</h2>

        <button className="hamburger" onClick={toggleMenu}>
          &#9776; {/* Unicode for hamburger icon */}
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'show' : ''}`}>
          <Link to={'/home'} className='link'>Home</Link>
          <Link to={'/logout'} className='link'>Log Out</Link>
        </nav>
      </div>
    </React.Fragment>
  );
}
