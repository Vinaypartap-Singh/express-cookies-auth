import { Router } from "express";
import AuthRouter from "../controllers/auth.controller.js";

const RouteHandler = Router();

RouteHandler.use("/api/auth", AuthRouter);

export default RouteHandler;
