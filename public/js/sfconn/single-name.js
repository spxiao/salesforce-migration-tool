"use strict";
$(document).ready(function(){
	$("#single-name button:last").bind("click",function(){
		var inputName = $("#single-name input.name").val();
		if(inputName && inputName !== ""){
			$("#single-name").modal("hide");
			var csId = $("#single-name input.targetCSId").val();
			$(".container").spin(opts);
			$.post("/changeSets/"+csId+"/archives?name="+inputName).done(function(data){
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
		}else{
			$("#single-name input.name").parent().addClass("has-error");
		}
	});

	$("#single-name input.name").bind("click",function(){
		$(this).parent().removeClass("has-error");
	});
});