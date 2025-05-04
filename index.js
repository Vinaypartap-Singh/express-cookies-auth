import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { randomInt } from "crypto";
import "dotenv/config";
import express from "express";
import sessions from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./db/db.config.js";
import RouteHandler from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middlwares

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session

app.use(
  sessions({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport Js Middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile?.emails[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) {
          const randomPassword = randomInt(10000000, 99999999).toString();
          const hashedPassword = bcrypt.hashSync(randomPassword, 14);
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: email,
              password: hashedPassword,
              googleId: profile.id,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize and DeSerialize User

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.use(RouteHandler);

app.get("/", (req, res) => {
  return res.json({ message: "Server is running" });
});

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
