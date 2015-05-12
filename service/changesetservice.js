"use strict";
var nodeforce = require("../lib/nodeforce"),
	Account = require("../model/account"),
	ChangeSet = require("../model/changeset"),
	Archive = require("../model/archive"),
	Validation = require("../model/validation"),
	Deployment = require("../model/deployment"),
	CommonService = require("./commonservice"),
	AccountServer = require("../service/accountServer"),
	//S3service = require("../service/s3service"),
	async = require("async"),
	fs = require("fs"),
	tempFolderRoot = require("os").tmpdir(),
	_path = require("path");

var tag = "changeSet Service : ";

exports.changeSetInit = function (data, options) {
	var account = data.acc;
	var syncMsg = account.syncFileStatus == "InProgress" ? "The File Sync Action is InProgress , please wait a few minutes :)." : "";
	if(data.csId){
		ChangeSet.findById(data.csId,function(err,changeSet){
			var csFileStr = "";
			for(var k=0;k<changeSet.files.length;k++){
				for(var x=0;x<changeSet.files[k].files.length;x++){
					csFileStr += ("$"+changeSet.files[k].files[x]+"$");
				}
			}
			if(global.currentImportCSVData && global.currentImportCSVData.trim().length > 0) csFileStr = global.currentImportCSVData;
			global.currentImportCSVData = '';
			options.showChangeSet(csFileStr, changeSet, syncMsg);
			/*async.series([function(callback){
				for(var k=0;k<changeSet.files.length;k++){
					for(var x=0;x<changeSet.files[k].files.length;x++){
						csFileStr += ("$"+changeSet.files[k].files[x]+"$");
					}
				}
				callback(null,"getChangeSetAllFiles done");
			},function(callback){
				if(global.currentImportCSVData && global.currentImportCSVData.trim().length > 0) csFileStr = global.currentImportCSVData;
				global.currentImportCSVData = '';
				checkFileSelect(account,csFileStr,function(acc){
					callback(null,acc);
				});
			}],function(err,results){
				options.showChangeSet(results[1], changeSet, syncMsg);
			});*/
		});
	}else{
		var csFileStr = "";
		if(global.currentImportCSVData && global.currentImportCSVData.trim().length > 0) csFileStr = global.currentImportCSVData;
		global.currentImportCSVData = '';
		options.newChangeSet(csFileStr, syncMsg);
	}
};

exports.changeSetSave = function (data, options) {
	if(data.selectFiles && data.selectFiles.length > 0){
		async.eachSeries(data.selectFiles,function(fileInfo,callback){
			var packName = fileInfo.metaName;
			var dirExists = false;
			for(var i=0;i<data.cs.files.length;i++){
				var pack = data.cs.files[i];
				if(fileInfo.fixedMetaName == pack.fixedMetaName){
					dirExists = true;
					data.cs.files[i].files.push(fileInfo.fileName);
					break; 
				}
			}
			if(!dirExists){
				var newData = {
					files : [fileInfo.fileName],
					packName : packName,
					fixedMetaName: fileInfo.fixedMetaName
				};
				data.cs.files.push(newData);
			}
			callback(null);
		},function(err){
			if(data.csId){
				ChangeSet.findById(data.csId,function(err,changeSet){
					if (err) {
						options.response({message : err});
					} else {
						if(changeSet.archiveStatus == "block"){
							options.response({
								message : "ChangeSet blocked with archive action.",
								csId : data.csId
							});
						}else{
							ChangeSet.findByIdAndUpdate(data.csId,{
								$set : {
									files : data.cs.files
								}
							},function(err,changeSet){
								if (err) {
									options.response({message : err});
								} else {
									options.response({
										message : "done",
										csId : data.csId
									});
								}
							});
						}
					}
				});
			}else{
				new ChangeSet(data.cs).save(function(err,changeSet){
					if(err) {
						options.response({message : err});
					} else {
						options.response({
							message : "done",
							csId : changeSet._id
						});
					}
				});
			}
		});
	} else {
		options.response({message : "Please select some files."});
	}
};

