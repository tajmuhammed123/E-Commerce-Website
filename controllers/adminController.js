const User = require("../models/usermodals");
const Products = require("../models/productModels");
const Category=require('../models/categoreyModels')
const Order=require('../models/orderModels')
const Coupon=require('../models/couponModels')
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    message = null;
    res.render("login", { message });
  } catch (err) {
    console.log(err.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const userData = await User.findOne({ username: username });

    if (userData) {
      console.log(userData);
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", {
            message: "Email and password is incorrect, not an admin",
          });
        } else {
          console.log(userData);
          req.session.admin_id = userData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", {
        message: "Please provide your Email and password",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const logout=async(req,res)=>{
  try{
      console.log(req.session);
      req.session.destroy()
      res.redirect('/admin')

  }catch(err){
      console.log(err.message);
  }
}

const loadDashboard = async (req, res) => {
  try {
    var id = req.session.admin_id;
    //const userData = await User.findById({ _id: req.session.admin_id });
    const adminData = await User.findById({ _id: req.session.admin_id });
    res.render("dashboard", { admin: adminData });
  } catch (err) {
    console.log(err.message);
  }
};

const loadUser = async (req, res) => {
  try {
    const id=req.session.admin_id
    const userData = await User.find({ is_admin: 0 });
    const adminData = await User.findOne({ _id:id });
    console.log(adminData);
    res.render("user-details", { user: userData, admin: adminData });
  } catch (err) {
    console.log(err.message);
  }
};

const loadProducts = async (req, res) => {
  try {
    const adminid=req.session.admin_id
    const productsData = await Products.find({ });
    const adminData = await User.findOne({ _id:adminid });
    res.render("product-details", { products: productsData, admin: adminData });
  } catch (err) {
    console.log(err.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const id = req.session.admin_id;
    const adminData = await User.findOne({ _id:id })
    const categoryData = await Category.find({ id_disable:false })
    message = null;
    res.render("addproduct", { admin: adminData, message, category:categoryData });
  } catch (err) {
    console.log(err.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const productFiles = req.files.map((file) => file.filename);
    const products = new Products({
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      product_discription: req.body.product_discription,
      product_img: productFiles,
      product_category: req.body.product_category,
      product_brand: req.body.product_brand,
      product_size: req.body.product_size,
      id_disable:false,
      product_stock: req.body.product_stock
    });
    const adminid =req.session.admin_id
    const adminData = await User.findOne({ _id:adminid });
    const productsData = await products.save();
    if (productsData) {
      res.render("addproduct", {
        message: "Product added successfully",
        admin: adminData,
      });
      console.log("success");
    } else {
      return res.render("addproduct", {
        message: "Enter valid details",
        admin: adminData,
      });
      console.log("failed");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const adminid =req.query.adminid
    message=null
    const id = req.query.id;
    const productData = await Products.findById({ _id: id });
    const categoryData = await Category.find({ id_disable:false })

    if (productData) {
      console.log(productData);
      const adminData = await User.findOne({ _id:adminid });
      res.render("editproducts", { product: productData, admin: adminData, category: categoryData, message });
    } else {
      res.redirect(`/admin/product-details?adminid=${adminid}&&id=${id}`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log('kjjhg');
    const productFiles = req.files.map((file) => file.filename);
    console.log(req.query.id);
    const productData = await Products.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          product_name: req.body.product_name,
          product_price: req.body.product_price,
          product_discription: req.body.product_discription,
          product_category: req.body.product_category,
          product_brand: req.body.product_brand,
          product_size: req.body.product_size,
          id_disable: false,
          product_stock: req.body.product_stock
        },
      }
    );
    console.log(productData);
    await productData.save()
    res.redirect("/admin/product-details");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await Products.deleteOne({ _id: id });
    res.redirect("/admin/product-details");
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddUser = async (req, res) => {
  try {
    const id = req.session.admin_id
    message = null;
    const adminData = await User.findOne({ _id:id })
    res.render("adduser", { admin: adminData, message });
  } catch (err) {
    console.log(err.message);
  }
};

const addUser = async (req, res) => {
  try {
    const id = req.session.admin_id
    const adminData = await User.findOne({ _id:id })
    const spassword = await securePassword(req.body.password);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render("adduser", {
        message: "Email already registered",
        admin: adminData,
      });
    }

    if (!req.body.name || req.body.name.trim().length === 0) {
      return res.render("adduser", {
        message: "Please enter a valid name",
        admin: adminData,
      });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mob,
      username: req.body.username,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      console.log("success");
      res.render("adduser", {
        message: "Registration Success",
        admin: adminData,
      });
    } else {
      res.render("adduser", {
        message: "Registration Failed",
        admin: adminData,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const editUser = async (req, res) => {
  try {
    const adminid = req.session.admin_id
    const id = req.query.id;
    const userData = await User.findById({ _id: id });

    if (userData) {
      console.log(userData);
      const adminData = await User.findOne({ _id:adminid });
      res.render("editusers", { user: userData, admin: adminData });
    } else {
      res.redirect("/admin/user-details");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mob,
          username: req.body.username,
        },
      }
    );
    console.log(userData);
    res.redirect("/admin/user-details");
  } catch (error) {
    console.log(error.message);
  }
};
// const deleteUser = async (req, res) => {
//   try {
//     const id = req.query.id;
//     await User.deleteOne({ _id: id });
//     res.redirect("/admin/user-details");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const enableProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const adminid = req.session.admin_id;
    await Products.findByIdAndUpdate({ _id: id }, { $set: { id_disable: false } });

    res.redirect(`/admin/product-details?adminid=${adminid}&&id=${id}`);
  } catch (err) {
    console.log(err.message);
  }
}


const disableProduct = async(req,res)=>{
  try{
    const id = req.query.id
    const adminid = req.session.admin_id
        await Products.findByIdAndUpdate({ _id: id }, { $set: { id_disable: true } })

    res.redirect(`/admin/product-details?adminid=${adminid}&&id=${id}`);
  }catch(err){
    console.log(err.message);
  }
}

const loadOrders=async(req,res)=>{
  try{
    const adminid = req.session.admin_id
    const adminData = await User.findOne({ _id:adminid });
    const orders= await Order.find({})
    res.render('order-list',{orders:orders, admin: adminData})

  }catch(err){
    console.log(err.message);
  }
}

const loadOrderAddress=async(req,res)=>{
  try {
    const productid=req.query.productid
    const addid= req.query.addid
    const userid=req.query.id
    const adminid = req.session.admin_id
    const orderid=req.query.orderid
    const adminData = await User.findOne({ _id:adminid });
    const customer = await User.findOne({ _id: userid });
    const orderData = await Order.findOne({ _id: orderid });
    const add= customer.address.find((addr) => addr._id == addid)
    res.render('order-address',{address:add, admin: adminData, order:orderData })
  } catch (err) {
    console.log(err.message);
  }
}

const loadOrderProducts=async(req,res)=>{
  try {
    const userid=req.query.id
    const adminid = req.session.admin_id
    const adminData = await User.findOne({ _id:adminid });
    const orderData = await Order.findOne({ customer_id: userid });
    console.log(orderData);
    res.render('order-products',{ admin: adminData, order:orderData })
  } catch (err) {
    console.log(err.message);
  }
}

const loadAddCategorey=async(req,res)=>{
  try{
    const adminid = req.session.admin_id
    const adminData = await User.findOne({ _id:adminid });
      res.render('add-category',{ admin: adminData })
  }catch(err){
    console.log(err.message);
  }
}
const addCategorey=async(req,res)=>{
  try{
    const adminid = req.session.admin_id
    console.log(req.body.productcategory);
    const productCategory = req.body.productcategory;

    const existingCategory = await Category.findOne({
      product_category: { $regex: new RegExp(productCategory, 'i') }
    });
    if (existingCategory) {
      return res.render("add-category", {
        message: "Categorey already exist", admin:adminid
      });
    }
    const category = new Category({
      product_category: req.body.productcategory
    });
    await category.save();
    res.redirect(`/admin/product-details?adminid=${adminid}`);
  }catch(err){
    console.log(err.message);
  }
}

// const editProdutStatus=async(req,res)=>{
//   try {
//     const productid=req.query.productid
//     const product_status= req.body.product_status
//     console.log(product_status);
//     await Order.findByIdAndUpdate({ _id: productid }, { $set: { product_status: product_status } }) 
//   } catch (error) {
//     console.log(error.message);
//   }
// }

const loadCategorey=async(req,res)=>{
  try {
      const adminid=req.session.admin_id
      const category= await Category.find({ });
      res.render('categorey-list',{ category:category, admin:adminid})
  } catch (error) {
    console.log(error.message);
  }
}

const enableCategory=async(req,res)=>{
  try {
    const adminid = req.session.admin_id;
    const categoryid = req.query.categoryid;
    await Category.findByIdAndUpdate({ _id: categoryid }, { $set: { id_disable: false } });

    res.redirect('/admin/category');
  } catch (error) {
    console.log(error.message);
  }
}

const disableCategory=async(req,res)=>{
  try {
    const adminid = req.session.admin_id;
    const categoryid = req.query.categoryid;
    await Category.findByIdAndUpdate({ _id: categoryid }, { $set: { id_disable: true } });

    res.redirect('/admin/category');
  } catch (error) {
    console.log(error.message);
  }
}

const disableUser=async(req,res)=>{
  try {
    const adminid = req.session.admin_id;
    const userid = req.query.userid;
    await User.findByIdAndUpdate({ _id: userid }, { $set: { id_disable: true } });
    
    // Get all sessions from the session store
    req.sessionStore.all((error, sessions) => {
      if (error) {
        console.log('An error occurred while retrieving sessions:', error);
        res.status(500).send('An error occurred');
      } else {
        // Find the target session based on user_id
        const targetSession = Object.values(sessions).find(session => session.user_id === userid);
        if (targetSession) {
          // Update the session data by removing the user_id
          delete targetSession.user_id;
          console.log(targetSession);
          // Save the modified session data back to the session store
          req.sessionStore.set(targetSession.sessionID, targetSession, (error) => {
            if (error) {
              console.log('An error occurred while updating the session:', error);
              res.status(500).send('An error occurred');
            } else {
              console.log('User ID removed from session successfully');
              res.redirect('/admin/user-details');
            }
          });
        } else {
          console.log('User session not found');
          res.redirect('/admin/user-details');
        }
      }
    });
    
    
  } catch (error) {
    console.log(error.message);
  }
}


const enableUser=async(req,res)=>{
  try {
    const adminid = req.session.admin_id;
    const userid = req.query.userid;
    await User.findByIdAndUpdate({ _id: userid }, { $set: { id_disable: false } });

    res.redirect('/admin/user-details');
  } catch (error) {
    console.log(error.message);
  }
}


const loadAddCoupon=async(req,res)=>{
  try {
    message=null
    const adminid=req.session.admin_id
    res.render('addcoupon',{admin:adminid, message})
  } catch (error) {
    console.log(error.message);
  }
}

const addCoupon=async(req,res)=>{
  try {
      console.log(req.body.coupon_code);
      const adminid=req.session.admin_id
      const existingCoupon = await Coupon.findOne({ coupon_code: req.body.coupon_code });
      if (existingCoupon) {
        return res.render("addcoupon", {
          message: "Coupon already exist", admin:adminid
        });
      }

    const coupon = new Coupon({
      coupon_code: req.body.coupon_code,
      coupon_type: req.body.coupon_type,
      coupon_value: req.body.coupon_value,
      min_purchase: req.body.min_purchase,
      max_discount: req.body.max_discount,
    });
    await coupon.save();
    res.redirect('/admin/couponlist')
  } catch (error) {
    console.log(error.message);
  }
}

const listCoupon=async(req,res)=>{
  try {
    const adminid=req.session.admin_id
    const couponData= await Coupon.find({ });
    res.render('coupon-list',{ coupon:couponData, admin:adminid})
  } catch (error) {
    console.log(error.message);
  }
}


const loadeditCoupon=async(req,res)=>{
  try{
      const adminid = req.session.admin_id
      const couponid =req.query.couponid
      const couponData=await Coupon.findById({_id:couponid})
      res.render('couponedit',{admin:adminid, couponid:couponData})
  }catch(err){
    log(err.message)
  }
}

const editCoupon = async (req, res) => {
  try {
    const couponid = req.body.couponid;
    const couponData = await Coupon.findByIdAndUpdate(
      { _id: couponid },
      {
        $set: {
          coupon_code: req.body.coupon_code,
          coupon_type: req.body.coupon_type,
          coupon_value: req.body.coupon_value,
          min_purchase: req.body.min_purchase,
          max_discount: req.body.max_discount
        }
      }
    );
    await couponData.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

const loadeditCategorey=async(req,res)=>{
  try{
    const adminid = req.session.admin_id
    const admin= await User.findById({_id: adminid})
    const categoryid=req.query.categoryid
    const categoryname= await Category.findById({_id: categoryid})
    res.render('edit-category',{category:categoryname, admin:admin })
    
  }catch(err){
    console.log(err.message)
  }
}
const editCategorey=async(req,res)=>{
  try{
    const category = req.body.category
    const categoryid=req.query.categoryid
    const categoryData=await Category.findByIdAndUpdate({_id:categoryid},{ $set :{
      product_category: req.body.category
    }})
    await categoryData.save()
    res.redirect('/admin/category')
    
  }catch(err){
    console.log(err.message)
  }
}



module.exports = {
  loadLogin,
  verifyLogin,
  logout,
  loadDashboard,
  loadProducts,
  loadUser,
  loadAddProduct,
  addProduct,
  editProduct,
  updateProduct,
  deleteProduct,
  loadAddUser,
  addUser,
  editUser,
  updateUser,
  enableProduct,
  disableProduct,
  loadOrders,
  loadOrderAddress,
  loadOrderProducts,
  loadAddCategorey,
  addCategorey,
  loadCategorey,
  enableCategory,
  disableCategory,
  disableUser,
  enableUser,
  addCoupon,
  loadAddCoupon,
  listCoupon,
  loadeditCoupon,
  editCoupon,
  loadeditCategorey,
  editCategorey
};
