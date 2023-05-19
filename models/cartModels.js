const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    product_id:{
        type:String,
        required:true
    },
    product_name:{
        type:String,
        required:true
    },
    product_price:{
        type:String,
        required:true
    },
    product_img:{
    
        type:String,
        required:true
    },
    product_size:{
    
        type:String
    },
    product_quantity:{
        type:String,
        required:true
    },
    product_brand:{
    
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Cart',cartSchema)