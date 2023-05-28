const Cart=require('../models/cartModels')
const Products=require('../models/productModels')
const User = require("../models/usermodals");
const Order=require('../models/orderModels')

const addToCart = async(req,res)=>{
    try {
        const id = req.query.id;
        const userid = req.query.userid;
        const productData = await Products.findById({ _id: id });
        const userData = await User.findById({ _id: userid });

        const cart = new Cart({
            user_id: userData._id,
            product_id: productData._id,
            product_name: productData.product_name,
            product_price: productData.product_price,
            product_img: productData.product_img[0],
            product_size: req.body.product_size,
            product_quantity: req.body.product_quantity,
            product_brand: productData.product_brand,
          });
      
          const cartData = await cart.save();
          if (cartData) {
            res.render("product-detail", { message: "Success", product: productData, userData: userData });
          }

    } catch (error) {
        console.log(error.message);
    }
}

const loadCart =async(req,res)=>{
    try{
        const userid = req.query.id
        console.log(userid);
        const cartData = await Cart.find({ user_id: userid });
        const orderData= await Order.find({ customer_id:userid })
        res.render('shoping-cart',{products: cartData, userid:userid, order:orderData })
    }catch(err){
        console.log(err.message);
    }
}

const deleteCartProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const userid = req.query.userid;
    console.log(id);
    await Cart.deleteOne({ _id: id });
    res.redirect(`/cart?id=${userid}`);
  } catch (error) {
    console.log(error.message);
  }
};

const updateCart = async (req, res) => {
    try {
      const product_id = req.body.product_id;
      const product_qty = req.body.product_qty;

        console.log(product_qty);
      const updateCart = await Cart.findByIdAndUpdate(
        product_id,
        {
          $set: {
            product_quantity: product_qty
          }
        }
      );
  
      console.log(updateCart);
      res.redirect("/cart");
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'An error occurred while updating the cart.' });
    }
  }

  const placeOrder=async(req,res)=>{
    try{
      console.log(req.query.userid);
      const userid = req.query.userid;
      const cartData = await Cart.find({ user_id: userid });
      const customer = await User.findOne({ _id: userid });
      const addressid = req.body.address
      
      // Iterate over each cart item in the productData array
      for (const cartItem of cartData) {
        const order = new Order({
          addressId: addressid,
          customer_id: cartItem.user_id,
          customer_name: customer.name,
          product_id: cartItem.product_id,
          product_name: cartItem.product_name,
          product_price: cartItem.product_price,
          product_img: cartItem.product_img,
          product_size: cartItem.product_size,
          product_quantity: cartItem.product_quantity,
          product_brand: cartItem.product_brand,
        });
      
        const orderData = await order.save();
        console.log(orderData);
      }
      for (const productData of cartData) {
        console.log('jhkgh');
        const product = await Products.findByIdAndUpdate(
          { _id: productData.product_id },
          {
            $inc: {
              product_stock: -productData.product_quantity
            }
          },
          { new: true }
        )
        const orderData = await product.save();
        console.log(orderData);
      }

      await Cart.deleteMany( { user_id: userid } )
      const add= customer.address.find((addr) => addr._id == addressid)
      console.log(add);
      res.render("success",{order:add});
      
    }catch(err){
      console.log(err.message);
    }
  }

  const loadPayment=async(req,res)=>{
    try{
      const id=req.query.id
      const totalamount=req.query.totalamount
      const orderid=req.query.orderid
      const userData = await User.findOne({ _id: id });
      console.log(userData);
      res.render('payment',{ userid:userData, totalamount:totalamount, orderid:orderid })
    }catch(err){
      console.log(err.message);
    }
  }

  const loadAddAddress=async(req,res)=>{
    try{
      const userid=req.query.userid
      console.log(userid);
      res.render('addaddress',{userid:userid})
    }catch(err){
      console.log(err.message);
    }
  }


  const addAddress = async (req, res) => {
    try {
      const userId = req.query.userid;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newAddress = {
        firstName: req.body.firstName,
        secondName: req.body.secondName,
        email: req.body.email,
        mobNumber: req.body.mobNumber,
        houseNumber: req.body.houseNumber,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode
      };
  
      user.address.push(newAddress);
      await user.save();
  
      console.log(user);
  
      res.render('payment',{userid:user});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  

module.exports = {
    addToCart,
    loadCart,
    deleteCartProduct,
    updateCart,
    placeOrder,
    loadAddAddress,
    loadPayment,
    addAddress
}