exports.changeSetInfo = function(data, options){
	ChangeSet.findById(data.changeSetId, function(err, changeSet){
		if (err) {
			options.error();
		} else {
			if(changeSet){
				async.parallel([
					function(callback){
						Account.find({_id:changeSet.sfconnId},"-fileInfo",function(err,acc){
							callback(null,acc|| new Account());
						});
					},function(callback){
						Archive.find({changeSetId : data.changeSetId}, "", {sort : {createdDate : "desc"}},function(err,archives){
							callback(null,archives||[]);
						});
					},function(callback){
						Validation.find({changeSetId : data.changeSetId}, "", {sort : {createdDate : "desc"}},function(err,validations){
							callback(null,validations||[]);
						});
					},function(callback){
						Deployment.find({changeSetId : data.changeSetId}, "", {sort : {createdDate : "desc"}},function(err,deployments){
							callback(null,deployments||[]);
						});
					},function(callback){
						Account.find({
							_id : {
								$ne : changeSet.sfconnId
							},
							accountType : "normal",
							createdBy : data.user._id
						},"-fileInfo",{sort:{name:"asc"}},function(err, accounts){
							if(err) {
								callback(null, []);
							} else {
								callback(null, accounts);
							}
						});

				}], function(err, results){
					options.success(changeSet, results);
				});
			}else{
				options.error();
			}
		}
	});
};

exports.changeSetDelete = function(data, options){
	ChangeSet.findByIdAndRemove(data.csId, function(err,changeSet){
		if (err) options.response(err);
		else {
			changeSet.remove();
			options.response("done");
		}
	});
};

exports.addArchive = function(data, options){
	ChangeSet.findById(data.csId,function(err, changeSet){
		if (err || changeSet === null) {
			options.response("Cant't find the ChangeSet with id : " + data.csId);
		} else {
			var newArchive = {};
			var theVersion = changeSet.theArchiveVersion
			newArchive.version = "V"+theVersion;
			newArchive.changeSetId = data.csId;
			newArchive.createdBy = data.user._id;
			new Archive(newArchive).save(function(err, archive){
				if (err) {
					options.response("Save Error.Cant't handle this archive save request.");
				} else {
					if(archive && archive._id){
						theVersion = theVersion + 0.01;
						changeSet.update({theArchiveVersion:theVersion},function(err){
							if(err) console.log("update ChangeSet theArchiveVersion error : "+changeSet._id);
						});
						var params = {
							status : "inProcess"
						};
						updateArchive(archive._id, params, data.csId, function(err){
							if(err) options.response(err);
							else options.response("done");

							var fileName = archive._id + '_' + new Date().getTime() +'.zip';
							var thePath = _path.normalize(tempFolderRoot + _path.sep + fileName);
							archiveZip(data.csId, changeSet.sfconnId, archive._id, data.user._id, false, thePath,
								function(e, key){
									console.log(tag + "<-------> archiveZip callback : " +e);
									var params;
									if(e) {
										params = {
											status : "fail",
											archiveErrorInfo : e
										};
									} else {
										params = {
											status : "success",
											s3Key : key
										};
									}
									updateArchive(archive._id, params, data.csId);
								});
						});
					}else{
						options.response("done");
					}
				}
			});
		}
	});
};

exports.deleteArchive = function(data, options){
	if(data.archiveId){
		Archive.findByIdAndRemove(data.archiveId,function(err, archive){
			if (err) {
				options.response(err);
			} else {
				archive.remove();
				updateCSArchiveStatus(archive.changeSetId,function(err){
					if(err) options.response(err);
					else options.response("done");
				});
			}
		});
	}
};

