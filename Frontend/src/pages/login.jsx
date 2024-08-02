// login.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import axios from 'axios';
import { toast } from "react-hot-toast";
import './login.css';

function Login() {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const authLogin = (event) => {
        event.preventDefault();

        const emailValue = document.querySelector('.email-input').value;
        const passwordValue = document.querySelector('.password-input').value;

        axios.get(`http://localhost:3500/login/${emailValue}/${passwordValue}`)
        .then(response => {
            if (response.status === 200) {
                const { email, firstName, lastName, phoneNumber } = response.data;

                // Set user context
                setUser({ email, firstName, lastName, phoneNumber });

                toast.success('Logged in successfully');
                navigate('/home');
            } else {
                toast.error(`Unexpected status code: ${response.status}`);
            }
        })
        .catch(error => {
            if (error.response) {
                toast.error(error.response.data.message);
            } else if (error.request) {
                console.error('Error: No response received from server', error.request);
                toast.error('Error: No response received from server');
            } else {
                console.error('Error:', error.message);
                toast.error(`Error: ${error.message}`);
            }
        });
    }

    return (
        <div className="login-container">
            <form onSubmit={authLogin} className="form-login">
                <h2>Login</h2>
                <label>Email</label>
                <input type="email" className="email-input" required /> <br />
                <label>Password</label>
                <input type="password" className="password-input" required /> <br />
                <button type="submit" className="login-button">Submit</button> <br />
                <Link to={'/signup'} className='link-1'>New User? <span className="signup">Sign Up here</span></Link>
            </form>
        </div>
    );
}

export default Login;
