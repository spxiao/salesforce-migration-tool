"use strict";

function ValidateOrDeploy(accId){
	var csId = $("#csId").val();
	var data = {
		//name : $("#sfconn-select .name").val(),
		archiveId : $("#archiveId").val(),
		targetSFConnId : accId
	};
	var requestType = $("#requestType").val();
	$(".container").spin(opts);
	$.post("/changeSets/" + csId+ "/" + requestType, data).done(function (data) {
		$(".container").spin(false);
		if("done" == data){
			location.reload(true);
		} else {
			console.log(data);
		}
	});
}

var clickBtnArchive = function(){
	var csId = $("#csId").val();
	$("#single-name input.targetCSId").val(csId);
	$.post("/changeSets/"+csId+"/archives").done(function(data){
		$(".container").spin(false);
		if("done"==data){
			location.reload(true);
		}else{
			$(".row.alert").addClass("alert-danger");
			$(".row.alert").text(data);
			$(".row.alert").show();
			$(".row.alert").fadeOut(6000);
		}
	});
};

var clickBtnValidate = function(el){
	var csId = $("#csId").val();
	var archiveId = $(el).parent().parent().attr("id") ? $(el).parent().parent().attr("id") : null;
	$("#archiveId").val(archiveId);
	$("#requestType").val("validation");
	$("#sfconn-select").modal("show");
};

var clickBtnDeploy = function(el){
	var csId = $("#csId").val();
	var archiveId = $(el).parent().parent().attr("id") ? $(el).parent().parent().attr("id") : null;
	$("#archiveId").val(archiveId);
	$("#requestType").val("deployment");
	$("#sfconn-select").modal("show");
};

var clickBtnDelArchive = function(el){
	$(".container").spin(opts);
	var itemId = $(el).parent().parent().attr("id");
	$.post("/changeSet/archive/"+itemId,{_method:"delete"}).done(function(data){
		$(".container").spin(false);
		if("done"==data){
			location.reload(true);
		}else{
			console.log(data);
			$(".row.alert.archive-alert").addClass("alert-danger");
			$(".row.alert.archive-alert").text(data);
			$(".row.alert.archive-alert").show();
			$(".row.alert.archive-alert").fadeOut(6000);
		}
	});
};

var clickBtnDelValidate = function(el){
	$(".container").spin(opts);
	var itemId = $(el).parent().parent().attr("id");
	$.post("/changeSet/validation/"+itemId,{_method:"delete"}).done(function(data){
		$(".container").spin(false);
		if("done"==data){
			location.reload(true);
		}else{
			$(".row.alert.validate-alert").addClass("alert-danger");
			$(".row.alert.validate-alert").text(data);
			$(".row.alert.validate-alert").show();
			$(".row.alert.validate-alert").fadeOut(6000);
		}
	});
};

var clickBtnDelDeploy = function(el){
	$(".container").spin(opts);
	var itemId = $(el).parent().parent().attr("id");
	$.post("/changeSet/deployment/"+itemId,{_method:"delete"}).done(function(data){
		$(".container").spin(false);
		if("done"==data){
			location.reload(true);
		}else{
			$(".row.alert.deploy-alert").addClass("alert-danger");
			$(".row.alert.deploy-alert").text(data);
			$(".row.alert.deploy-alert").show();
			$(".row.alert.deploy-alert").fadeOut(6000);
		}
	});
};

$(document).ready(function(){
	$("li[mode='pack'] .controlBtn").each(function(){
		var ref = $(this).parent().parent().attr("ref");
		$(this).bind("click",function(){
			if($(this).hasClass("controlFold")){
				$(this).removeClass("controlFold").addClass("controlUnFold");
				$(this).removeClass("icon-plus-sign").addClass("icon-minus-sign");
				$("li[ref='"+ref+"'][mode='file']").show();
			}else if($(this).hasClass("controlUnFold")){
				$(this).removeClass("controlUnFold").addClass("controlFold");
				$(this).removeClass("icon-minus-sign").addClass("icon-plus-sign");
				$("li[ref='"+ref+"'][mode='file']").hide();
			}
		});
	});

	$("a.validate-detail").each(function(){
		var data = $(this).next().text();
		var status = $(this).parent().prev().prev().children().eq(0).text();
		var content = "<div class='validate-result-contaniner'>";
		if(status == 'done') {
			data = $.parseJSON(data);
			var failData = data[0].componentFailures;
			if(failData && failData.length > 0){
				for(var i = 0 ; i < failData.length ; i ++){
					var crfaildata = failData[i];
					content += "<div class='error'>"+crfaildata.fullName+"\t\t"+crfaildata.problem+"</div>";
				}
			}else{
				content += "<div class='success'>Validate Sucessfully</div>";
			}
		}else{
			content += "<div class='error'>"+data+"</div>";
		}
		content += "</div>";
		$(this).popover({
			placement:"right",
            content:content, 
            trigger:'click',
            html:true
		});
	});

	$('.sfconn-syncFile').bind('click',function(){
		var accId = $("#sfconnId").val();
		$(".alert.sfconn-sync-info").removeClass("alert-danger").removeClass("alert-success");
		$(".alert.sfconn-sync-info").hide();
		$(".container").spin(opts);
		$.post("/sfconn/syncFile/"+accId).done(function (data) {
			$(".container").spin(false);
			if("done" == data){
				$('i.icon-refresh').addClass('icon-spin');
			}else{
				alert(data);
			}	
		});
	});

});

