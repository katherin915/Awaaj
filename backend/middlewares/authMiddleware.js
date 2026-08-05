const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { asyncHandler } = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Auth: Token received, length:", token.length);

      if (!process.env.JWT_SECRET) {
        console.error("Auth: JWT_SECRET not set in environment");
        res.status(500);
        throw new Error("Server configuration error");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth: Token decoded, user ID:", decoded.id);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        console.error("Auth: User not found in database for ID:", decoded.id);
        res.status(401);
        throw new Error("User not found");
      }

      console.log("Auth: User authenticated:", req.user.email);
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      if (error.name === "JsonWebTokenError") {
        res.status(401);
        throw new Error("Invalid token");
      } else if (error.name === "TokenExpiredError") {
        res.status(401);
        throw new Error("Token expired");
      } else {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
  }

  if (!token) {
    console.log("Auth: No token provided in request");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role ${req.user.role} is not authorized to access this route`,
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
