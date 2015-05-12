"use strict";
var Account = require("../model/account"),
	ChangeSet = require("../model/changeset"),
	nodeforce = require("../lib/nodeforce"),
	async = require("async"),
	csv = require("csv"),
	commonservice = require("./commonservice"),
	fs = require("fs"),
	common_cfg = require("../common_config");

exports.validateAccount = function (data, options) {
	var client = nodeforce.createClient({
		    sid: data.sid,
		    userId: data.userId,
		    endpoint: data.endpoint
	});
	client.login(function(err, response, lastRequest) {
	    if (!err) {
			options.success();
	    } else {
			options.error();
	    }
	});
};

exports.loadAcc = function(accId, userId, callback){
	Account.find({_id:accId, createdBy: userId},function(err,acc){
		if(err) callback(err,null);
		else if(acc) callback(null,acc);
		else callback(null,null);
	});
};

exports.listAccount = function (data, options) {
	Account.find({createdBy: data.id, accountType : "normal"},"",{sort : {userName : "asc"}},
		function(err,accounts){
			if(err){
				options.error(err);
			}else {
				options.success(accounts);
			}
	});
};

exports.addAccount = function (data, options) {
	//TODO
	//还缺少changeSet部分的登入

	var theMode = common_cfg.APP_MODE;
	if(theMode == 'private'){
		data.endpoint = common_cfg.SFDC_TYPE.SANDBOX;
		if(data.orgType == 'Production') data.endpoint = common_cfg.SFDC_TYPE.PRODUCTION;
		commonservice.connectSFDC_ori(data,function(err,client){
			if(err) options.error("Save Account Error : " + err + ",please check the info you submit");
			else {
				data.sid = client.sid;
				data.endpoint = client.endpoint;
				data.userId = client.userId;
				if(data._id){
					var accId = data._id;
					delete data._id;
					Account.findOneAndUpdate({_id:accId},data,function(err,account){
						if(err) options.error("Update Account Error : "+err);
						else options.success(account._id);
					});
				}else{
					Account.find({userName:data.userName},'-fileInfo',function(err,accs){
						if(err) options.error("Account Error");
						else{
							if(accs && accs.length > 0){
								options.error("Save Account Error : Duplicate User Name.");
							}else{
								new Account(data).save(function(err,acc){
									if(err) options.error("Save Account Error");
									else {
										syncAccountFile(acc._id,options);
									}
								});
							}
						}
					});
				}
			}
		});
	}else{
		var saveData = function (data) {
			if(data.orgId && data.orgId !== data.organizationId) {
				console.log("orgId = " + data.orgId);
				options.error("The Account isn't in this organization");
				return;
			}
			Account.find({organizationId: data.organizationId},
				"",	{sort : {userName : "asc"}},
				function(err,accounts){
					if(err){
						options.error("Account Error");
					} else if(accounts && accounts.length === 0) { 
						new Account(data).save(function(err, account){
							if(err){
								options.error("Save Account Error");
							}else {
								options.success();
							}
						});
					} else {
						checkObject(data);
						accounts[0].update(data, function(err, account){
							if(err){
								options.error("Update Account Error");
							}else {
								options.success();
							}
						});
					}
			});
		};

		//get User Info and update data
		getUserInfo(data, {
			success : function(err, res) {
				//console.log('res');
				data.userName = res.result.userName;
				data.userEmail = res.result.userEmail;
				data.organizationId = res.result.organizationId;
				saveData(data);
			}
		});
	}
};

exports.deleteAccount = function (data, options) {
	Account.findByIdAndRemove(data.id, function (err,acc) {
		if(err){
			options.error(err);
		}else {
			acc.remove();
			options.success();
		}
	});
};

exports.updateAccount = function (data, options) {
	Account.findByIdAndUpdate(data.id, data.updataAccount, function (err) {
		if(err){
			options.error("update error");
		}else {
			options.success();
		}
	});
	//need sync files
};

exports.syncAccountFile = function(data, options){
	syncAccountFile(data.id, options);
};

exports.listAccountInfo = function(data, options){
	var sfconnInfo = Account.findById(data.id,
		function(err, account){
			if(!err && account !== null){
				commonservice.connectSFDC_ori(account,function(err,client){
					if (!err) {
						ChangeSet.find({
							createdBy : data.user._id,
							sfconnId : data.id
						}, "", {
							sort : { createdDate : "desc"}
						}, function(err, ChangeSets){
							if(options.loginSuccess) {
								global.sfclient = client;
								global.sfconn = account;
								options.loginSuccess(account, ChangeSets);
							}
						});
					} else {
						if(options.loginError)options.loginError(account);
					}
				});
			}else{
				if(options.failed)options.failed();
			}
		});
};


