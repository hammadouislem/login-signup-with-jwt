const express = require('express');
const user_route = express.Router();
const userController = require('../controllers/userController');


user_route.get('/mail-verification' ,userController.verifyMail);

module.exports = user_route;