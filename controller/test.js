var changeSetService = require('../service/changesetservice'),
	s3service = require('../service/s3service'),
	commonservice = require('../service/commonservice'),
	nodeforce = require('../lib/nodeforce'),
	Account = require('../model/account');


exports.testArchive = function(req,res){
	changeSetService.doArchiveAction('52cbb62f338f19b810000001','52ce72649f7d00001e000002','52cb72fca3513a0e51c623e3');
};

exports.testS3 = function(req,res){
	s3service.uplaodData('52cb72fca3513a0e51c623e3_52ce72649f7d00001e000002.zip');
}

exports.testDeploy = function(req,res){
	console.log('ready to do deploy action');
	changeSetService.deploy({
		targetSFConnId : '52cbb62f338f19b810000001'
	},'/temp/52ce72649f7d00001e000002.zip',function(execCode){
		console.log(execCode);
	});
};

exports.test = function(req,res){
	var a = null;
	if(a){
		console.log(11);
	}else{
		console.log(22);
	}
}

exports.testSFAccessToken = function(req,res){
	var sfconn={
		username : 'shawn.lnd@123.com',
		password : '127388626xaxsp',
		secureToken : '3blQBddY6RkcxRGaulunmPhW3',
		conn_env : 'login.salesforce.com'
	};
	var client = nodeforce.createClient({
		sid : '00D90000000otEQ!ARAAQKA0R6vF4GiCd33IkgcQgsJyQMCx_c_i_3TKR9a_nwL0GGV1HaGtS53YJI1dFH6bH.Z0sXuZT4M1C_LevAG0nMYzlIQ9',
		userId : '00590000001DjeCAAS',
		endpoint : 'https://ap1.salesforce.com/services/Soap/u/29.0/00D90000000otEQ'
	});
	client.login(function(err,response,request){
		if(err)console.log(err);
		else{
			console.log(response);
		}
	});
	/*commonservice.connect2SFDC(sfconn,function(err,client){
		if(err)console.log(err);
		else console.log(client);
	});*/
};

exports.addSFConn = function (req, res) {
	console.log(req.body);

	var newSFConn={
		name : "test",
		sid : req.body.sid,
		userId : req.body.userId,
		endpoint : req.body.endpoint,
		createdBy : req.session.user._id
	};
	new Account(newSFConn).save(function(err,docs){
		res.send("ok");
		});
};