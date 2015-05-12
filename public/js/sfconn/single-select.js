"use strict";
var tempOrgName, orgId, orgType;
$(document).ready(function(){
	function checkInputName () {
		var inputName = $("#single-select input.name").val();
		if(!inputName) {
			$("#single-select input.name").parent().addClass("has-error");
			tempOrgName = "";
			return false;
		} else {
			$("#single-select input.name").parent().removeClass("has-error");
			$("#single-select").modal("hide");
			tempOrgName = inputName;
			return true;
		}
	}

	$("#single-select a:first").bind("click",function(){
		if(!checkInputName()) return;
		else oauthProduction();
	});

	$("#single-select a:last").bind("click",function(){
		if(!checkInputName()) return;
		else oauthSandBox();
	});
});

function oauthProduction(id) {
	if(id) orgId = id;
	else orgId = null;

	orgType = 'Production';

	var loginUrl = "https://login.salesforce.com/";
	var clientId = "3MVG9Y6d_Btp4xp7ZOesaztHpuKJTdGVM86i1KD.CafBzBowRXP0mAs_oSTxvQrJRXJMVh3pT1oDaLMe7D_Nh";
	var	redirectUri = "https://migrationtool-staging.herokuapp.com/authcallback";
	if(document.URL.indexOf("localhost") !== -1 || document.URL.indexOf("127.0.0.1") !== -1) {
		clientId = "3MVG9Y6d_Btp4xp4eO2jujCUfEWdyWextljrhi5gB0G7gIaieua03FNx15oOJpTCI7ASBrq3v11NJ_9peAmlC";
		redirectUri = "http://localhost:5000/authcallback";
	}
	$("#popupWindow").popupWindow({
        windowURL: getAuthorizeUrl(loginUrl, clientId, redirectUri),
        windowName: "Connect",
        centerBrowser: 1,
        height: 524,
        width: 675
    });
    $("#popupWindow").trigger("click");	
}

function oauthSandBox(id) {
	if(id) orgId = id;
	else orgId = null;

	orgType = 'SandBox';

	var loginUrl = "https://test.salesforce.com/";
	var clientId = "3MVG9A2kN3Bn17huLzcysKVpjdfzblwRb4UArmn8iNYIAykHugRL76dwTzlY9ryzUqTBdxSGypMLbbkYGmdA.";
	var	redirectUri = "http://localhost:5000/authcallback";
	var	redirectUri = "https://migrationtool-staging.herokuapp.com/authcallback";
	if(document.URL.indexOf("localhost") !== -1 || document.URL.indexOf("127.0.0.1") !== -1) {
		clientId = "3MVG9Y6d_Btp4xp4eO2jujCUfEWdyWextljrhi5gB0G7gIaieua03FNx15oOJpTCI7ASBrq3v11NJ_9peAmlC";
		redirectUri = "http://localhost:5000/authcallback";
	}
	$("#popupWindow").popupWindow({
        windowURL: getAuthorizeUrl(loginUrl, clientId, redirectUri),
        windowName: "Connect",
        centerBrowser: 1,
        height: 524,
        width: 675
    });
    $("#popupWindow").trigger("click");
}

function getAuthorizeUrl(loginUrl, clientId, redirectUri){
	return loginUrl+"services/oauth2/authorize?display=popup" + 
		"&response_type=token&client_id=" + escape(clientId) +
		"&redirect_uri="+escape(redirectUri);
}

function sessionCallback(oauthResponse) {
	console.log("sessionCallback");
	console.log(oauthResponse);

	var splitToken = oauthResponse.access_token.split("!");
	var splitId = oauthResponse.id.split("/");
	var sfconn={};
	sfconn.orgId = orgId;
	sfconn.orgType = orgType;
	if(tempOrgName !== "" && !orgId){
		sfconn.orgName = tempOrgName;
	}
	sfconn.sid = oauthResponse.access_token;
	sfconn.userId = splitId[splitId.length - 1];
	sfconn.endpoint = oauthResponse.instance_url + "/services/Soap/u/29.0/" + splitToken[0];

	tempOrgName = "";

	console.log(sfconn);

	$.post("/sfconn", sfconn)
		.done(function(data){
			if("done" == data){
				//window.open("/sfconn","_self");
				location.reload(true);
			} else {
				location.reload(true);
			}
		});
}