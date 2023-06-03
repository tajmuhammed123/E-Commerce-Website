const express=require('express')
const admin_route= express()

const session = require("express-session");
const config = require("../config/config");
// admin_route.use(session({secret:config.sessionSecret}))

admin_route.use(express.json())
admin_route.use(express.urlencoded({ extended: true }))

const path=require('path')
const multer= require('multer')

const auth=require('../middleware/adminAuth')

const storage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/admin/images'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})

const upload=multer({storage:storage})

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const adminController=require('../controllers/adminController');

const orderController=require('../controllers/orderController');
// const { path } = require('./userRouter');

admin_route.get('/',auth.isLogout,adminController.loadLogin)

admin_route.post('/',adminController.verifyLogin)

admin_route.get('/logout',auth.isLogin,adminController.logout)

admin_route.get('/user-details',auth.isLogin,adminController.loadUser)

admin_route.get('/product-details',auth.isLogin,adminController.loadProducts)

admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)

admin_route.get('/addproduct',auth.isLogin,adminController.loadAddProduct)

admin_route.post('/addproduct',upload.array('product_img'),adminController.addProduct)

admin_route.get('/editproducts',auth.isLogin,adminController.editProduct)

admin_route.post("/editproducts",upload.array('product_img'), adminController.updateProduct);

admin_route.get('/deleteproduct',adminController.deleteProduct)

admin_route.get('/adduser',auth.isLogin,adminController.loadAddUser)

admin_route.post('/adduser',upload.single('product_img'),adminController.addUser)

admin_route.get('/editusers',auth.isLogin,adminController.editUser)

admin_route.post("/editusers", adminController.updateUser);

// admin_route.get('/deleteusers',adminController.deleteUser)

admin_route.get('/id_disable',auth.isLogin,adminController.disableProduct)

admin_route.get('/id_undisable',auth.isLogin,adminController.enableProduct)

admin_route.get('/orders',auth.isLogin,adminController.loadOrders)

admin_route.get('/orderaddress',auth.isLogin,adminController.loadOrderAddress)

admin_route.get('/orderproducts',auth.isLogin,adminController.loadOrderProducts)

admin_route.post('/orderproducts',auth.isLogin,orderController.productStatus)

admin_route.get('/addcategorey',auth.isLogin,adminController.loadAddCategorey)

admin_route.post('/addcategorey',auth.isLogin,adminController.addCategorey)

// admin_route.post('/editcategory',auth.isLogin,adminController.editProdutStatus)

admin_route.get('/category',auth.isLogin,adminController.loadCategorey)

admin_route.get('/category_disable',auth.isLogin,adminController.disableCategory)

admin_route.get('/category_undisable',auth.isLogin,adminController.enableCategory)

admin_route.get('/user_disable',auth.isLogin,adminController.disableUser)

admin_route.get('/user_undisable',auth.isLogin,adminController.enableUser)

admin_route.get('/couponlist',auth.isLogin,adminController.listCoupon)

admin_route.get('/addcoupon',auth.isLogin,adminController.loadAddCoupon)

admin_route.post('/addcoupon',adminController.addCoupon)

admin_route.get('/editcoupon',adminController.loadeditCoupon)

admin_route.put('/editcoupon',adminController.editCoupon)

admin_route.get('/editcategory',adminController.loadeditCategorey)

admin_route.post('/editcategory',adminController.editCategorey)

module.exports = admin_route