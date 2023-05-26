const User=require('../models/usermodals')
const Products=require('../models/productModels')
const Cart=require('../models/cartModels')
const Order=require('../models/orderModels')
const bcrypt = require("bcrypt");


const securePassword = async(password) =>{
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
        
    } catch (error) {

        console.log(error.message);

    }
}


const loginLoad = async(req,res)=>{
    try{
        message=null
        res.render('login',{message})
    }catch(err){
        console.log(err.message);
    }
}

const loadSignup = async(req,res)=>{
    try{
        message=null
        res.render('signup',{message})
    }catch(err){
        console.log(err.message);
    }
}

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render("signup", {
        message: "Email already registered",
      });
    }

  
    if (!req.body.name || req.body.name.trim().length === 0) {
      return res.render("signup", {
        message: "Please enter a valid name",
      });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mob,
      username: req.body.username,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      res.render("signup", { message: "Registration Success" });
    } else {
      res.render("signup", { message: "Registration Failed" });
    }
  } catch (err) {
    console.log(err.message);
  }
};


const verifyLogin = async(req,res) => {

    try {
        console.log('fgsd');
        const username = req.body.username;
        const password = req.body.password;

        const userData = await User.findOne({username:username, id_disable:false});

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if(passwordMatch){
                if(userData.is_admin === 0
                  // ||
                  // userData.is_admin == 1 
                  ){
                req.session.user_id = userData._id;

                res.redirect('/')
                }
                else{

                    res.render('login', {message : "Email or password is incorrect"});

                }

            }
            else{

                res.render('login', {message : "Email or password is incorrect"});
            }
            
        } else {

            res.render('login', {message : "Please provide your correct Email and password "});

        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req,res)=> {

        try {
            if(req.session.user_id){
              const session=req.session.user_id
              const productData = await Products.find({ id_disable:false });
            const id=req.session.user_id
            const cartData = await Cart.find({ user_id: id })
            const userData = await User.findById({_id : req.session.user_id});
            console.log(cartData);
            res.render('home',{products:productData, user:userData, session, cart: cartData});
            }else{
              const session=null
              const productData = await Products.find({ id_disable:false });
              res.render('home',{products:productData, session, cart: null})
            }

        } catch (error) {

            console.log(error.message);
        }
}

const filterProduct= async(req,res)=>{
    try{
        const filterproduct=req.query.filterproduct
        console.log(filterproduct);
        const productData = await Products.find({ product_brand: filterproduct });
        // const userData = await User.findById({_id : req.session.user_id});

        console.log(productData);
        
        res.render('home',{products:productData});
    }catch(err){
        console.log(err.message);
    }
}

const productDetail = async(req,res)=>{
    try{
        const id = req.query.id;
      const productData = await Products.findById({ _id: id });
      const userid= req.session.user_id
  
      if (productData) {
        console.log(productData);
        // const adminData = await User.findOne({ is_admin: 1 });
        const userData = await User.findById({ _id: userid })
        res.render("product-detail", { product: productData, userData: userData });
      } else {
        res.redirect("/dashboard");
      }
    }catch(err){
        console.log(err.message);
    }
}

const userProfile=async(req,res)=>{
  try {
    const userid=req.session.user_id
    const user= await User.findById({_id: userid})
        res.render('userprofile',{user:user})
  } catch (error) {
    console.log(error.message);
  }
}




module.exports ={
    loginLoad,
    loadSignup,
    insertUser,
    verifyLogin,
    loadHome,
    filterProduct,
    productDetail,
    userProfile
}