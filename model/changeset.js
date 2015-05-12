var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Archive = require("./archive")
  , Validation = require("./validation")
  , Deployment = require("./deployment");
 
var ChangeSet = new Schema({
  name: {type :String,default : ''},
  description: {type :String,default : ''},
  createdDate: {type: Date, default: Date.now},
  createdBy: {type: ObjectId, default: null},
  sfconnId: {type: ObjectId, default: null},
  files : {type : Array, default : []},
  archiveStatus : {type : String , default : 'none'},
  validateStatus : {type : String , default : 'none'},
  deployStatus : {type : String , default : 'none'},
  theArchiveVersion: {type:Number , default: 1.00}
});

ChangeSet.pre("remove",function(next){
  //delete all relate archives
  Archive.find({changeSetId:this._id},function(err,archives){
    if(archives){
      for (var i = archives.length - 1; i >= 0; i--) {
        archives[i].remove();
      };
    }
  });

  //delete all relate validations
  Validation.find({changeSetId:this._id},function(err,validations){
    if(validations){
      for (var i = validations.length - 1; i >= 0; i--) {
        validations[i].remove();
      };
    }
  })

  //delete all relate deployments
  Deployment.find({changeSetId:this._id},function(err,deployments){
    if(deployments){
       for (var i = deployments.length - 1; i >= 0; i--) {
        deployments[i].remove();
      };
    }
  });

  next();
});


module.exports = mongoose.model('ChangeSet', ChangeSet);