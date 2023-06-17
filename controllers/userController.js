const User=require('../models/usermodals')
const Products=require('../models/productModels')
const Cart=require('../models/cartModels')
const Order=require('../models/orderModels')
const Wallet=require('../models/walletModels')
const Category=require('../models/categoreyModels')
const Banner=require('../models/bannerModels')
const bcrypt = require("bcrypt");
const fs= require('fs')
const pdf=require('pdf-creator-node')
const path=require('path')

const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// const { loadOrderAddress } = require('./adminController')


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
              const banner= await Banner.find({})
              const session=req.session.user_id
              const category = await Category.find({ id_disable: false });
              const categoryIds = category.map(c => c.product_category); // Extract category IDs

              const productData = await Products.find({
                id_disable: false,
                product_category: { $in: categoryIds }
              }).limit(8);
              console.log(productData);
              
            const id=req.session.user_id
            const cartData = await Cart.findOne({ user_id: id })
            const userData = await User.findById({_id : req.session.user_id});
            console.log(id);
            res.render('home',{products:productData, user:userData, session, cart: cartData, category:category, banner:banner});
            }else{
              const banner= await Banner.find({})
              const session=null
              const category = await Category.find({ id_disable: false });
              const categoryIds = category.map(c => c.product_category); // Extract category IDs
              console.log(categoryIds);
              const productData = await Products.find({
                id_disable: false,
                product_category: { $in: categoryIds }
              }).limit(8);
              console.log(banner);
              res.render('home',{products:productData, session, cart: null, category:category, banner:banner})
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

const searchProduct = async (req, res) => {
  try {
    var session = req.session.user_id;

    if (session) {
      const cartData = await Cart.find({ user_id: session });
      session = null;
      
      var search = '';
      if (req.body.search) {
        search = req.body.search;
      }

      const userData = await Products.find({ product_name: { $regex: '.*' + search + '.*', $options: 'i' } });

      res.render('home', { products: userData, cart: cartData, session });
    } else {
      const cart = null;
      session = null;
      
      var search = '';
      if (req.body.search) {
        search = req.body.search;
      }
      console.log(req.body.search);

      const userData = await Products.find({ product_name: { $regex: '.*' + search + '.*', $options: 'i' } });

      res.render('home', { products: userData, cart, session });
    }
  } catch (error) {
    console.log(error.message);
    // Handle error if needed
    res.status(500).send('An error occurred during the search.');
  }
};


const userLogout=async(req,res)=>{
  try{
    req.session.destroy()
    res.redirect('/')
  }catch(err){
    console.log(err.message);
  }
}

const loadWallet = async (req, res) => {
  try {
    const user_id = req.session.user_id;
  const userData= await User.findById({_id:user_id})
    let wallet = await Wallet.findOne({ user_id: user_id });

    if (!wallet) {
      const walletUser = new Wallet({
        user_id: user_id,
        wallet_amount: 0
      });

      wallet = await walletUser.save();
    }

    res.render('wallet', { wallet: wallet, userData:userData });
  } catch (error) {
    console.log(error.message);
  }
};

const addWallet= async(req,res)=>{
  try{

    const userid=req.session.user_id
    const amount =req.body.addamount * 100
    
    
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: 'razorUser@gmail.com'
    };

    razorpayInstance.orders.create(options, async (err, order) => {
      console.log('Razorpay API Response:', err, order);
      if (!err) {
        res.status(200).send({
          success: true,
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
          contact: '9895299091',
          name: 'Taj Muhammed',
          email: 'tajmuhammed4969@gmail.com'
        });

      const wallet= await Wallet.findOne({user_id:userid})
      await Wallet.updateOne({user_id:userid},{
        $inc: {
          wallet_amount: req.body.addamount
        }
      },
      { new: true })
      let wallet_history={
        transaction_amount:'+$'+req.body.addamount
      }
      wallet.wallet_history.push(wallet_history)
      await wallet.save()
        
      } else {
        console.log('hjghfd');
        res.status(400).send({ success: false, msg: 'Something went wrong!' });
      }
    });

  }catch(err){
    console.log(err.message);
  }
}

