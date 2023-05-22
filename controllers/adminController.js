const User = require("../models/usermodals");
const Products = require("../models/productModels");
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
    const id=req.query.id
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
    const id=req.query.id
    const productsData = await Products.find({ });
    const adminData = await User.findOne({ _id:id });
    res.render("product-details", { products: productsData, admin: adminData });
  } catch (err) {
    console.log(err.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const adminData = await User.findOne({ _id:id })
    message = null;
    res.render("addproduct", { admin: adminData, message });
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
    const adminid =req.query.adminid
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
    const id = req.query.id;
    const productData = await Products.findById({ _id: id });

    if (productData) {
      console.log(productData);
      const adminData = await User.findOne({ _id:adminid });
      res.render("editproducts", { product: productData, admin: adminData });
    } else {
      res.redirect("/admin/product-details");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const productFiles = req.files.map((file) => file.filename);
    const productData = await Products.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          product_name: req.body.product_name,
          product_price: req.body.product_price,
          product_discription: req.body.product_discription,
          product_img: productFiles,
          product_category: req.body.product_category,
          product_brand: req.body.product_brand,
          product_size: req.body.product_size,
          id_disable: false,
          product_stock: req.body.product_stock
        },
      }
    );

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
    const id = req.query.id;
    message = null;
    const adminData = await User.findOne({ _id:id })
    res.render("adduser", { admin: adminData, message });
  } catch (err) {
    console.log(err.message);
  }
};

const addUser = async (req, res) => {
  try {
    const id = req.query.id;
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
    const adminid = req.query.adminid
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

const enableProduct = async(req,res)=>{
  try{
    const id = req.query.id
        await Products.findByIdAndUpdate({ _id: id }, { $set: { id_disable: false } })

        res.redirect('/admin/product-details')
  }catch(err){
    console.log(err.message);
  }
}

const disableProduct = async(req,res)=>{
  try{
    const id = req.query.id
        await Products.findByIdAndUpdate({ _id: id }, { $set: { id_disable: true } })

        res.redirect('/admin/product-details')
  }catch(err){
    console.log(err.message);
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
  disableProduct
};
