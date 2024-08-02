const express = require('express')
const router = express.Router()

const {authenticateUser} = require('../controllers/loginController')

router.get('/:email/:password', authenticateUser);

module.exports = router