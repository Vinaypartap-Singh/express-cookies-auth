import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/db.config.js";
import { handleCatchError, handleTryResponseHandler } from "../utils/helper.js";
import {
  loginSchemaValidation,
  registerSchemaValidation,
} from "../validations/auth.validation.js";

const AuthRouter = Router();

AuthRouter.post("/register", async (req, res) => {
  try {
    const body = req.body;
    const payload = registerSchemaValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (user) {
      return handleTryResponseHandler(res, 400, "User Already Exist");
    }

    const salt = bcrypt.genSaltSync(14);
    const hashedPassword = bcrypt.hashSync(payload.password, salt);

    const data = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
      },
    });

    return handleTryResponseHandler(
      res,
      201,
      "Your Account Created Successfully",
      data
    );
  } catch (error) {
    return handleCatchError(error, res);
  }
});

AuthRouter.post("/login", async (req, res) => {
  try {
    const body = req.body;
    const payload = loginSchemaValidation.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      return handleTryResponseHandler(res, 400, "User not found");
    }

    const verifyPassword = bcrypt.compareSync(payload.password, user.password);

    if (!verifyPassword) {
      return handleTryResponseHandler(res, 400, "Incorrect Email or Password");
    }

    const jwtPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    const responsePayload = {
      ...jwtPayload,
      token: `Bearer ${token}`,
    };

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return handleTryResponseHandler(
      res,
      200,
      "Account login Success",
      responsePayload
    );
  } catch (error) {
    return handleCatchError(error, res);
  }
});

export default AuthRouter;
