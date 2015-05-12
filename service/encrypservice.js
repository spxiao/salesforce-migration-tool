var crypto = require('crypto');

exports.generateHashPassword = function(password) {
  var shaSum = crypto.createHash('sha256');
  shaSum.update(password);
  return shaSum.digest('hex');
};