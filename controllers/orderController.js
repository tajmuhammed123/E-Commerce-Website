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
        } else {
          res.status(400).send({ success: false, msg: 'Something went wrong!' });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  


  module.exports = {
    orderHistory,
    productStatus,
    cancelProduct,
    returnProduct,
    createOrder
  }