const User=require('../models/usermodals')
const Products=require('../models/productModels')
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
        res.render('login')
    }catch(err){
        console.log(err.message);
    }
}

const loadSignup = async(req,res)=>{
    try{
        res.render('signup')
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

        const userData = await User.findOne({username:username});

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if(passwordMatch){
                if(userData.is_admin === 0
                  // ||
                  // userData.is_admin == 1 
                  ){
                req.session.user_id = userData._id;

                res.redirect('/dashboard')
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
            const productData = await Products.find({ });
            const userData = await User.findById({_id : req.session.user_id});
            console.log(productData);
            res.render('home',{products:productData});

        } catch (error) {

            console.log(error.message);
        }
}

const filterUser= async(req,res)=>{
    try{
        console.log('ghjgkhkg');
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



const loadCart = async (req,res)=>{
    try{
        res.render('shoping-cart')
    }catch(err){
        console.log(err);
    }
}

module.exports ={
    loginLoad,
    loadSignup,
    insertUser,
    verifyLogin,
    loadHome,
    loadCart,
    filterUser
}