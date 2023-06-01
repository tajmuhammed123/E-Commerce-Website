const Cart=require('../models/cartModels')
const Products=require('../models/productModels')
const User = require("../models/usermodals");
const Order=require('../models/orderModels')

const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const orderHistory=async(req,res)=>{
    try{
    const id = req.session.user_id;
    const orderData = await Order.find({ customer_id: id });
    const custData = await User.findOne({_id:id})
    const custName = custData.name
    console.log(id);
      res.render('orderhistory',{ order:orderData, name:custName })
    }catch(err){
      console.log(err.message);
    }
  }

  const productStatus=async(req,res)=>{
    try {
          const orderid=req.query.orderid
          const adminid=req.session.admin_id
          const product_status=req.body.product_status
          console.log(adminid);
          await Order.findByIdAndUpdate({ _id:orderid }, { $set: { product_status: product_status } })
            res.redirect(`/admin/orders?adminid=${adminid}`)
            console.log(product_status);
    } catch (error) {
      console.log(error.message);
    }
  }

  const cancelProduct=async(req,res)=>{
    try {
          const orderid = req.query.orderid
          console.log(orderid);
          await Order.findByIdAndUpdate({ _id:orderid }, { $set: { product_status: 'Canceled' } })
          res.redirect('/orderhistory')
    } catch (error) {
      console.log(error.message);
    }
  }

  const returnProduct=async(req,res)=>{
    try {
          const orderid = req.query.orderid
          console.log(orderid);
          await Order.findByIdAndUpdate({ _id:orderid }, { $set: { product_status: 'Return' } })
          res.redirect('/orderhistory')
    } catch (error) {
      console.log(error.message);
    }
  }

  const createOrder = async (req, res) => {
    try {
      const amount = req.body.amount * 100;
      const userid = req.session.user_id;
      const cartData = await Cart.findOne({ user_id: userid });
      const customer = await User.findOne({ _id: userid });
      const addressid = req.body.address;

      
      
      
      if(req.body.mode=='Online Payment'){
        
        const options = {
          amount: amount,
          currency: 'INR',
          receipt: 'razorUser@gmail.com'
        };
    
        razorpayInstance.orders.create(options, (err, order) => {
          if (!err) {

            
            res.status(200).send({
              success: true,
              msg: 'Order Created',
              order_id: order.id,
              amount: amount,
              key_id: RAZORPAY_ID_KEY,
              product_name: req.body.name,
              address: req.body.address,
              contact: "9895299091",
              name: "Taj Muhammed",
              email: "tajmuhammed4969@gmail.com"
            });

            // Check if cartData exists and is an array
      if (cartData && Array.isArray(cartData.product)) {
        // Iterate over each cart item in the productData array
        for (const cartItem of cartData.product) {
          const order = new Order({
            addressId: addressid,
            customer_id: userid,
            customer_name: customer.name,
            product_id: cartItem.product_id,
            product_name: cartItem.product_name,
            product_price: cartItem.product_price,
            product_img: cartItem.product_img,
            product_size: cartItem.product_size,
            product_quantity: cartItem.product_quantity,
            product_brand: cartItem.product_brand,
            payment_method:req.body.mode
          });

          const orderData = order.save();
          console.log(orderData);
        }
      } else {
        console.log('Cart data not found or is invalid');
      }

      for (const productItem of cartData.product) {
        console.log(productItem.product_id);
        const product = Products.findByIdAndUpdate(
          { _id: productItem.product_id },
          {
            $inc: {
              product_stock: -productItem.product_quantity
            }
          },
          { new: true }
        );
        const orderData = product.save();
        console.log(orderData);
      }

            Cart.deleteOne( { user_id: userid } )
            const add= customer.address.find((addr) => addr._id == addressid)
            console.log(add);
          } else {
            res.status(400).send({ success: false, msg: 'Something went wrong!' });
          }
        });

      }else{

        // Check if cartData exists and is an array
      if (cartData && Array.isArray(cartData.product)) {
        // Iterate over each cart item in the productData array
        for (const cartItem of cartData.product) {
          const order = new Order({
            addressId: addressid,
            customer_id: userid,
            customer_name: customer.name,
            product_id: cartItem.product_id,
            product_name: cartItem.product_name,
            product_price: cartItem.product_price,
            product_img: cartItem.product_img,
            product_size: cartItem.product_size,
            product_quantity: cartItem.product_quantity,
            product_brand: cartItem.product_brand,
            payment_method:req.body.mode
          });

          const orderData = await order.save();
          console.log(orderData);
        }
      } else {
        console.log('Cart data not found or is invalid');
      }

      for (const productItem of cartData.product) {
        console.log(productItem.product_id);
        const product = await Products.findByIdAndUpdate(
          { _id: productItem.product_id },
          {
            $inc: {
              product_stock: -productItem.product_quantity
            }
          },
          { new: true }
        );
        const orderData = await product.save();
        console.log(orderData);
      }


        await Cart.deleteOne( { user_id: userid } )
        const add= customer.address.find((addr) => addr._id == addressid)
        console.log(add);
        res.status(200).send({ success: true, cod:true })
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const paymentSuccess=async(req,res)=>{
    try{
        res.render('success')
    }catch(err){
      console.log(err.message);
    }
  }
  


  module.exports = {
    orderHistory,
    productStatus,
    cancelProduct,
    returnProduct,
    createOrder,
    paymentSuccess
  }