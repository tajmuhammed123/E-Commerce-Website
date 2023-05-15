const isLogin = async (req, res, next) => {
    try {
      if (req.session.Auser_id) {
        next();
      } else {
        res.redirect("");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.Auser_id) {
        res.redirect("");
      } else {
        next();
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  module.exports={
    isLogin,
    isLogout
  }
  