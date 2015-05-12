// The SFConnection model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  ChangeSet = require("./changeset");

var Account = new Schema({
  orgName : {type : String, default : ''},
  orgType : {type : String, default : ''},
  organizationId : {type : String, default : ''},
  userName : {type : String, default : ''},
  userEmail : {type : String, default : ''},
  //login info start
  sid : {type : String, default : ''},
  userId : {type : String, default : ''},
  endpoint : {type : String, default : ''},
  //login info end
  createdDate : {type: Date, default: Date.now},
  createdBy : {type: ObjectId, default : null},
  fileInfo : {type : Array, default : []},
  objectChildInfo: {type: Array, default: []},
  syncFileStatus : {type : String, default : 'none'},
  syncFileMsg : {type: String, default: ""},
  lastFileSyncDate : {type : Date, default : null},
  accountType : {type: String, default : 'normal'}, //normal(can query)  temp(will be delete)
  //don't delete
  password: {type : String, default : ''},
  securityToken: {type : String, default : ''}
});


Account.pre("remove",function(next){
  ChangeSet.find({sfconnId:this._id},function(err,changesets){
    if(changesets){
      for (var i = changesets.length - 1; i >= 0; i--) {
        changesets[i].remove();
      };
    }
  });
  next();
});


module.exports = mongoose.model('Account', Account);