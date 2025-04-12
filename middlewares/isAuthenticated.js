// middleware/isAuthenticated.js
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY); // No need for await
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.user = { id: decode.userId }; // ✅ THIS IS THE FIX
    next();
  } catch (error) {
    console.log("Auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal auth error",
    });
  }
};

export default isAuthenticated;
