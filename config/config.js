require('dotenv').config()
const sessionSecret = process.env.SESSION_SECRET_KEY;

module.exports = {
  sessionSecret
};