const ascendingFilter=async(req,res)=>{
  try{
    if(req.session.user_id){
      const session=req.session.user_id
      const category = await Category.find({ id_disable: false });
      const categoryIds = category.map(c => c.product_category); 
      const banner= await Banner.find({})
      const productData = await Products.find({
        id_disable: false,
        product_category: { $in: categoryIds }
      }).sort({product_price:1})
    const id=req.session.user_id
    const cartData = await Cart.findOne({ user_id: id })
    const userData = await User.findById({_id : req.session.user_id});
    console.log(id);
    res.render('home',{products:productData, user:userData, session, cart: cartData, banner:banner, category:category});
    }else{
      const session=null
      const category = await Category.find({ id_disable: false });
      const categoryIds = category.map(c => c.product_category); 
      const banner= await Banner.find({})
      const productData = await Products.find({
        id_disable: false,
        product_category: { $in: categoryIds }
      }).sort({product_price:1})
      res.render('home',{products:productData, session, cart: null, banner:banner, category:category})
    }

  }catch(err){
    console.log(err.message);
  }
}


const descendingFilter=async(req,res)=>{
  try{
    if(req.session.user_id){
      const session=req.session.user_id
      const category = await Category.find({ id_disable: false });
      const categoryIds = category.map(c => c.product_category); 
      const banner= await Banner.find({})
      const productData = await Products.find({
        id_disable: false,
        product_category: { $in: categoryIds }
      }).sort({product_price:-1}) 
    const id=req.session.user_id
    const cartData = await Cart.findOne({ user_id: id })
    const userData = await User.findById({_id : req.session.user_id});
    console.log(id);
    res.render('home',{products:productData, user:userData, session, cart: cartData, banner:banner, category:category});
    }else{
      const session=null
      const category = await Category.find({ id_disable: false });
      const categoryIds = category.map(c => c.product_category); 
      const banner= await Banner.find({})
      const productData = await Products.find({
        id_disable: false,
        product_category: { $in: categoryIds }
      }).sort({product_price: -1})
      res.render('home',{products:productData, session, cart: null, banner:banner, category:category})
    }

  }catch(err){
    console.log(err.message);
  }
}
const loadMore=async(req,res)=>{
  try{
    if(req.session.user_id){
      const category = await Category.find({ id_disable: false });
      const categoryIds = category.map(c => c.product_category); 
      const banner= await Banner.find({})
      const session=req.session.user_id
      const productData = await Products.find({
        id_disable: false,
        product_category: { $in: categoryIds }
      })  
    const id=req.session.user_id
    const cartData = await Cart.findOne({ user_id: id })
    const userData = await User.findById({_id : req.session.user_id});
    console.log(id);
    res.render('home',{products:productData, user:userData, session, cart: cartData, category:category, banner:banner});
    }else{
      console.log('hjk');
      const banner= await Banner.find({})
      const session=null
      const category = await Category.find({ id_disable: false });
      const categoryIds = category.map(c => c.product_category); 
      const productData = await Products.find({
        id_disable: false,
        product_category: { $in: categoryIds }
      })
      res.render('home',{products:productData, session, cart: null, banner:banner, category:category})
    }

  }catch(err){
    console.log(err.message);
  }
}

const loadAddress=async(req,res)=>{
  try{
    const userid=req.session.user_id
    const userData = await User.findOne({ _id: userid });
      res.render('addresslist',{userid:userData})
  }catch(err){
    console.log(err.message);
  }
}

const loadEditAddress=async(req,res)=>{
  try{
    const addressid = req.body.address
    const userid=req.session.user_id
    const userData = await User.findOne({ _id: userid });
    const address = userData.address.id(addressid)
    console.log(address);
      res.render('editaddress',{ userid:userData, address:address })
  }catch(err){
    console.log(err.message);
  }
}

