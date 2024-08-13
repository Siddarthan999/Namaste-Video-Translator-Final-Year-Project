import React, { useContext, useEffect } from 'react';
import AuthContext from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Import toast for notifications

const Logout = () => {
    const { setAuthData } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setAuthData(null); // Clear authData in both context and localStorage
            toast.success("Successfully logged out."); // Show a success message
            navigate('/login'); // Redirect to login page
        }, 0);

        return () => clearTimeout(timer); // Cleanup the timeout
    }, [setAuthData, navigate]);

    return null; // No UI is needed, just the logout effect
};

export default Logout;
