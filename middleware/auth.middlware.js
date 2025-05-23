import jwt from "jsonwebtoken";
import { handleCatchError, handleTryResponseHandler } from "../utils/helper.js";

const AuthMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  // check if token is in header authorization

  if (!token && req.headers.authorization?.startWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return handleTryResponseHandler(
      res,
      401,
      "Access denied. No token provided."
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return handleCatchError(error, res, "Invalid or expired token");
  }
};

export default AuthMiddleware;
