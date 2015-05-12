// The User model
 
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
var userSchema = new Schema({
  uid: { type: String, default: "" },
  tokens: [],
  profile: {},
  createdAt: { type : Date, default : Date.now }
});

var User = mongoose.model("User", userSchema);
module.exports = User;