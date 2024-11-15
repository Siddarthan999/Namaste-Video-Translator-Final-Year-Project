const {request, response} = require('express')
const userData = require('../data/userData')
const userModel = require('../models/userModel');
const { comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const authenticateUser = async(request, response) => {
    const newEmail = request.params.email;
    const newPwd = request.params.password;
    try{
        let users = await userModel.find()
        if(users.length === 0)
        {
            const initialUser = await userModel.insertMany(userData);
        }
        const expectedUser = await userModel.findOne({email : newEmail});
        if(!expectedUser)
        {
            return response.status(400).json({message: 'User not found'})
        }
        // BCRYPT
        const match = await comparePassword(newPwd, expectedUser.password);
        if(match) 
        {
            jwt.sign({email : expectedUser.email, id: expectedUser._id, name: expectedUser.firstName }, process.env.JWT_SECRET, {}, (error, token) => {
                if(error) throw error;
                response.cookie('token', token).json(expectedUser);
            })
            //return response.status(200).json({message : `Authentication Successful`, user : expectedUser})
        }
        else 
        {
            return response.status(404).json({message: 'Invalid Password'});
        }
    }
    catch(error)
    {
        response.status(500).json({message: error.message})
    }
}

module.exports = {authenticateUser}