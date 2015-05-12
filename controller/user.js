"use strict";

exports.showloginForm = function(req, res) {
  res.render("user/login-form",{
  	pageIndex: 'root',
    title: "MigrationTool"
  });
};

exports.login = function (req, res) {
	req.flash("success", "Successfully  Login!");
	res.redirect("/sfconn");
};

exports.logout = function (req, res) {
  req.logout();
  //req.flash("success", "Successfully  Logout!");
  res.redirect("/");
};

exports.wiki = function(req,res){
	res.render("user/wiki",{
		pageIndex:'wiki',
    title: "MigrationTool"
	});
};