const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const orderSchema = mongoose.Schema({

    addressId:{
        type:ObjectId,
        required:true
    },

    customer_id: {

        type:String,
        required:true
    },
    customer_name: {

        type:String,
        required:true
    },
    product_id: {

        type:String,
        required:true
    },
    product_name: {

        type:String,
        required:true
    },
    product_price: {

        type:String,
        required:true
    },
    product_img: {

        type:String,
        required:true
    },
    product_size: {

        type:String,
        required:true
    },
    product_quantity: {

        type:String,
        required:true
    },
    product_brand: {

        type:String,
        required:true
    },
    product_status:{
        type:String,
        default:'Ordered'
    },
    // is_delivered:{
    //     type:Boolean,
    //     default: false
    // }
})

module.exports=mongoose.model("Order",orderSchema);