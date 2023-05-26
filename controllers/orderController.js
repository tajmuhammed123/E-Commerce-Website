const Cart=require('../models/cartModels')
const Products=require('../models/productModels')
const User = require("../models/usermodals");
const Order=require('../models/orderModels')

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

  module.exports = {
    orderHistory,
    productStatus,
    cancelProduct
  }