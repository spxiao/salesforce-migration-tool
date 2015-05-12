"use strict";
var	ChangeSet = require("../model/changeset"),
	Archive = require("../model/archive"),
	Validation = require("../model/validation"),
	Deployment = require("../model/deployment"),
	async = require("async"),
	Account = require("../model/account"),
	accountServer = require("./accountServer");

var tag = "Daemon : ";

exports.run = function() {
	
	console.log(tag + "start run!");

	checkFileSync(true);

	//checkArchive(true);

	checkValidation(true);

	checkDeployment(true);

	setInterval(checkFileSync, 1000*60*3, false);//check syncfile per 3 minutes

	//setInterval(checkArchive, 1000*60*10, false);//check archive per 10 minutes
	
	setInterval(checkValidation, 1000*60*10, false);//check validate per 10 minutes
	
	setInterval(checkDeployment, 1000*60*10, false);//check deploy per 10 minutes

};

var checkArchive = function(init) {
	console.log(tag + "check archive status at : " + new Date().toLocaleString() );
	Archive.find({status:"inProcess"}, function(err, docs) {
		for (var i = docs.length - 1; i >= 0; i--) {
			var archive = docs[i];
			var aperture = 1000*60*10;
			var date_current = new Date();
			var date_created = new Date(archive.createdDate);
			if(init){
				archive.update({status: 'fail', msg: 'Archive request time out.'},function(err){
					if(err) console.log(err);
					else console.log('update archive('+archive._id+') to request timeout');
				});
			}else if(date_current - date_created >= aperture){
				archive.update({status: 'fail', msg: 'Archive request time out.'},function(err){
					if(err) console.log(err);
					else console.log('update archive('+archive._id+') to request timeout');
				});
			}
		}
	});
};

var checkValidation = function(init) {
	console.log(tag + "check Validation status at : " + new Date().toLocaleString() );
	Validation.find({status: 'inProcess'}, function(err, docs) {
		for (var i = docs.length - 1; i >= 0; i--) {
			var validation = docs[i];
			var aperture = 1000*60*10;
			var date_current = new Date();
			var date_created = new Date(validation.createdDate);
			if(init){
				validation.update({status: 'Failed', validateErrorInfo: 'Validation request time out.'},function(err){
					if(err) console.log(err);
					else console.log('update validation('+validation._id+') to request timeout');
				});
			}
			else if(date_current - date_created >= aperture){
				validation.update({status: 'Failed', validateErrorInfo: 'Validation request time out.'},function(err){
					if(err) console.log(err);
					else console.log('update validation('+validation._id+') to request timeout');
				});
			}
		};
	});
};

var checkDeployment = function(init) {
	console.log(tag + "check Deployment status at : " + new Date().toLocaleString() );
	Deployment.find({status: 'inProcess'}, function(err, docs) {
		for (var i = docs.length - 1; i >= 0; i--) {
			var deployment = docs[i];
			var aperture = 1000*60*60;
			var date_current = new Date();
			var date_created = new Date(deployment.createdDate);
			if(init){
				deployment.update({status: 'Failed', deployErrorInfo: 'Deployment request time out.'},function(err){
					if(err) console.log(err);
					else console.log('update deployment('+deployment._id+') to request timeout');
				});
			}
			else if(date_current - date_created >= aperture){
				deployment.update({status: 'Failed', deployErrorInfo: 'Deployment request time out.'},function(err){
					if(err) console.log(err);
					else console.log('update deployment('+deployment._id+') to request timeout');
				});
			}
		};
	});
};

//-----------------------------------------------------------------------

var checkObject = function (obj) {
	for (var i in obj) {
		if (obj[i] === null || obj[i] === undefined || obj[i] === "") {
			delete obj[i];
		}
	}
};

var checkFileSync = function(init){
	console.log(tag + "check file list sycn status at " + new Date().toLocaleString());
	Account.find({
		syncFileStatus: 'InProgress'
	},function(err,accounts){
		if(err) console.log(err);
		if(accounts && accounts.length > 0){
			for(var i = 0 ; i < accounts.length ; i++){
				var acc = accounts[i];
				var aperture = 1000*60*2;
				var date_current = new Date();
				var date_created = new Date(acc.lastFileSyncDate);
				if(init){
					acc.update({syncFileStatus: 'fail', syncFileMsg: 'The last Sync file request time out.', lastFileSyncDate: new Date()},function(err){
						if(err) console.log(err);
						else console.log('update account('+acc._id+') to request timeout');
					})
				}
				else if(date_current - date_created >= aperture){
					acc.update({syncFileStatus: 'fail', syncFileMsg: 'The last Sync file request time out.', lastFileSyncDate: new Date()},function(err){
						if(err) console.log(err);
						else console.log('update account('+acc._id+') to request timeout');
					})
				}
			}
		}
	});
}