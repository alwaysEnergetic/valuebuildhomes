var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var userRouter = require("./user");
var landRouter = require("./land");
var respRouter = require("./resp");
var homeRouter = require("./home");
var optionRouter = require("./option");
var pageRouter = require("./pagecontents");
var assetsRouter = require("./assets");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/user/", userRouter);
app.use("/land/", landRouter);
app.use("/resp/", respRouter);
app.use("/home/", homeRouter);
app.use("/option/", optionRouter);
app.use("/pagecontents/", pageRouter);
app.use("/assets/", assetsRouter);
module.exports = app;