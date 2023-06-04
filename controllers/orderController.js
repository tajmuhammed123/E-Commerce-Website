const Cart=require('../models/cartModels')
const Products=require('../models/productModels')
const User = require("../models/usermodals");
const Order=require('../models/orderModels')
const Wallet=require('../models/walletModels')

const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const orderHistory=async(req,res)=>{
    try{
    const id = req.session.user_id;
    const orderData = await Order.findOne({ customer_id: id });
    const custData = await User.findOne({_id:id})
    const custName = custData.name
    console.log(orderData);
      res.render('orderhistory',{ order:orderData, name:custName })
    }catch(err){
      console.log(err.message);
    }
  }

  const productStatus = async (req, res) => {
    try {
      const id = req.query.id;
      const productId = req.body.productID;
      const adminId = req.session.admin_id;
      const productStatus = req.body.product_status;
  
      console.log(adminId);
  
      await Order.updateOne(
        {
          customer_id: id,
          'product_details._id': productId
        },
        {
          $set: {
            'product_details.$.product_status': productStatus
          }
        }
      );
  
      res.redirect(`/admin/orders?adminid=${adminId}`);
      console.log(productStatus);
    } catch (error) {
      console.log(error.message);
    }
  };  

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

  const returnProduct = async (req, res) => {
    try {
      const orderid = req.query.orderid;
      const daysThreshold = 14; // Number of days threshold
  
      const order = await Order.findOne({
        customer_id: req.session.user_id,
        'product_details._id': orderid
      });
  
      if (!order) {
        // Order not found
        return res.status(404).json({ error: 'Order not found' });
      }
  
      const currentDate = new Date();
      const orderDateStr = order.product_details.find(item => item._id.toString() === orderid).order_date;
      const orderDate = new Date(orderDateStr);
  
      const timeDifference = currentDate.getTime() - orderDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
      if (daysDifference > daysThreshold) {
        // Order is older than the threshold, handle the case accordingly
        return res.status(400).json({ error: 'Order is older than the threshold' });
      }
  
      // Perform the update on the found order
      await Order.findOneAndUpdate(
        {
          customer_id: req.session.user_id,
          'product_details._id': orderid
        },
        {
          $set: {
            'product_details.$.product_status': 'Return'
          }
        },
        { new: true }
      );
  
      res.redirect('/orderhistory');
    } catch (error) {
      console.log(error.message);
    }
  };  

  

  const createOrder = async (req, res) => {
    try {
      const amount = req.body.amount * 100;
      const userid = req.session.user_id;
      const cartData = await Cart.findOne({ user_id: userid });
      const customer = await User.findOne({ _id: userid });
      const addressid = req.body.address;

      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
      console.log(currentDate);
  
      if (req.body.mode === 'Online Payment') {
        const options = {
          amount: amount,
          currency: 'INR',
          receipt: 'razorUser@gmail.com'
        };
  
        razorpayInstance.orders.create(options, async (err, order) => {
          if (!err) {
            res.status(200).send({
              success: true,
              msg: 'Order Created',
              order_id: order.id,
              amount: amount,
              key_id: RAZORPAY_ID_KEY,
              product_name: req.body.name,
              address: req.body.address,
              contact: '9895299091',
              name: 'Taj Muhammed',
              email: 'tajmuhammed4969@gmail.com'
            });
  
            // Check if cartData exists and is an array
            if (cartData && Array.isArray(cartData.product)) {
              for (const cartItem of cartData.product) {
                const orderItem = {
                  product_id: cartItem.product_id,
                  product_name: cartItem.product_name,
                  product_price: cartItem.product_price,
                  product_img: cartItem.product_img,
                  product_size: cartItem.product_size,
                  product_quantity: cartItem.product_quantity,
                  product_brand: cartItem.product_brand,
                  order_date: formattedDate,
                  payment_method: req.body.mode
                };
            
                let order = await Order.findOneAndUpdate(
                  { customer_id: req.session.user_id },
                  {
                    $set: {
                      addressId: addressid,
                      customer_name: customer.name,
                    }
                  },
                  { new: true, upsert: true }
                );
            
                order.product_details.push(orderItem);
            
                console.log(order);
              }            
            } else {
              console.log('Cart data not found or is invalid');
            }
  
            for (const productItem of cartData.product) {
              console.log(productItem.product_id);
              await Products.findByIdAndUpdate(
                productItem.product_id,
                {
                  $inc: {
                    product_stock: -productItem.product_quantity
                  }
                },
                { new: true }
              );
            }
  
            await Cart.deleteOne({ user_id: userid });
            const add = customer.address.find((addr) => addr._id == addressid);
            console.log(add);
          } else {
            res.status(400).send({ success: false, msg: 'Something went wrong!' });
          }
        });
      } else if(req.body.mode === 'Wallet') {
        const wallet= await Wallet.findOne({user_id:userid})
        console.log(wallet.wallet_amount);
        console.log(cartData.cart_amount);
        if(wallet.wallet_amount>=cartData.cart_amount){
          // Check if cartData exists and is an array
          console.log('kjhg');
        if (cartData && Array.isArray(cartData.product)) {
          for (const cartItem of cartData.product) {
            const orderItem = {
              product_id: cartItem.product_id,
              product_name: cartItem.product_name,
              product_price: cartItem.product_price,
              product_img: cartItem.product_img,
              product_size: cartItem.product_size,
              product_quantity: cartItem.product_quantity,
              product_brand: cartItem.product_brand,
              order_date: formattedDate
            };
  
            let order = await Order.findOneAndUpdate(
              { customer_id: req.session.user_id },
              {
                $set: {
                  addressId: addressid,
                  customer_name: customer.name,
                  payment_method: req.body.mode
                },
                $push: {
                  product_details: orderItem
                }
              },
              { new: true, upsert: true }
            );
  
            console.log(order);
          }
        } else {
          console.log('Cart data not found or is invalid');
        }
  
        for (const productItem of cartData.product) {
          console.log(productItem.product_id);
          await Products.findByIdAndUpdate(
            productItem.product_id,
            {
              $inc: {
                product_stock: -productItem.product_quantity
              }
            },
            { new: true }
          );
        }
        await Wallet.updateOne({user_id:userid},{
          $inc: {
            wallet_amount: -cartData.cart_amount
          }
        },
        { new: true })
        let wallet_history={
          transaction_amount:'-$'+cartData.cart_amount
        }
        wallet.wallet_history.push(wallet_history)
        await wallet.save()
        console.log('hjkgh');
        console.log(currentDate);
        await Cart.deleteOne({ user_id: userid });
        const add = customer.address.find((addr) => addr._id == addressid);
        console.log(add);
        res.status(200).send({ success: true, cod: true });
        }else{
          console.log('Insufficient Balance');
          res.status(400).send({ success: false, msg: 'Insufficient Balance' });
        }
        
      } else {
        // Check if cartData exists and is an array
        if (cartData && Array.isArray(cartData.product)) {
          for (const cartItem of cartData.product) {
            const orderItem = {
              product_id: cartItem.product_id,
              product_name: cartItem.product_name,
              product_price: cartItem.product_price,
              product_img: cartItem.product_img,
              product_size: cartItem.product_size,
              product_quantity: cartItem.product_quantity,
              product_brand: cartItem.product_brand,
              order_date: formattedDate
            };
  
            let order = await Order.findOneAndUpdate(
              { customer_id: req.session.user_id },
              {
                $set: {
                  addressId: addressid,
                  customer_name: customer.name,
                  payment_method: req.body.mode
                },
                $push: {
                  product_details: orderItem
                }
              },
              { new: true, upsert: true }
            );
  
            console.log(order);
          }
        } else {
          console.log('Cart data not found or is invalid');
        }
  
        for (const productItem of cartData.product) {
          console.log(productItem.product_id);
          await Products.findByIdAndUpdate(
            productItem.product_id,
            {
              $inc: {
                product_stock: -productItem.product_quantity
              }
            },
            { new: true }
          );
        }
        console.log(currentDate);
        await Cart.deleteOne({ user_id: userid });
        const add = customer.address.find((addr) => addr._id == addressid);
        console.log(add);
        res.status(200).send({ success: true, cod: true });
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