require("dotenv").config();
const express = require("express");
const passport = require('passport');
const session = require('express-session');
const cors = require("cors");
const BodyParser = require("body-parser");
const app = express();
const userRouter = require("./routes/userRoutes");
const webRouter = require("./routes/webRoutes");
const path = require("path");
const flash = require("express-flash");

require("./middleware/fbauth");
require("./middleware/googleauth");
require("./middleware/githubauth");

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));
app.use("/api", userRouter);
app.use("/", webRouter);

require("./config/dbConnection");

app.use((err , req , res , next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message : err.message
  });
});

app.listen(3000 , () => {
  console.log("Server is running on port 3000");
});
