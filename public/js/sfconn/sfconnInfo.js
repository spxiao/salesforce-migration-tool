var $=jQuery.noConflict();

$(document).ready(function(){
	//initArchiveBtnAction();
	initDeleteBtnAction();
	//initDeployAndVlidateAction();

	var accId = $("#sfconnId").val();

	$(".sfconn-edit").bind("click",function(){
		$(".container").spin(opts);
		$.get("/sfconn",{accId:accId},function(data){
			if(data){
				$(".container").spin(false);
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
				theForm.modal('show');
			}
		});
	});

	$('.sfconn-syncFile').bind('click',function(){
		$(".container").spin(opts);
		$("alert.sfconn-sync-info").removeClass("alert-danger").removeClass("alert-success");
		$("alert.sfconn-sync-info").hide();
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

function initDeployAndVlidateAction(){
	$("tbody tr").each(function(){
		var csId = $(this).attr('id');
		$(this).find('td:last button.validate').bind('click',function(){
			$("#newSFConn-csId").val(csId);
			$("#triggle-name").val('validation');
		});
		$(this).find('button.deploy').bind('click',function(){
			$("#newSFConn-csId").val(csId);
			$("#triggle-name").val('deployment');
		});
	});
}

function initArchiveBtnAction(){
	$('table td button.archive').each(function(){
		var csId = $(this).parent().parent().attr('id');
		$(this).bind('click',function(){
			$("#single-name input.targetCSId").val(csId);
		});
	});
}

function initDeleteBtnAction(){
	$('table td button.delete').each(function(){
		var csId = $(this).parent().parent().attr('id');
		var sfconnId = $("#sfconnId").val();
		$(this).bind('click',function(){
			var ensure = confirm("Are you sure to delete the Change Set ?");
			if(ensure){
				$(".container").spin(opts);
				$.post('/sfconn/'+sfconnId+'/changeSets/'+csId,{_method : 'delete'}).done(function(data){
					$(".container").spin(false);
					if('done'==data){
						location.reload(true);
					}
				});
			}else{
				return;				
			}
		});
	});
}

var opts = {
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: true, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};



$(document).ready(function(){
	
	setInterval(accStatusCheck, 5000);

});

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
				$("span.lastFileSyncDate").text(' ' + $.format.date(account.lastFileSyncDate,'yyyy-MM-dd HH:mm:ss'));
				if(account.syncFileStatus == 'done'){
					$(".alert span.sfconn-sync-info").text("The Syncronization completed.");
					$(".alert.sfconn-sync-info").addClass('alert-success');
					$(".alert.sfconn-sync-info").show();
				}else{
					$(".alert span.sfconn-sync-info").text(account.syncFileMsg);
					$(".alert.sfconn-sync-info").addClass('alert-danger');
					$(".alert.sfconn-sync-info").show();
				}
			}
		});
	}
		
};