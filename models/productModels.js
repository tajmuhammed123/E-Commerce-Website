const mongoose = require("mongoose");

const products=mongoose.Schema({

product_name:{
    type:String,
    required:true
},
product_price:{
    type:String,
    required:true
},
product_discription:{

    type:String,
    required:true
},
product_img:{

    type:String,
    required:true
},
product_category:{

    type:String,
    required:true
},
product_brand:{

    type:String,
    required:true
}
  

});

module.exports=mongoose.model("Product",products);
