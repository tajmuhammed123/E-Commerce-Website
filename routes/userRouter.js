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
const cartController=require('../controllers/cartController');
const orderController = require('../controllers/orderController');

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

user_route.post('/cart',auth.isLogin, cartController.updateCoupon)

user_route.delete('/deleteproduct',cartController.deleteCartProduct)

user_route.post('/update_cart',auth.isLogin, cartController.updateCart );

user_route.get('/payment',auth.isLogin, cartController.loadPayment);

user_route.get('/addaddress',auth.isLogin, cartController.loadAddAddress);

user_route.post('/payment',auth.isLogin, cartController.addAddress);

user_route.post('/confirm',auth.isLogin, cartController.placeOrder);

user_route.get('/orderhistory',auth.isLogin, orderController.orderHistory);

user_route.get('/userprofile',auth.isLogin, userController.userProfile);

user_route.get('/cancel',auth.isLogin, orderController.cancelProduct);

user_route.get('/return',auth.isLogin, orderController.returnProduct);

user_route.post('/search', userController.searchProduct);

user_route.post('/createOrder', orderController.createOrder);

user_route.post('/coupon', cartController.couponCode);

user_route.get('/success',auth.isLogin, orderController.paymentSuccess);

user_route.get('/logout',auth.isLogin, userController.userLogout);

user_route.get('/wallet',auth.isLogin, userController.loadWallet);

user_route.get('/lowsortsort', userController.ascendingFilter);

user_route.get('/highsort', userController.descendingFilter);

user_route.get('/loadmore', userController.loadMore);

user_route.post('/editaddress', userController.loadEditAddress);

user_route.get('/addresslist', userController.loadAddress);

user_route.post('/updateaddress', userController.editAddress);

user_route.get('/orderdetails', userController.loadOrderDetails);

user_route.post('/downloadinvoice', userController.generatePdf);

user_route.get('/download', userController.loadDownload);



module.exports = user_route;