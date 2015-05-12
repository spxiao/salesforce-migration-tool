/**
 * New node file
 */
 "use strict";
var $ = jQuery.noConflict();

$(document).ready(function(){

	$("tr[ref]").each(function(){
		var sfconnId=$(this).attr("ref");
		var sfconn={};
		
		/*$("tr[ref='"+sfconnId+"']").find(".sfconn-oauth").bind("click",function(){
			var orgId = $(this).parent().parent().find(".organizationId").attr("id");
			var orgType = $(this).parent().prev().text();
			if(orgType == 'Production')
				oauthProduction(orgId);
			if(orgType == 'SandBox')
				oauthSandBox(orgId);
		});
*/
		/*$("tr[ref='"+sfconnId+"']").find(".sfconn-cs").bind("click",function(){
			sfconn.name=$("#"+sfconnId).find("input[name='connName']").val();
			sfconn.username=$("#"+sfconnId).find("input[name='username']").val();
			sfconn.password=$("#"+sfconnId).find("input[name='password']").val();
			sfconn.secureToken=$("#"+sfconnId).find("input[name='secureToken']").val();
			sfconn.conn_env=$("#"+sfconnId).find("select[name='endpoint']").val();
			$.post("/sfconn/validate",{
				sfconn:sfconn
			}).done(function(data){
				if("validate"==data){
					window.open("/sfconn/"+sfconnId,"_self");
				}else{
					$("#"+sfconnId).find(".unValideInfo").css("display","block");
					$("#"+sfconnId).modal("show");
				}
			});
		});*/
		
		$(this).find(".sfconn-del").bind("click",function(){
			var ensure = confirm("Are you sure to delete the Organization ?");
			if(ensure){
				$.post("/sfconn/"+sfconnId,{_method:"delete"}).done(function(data){
					if("done" == data){
						window.open("/sfconn","_self");
					}
				});
			}else return;
				
		});

		$(this).find(".sfconn-edit").bind("click",function(){
			$.get("/sfconn",{accId:sfconnId},function(data){
				if(data){
					var acc = data[0];
					var theForm = $("#sfconnform");
					$("#acc_id").val(acc._id);
					$(theForm.find("input")[0]).val(acc.orgName);
					$(theForm.find("input")[1]).val(acc.userName);
					$(theForm.find("input")[2]).val(acc.password);
					$(theForm.find("input")[3]).val(acc.securityToken);
					if(acc.orgType == 'Production'){
						theForm.find(".btn-info i:first").addClass("icon-check").removeClass("icon-check-empty");
						theForm.find(".btn-info i:last").addClass("icon-check-empty").removeClass("icon-check");
					}else{
						theForm.find(".btn-info i:first").addClass("icon-check-empty").removeClass("icon-check");
						theForm.find(".btn-info i:last").addClass("icon-check").removeClass("icon-check-empty");
					}
					$(".page-header .btn-info").trigger('click');
				}
			});
		});

	});


	/*$("a.sfconn-del").each(function(){
		var sfconnId = $(this).parent().parent().attr('ref');
		$(this).confirmation({
			animation: true,
			placement: 'top',
			trigger: 'click',
			title: 'Are you sure ?',
			target: this,
			popout: true,
			singleton: true,
			onConfirm: function(){
				$.post("/sfconn/"+sfconnId,{_method:"delete"}).done(function(data){
					if("done" == data){
						window.open("/sfconn","_self");
					}
				});
			}
		});
	});*/

});

var clickBtnSyncFile = function(el){
	var sfconnId=$(el).parent().parent().attr("ref");
	/*sfconn.name=$("#"+sfconnId).find("input[name='connName']").val();
	sfconn.username=$("#"+sfconnId).find("input[name='username']").val();
	sfconn.password=$("#"+sfconnId).find("input[name='password']").val();
	sfconn.secureToken=$("#"+sfconnId).find("input[name='secureToken']").val();
	sfconn.conn_env=$("#"+sfconnId).find("select[name='endpoint']").val();*/
	$.post("/sfconn/syncFile/"+sfconnId).done(function (data) {
		if("done" == data){
			window.open("/sfconn","_self");
		}else{
			alert(data);
		}	
	});
	/*$.post("/sfconn/validate",{
		sfconn:sfconn
	}).done(function(data){
		if("validate"==data){
			$.post("/sfconn/syncFile/"+sfconnId);
		}else{
			$("#"+sfconnId).find(".unValideInfo").css("display","block");
			$("#"+sfconnId).modal("show");
		}
	});*/
};

$(document).ready(function(){
	
	//setInterval(accStatusCheck, 5000);

});

var accStatusCheck = function(){
	var q = {
		checkType : 'Account'
	};
	var checkIds = '';
	$("i.accStatus").each(function(){
		var accId = $(this).parent().parent().attr('ref');
		if(accId) checkIds += accId+",";
	});
	if(checkIds.length > 0){
		q.checkIds = checkIds;
		$.get("/checkStatus",q).done(function(data){
			if(data && data.length > 0){
				for (var i = data.length - 1; i >= 0; i--) {
					var accountId = data[i]._id;
					$("tr[ref='"+accountId+"'] i.accStatus").replaceWith("<a onclick='clickBtnSyncFile(this);' style='margin-left:4px;' class='btn btn-xs btn-primary sfconn-sf'>SyncFiles</a>");
					var syncTime = data[i].lastFileSyncDate;
					var syncStatus = data[i].syncFileStatus;
					if(syncStatus == 'done'){
						syncTime = new Date(syncTime);
						var y = syncTime.getFullYear();
						var m = syncTime.getMonth()+1;
						m = m < 10 ? "0"+m : m;
						var d = syncTime.getDate();
						d = d < 10 ? "0"+d : d;
						var h = syncTime.getHours();
						h = h < 10 ? "0"+h : h;
						var mi = syncTime.getMinutes();
						mi = mi < 10 ? "0"+mi : mi;
						var ms = syncTime.getSeconds();
						mi = ms < 10 ? "0"+ms : ms;
						var formatDate = d+'.'+m+'.'+y+" "+h+":"+mi+":"+ms;
						$("tr[ref='"+accountId+"'] td").eq(4).text(formatDate);
					}else{
						$("tr[ref='"+accountId+"'] td").eq(4).text(syncStatus);
						$("tr[ref='"+accountId+"'] td:last").html("<a class='btn btn-danger btn-xs'>"+data[i].syncFileMsg+"</a>");
					}
				};
			}
		});
	}
		
};