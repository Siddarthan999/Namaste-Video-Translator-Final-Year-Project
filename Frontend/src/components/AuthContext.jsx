import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Load authData from localStorage on initialization
    const [authData, setAuthData] = useState(() => {
        const savedAuthData = localStorage.getItem('authData');
        return savedAuthData ? JSON.parse(savedAuthData) : null;
    });

    // Save authData to localStorage whenever it changes
    useEffect(() => {
        if (authData) {
            localStorage.setItem('authData', JSON.stringify(authData));
        } else {
            localStorage.removeItem('authData'); // Clear authData from localStorage on logout
        }
    }, [authData]);

    return (
        <AuthContext.Provider value={{ authData, setAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;