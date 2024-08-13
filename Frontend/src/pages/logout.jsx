import React, { useContext } from 'react';
import AuthContext from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const { setAuthData } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        setAuthData(null); // This will clear authData in both context and localStorage
        navigate('/login'); // Redirect to login page
    };

    return (
        handleLogout()
    );
};

export default Logout;