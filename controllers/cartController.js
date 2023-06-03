const Cart=require('../models/cartModels')
const Products=require('../models/productModels')
const User = require("../models/usermodals");
const Order=require('../models/orderModels')
const Coupon=require('../models/couponModels')
const mongoose=require('mongoose')

  const addToCart = async (req, res) => {
    try {
      const id = req.query.id;
      const userid = req.query.userid;

      // Retrieve product and user data
      const productData = await Products.findById(id);
      const userData = await User.findById(userid);

      // Create a cart item object
      const cartItem = {
        product_id: productData._id,
        product_name: productData.product_name,
        product_price: productData.product_price,
        product_img: productData.product_img[0],
        product_size: req.body.product_size,
        product_quantity: req.body.product_quantity,
        product_brand: productData.product_brand,
      };

      // Find or create a cart for the user
      let cart = await Cart.findOneAndUpdate({ user_id: req.session.user_id },{$set:{cart_amount: +productData.product_price}});

      if (!cart) {
        // Create a new cart if it doesn't exist
        cart = new Cart({ user_id: req.session.user_id, cart_amount: productData.product_price});
      }

      // Add the cart item to the cart's product array
      cart.product.push(cartItem);

      // Save the cart
      const savedCart = await cart.save();

      if (savedCart) {
        res.render("product-detail", { message: "Success", product: productData, userData: userData });
      }
    } catch (error) {
      console.log(error.message);
      // Handle the error and send an appropriate response to the client
      res.status(500).send("Error adding product to cart.");
    }
  };
//   const loadCart =async(req,res)=>{
//     try{
//         const userid = req.query.id
//         console.log(userid);
//         const cartData = await Cart.findOne({ user_id: userid })
//         console.log(cartData);
//         res.render('shoping-cart',{products: cartData, userid:userid })

//     }catch(err){
//         console.log(err.message);
//     }
// }

  const loadCart = async (req, res) => {
    try {
      const userid = req.session.user_id;
      console.log(userid);
      var cartPrd = await Cart.findOne({ user_id: userid })
  
      // Check if cart data exists
      if (cartPrd) {
        // Update current_stock only once
          console.log('vbvcxdfb');
          for (const cartItem of cartPrd.product) {
            const productData = await Products.findById(cartItem.product_id);
            if (productData) {
              cartItem.current_stock = productData.product_stock;
            }
          }
          // Increment count to indicate update has been performed
          // cartPrd.count++;
          await cartPrd.save();
  
        res.render('shoping-cart', { products: cartPrd, userid: userid, product:cartPrd.product });
      }else{
        cartPrd=null
        res.render('shoping-cart', { products: cartPrd, userid: userid, product:cartPrd });
      }
    } catch (error) {
      console.error(error);
      // Handle the error appropriately
    }
  }

const couponCode = async (req, res) => {
  try {
    const userid = req.session.user_id;
    console.log(userid);
    const code = req.body.code;
    req.session.coupon_status =false
    const cartData = await Cart.findOne({ user_id: userid }).populate("product.product_id");
    const orderData = await Order.find({ customer_id: userid });
    console.log(cartData);

    if (cartData) {
      let totalPrice = cartData.product.map((product) => product.product_price).reduce((acc, cur) => acc += cur);

      await Coupon.findOne({coupon_status:false, coupon_code: { $regex: new RegExp(code, 'i') } })
        .then((coupon) => {
          console.log('Coupon:', coupon);
          if (coupon.coupon_type === "Flat" && coupon.min_purchase < totalPrice) {
            console.log('flat');
            totalPrice = totalPrice - coupon.coupon_value;
            req.session.coupon_status = true;
            req.session.totalPrice = totalPrice;
          } else if (coupon.coupon_type === "Percentage" && coupon.min_purchase < totalPrice) {
            console.log('percentage');
            totalPrice = totalPrice - ((totalPrice * coupon.coupon_value) / 100);
            req.session.coupon_status = true;
            req.session.totalPrice = totalPrice;
          }
          res.json({ success: coupon });
        });

        console.log(req.session.totalPrice);
    } else {
      res.redirect('/cart');
    }
  } catch (err) {
    console.log(err.message);
  }
};


const deleteCartProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const userid = req.query.userid;
    console.log(id);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ success: false, error: 'Invalid product ID' });
    }

    await Cart.updateOne(
      { user_id: userid },
      { $pull: { product: { _id: id } } }
    );

    res.status(200).send({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: error.message });
  }
};


const updateCart = async (req, res) => {
  try {
    console.log('hghfg');
    const userid=req.session.user_id
    const product_id = req.body.product_id;
    const product_qty = req.body.product_qty;
    // const Product= await Cart.findOne({user_id: userid, "product._id": product_id})

    console.log(product_id);
    console.log(product_qty);
    const updatedCart = await Cart.findOneAndUpdate(
      { user_id: userid, "product._id": product_id },
      { $set: { "product.$.product_quantity": product_qty } }
    );

    console.log(updatedCart);
    console.log('success');
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'An error occurred while updating the cart.' });
  }
}




  const placeOrder=async(req,res)=>{
    try{
      const userid = req.session.user_id;
      const cartData = await Cart.findOne({ user_id: userid });
      const customer = await User.findOne({ _id: userid });
      const addressid = req.body.address;

      // Check if cartData exists and is an array
      if (cartData && Array.isArray(cartData.product)) {
        // Iterate over each cart item in the productData array
        for (const cartItem of cartData.product) {
          const order = new Order({
            addressId: addressid,
            customer_id: userid, // Use the userid obtained from the request query
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
      } else {
        console.log('Cart data not found or is invalid');
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

      await Cart.delete( { user_id: userid } )
      const add= customer.address.find((addr) => addr._id == addressid)
      console.log(add);
      res.render("success",{order:add});
      
    }catch(err){
      console.log(err.message);
    }
  }

  const loadPayment=async(req,res)=>{
    try{
      console.log(req.session.totalPrice);
      const userid=req.session.user_id
      const userData = await User.findOne({ _id: userid });
      console.log(userData);
      res.render('payment',{ userid:userData })
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

  const updateCoupon=async(req,res)=>{
    try{
      console.log(req.session.totalPrice);
      const prid=req.body.prid
      const orderid=req.body.orderid
      const totalPrice = req.body.totalamnt
      // const userData = await User.findOne({ _id: prid });
      res.redirect(`/payment?prid=${prid}&&orderid=${orderid}&&totalamount=${totalPrice}`)
    }catch(err){
      console.log(err.message);
    }
  }
  
  

module.exports = {
    addToCart,
    loadCart,
    deleteCartProduct,
    updateCart,
    placeOrder,
    loadAddAddress,
    loadPayment,
    addAddress,
    couponCode,
    updateCoupon
}