var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  fs = require("fs");
 
var Archive = new Schema({
  name : String ,
  createdDate: {type: Date, default: Date.now},
  changeSetId: {type: ObjectId, default: null},
  createdBy: {type: ObjectId, default: null},
  s3Key : {type : String , default : null},
  status : {type : String , default : 'new'},
  validateStatus : {type : String , default : 'none'},
  deployStatus : {type : String , default : 'none'},
  archiveErrorInfo : {type : String , default : ''},
  zipFileId: { type: ObjectId , default: null },
  zipFileName: {type: String , default: null},
  version: {type: String,default:null},
  msg: {type: String , default: ''}
});


Archive.pre("remove",function(next){
  if(this.zipFileId){
    var gfs = require("gridfs-stream").gfs;
    gfs.remove({_id: this.zipFileId}, function (err) {
      if (err) console.log("delete archive("+this._id+") attached file("+this.zipFileId+") error : "+err);
      next();
    });
  }else next();
  
});

Archive.methods = {
  uploadAndSave: function(path,callback){
    if(!path) return this.save(callback);
    if(path){
      var self = this;
      var fileName = "Archive_"+self.version+".zip";
      var gfs = require("gridfs-stream").gfs;
      var writestream = gfs.createWriteStream({filename: fileName});
      fs.createReadStream(path).pipe(writestream);
      writestream.on("close", function (file) {
        self.zipFileId = file._id;
        self.zipFileName = file.filename;
        self.status = "done";
        self.save(callback);
      });
    }
  },
  removeFile: function (cb){
    var gfs = require("gridfs-stream").gfs;
    gfs.remove({_id: this.zipFileId}, function (err) {
      if (err) {
        cb(err);
      } else {
        cb(null);
      }
    });
  },
  downloadFile: function(res){
    var fileId = this.zipFileId;
    if(fileId){
      var gfs = require("gridfs-stream").gfs;
      var readstream = gfs.createReadStream({
        _id: fileId 
      });
      readstream.pipe(res);  
    }else res.send("There is no file attached the Archive");
  }
};

module.exports = mongoose.model('Archive', Archive);