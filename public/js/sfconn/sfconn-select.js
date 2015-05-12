"use strict";
$(document).ready(function(){
	$("#sfconn-select input:radio").each(function(){
		$(this).bind("click",function(){
			var _this = $(this)[0];
			$("#sfconn-select .choosedSFConn").val($(this).parent().next().text());
			$(".choosedSFConnId").val($(this).val());
			$("#sfconn-select input:radio").each(function(){
				if($(this)[0]!=_this){
					$(this).attr("checked",false);
				}
			});
		});
	});
	
	$("#sfconn-select").on("hidden.bs.modal",function(){
		$("#sfconn-select .name").val("");
		$("#sfconn-select input:radio").attr("checked",false);
		$("#sfconn-select .nameClass").removeClass("has-error");
		$(".choosedSFConnId").removeClass("has-error");
		$("#sfconn-select .choosedSFConn").val("None Choosed");
		$(".choosedSFConn").attr("style","border:0px;background: white");
	});

	$("#sfconn-select .new").bind("click", function () {  
		$("#sfconn-select").modal("hide");
		$("#sfconnform").modal("show");
	});

	$("#sfconn-select .submit").bind("click", function () {
		/*if($("#sfconn-select .name").val() === ""){
			$("#sfconn-select .nameClass").addClass("has-error");
		}else*/ if($("#sfconn-select .choosedSFConn").val() == "None Choosed"){
			$(".choosedSFConn").attr("style","background: white");
			$(".choosedSFConnId").addClass("has-error");
			$("#sfconn-select .nameClass").removeClass("has-error");
		}else{

			//$("#sfconn-select .nameClass").removeClass("has-error");
			$(".choosedSFConnId").removeClass("has-error");
			var csId = $("#csId").val();
			var data = {
				//name : $("#sfconn-select .name").val(),
				archiveId : $("#archiveId").val(),
				targetSFConnId : $(".choosedSFConnId").val()
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
			
			$("#sfconn-select").modal("hide");
		}
	});
});