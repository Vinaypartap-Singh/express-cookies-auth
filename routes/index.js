import { Router } from "express";
import AuthRouter from "../controllers/auth.controller.js";

const RouteHandler = Router();

RouteHandler.use("/auth", AuthRouter);

export default RouteHandler;
