$(document).ready(function(){
	var theForm = $('#sfconnform');

	$('#sfconnform').on("hide.bs.modal",function(e){
		$("#acc_id").val("");
		$(theForm.find("input")[0]).val("");
		$(theForm.find("input")[1]).val("");
		$(theForm.find("input")[2]).val("");
		$(theForm.find("input")[3]).val("");
		theForm.find(".btn-info i:first").addClass("icon-check").removeClass("icon-check-empty");
		theForm.find(".btn-info i:last").addClass("icon-check-empty").removeClass("icon-check");
	});

	theForm.find(".btn-info").bind('click',function(){
		hideEl('.alert-danger');
		$(this).parent().parent().find("i").addClass("icon-check-empty").removeClass("icon-check");
		$(this).find("i").addClass("icon-check").removeClass("icon-check-empty");
	});

	theForm.find("input[name]").bind('click',function(){
		hideEl('.alert-danger');
		$(this).removeClass("input_error");
	});

	theForm.find(".btn-primary").bind("click",function(){
		var inputs = theForm.find("input[name]");
		var acc_id = $("#acc_id").val();
		var orgName = $(inputs[0]).val();
		var userName = $(inputs[1]).val();
		var password = $(inputs[2]).val();
		var token = $(inputs[3]).val();
		var orgType = theForm.find("i.icon-check");
		if(!orgName){
			$(inputs[0]).attr("placeholder","You must enter a Name");
			$(inputs[0]).addClass("input_error");
			return;
		}
		if(!userName){
			$(inputs[1]).attr("placeholder","You must enter an User Name");
			$(inputs[1]).addClass("input_error");
			return;
		}
		if(!password){
			$(inputs[2]).attr("placeholder","You must enter the Password");
			$(inputs[2]).addClass("input_error");
			return;
		}
		/*if(!token){
			$(inputs[3]).attr("placeholder","You must enter the Security Token");
			$(inputs[3]).addClass("input_error");
			return;
		}*/
		if(userName && !/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(userName)){
			$(inputs[1]).attr("placeholder","InValide User Name");
			$(inputs[1]).addClass("input_error");
			return;
		}
		if(!orgType || orgType.length == 0){
			var alertDIV = theForm.find('.alert-danger').text("Please specify the org type");
			alertDIV.show();
			return;
		}

		orgType = theForm.find("i.icon-check").next().text();
		var sfconn = {
			orgName: orgName,
			userName: userName,
			password: password,
			securityToken: token,
			orgType: orgType
		}

		if(acc_id) sfconn._id = acc_id;
		var isSave ;
		if($(theForm.find("input:checkbox")).length > 0)
			isSave = $(theForm.find("input:checkbox"))[0].checked ? 'true':'false';//adjust backend analyze

		showEl(".icon-spin");
		hideEl(".btn-primary");

		$.post("/sfconn",{sfconn:sfconn,isSave:isSave}).done(function(data){
			if(data && data.message && data.message =='done'){
				$("#sfconnform").modal("hide");
				if(window.location.href.indexOf("changeSets") > -1){
					ValidateOrDeploy(data.accId);
				}else location.reload(true);
			}else{
				var alertDIV = theForm.find('.alert-danger').text(data.message);
				alertDIV.show();
			}
			showEl(".btn-primary");
			hideEl(".icon-spin");
		});

	});

	var showEl = function(selector){
		theForm.find(selector).show();
	}

	var hideEl = function(selector){
		theForm.find(selector).hide();
	}
});