exports.analyzeCSV = function(filepath,cb){
	commonservice.checkFileExists(filepath,function(flag,msg){
		if(flag){
			var csFileStr = "";
			csv().from.path(filepath, { delimiter: ',', escape: '"' })
				.on('record', function(row,index){
					if(row.length > 1){
						var type = row[0];
						var folderName = row[1];
						for(var i = 2 ; i< row.length ; i++){
							var filename = '';
							if(type == 'CustomField' || type == 'RecordType' || type == 'ValidationRule')
								filename = folderName+ '.' + row[i];
							else if (type == 'CustomLabel')
								filename = row[i];
							else
								filename = folderName+ '/' + row[i];
							csFileStr += "$"+filename+"$";
						}
					}
					global.currentImportCSVData = csFileStr;
				})
				.on('end', function(count){
					fs.unlinkSync(filepath);
					cb(null);
				})
				.on('error', function(error){
				  console.log(error.message);
				  fs.unlinkSync(filepath);
				  cb(error.message);
				});
		}else{
			cb(msg);
		}
	});
};


/* ----------------------- utility -------------------------- */
exports.getAccount = function (id, options) {
	Account.findById(id, function(err, account){
		if(err){
			options.error(err);
		} else {
			options.success(account);
		}
	});
};

var checkObject = function (obj) {
	for (var i in obj) {
		if (obj[i] === null || obj[i] === undefined) {
			delete obj[i];
		}
	}
};


/* ------------------ built-in function -------------------- */
function getUserInfo(loginInfo, options) {
	var client = nodeforce.createClient({
		    sid: loginInfo.sid,
		    userId: loginInfo.userId,
		    endpoint: loginInfo.endpoint
	});
	client.login(function(err, response, lastRequest) {
	    if (!err) {
			client.getUserInfo(options.success);
	    } else {
			options.error();
	    }
	});
}

function syncAccountFile (sfconnId, options){
	Account.findById(sfconnId, function(err, account){
		if (!err) {
			commonservice.connectSFDC_ori(account,function(err,client){
				if (!err) {
					if("InProgress" != account.syncFileStatus || options.recall){
						console.log("begin to sync file of sfconn(id : " + sfconnId + ")");
						account.update({
							syncFileStatus : "InProgress",
							syncFileMsg: null
						},function(err){
							if(err) {
								if(options.error) options.error(err);
							} else {
								if(options.success){
									options.success(sfconnId);
								}
							}
						});
						client.describe(function(err, response, request){
							var allData=[];
							if(err) console.log('describe sfconn metaData err : ' , err);
							if(response && response.result && response.result.metadataObjects){
								var metadataObjects = response.result.metadataObjects;
								var folders = commonservice.STATICS.sync_folder;
								async.each(metadataObjects, function(item, callback){
									var metaData ={};
									metaData.metaObject = item;
									if(folders.indexOf(item.directoryName) > -1 ){
										client.list({
											queries:[{
												folder:item.directoryName,
												type:item.xmlName
											}],
											asOfVersion:"29.0"
										},function(err,response,request){
											if(err) {
												callback(err);
											}else{
												if(response.result && response.result.length){
													var childFiles = response.result;
													if(childFiles && childFiles.length > 0){
														async.sortBy(childFiles,function(a, cb){
															cb(null,a.fullName);
														},function(err,results){
															childFiles = results;
															
															// ignore manage file
															var unmanagedChildFiles = [];
															for (var i = childFiles.length - 1; i >= 0; i--) {
																var childFile = childFiles[i];
																if(!childFile.manageableState || childFile.manageableState == 'unmanaged') 
																	unmanagedChildFiles.unshift(childFile);
															};
															
															childFiles = unmanagedChildFiles;

															//analyze standard object and custom object
															if(item.directoryName == 'objects'){
																//get all customer field
																client.list({
																	queries: [{
																		type: 'CustomField'
																	},{
																		type: 'RecordType'
																	},{
																		type: 'ValidationRule'
																	}],
																	asOfVersion:"29.0"
																},function(err, response, request){
																	if(err) console.log('list object child info err : ',err);
																	else {
																		var fieldResult = response.result;
																		analyzeObjectChild(item, childFiles, fieldResult, function(standard_meta, custom_meta){
																			allData.push(standard_meta);
																			allData.push(custom_meta);
																			callback(null);
																		});
																	}
																});

															}else if (item.directoryName == 'labels') {
																//get all CustomLabel
																client.list({
																	queries: [{type: 'CustomLabel'}],
																	asOfVersion:"29.0"
																},function(err, response, request){
																	if(err) console.log("list all customer labels err : ",err);
																	else{
																		var labels = response.result;
																		var label_detail = [];
																		if(labels && labels.length > 0){
																			for (var i = labels.length - 1; i >= 0; i--) {
																				var theLabel = labels[i];
																				if(theLabel.manageableState == 'unmanaged' || !theLabel.manageableState){
																					label_detail.push(theLabel);
																				}
																			};
																		}
																		if(label_detail && label_detail.length > 0){
																			async.sortBy(label_detail,function(a,cb){
																				cb(null,a.fullName);
																			},function(err,theData){
																				childFiles[0].labels = theData;
																				metaData.childFiles = childFiles;
																				allData.push(metaData);
																				callback(null);
																			});
																		}else{
																			metaData.childFiles = childFiles;
																			allData.push(metaData);
																			callback(null);
																		}
																	}
																});

															}else {
																metaData.childFiles = childFiles;
																allData.push(metaData);
																callback(null);
															}
														});
													}else callback(null);
												}else callback(null);
											}
										});
									}else{
										callback(null);
									}
								},function(err){
									if(err) {
										console.log('list metaFile error : ',err);
										account.update({
											syncFileStatus : "fail",
											lastFileSyncDate : new Date(),
											syncFileMsg: 'Failed fetch the file list from SFDC.'
										},function(err){
											if(err)console.log(err);
										});
									} else {
										if(allData && allData.length > 0){
											async.sortBy(allData,function(a, cb){
												cb(null,a.metaObject.xmlName);
											},function(err,results){
												allData = results;
												account.update({
													fileInfo : allData,
													syncFileStatus : "done",
													lastFileSyncDate : new Date(),
													syncFileMsg: null
												},function(err,data){
													if(err)console.log("update fileinfo of sfconn(id : "+account._id+") err. errMessage : "+err);
													else console.log("update fileinfo of sfconn(id : "+account._id+") complete.");
												});
											});
										}
									}
								});
							}else{
								console.log("failed to describe sfdc with sfconn  " + sfconnId);
								account.update({
									syncFileStatus : "fail",
									lastFileSyncDate : new Date(),
									syncFileMsg: 'failed to describe the metadata file list of the SFDC.'
								},function(err){
									if(err)console.log(err);
								});
							}
						});
					}else{
						if(options.success) options.success();
					}
				}else{
					console.log("failed to log in sfdc with sfconn  " + sfconnId);
					if(options.error) options.error("failed to log in sfdc with sfconn " + account.orgName);
				}
			});
		}
	});
}



