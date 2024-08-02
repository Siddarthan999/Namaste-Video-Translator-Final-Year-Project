import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './signup.css';
import { toast } from "react-hot-toast";

function SignUp() {

    const navigate = useNavigate();

    function registerNewUser(event) {
        event.preventDefault();
        const newUserData = {
            "firstName": `${document.querySelector('.first-name').value}`,
            "lastName": `${document.querySelector('.last-name').value}`,
            "phoneNumber": `${document.querySelector('.phone-no').value}`,
            "email": `${document.querySelector('.email').value}`,
            "password": `${document.querySelector('.new-password').value}`
        };

        axios.post(`http://localhost:3500/signup/`, newUserData)
            .then(response => {
                console.log(response.data);
                if (response.data.message) {
                    // alert('Registration Successfull');
                    toast.success('Registration Successfull');
                    navigate('/login');
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
        <React.Fragment>
            <div className="signup-container">
                <form onSubmit={registerNewUser} className="form-signup">
                    <h2>Sign Up</h2>
                    First Name <input type="text" className="first-name" required /> <br />
                    Last Name <input type="text" className="last-name" required /> <br />
                    Phone no <input type="number" className="phone-no" required /> <br />
                    Email<input type="email" className="email" required /> <br />
                    Enter New Password<input type="password" className="new-password" required /> <br />
                    <button type="submit" className="signup-button">Submit</button> <br />
                    <Link to={'/'} className='link-2'>Already Registered? <span className="login">Login here</span></Link>
                </form>
            </div>
        </React.Fragment>
    );
}

export default SignUp;
