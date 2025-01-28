const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const isAuthorize = async(req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      return res.status(401).json({ message: "Please Provide a Token" });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = {isAuthorize};