var analyzeObjectChild = function(metaItem, objects, fieldResult, cb){
	var childFiles = objects;
	var standard_meta = {};
	var custom_meta = {};
	var standard_childFile = [];
	var custom_childFile = [];
	
	var extend = require("util")._extend;
	
	var item1 = extend({}, metaItem);
	item1.helpHeader = "Object - Standard";
	standard_meta.metaObject = item1;

	var item2 = extend({}, metaItem);
	item2.helpHeader = "Object - Custom";
	custom_meta.metaObject = item2;

	for (var i = childFiles.length - 1; i >= 0; i--) {
		var theObject = childFiles[i];
		var objectFields = [];
		var objectValidationRules = [];
		var objectRecordTypes = [];
		if(fieldResult && fieldResult.length > 0){
			for (var j = fieldResult.length - 1; j >= 0; j--) {
				var theField = fieldResult[j];
				if(theField && theField.fileName == theObject.fileName 
					&& (theField.manageableState == 'unmanaged' || !theField.manageableState) ){
					if(theField.type == 'CustomField') objectFields.push(theField);
					if(theField.type == 'RecordType') objectRecordTypes.push(theField);
					if(theField.type == 'ValidationRule') objectValidationRules.push(theField);	
				} 
			};
		}
		
		if(objectFields && objectFields.length > 0) {
			async.sortBy(objectFields,function(a,cb){
				cb(null,a.fullName);
			},function(err,theData){
				if(theData) theObject.customerField = theData;	
			});
		}

		if(objectValidationRules && objectValidationRules.length > 0) {
			async.sortBy(objectValidationRules,function(a,cb){
				cb(null,a.fullName);
			},function(err,theData){
				if(theData) theObject.validationRule = theData;	
			});
		}

		if(objectRecordTypes && objectRecordTypes.length > 0) {
			async.sortBy(objectRecordTypes,function(a,cb){
				cb(null,a.fullName);
			},function(err,theData){
				if(theData) theObject.recordType = theData;	
			});
		}

		if(theObject && /^(\S)+(__c.object)$/.test(theObject.fileName)) custom_childFile.unshift(theObject);
		else standard_childFile.unshift(theObject);
	}

	standard_meta.childFiles = standard_childFile;
	custom_meta.childFiles = custom_childFile;
	cb(standard_meta,custom_meta);
};