const express = require('express')
const router = express.Router()

const addNewUser = require('../controllers/signupController')
router.post('/', addNewUser)

module.exports = router