exports.addValidation = function(data, options){
	ChangeSet.findById(data.csId,function(err, changeSet){
		if (err || changeSet === null) {
			options.response("Cant't find the ChangeSet with id : " + data.csId);
		} else {
			var newValidation = {
				//name : data.name,
				changeSetId: data.csId,
				createdBy: data.user._id,
				archiveId: data.archiveId,
				targetSFConnId : data.targetSFConnId
			};
			Account.findById(data.targetSFConnId,function(err,account){
				if(err) options.response("Cant't find the target organization.");
				else{
					checkObject(newValidation);
					newValidation.targetSFConnName = account.orgName;
					newValidation.targetSFConnUser = account.userName;
					newValidation.targetSFConnType = account.orgType;
					new Validation(newValidation).save(function(err, validation){
						if (err) {
							options.response("Save Error.Cant't handle this validation save request." + err);
						} else {
							if(validation && validation._id){
								var params = {
									status : "inProcess"
								};
								updateValidation(validation._id, params, data.csId, function(err){
									if(err) options.response(err);
									else{
										options.response("done");
										deploy(data.csId, changeSet.sfconnId, data.targetSFConnId, data.archiveId,validation._id, data.user._id, true,function(e, result){
											console.log(tag + "<-------> Validation callback : " +e);
											var params;
											if(e) {
												params = {
													status : "Failed",
													validateErrorInfo : e
												};
											} else {
												var status = 'Succeeded';
												if(!result.success) status = 'Failed';
												params = {
													status : status,
													validateResult : result.details
												};
											}
											updateValidation(validation._id, params, data.csId);
										});
									} 
								});
							}else{
								options.response("done");
							}
						}
					});
				}
			});
		}
	});
};

exports.deleteValidation = function(data, options){
	if(data.validationId){
		Validation.findByIdAndRemove(data.validationId,function(err, validation){
			if(err) options.response(err);
			else {
				updateCSValidateStatus(validation.changeSetId,function(err){
					if(err) options.response(err);
					else options.response("done");
				});
			}
		});
	}
};

exports.addDeployment = function(data, options){
	ChangeSet.findById(data.csId,function(err, changeSet){
		if (err || changeSet === null) {
			options.response("Cant't find the ChangeSet with id : " + data.csId);
		} else {
			var newDeployment = {
				//name : data.name ,
				changeSetId: data.csId,
				createdBy: data.user._id,
				archiveId: data.archiveId,
				targetSFConnId : data.target
			};
			Account.findById(data.targetSFConnId,function(err,account){
				if(err) options.response("Cant't find the target organization.");
				else{
					newDeployment.targetSFConnName = account.orgName;
					newDeployment.targetSFConnUser = account.userName;
					newDeployment.targetSFConnType = account.orgType;
					checkObject(newDeployment);
					new Deployment(newDeployment).save(function(err, deployment){
						if (err) {
							options.response("Save Error.Cant't handle this deployment save request.");
						} else {
							if(deployment && deployment._id){
								var params = {
									status : "inProcess"
								};
								updateDeployment(deployment._id, params, data.csId, function(err){
									if(err) options.response(err);
									else {
										options.response("done");
										deploy(data.csId,changeSet.sfconnId, data.targetSFConnId, data.archiveId,deployment._id, data.user._id, false,function(e, result){
											console.log(tag + "<-------> Deployment callback : " +e);
											var params;
											if(e) {
												params = {
													status : "Failed",
													deployErrorInfo : e
												};
											} else {
												var status = 'Succeeded';
												if(!result.success) status = 'Failed';
												params = {
													status : status,
													deployResult : result.details
												};
											}
											updateDeployment(deployment._id, params, data.csId);
										});
									}		
								});
							}else{
								options.response("done");
							}
						}
					});
				}
			});
		}
	});
};

exports.deleteDeployment = function(data, options){
	if(data.deploymentId){
		Deployment.findByIdAndRemove(data.deploymentId,function(err, deployment){
			if(err) options.response(err);
			else {
				updateCSDeployStatus(deployment.changeSetId,function(err){
					if(err) options.response(err);
					else options.response("done");
				});
			}
		});
	}
};

exports.loadArchive = function(archiveId,cb){
	Archive.findById(archiveId,function(err,archive){
		if(err) cb(err,null);
		else cb(null,archive);
	})
};

/* ------------------ built-in function -------------------- */
		/* ===== part of archive db ====== */
