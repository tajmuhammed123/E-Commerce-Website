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
            product_quantity: 1,
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
        res.render('shoping-cart',{products: cartData})
    }catch(err){
        console.log(err.message);
    }
}

const deleteCartProduct = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    await Cart.deleteOne({ _id: id });
    res.redirect("/cart");
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

  const checkOut=async(req,res)=>{
    try{
      console.log(req.query.id);
      const id = req.query.id;
      const productData = await Cart.find({ user_id: id });
      const customer = await User.findOne({ _id: id });
      console.log(productData);
      
      console.log('dfgh');
      
      // Iterate over each cart item in the productData array
      for (const cartItem of productData) {
        const order = new Order({
          customer_id: cartItem.user_id,
          customer_name: customer.name,
          product_id: cartItem.product_id,
          product_name: cartItem.product_name,
          product_price: cartItem.product_price,
          product_img: cartItem.product_img,
          product_size: cartItem.product_size,
          product_quantity: cartItem.product_quantity,
          product_brand: cartItem.product_brand
        });
      
        const orderData = await order.save();
        console.log(orderData);
      }
      
      res.redirect("/cart");
      
    }catch(err){
      console.log(err.message);
    }
  }
  

module.exports = {
    addToCart,
    loadCart,
    deleteCartProduct,
    updateCart,
    checkOut
}