var opts = {
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: "#000", // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: true, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: "spinner", // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: "auto", // Top position relative to parent in px
  left: "auto" // Left position relative to parent in px
};


$(document).ready(function(){
	setInterval(accStatusCheck,1000*5);
	//setInterval(checkArchiveState,1000*10);
	setInterval(checkValidationStatus,1000*15);
	setInterval(checkDeployStatus,1000*15);
});

var checkArchiveState = function(){
	var checkType = "Archive";
	var q = {};
	q.checkType = checkType;
	var checkIds = '';
	$("i.archiveStatus").each(function(){
		var archiveId = $(this).parent().parent().attr("id");
		if(archiveId) checkIds += archiveId + ',';
	});
	if(checkIds.length > 0){
		q.checkIds = checkIds;
		$.get("/checkStatus",q).done(function(data){
			if(data && data.length > 0){
				for (var i = data.length - 1; i >= 0; i--) {
					var archive = data[i];
					$("tr[id='"+archive._id+"'] i.archiveStatus").replaceWith(archive.status);
					$("tr[id='"+archive._id+"'] td:last").html("");
					var content = "";
					if(archive.status == 'success'){
						content = '<button onclick="clickBtnValidate(this);" style="margin-left: 6px;" class="btn btn-xs btn-primary bakvalidate archive-validate">Validate</button>'
							+'<button onclick="clickBtnDeploy(this);" style="margin-left: 6px;" class="btn btn-xs btn-primary bakdeploy archive-deploy">Deploy</button>'
							+'<button onclick="clickBtnDelArchive(this);" style="margin-left: 6px;" class="btn btn-xs btn-warning archive-drop">Del</button>'
							+'<a href="/archive/'+archive._id+'/download" class="btn btn-xs btn-info pull-right">Download</a>';
					}else{
						content = '<button onclick="clickBtnDelArchive(this);" style="margin-left: 6px;" class="btn btn-xs btn-warning archive-drop">Del</button>';
						$("tr[id='"+archive._id+"'] td:last").html("<a class='btn btn-xs btn-danger'>"+archive.msg+"</a>");		
					}
					$("tr[id='"+archive._id+"'] td").eq(3).html(content);	
				};
			}
		});
	}
};

var checkValidationStatus = function(){
	var checkType = "Validation";
	var q = {};
	q.checkType = checkType;
	var checkIds = '';
	$("i.validateStatus").each(function(){
		var validateId = $(this).parent().parent().attr("id");
		if(validateId) checkIds += validateId + ',';
	});
	if(checkIds.length > 0){
		q.checkIds = checkIds;
		$.get("/checkStatus",q).done(function(data){
			if(data && data.length > 0){
				for (var i = data.length - 1; i >= 0; i--) {
					var validation = data[i];
					if(validation.status == 'Failed') $("tr[id='"+validation._id+"'] i.validateStatus").replaceWith("<span class='badge fail'>"+validation.status+"</span>");
					else if(validation.status == 'Succeeded') $("tr[id='"+validation._id+"'] i.validateStatus").replaceWith("<span class='badge'>"+validation.status+"</span>");
					$("tr[id='"+validation._id+"'] button.validation-drop").removeAttr("disabled");
					var content;
					if(validation.status == 'Failed'){
						if(validation.validateErrorInfo && validation.validateErrorInfo.length > 0){
							content = "<div class='row'><p class='error'>"+validation.validateErrorInfo+"</p></div>";
						}else if(validation.validateResult && validation.validateResult.length > 0){
							var result = validation.validateResult[0];
							if(result.componentFailures || (result.runTestResult && result.runTestResult.failures)){
								var fails = result.componentFailures;
								var content = '<table class="table table-hover table-bordered error detail-table"><thead><tr><th>File Name</th><th>Failure Info</th></tr></thead><tbody>';
								for (var i = fails.length - 1; i >= 0; i--) {
									var failInfo = fails[i];
									content += "<tr><td>" + failInfo.fullName + "</td><td>column " +failInfo.columnNumber +',line ' + failInfo.lineNumber + ' ' + failInfo.problem + "</td></tr>";
								};
								if(result.runTestResult && result.runTestResult.failures){
									for (var j = result.runTestResult.failures.length - 1; j >= 0; j--) {
										var testFail = result.runTestResult.failures[j];
										content += "<tr><td>" + testFail.name + "</td><td>" + testFail.message + "</td></tr>";
									};
								}
									
								content += "</tbody></table>";
							}
						}
					}else{
						content = "<div class='row'><p class='success'>Validate Successfully.</p></div>";
					}
					$("tr[id='"+validation._id+"'] td:last .info-container").html(content);
					$("tr[id='"+validation._id+"'] td").eq(4).find("a").removeAttr("disabled");
				};
			}
		});
	}
};

