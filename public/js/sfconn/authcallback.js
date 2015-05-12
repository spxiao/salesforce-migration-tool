function onloadCallback(){
	var oauthResponse = {};
	if (window.location.hash) {
		var message = window.location.hash.substr(1);
		var nvps = message.split('&');
		for (var nvp in nvps) {
		    var parts = nvps[nvp].split('=');
			oauthResponse[parts[0]] = unescape(parts[1]);
		}
	}
	window.opener.sessionCallback(oauthResponse);
	window.close();
}