const editAddress=async(req,res)=>{
  
  try {
    console.log('jkhh');
    const addressid = req.body.addressid;
    const userid = req.session.user_id;
    const updateAddress = {
      firstName: req.body.firstName,
      secondName: req.body.secondName,
      email: req.body.email,
      mobNumber: req.body.mobNumber,
      houseNumber: req.body.houseNumber,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode
    };
    const user = await User.findById(userid);
  
    const address = user.address.id(addressid);

    address.set(updateAddress);
    await user.save();
    res.redirect('/addresslist')

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
  
}

const loadOrderDetails=async(req,res)=>{
  try{
    const id=req.session.user_id
    const productid=req.query.productid
    const user= await User.findById(id)
    console.log(user);
    const orderData = await Order.findOne({ customer_id: id });
    const order = orderData.product_details.find((product) => product._id.toString() === productid);
    console.log(order);
      res.render('orderdetails',{ order:order, user:user })
  }catch(err){
    console.log(err.message);
  }
}

const generatePdf = async (req, res) => {
  try {
    console.log('khjgf');
    const html = fs.readFileSync(path.join(__dirname, '../views/user/template.ejs'), 'utf-8');
    const filename = Math.random() + '_doc' + '.pdf';


    const prod = {
      name: req.body.name,
      description: req.body.description,
      unit: req.body.unit,
      quantity: req.body.quantity,
      price: req.body.price,
      total: req.body.quantity * req.body.price,
      imgurl: req.body.imgurl,
      username: req.body.username,
      mob: req.body.mob,
      email: req.body.email,
      date: req.body.date,
      id: req.body.id,
      amount:req.body.amount

    };

    let subtotal = prod.total;
    const tax = (subtotal * 20) / 100;
    const grandtotal = subtotal - tax;

    const obj = {
      // prodlist: [prod],      
      name: req.body.name,
      description: req.body.description,
      unit: req.body.unit,
      quantity: req.body.quantity,
      price: req.body.price,
      total: req.body.quantity * req.body.price,
      imgurl: req.body.imgurl,
      username: req.body.username,
      mob: req.body.mob,
      email: req.body.email,
      date: req.body.date,
      id: req.body.id,
      amount:req.body.amount,
      subtotal: subtotal,
      tax: tax,
      gtotal: grandtotal,
      prdcts: [prod]
    };

    console.log(obj);

    const options = {
      format: 'A3',
      orientation: 'portrait',
      border: '8mm',
      header: {
        height: '15mm',
        contents: '<h4 style="color: red; font-size: 20; font-weight: 800; text-align: center;">CUSTOMER INVOICE</h4>'
      },
      footer: {
        height: '20mm',
        contents: {
          first: 'Cover page',
          2: 'Second page',
          default: '<span style="color: #444;">page</span>/<span>pages</span>',
          last: 'Last Page'
        }
      }
    };

    const document = {
      html: html,
      data: {
        products: obj
      },
      path: './docs/' + filename
    };

    pdf.create(document, options)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      });

    const filepath = filename;
    console.log(filepath);
    res.redirect('/download?filepath=' + encodeURIComponent(filepath));
  } catch (err) {
    console.log(err.message);
  }
};

const loadDownload=async(req,res)=>{
  try{
    console.log('jkhgfd');
    const filepath = req.query.filepath;
      res.render('download', { path: filepath })
  }catch(err){
    console.log(err.message);
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
    userProfile,
    searchProduct,
    userLogout,
    loadWallet,
    addWallet,
    ascendingFilter,
    descendingFilter,
    loadMore,
    loadAddress,
    loadEditAddress,
    editAddress,
    loadOrderDetails,
    generatePdf,
    loadDownload
}


// const addressData = await User.findOne(
//   { _id: userid },
//   { address: { $elemMatch: { _id: addressid } } }
// );