var updateArchive = function(archiveId, data, csId, callback){
	checkObject(data);
	Archive.findById(archiveId,function(err,archive){
		if(archive){
			archive.update(data, function(err){
				if (err) console.warn(tag + "updateArchive ->" + err);

				updateCSArchiveStatus(csId, function(e){
					if(e) console.warn(tag + "updateCSArchiveStatus ->" + e);
				});

				if(callback) callback(err);
			});
		}
	});
};

		/* ===== part of validation db ====== */
var updateValidation = function(validationId, data, csId, callback){
	checkObject(data);
	Validation.findById(validationId,function(err, validation){
		if(validation){
			validation.update(data, function(err) {
				if (err) console.warn(tag + "updateValidation ->" + err);

				/*updateCSValidateStatus(csId, function(e){
					if(e) console.warn(tag + "updateCSValidateStatus ->" + e);
				});*/

				if(callback) callback(err);
			});
		}
	});
};

		/* ===== part of deployment db ====== */
var updateDeployment = function(deploymentId, data, csId, callback){
	checkObject(data);
	Deployment.findById(deploymentId,function(err,deployment){
		if(deployment){
			deployment.update(data, function(err) {
				if (err) console.warn(tag + "updateDeployment ->" + err);

				/*updateCSDeployStatus(csId, function(e){
					if(e) console.warn(tag + "updateCSDeployStatus ->" + e);
				});*/

				if(callback) callback(err);
			});
		}
	});
};

		/* ===== part of changeSet db ====== */
var updateCSArchiveStatus = function(csId, callback){
	Archive.find({changeSetId : csId}).exec(function(err,archives){
		var status = 'none';
		if(archives && archives.length > 0){
			status = 'block';
		}
		ChangeSet.findByIdAndUpdate(csId,{archiveStatus : status},function(err){
			if(err) callback(err);
			else callback(null);
		});
	});
};

var updateCSValidateStatus = function(csId, callback){
	Validation.find({changeSetId:csId},function(err,validations){
		if(validations){
			if(validations.length > 0){
				var isBreak = false;
				var inline = function () {
					ChangeSet.findByIdAndUpdate(csId,{validateStatus:"block"},function(err){
						if(err) callback(err);
						else callback(null);
					});
				};
				for(var i=0;i<validations.length;i++){
					var validation = validations[i];
					if(validation.status == "inProcess"){
						inline();
						isBreak = true;
						break;
					}
				}
				if(!isBreak){
					ChangeSet.findByIdAndUpdate(csId,{validateStatus : "done"},function(err){
						if(err)callback(err);
						else callback(null);
					});
				}
			} else {
				ChangeSet.findByIdAndUpdate(csId,{validateStatus : "none"},function(err){
					if(err) callback(err);
					else callback(null);
				});
			}
		}
	});
};

var updateCSDeployStatus = function(csId,callback){
	Deployment.find({changeSetId:csId},function(err,deployments){
		if(deployments){
			if(deployments.length > 0){
				var isBreak = false;
				var inline = function () {
					ChangeSet.findByIdAndUpdate(csId,{deployStatus:"block"},function(err){
						if(err) callback(err);
						else callback(null);
					});
				};
				for(var i=0;i<deployments.length;i++){
					var deployment = deployments[i];
					if(deployment.status == "inProcess"){
						inline();
						isBreak=true;
						break;
					}
				}
				if(!isBreak){
					ChangeSet.findByIdAndUpdate(csId,{deployStatus:"done"},function(err){
						if(err)callback(err);
						else callback(null);
					});
				}
			} else {
				ChangeSet.findByIdAndUpdate(csId,{deployStatus : "none"},function(err){
					if(err) callback(err);
					else callback(null);
				});
			}
		}
	});
};

var checkFileSelect = function(account,csFileStr,cb){
	var csFileStrLength = csFileStr.length;
	var checkedFileLength = 0;
	for(var i=0;i<account.fileInfo.length;i++){
		var metaData=account.fileInfo[i];
		for(var j=0;j<metaData.childFiles.length;j++){
			var file = metaData.childFiles[j];
			if(csFileStr.indexOf("$"+file.fileName+"$")>-1){
				file.isChecked = true;
				checkedFileLength += file.fileName.length + 2;
			}
			if(csFileStrLength == checkedFileLength){
				break;
			}
		}
		if(csFileStrLength == checkedFileLength){
			break;
		}
	}
	cb(account);
};


