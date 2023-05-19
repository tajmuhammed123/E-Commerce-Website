const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
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
    }
})

module.exports=mongoose.model("Order",orderSchema);