import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import prisma from "../db/db.config.js";
import AuthMiddleware from "../middleware/auth.middlware.js";
import { upload } from "../middleware/multer.middleware.js";
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
      expiresIn: "1d",
    });

    const responsePayload = {
      ...jwtPayload,
      token: `Bearer ${token}`,
    };

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
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

AuthRouter.get("/user", AuthMiddleware, async (req, res) => {
  try {
    const userCheck = req.user;

    const user = await prisma.user.findUnique({
      where: {
        email: userCheck.email,
      },
    });

    if (!user) {
      return handleTryResponseHandler(res, 400, "Unauthorized Access");
    }

    const payload = {
      ...user,
    };

    return handleTryResponseHandler(res, 200, "User Information", payload);
  } catch (error) {
    return handleCatchError(error, res);
  }
});

AuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

AuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/login" }),
  function (req, res) {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    res.json({
      message: "Account Logged In Successfully",
    });

    res.redirect("/");
  }
);

export default AuthRouter;

AuthRouter.post(
  "/profile",
  AuthMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user_id = req.user.id;

      if (!user_id) {
        return handleTryResponseHandler(res, 400, "UnAuthorized Access");
      }

      if (!req.file) {
        return handleTryResponseHandler(res, 400, "No Image File Uploaded");
      }

      const profileImageLocalPath = req.file.path;

      const profileImage = await uploadOnCloudinary(profileImageLocalPath);

      if (!profileImage) {
        return handleTryResponseHandler("Unable to load image to cloudinary.");
      }

      await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          profileImage: profileImage.url,
        },
      });

      const imageUrl = {
        profileImage: profileImage.urxl,
      };

      return handleTryResponseHandler(
        res,
        200,
        "Profile Image Uploaded Successfully",
        imageUrl
      );
    } catch (error) {
      return handleCatchError(error, res);
    }
  }
);
