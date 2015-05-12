var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
 
var Deployment = new Schema({
  name : String ,
  createdDate: {type: Date, default: Date.now},
  changeSetId: {type: ObjectId, default: null},
  createdBy: {type: ObjectId, default: null},
  archiveId: {type: ObjectId, default: null},
  status : {type : String , default : 'new'},
  targetSFConnId : {type: ObjectId, default: null},
  targetSFConnName: {type: String, default: null},
  targetSFConnUser: {type: String, default: null},
  targetSFConnType: {type: String, default: null},
  deployErrorInfo : {type : String , default : ''},
  deployResult : { type : Array , default : []}
});
 
module.exports = mongoose.model('Deployment', Deployment);