/* ----------------------- utility -------------------------- */
var checkObject = function (obj) {
	for (var i in obj) {
		if (obj[i] === null || obj[i] === undefined || obj[i] === "") {
			delete obj[i];
		}
	}
};

var getArchive = function (id, callback) {
	Archive.findById(id, callback);
};

/***************************** connection salesforce & S3 *******************************/
var archiveZip = function(csId, sfconnId, archiveId, userId, nativeOnly, thePath, callback){
	Account.findById(sfconnId,"-fileInfo",function(err,sfconn){
		if(err || sfconn === null){
			callback("cannot find the account");
		} else {
			console.log(tag + "find sfconn "+sfconn.userName);
			CommonService.connectSFDC(sfconn,function(err,client){
				if(err) {
					callback("connect the org fail");
				}
				if(client){
					console.log(tag + "login sf with "+sfconn.userName);
					ChangeSet.findById(csId, function(err,changeSet){
						if(err || changeSet === null || changeSet.files === null){
							callback("find changeSet fail");
						}else{
							console.log(tag + "find ChangeSet "+changeSet.name + " id " + changeSet._id);
							var opts = {
								apiVersion : 29.0,
								unpackaged : {}
							};
							var unpackagedTypes = [];
							for(var j=0;j<changeSet.files.length;j++){
								var fileInfo = changeSet.files[j];
								var packName = fileInfo.packName;
								for(var i=0;i<fileInfo.files.length;i++){
									var theFile = fileInfo.files[i];
									if(theFile.indexOf('\/') > -1) theFile = (theFile.split("/")[1]).split(".")[0];
									var upackType = {
										members : theFile,
										name : packName
									};
									unpackagedTypes.push(upackType);
								}
							}

							//test
							opts.unpackaged.fullName = 'Book__c.object'

							opts.unpackaged.types = unpackagedTypes;
							console.log(tag + "begin retrieve data");
							retrieveData(client, opts, thePath, function(err){
								if(err) {
									callback(err);
								} else {
									if(archiveId){
										Archive.findById(archiveId,function(err,archive){
											if(err) callback(err);
											else if(archive){
												archive.uploadAndSave(thePath,function(err){
													if(err) callback(err);
													else{
														callback(null);
														removeFile(thePath);
													}
												});
											}
										});
									}else{
										callback(null);
									}
									/*if(nativeOnly) {
										callback(null);
									} else {
										S3service.uplaodData(zipFileName, function(err, key){
											if(err) {
												callback("uplaodData error" + err);
											} else {
												callback(null, key);
											}
											removeFile(zipFileName);
										});
									}*/
								}
							});
						}
					});
				}
			});
		}
	});
};

var retrieveData = function(client, opts, thePath, callback){
	var path = tempFolderRoot;
	client.retrieve(opts, function(err,response,request){
		if(err){
			callback("retrieve fail");
			return;
		}
		var result=response.result;
		var intervalId=setInterval(function(){
			client.checkStatus({Id:result.id},function(err,resp,reqs){
				var result1=resp.result[0];
				if(result1.done){
					clearInterval(intervalId);
					client.checkRetrieveStatus({Id:result.id},function(err,resp1,req1){
						if(resp1 && resp1.result && resp1.result.zipFile){
							console.log(tag + "retrieve data done");
							if(resp1.result.zipFile.length <= 100*1024*1024){
								console.log(tag + "start write zip");
								CommonService.confirmDirExists(path, function(exists, message){
									console.log(tag + message);
									if(!exists) {
										callback(message);
									} else {
										fs.writeFile(thePath, resp1.result.zipFile, {encoding:"base64"}, function(err){
											if(err){
												console.log(tag + "write file :"+thePath+" error : "+err);
												callback("write file system error");
											} else {
												console.log(tag + thePath + " save done.");
												callback();
											}
										});
									}
								});
							}else{
								callback("Too large file size( >100M ).");
							}
						}
					});
				}else{
					console.log(tag + "checkStatus of download state : "+result1.state);
				}
			});
		},15000);
	});
};

