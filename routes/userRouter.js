const express = require('express');
const user_route = express();

const session=require('express-session')
const config = require("../config/config");
// user_route.use(session({secret:config.sessionSecret}))

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

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))

user_route.set('view engine','ejs');
user_route.set('views','./views/user')


const userController= require('../controllers/userController')
const cartController=require('../controllers/cartController')

user_route.get('/',userController.loginLoad)

user_route.post("/signup", userController.insertUser);

user_route.get('/signup',userController.loadSignup)

user_route.get('/login',userController.loginLoad)

user_route.post('/login',userController.verifyLogin)

user_route.get('/dashboard',userController.loadHome)

// user_route.get('/filter',userController.filterProduct)

user_route.get('/product-detail',userController.productDetail)

user_route.post('/addcart',cartController.addToCart)

user_route.get('/cart',cartController.loadCart)

user_route.get('/deleteproduct',cartController.deleteCartProduct)

user_route.post('/update_cart', cartController.updateCart );

user_route.get('/checkout', cartController.checkOut);


module.exports = user_route;