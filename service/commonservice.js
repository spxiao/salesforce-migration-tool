"use strict";
var fs = require("fs"),
	nodeforce = require("../lib/nodeforce"),
	common_cfg = require("../common_config"),
	Account = require("../model/account"),
	Archive = require("../model/archive"),
	Validation = require("../model/validation"),
	Deployment = require("../model/deployment");

exports.confirmDirExists = function(path,callback){
	if (fs.existsSync(path)) {
		callback(true, "path is exists");
	} else {
		fs.mkdirSync(path, "0755");
		if (fs.existsSync(path)) {
			callback(true, "new path succes");
		} else {
			callback(false, "new path failure");
		}
	}
};

exports.checkFileExists = function(path,callback){
	if (fs.existsSync(path)) {
		callback(true, "path is exists");
	} else {
		callback(false, "path is not exists");
	}
};

exports.connectSFDC_ori = function(data,callback){
	baseConnectToSFDC(data,callback);
};

exports.connectSFDC = function (data, callback) {
	baseConnectToSFDC(data,callback);
};

exports.STATICS = {
	datefmt : "DD.MM.YYYY HH:mm:ss",
	sync_folder : ["staticresources","components","pages","triggers","classes","objects","labels"]
};

exports.checkStatus = function(opts,cb){
	var checkType = opts.checkType;
	var checkIds = opts.checkIds;
	if(checkType && checkIds && checkIds.length > 0){
		checkIds = checkIds.split(',');
		checkIds = checkIds.filter(function(n){
			return n != undefined && n.trim() != '';
		});
		switch(checkType) {
			case 'Account' :
				Account.find()
					.where('_id').in(checkIds)
					.where('syncFileStatus').in(['fail','done'])
					.select('syncFileStatus lastFileSyncDate syncFileMsg').exec(function(err,accs){
						if(err) {
							console.log(err);
							cb(null);
						}
						else cb(accs);
				});
				break;
			case 'Archive' :
				Archive.find()
					.where('_id').in(checkIds)
					.where('status').in(['fail','success'])
					.select('status zipFileId msg').exec(function(err,archives){
						if(err) {
							console.log(err);
							cb(null);
						}
						else cb(archives);
				});
				break;
			case 'Validation' :
				Validation.find()
					.where('_id').in(checkIds)
					.where('status').in(['Failed','Succeeded'])
					.select('status validateErrorInfo validateResult').exec(function(err,validates){
						if(err) {
							console.log(err);
							cb(null);
						}
						else cb(validates);
					});
				break;
			case 'Deployment' :
				Deployment.find()
					.where('_id').in(checkIds)
					.where('status').in(['Failed','Succeeded'])
					.select('status deployErrorInfo deployResult').exec(function(err,deployments){
						if(err) {
							console.log(err);
							cb(null);
						}
						else cb(deployments);
					});
				break;
			default :
				break;
		}
	}else{
		cb(null);
	}
};

/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = function (errors) {
  var keys = Object.keys(errors);
  var errs = [];

  // if there is no validation error, just display a generic error
  if (!keys) {
    return ["Oops! There was an error"];
  }

  keys.forEach(function (key) {
    errs.push(errors[key].message);
  });

  return errs;
};


exports.wirteGridfsFile = function(fileId,toPath,cb){
	if (fs.existsSync(toPath)){
		fs.unlinkSync(toPath);
		console.log("File "+toPath+" exists , delete it.");
	}
	var gfs = require("gridfs-stream").gfs;
	var readstream = gfs.createReadStream({_id:fileId});
	var writestream = fs.createWriteStream(toPath,{encoding: "base64"});
	readstream.pipe(writestream);
	writestream.on("close",function(file){
		cb(null,toPath);
	});
	writestream.on("error",function(err){
		cb(err,null);
	})
};

var baseConnectToSFDC = function(data,callback){
	var endpoint = data.orgType == 'Production' ? common_cfg.SFDC_TYPE.PRODUCTION : common_cfg.SFDC_TYPE.SANDBOX;
	var client = nodeforce.createClient({
		username: data.userName,
		password: data.password+data.securityToken,
		endpoint: endpoint
	});

	client.login(function(err, response, lastRequest) {
	    if (!err) {
			callback(null,client);
	    } else {
			callback(err,null);
	    }
	});
};