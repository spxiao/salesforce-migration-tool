"use strict";
exports.checkLogin = function(req, res, next) {
  if (req.user) {
    // user already logged in
    next();
  } else {
    // redirect to login page
    res.redirect("/");
  }
};

exports.redirectToHomePageIfAlreadyLoggedIn = function(req, res, next) {
  if (req.user) {
    // user already logged in, redirect to home page
    res.redirect("/sfconn");
  } else {
    // continue login process
    next();
  }
};

exports.checkSFConnLoggedin = function(req,res,next) {
  if(global.sfclient && global.sfclient.userId){
    next();
  }else{
    res.redirect("/sfconn/");
  }
};