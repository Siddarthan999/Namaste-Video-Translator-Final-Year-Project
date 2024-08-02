const {request, response} = require('express')
const userData = require('../data/userData')
const userModel = require('../models/userModel')
const {hashPassword, comparePassword } = require('../helpers/auth')

const addNewUser = async(request, response) => {
    const newUser = request.body
    try{
        let users = await userModel.find()
        if(users.length === 0)
        {
            const initialUser = await userModel.insertMany(userData);
        }
        const existingUser = await userModel.findOne({email: newUser.email})
        if(existingUser)
        {
            return response.status(409).json({message: `A user with ${newUser.email} already exists`})
        }
        // BCRYPT
        const hashedPassword = await hashPassword(newUser.password);
        newUser.password = hashedPassword;
        
        const insertedUser = await userModel.create(newUser)
        response.status(201).json({message : 'Registration Successful', user : insertedUser})
    }
    catch(error)
    {
        response.status(500).json({message: error.message})
    }
}

module.exports = addNewUser