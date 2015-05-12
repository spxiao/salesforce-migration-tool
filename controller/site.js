var commonservice = require("../service/commonservice");


exports.index = function(req, res) {
  res.render('site/index', {
    companyName: process.env.COMPANY_NAME || "ITBconsult",
    env: process.env.NODE_ENV || "development",
    username: process.env.TEMP_USERNAME || "",
    password: process.env.TEMP_PASSWORD || "",
    secureToken: process.env.TEMP_SECURETOKEN || "",
  });
};

exports.checkStatus = function(req,res){
	if(req.user){
		commonservice.checkStatus(req.query,function(data){
			if(data) res.send(data);
			else res.send(null);
		});
	}else{
		res.send(null);
	}
};