"use strict";
var ChangeSetService = require("../service/changesetservice"),
	Moment = require("moment");

	Moment.lang("en_gb");

exports.changeSetInit = function(req,res){
	var data = {
		acc : req.sfconn[0],
		csId : req.query.csId
	};
	var callback = {
		showChangeSet : function (csFileStr, changeSet, msg) {
			res.render("sfconnection/newChangeSet", {
				title : "MigrationTool",
				sfconn : data.acc,
				changeSet : changeSet,
				csFileStr : csFileStr,
				message : msg
			});
		},
		newChangeSet : function (csFileStr, msg) {
			res.render("sfconnection/newChangeSet", {
				title : "MigrationTool",
				sfconn : data.acc,
				csFileStr : csFileStr,
				message : msg
			});
		},
		error : function () {

		}
	};
	ChangeSetService.changeSetInit(data, callback);
};

exports.changeSetSave = function(req,res){
	var data = {
		selectFiles : req.body.selectFiles,
		csId : req.query.csId,
		cs : {
			name : req.body.csName,
			files : [],
			sfconnId : req.params.sfconnId,
			createdBy : req.user._id
		}
	};

	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.changeSetSave(data, callback);
};

exports.changeSetInfo = function(req,res){
	var data = {
		changeSetId : req.params.changeSetId,
		user: req.user
	};

	var callback = {
		success : function (changeSet, results) {
			res.render("sfconnection/changeSetInfo",{
				title : "MigrationTool",
				user : req.user,
				changeSet :  changeSet,
				sfconn : results[0][0],
				archives : results[1],
				validates : results[2],
				deploys : results[3] ,
				sfconns : results[4],
				single_select_choose1 : "Production",
				single_select_choose2 : "Sandbox"
			});
		},
		error : function () {
			res.render("404",{
				title : "404",
			});
		}
	};

	ChangeSetService.changeSetInfo(data, callback);
};

exports.changeSetDelete = function(req,res){
	var data = {
		csId : req.params.changeSetId
	};
	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.changeSetDelete(data, callback);
};

exports.addArchive = function(req,res){
	var data = {
		csId : req.params.changeSetId,
		user : req.user
	};

	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.addArchive(data, callback);
};

exports.deleteArchive = function(req,res){
	var data = {
		archiveId : req.params.archiveId
	};

	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.deleteArchive(data, callback);
};

exports.addValidation = function(req,res){
	var data = {
		csId : req.params.changeSetId,
		name : req.body.name,
		archiveId : req.body.archiveId,
		targetSFConnId : req.body.targetSFConnId,
		user: req.user
	};

	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.addValidation(data, callback);
};

exports.deleteValidation = function(req,res){
	var data = {
		validationId : req.params.validationId
	};
	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.deleteValidation(data, callback);
};

//TODO
exports.addDeployment = function(req,res){
	var data = {
		csId : req.params.changeSetId,
		name : req.body.name,
		archiveId : req.body.archiveId,
		targetSFConnId : req.body.targetSFConnId,
		user : req.user
	};

	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.addDeployment(data, callback);
};

exports.deleteDeployment = function(req,res){
	var data = {
		deploymentId : req.params.deploymentId
	};
	var callback = {
		response : function (message) {
			res.send(message);
		}
	};

	ChangeSetService.deleteDeployment(data, callback);
};

exports.loadArchive = function(req,res,next){
	var archiveId = req.params.archiveId;
	if(archiveId){
		ChangeSetService.loadArchive(archiveId,function(err,archive){
			if(err) req.archive = null;
			else req.archive = archive;
			next();
		});
	}
};

exports.downloadArchiveFile = function(req,res){
	if(req.archive){
		var archive = req.archive;
		var fileId = archive.zipFileId;
	    if(fileId){
	      var gfs = require("gridfs-stream").gfs;
	      var readstream = gfs.createReadStream({
	        _id: fileId 
	      });
	      res.setHeader("Content-disposition", "attachment; filename="
	      		+encodeURIComponent(archive.zipFileName) 
	      		+ "; filename*=UTF-8''"
	      		+encodeURIComponent(archive.zipFileName));
	      readstream.pipe(res);  
	    }else res.send("There is no file attached the Archive");
	}
};