var checkDeployStatus = function(){
	var checkType = "Deployment";
	var q = {};
	q.checkType = checkType;
	var checkIds = '';
	$("i.deployStatus").each(function(){
		var deploymentId = $(this).parent().parent().attr("id");
		if(deploymentId) checkIds += deploymentId + ',';
	});
	if(checkIds.length > 0){
		q.checkIds = checkIds;
		$.get("/checkStatus",q).done(function(data){
			if(data && data.length > 0){
				for (var i = data.length - 1; i >= 0; i--) {
					var deployment = data[i];
					if(deployment.status == 'Failed') $("tr[id='"+deployment._id+"'] i.deployStatus").replaceWith("<span class='badge fail'>"+deployment.status+"</span>"); 
					else if(deployment.status == 'Succeeded') $("tr[id='"+deployment._id+"'] i.deployStatus").replaceWith("<span class='badge'>"+deployment.status+"</span>"); 
					$("tr[id='"+deployment._id+"'] button.deployment-drop").removeAttr("disabled");
					var content;
					if(deployment.status == 'Failed'){
						if(deployment.deployErrorInfo && deployment.deployErrorInfo.length > 0){
							content = "<div class='row'><p class='error'>"+deployment.deployErrorInfo+"</p></div>";
						}else if(deployment.deployResult && deployment.deployResult.length > 0){
							var result = deployment.deployResult[0];
							if(result.componentFailures || (result.runTestResult && result.runTestResult.failures)){
								var fails = result.componentFailures;
								var content = '<table class="table table-hover table-bordered error detail-table"><thead><tr><th>File Name</th><th>Failure Info</th></tr></thead><tbody>';
								for (var i = fails.length - 1; i >= 0; i--) {
									var failInfo = fails[i];
									content += "<tr><td>" + failInfo.fullName + "</td><td>column " +failInfo.columnNumber +',line ' + failInfo.lineNumber + ' ' + failInfo.problem + "</td></tr>";
								};
								if(result.runTestResult && result.runTestResult.failures){
									for (var j = result.runTestResult.failures.length - 1; j >= 0; j--) {
										var testFail = result.runTestResult.failures[j];
										content += "<tr><td>" + testFail.name + "</td><td>" + testFail.message + "</td></tr>";
									};
								}
								content += "</tbody></table>";
							}
						}
					}else{
						content = "<div class='row'><p class='success'>Deploy Successfully.</p></div>";
					}
					$("tr[id='"+deployment._id+"'] td:last .info-container").html(content);
					$("tr[id='"+deployment._id+"'] td").eq(4).find("a").removeAttr("disabled");
				};
			}
		});
	}
};


var accStatusCheck = function(){
	var q = {
		checkType : 'Account'
	};
	var checkIds = $("#sfconnId").val();
	if(checkIds && $("i.icon-spin.icon-refresh").length > 0){
		q.checkIds = checkIds;
		$.get("/checkStatus",q).done(function(data){
			if(data && data.length > 0){
				$('i.icon-refresh').removeClass('icon-spin');
				var account = data[0];
				$("span.lastFileSyncDate").text($.format.date(account.lastFileSyncDate,'yyyy-MM-dd HH:mm:ss'));
				if(account.syncFileStatus == 'done'){
					$("span.sfconn-sync-info").text("The Syncronization completed .");
					$(".alert.sfconn-sync-info").addClass('alert-success');
					$(".alert.sfconn-sync-info").show();
				}else{
					$("span.sfconn-sync-info").text(account.syncFileMsg);
					$(".alert.sfconn-sync-info").addClass('alert-danger');
					$(".alert.sfconn-sync-info").show();
				}
			}
		});
	}
		
};