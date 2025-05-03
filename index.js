import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import RouteHandler from "./routes/index.js";
const app = express();
const PORT = process.env.PORT || 8000;

// Middlwares

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use(RouteHandler);

app.get("/", (req, res) => {
  return res.json({ message: "Server is running" });
});

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