var deploy = function(csId, oriSFConnId, targetSFConnId, archiveId,id, userId, checkOnly, callback){
	var zipFileName = id + '_' + new Date().getTime() + ".zip";
	var filePath = _path.normalize(tempFolderRoot + _path.sep + zipFileName);
	if (!archiveId) {
		archiveZip(csId, oriSFConnId, archiveId, userId, checkOnly, filePath,
			function(err, key){
				if(err) {
					callback("archiveZip fail " + err,null);
				} else {
					console.log(tag + "archiveZip success");
					todoDeploy(filePath,targetSFConnId,checkOnly,callback);
				}
			});
	} else {
		getArchive(archiveId, function(err, archive) {
			if(err)	{
				callback("getArchive err" + err);
			} else {
				CommonService.wirteGridfsFile(archive.zipFileId,filePath,function(err,toPath){
					if(err) callback("download archive zip file fail" + err);
					else{
						console.log(tag + "download archive zip file success");
						todoDeploy(toPath,targetSFConnId,checkOnly,callback);
					}
				});
				/*S3service.downloadData(archive.s3Key, function (err) {
					if(err) {
						callback("download file from S3 fail" + err);
					} else {
						console.log(tag + "download file from S3 success");
						//callback("download file from S3 success");
						todoDeploy(checkOnly);
					}
				});*/
			}
		});
	}

	var todoDeploy = function (toPath,targetSFConnId,checkOnly,callback) {
		CommonService.checkFileExists(toPath,function(exists){
			if(!exists) {
				callback(toPath + " is not exists");
			} else {
				console.log(tag + "find file "+toPath + " on disk.");
				Account.findById(targetSFConnId,function(err,sfconn){
					if (err) {
						callback("target Account find err");
						removeFile(toPath);
					} else {
						CommonService.connectSFDC(sfconn,function(err,client){
							if(err) {
								callback("target Account cannot connect salesforce " + err);
								removeFile(toPath);
							} else {
								console.log(tag + "connect to sfdc sucess");
								fs.readFile(toPath, {encoding:"base64"},function(err,data){
									if(err) {
										callback("read file error");
										removeFile(toPath);
									} else {
										console.log(tag + "begin do deploy");
										var deployOptions = {
											rollbackOnError : true,
											//runAllTests : true,
											autoUpdatePackage: true,
											ignoreWarnings : false,
											purgeOnDelete : false,
											performRetrieve: false
										};
										if(checkOnly){
											deployOptions.checkOnly = true;
										}else{
											deployOptions.checkOnly = false;
										}
										client.deploy({
											zipFile : data,
											deployOptions : deployOptions
										},function(err,response,request){
											if(err) {
												callback("deploy error :" + err);
											} else {
												var result = response.result;
												var intervalId = setInterval(function(){
													client.checkStatus({Id:result.id},function(err,resp,reqs){
														if(err) {
															callback("check Deploy Status error : "+err);
															console.log(tag + "check Deploy Status error "+err+" stop interval");
															clearInterval(intervalId);
														}
														else{
															var result1 = resp.result[0];
															if(result1.done){
																console.log(tag + "deploy action complete");
																clearInterval(intervalId);
																console.log(tag + "stop interval");
																client.checkDeployStatus({
																		Id : result.id,
																		includeDetails : true
																	},function(err,resp1,req1){
																		if(err) {
																			callback("get Deploy result error: "+err);
																		}
																		if(resp1 && resp1.result){
																			if(sfconn.accountType == 'temp') sfconn.remove();
																			callback(null, resp1.result);
																		}
																	});
															}else{
																console.log(tag + "check deploy status . state :"+result1.state);
															}
														}
													});
												},15000);
											}
											removeFile(toPath);
										});
									}
								});
							}
						});
					}
				});
			}
		});
	};
};

var removeFile = function (fileName) {
	CommonService.checkFileExists(fileName, function(exists){
		if(exists) {
			fs.unlinkSync(fileName);
			console.log(tag + "delete " + fileName);
		} else {
			console.log(tag + "has no " + fileName);
		}
	});
};