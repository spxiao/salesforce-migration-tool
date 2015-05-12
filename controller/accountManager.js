"use strict";
var AccountServer = require("../service/accountServer"),
	ChangeSet = require("../model/changeset"),
	CommonServer = require("../service/commonservice"),
	Moment = require("moment"),
	common_cfg = require("../common_config");

Moment.lang("en_gb");

exports.authcallback = function(req,res){
	res.render("sfconnection/authcallback");
};

exports.validateAccount = function(req, res){
	var account = {
		sid : req.body.sid,
		userId : req.body.userId,
		endpoint : req.body.endpoint,
	};
	AccountServer.validateAccount(account, {
		success : function(){
			res.send("validate");
		},
		error : function(){
			res.send("unValidate");
		}
	});
};

exports.load = function(req,res,next){
	AccountServer.loadAcc(req.params.sfconnId, req.user._id, function(err,acc){
		if(acc) {
			req.sfconn = acc;
			next();
		}else{
			req.flash("error","Can't find the Organization.");
			return res.redirect("/");
		}
	});
};

exports.listAccount = function (req, res) {
	var accId = req.query.accId;
	if(accId){
		AccountServer.loadAcc(accId,function(err,acc){
			res.send(acc);
		});
	}else{
		var data = {
			id : req.user._id
		};

		AccountServer.listAccount(data, {
			success : function(SFConnections){
				res.render("sfconnection/sfconnManage",{
					SFConnections:SFConnections,
					title : "MigrationTool",
					single_select_choose1 : "Production",
					single_select_choose2 : "Sandbox",
					private_mode: common_cfg.APP_MODE,
					pageIndex: 'index'
				});
			},
			error : function(err){
				res.render("sfconnection/sfconnManage",{
					err:err,
					title : "MigrationTool",
					SFConnections:[],
					errors : CommonServer.errors(err.Error || err.errors || err),
					single_select_choose1 : "Production",
					single_select_choose2 : "Sandbox",
					private_mode: common_cfg.APP_MODE,
					pageIndex: 'index'
				});
			}
		});
	}
};

exports.addAccount = function (req, res) {
	console.log("session user _id = " + req.user._id);
	/*var newAccount = {
		orgId : req.body.orgId,
		orgName : req.body.orgName,
		orgType : req.body.orgType,
		sid : req.body.sid,
		userId : req.body.userId,
		endpoint : req.body.endpoint,
		createdBy : req.user._id
	};*/
	var newAccount = req.body.sfconn;
	newAccount.createdBy = req.user._id;
	var isStore = req.body.isSave;
	if(isStore){
		if(isStore == 'false') newAccount.accountType = "temp";
	}

	AccountServer.addAccount(newAccount, {
		success : function(accId){
			res.send({accId:accId,message:'done'});
		},
		error : function(err){
			//req.flash("error", err);
			res.send({accId:null,message:err});
		}
	});
};

exports.deleteAccount = function (req, res) {
	var data = {
		id : req.params.sfconnId
	};

	AccountServer.deleteAccount(data, {
		success : function(){
			res.send("done");
		},
		error : function(err){
			req.flash("error", err);
			res.send(err);
		}
	});
};

exports.updateAccount = function (req, res) {
	var updataAccount = {
		//sid : req.body.sid,
		//userId : req.body.userId,
		//endpoint : req.body.endpoint,
		orgName : req.body.orgName
	};
	var data = {
		id : req.params.sfconnId,
		updataAccount : updataAccount
	};

	AccountServer.updateAccount(data, {
		success : function(){
			res.send("done");
			//syncSFConnFile(id);
		},
		error : function(err){
			req.flash("error", err);
			res.send(err);
		}
	});
};

exports.syncAccountFile = function (req, res) {
	if(!req.params.sfconnId){
		return;
	}
	var data = {
		id : req.params.sfconnId
	};
	var callbacks = {
		success : function () {
			res.send("done");
		},
		error : function(err){
			res.send(err);
		}
	};
	AccountServer.syncAccountFile(data, callbacks);
};

exports.listAccountInfo = function(req, res){
	var data = {
		id : req.params.sfconnId,
		user : req.user
	};
	var callbacks = {
		loginSuccess : function (account, ChangeSets) {
			res.render("sfconnection/sfconnInfo",{
				title : "MigrationTool",
				sfconn : account,
				changeSets : ChangeSets || [new ChangeSet()],
				single_select_choose1 : "Production",
				single_select_choose2 : "Sandbox",
				private_mode: common_cfg.APP_MODE,
				user : req.user
			});
		},
		loginError : function (account) {
			req.flash("error", "Login with " + account.userEmail + " failed, please check the org info!");
			res.redirect("/sfconn");
		},
		failed : function () {
			req.flash("error", "Failed log in SFDC.");
			res.redirect("/sfconn");
		}
	};
	AccountServer.listAccountInfo(data, callbacks);
};

exports.analyzeCSV = function(req,res){
	if(req.files.inputfile && req.files.inputfile.path){
		AccountServer.analyzeCSV(req.files.inputfile.path,function(err){
			var redirectPath = "/sfconn/"+req.params.sfconnId+"/changeSets";
			if(req.body.csId && req.body.csId.trim() != '') redirectPath += "?csId="+req.body.csId ;
			res.redirect(redirectPath);
		});
	}
};