const express = require('express');
const user_route = express();

const session=require('express-session')
const config = require("../config/config");

user_route.use(
    session({
      secret: config.sessionSecret,
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 500000,
      },
    })
  );

const bodyParser = require("body-parser");

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set('view engine','ejs');
user_route.set('views','./views/user')


const userController= require('../controllers/userController')

user_route.get('/',userController.loginLoad)

user_route.post("/signup", userController.insertUser);

user_route.get('/signup',userController.loadSignup)

user_route.get('/shoping-cart',userController.loadCart)

user_route.get('/login',userController.loginLoad)

user_route.post('/login',userController.verifyLogin)

user_route.get('/dashboard',userController.loadHome)

user_route.get('/filter',userController.filterUser)

user_route.get('/product-detail',userController.productDetail)


module.exports = user_route;