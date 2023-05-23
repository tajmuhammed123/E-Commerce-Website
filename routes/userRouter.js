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

const auth=require('../middleware/Auth')


const userController= require('../controllers/userController')
const cartController=require('../controllers/cartController')

user_route.get('/login',auth.isLogout,userController.loginLoad)

user_route.post("/signup", userController.insertUser);

user_route.get('/signup',auth.isLogout,userController.loadSignup)

user_route.post('/login',userController.verifyLogin)

user_route.get('/',auth.isLogin, userController.loadHome)

user_route.get('/dashboard', userController.loadHome)

// user_route.get('/filter',userController.filterProduct)

user_route.get('/product-detail', userController.productDetail)

user_route.post('/addcart', cartController.addToCart)

user_route.get('/cart',auth.isLogin, cartController.loadCart)

user_route.get('/deleteproduct',cartController.deleteCartProduct)

user_route.post('/update_cart',auth.isLogin, cartController.updateCart );

user_route.get('/payment',auth.isLogin, cartController.loadPayment);

user_route.get('/addaddress',auth.isLogin, cartController.loadAddAddress);

user_route.post('/payment',auth.isLogin, cartController.addAddress);

user_route.post('/confirm',auth.isLogin, cartController.placeOrder);


module.exports = user_route;