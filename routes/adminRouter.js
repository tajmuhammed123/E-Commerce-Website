const express=require('express')
const admin_route= express()

const session = require("express-session");
const config = require("../config/config");

const bodyParser=require('body-parser')

admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

const path=require('path')
const multer= require('multer')

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
// const { path } = require('./userRouter');

admin_route.get('/',adminController.loadLogin)

admin_route.post('/',adminController.verifyLogin)

admin_route.get('/user-details',adminController.loadUser)

admin_route.get('/product-details',adminController.loadProducts)

admin_route.get('/dashboard',adminController.loadDashboard)

admin_route.get('/addproduct',adminController.loadAddProduct)

admin_route.post('/addproduct',upload.single('product_img'),adminController.addProduct)

admin_route.get('/editproducts',adminController.editProduct)

admin_route.post("/editproducts",upload.single('product_img'), adminController.updateProduct);

admin_route.get('/deleteproduct',adminController.deleteProduct)

admin_route.get('/adduser',adminController.loadAddUser)

admin_route.post('/adduser',upload.single('product_img'),adminController.addUser)

admin_route.get('/editusers',adminController.editUser)

admin_route.post("/editusers", adminController.updateUser);

admin_route.get('/deleteusers',adminController.deleteUser)

module.exports = admin_route