var $=jQuery.noConflict();

$(document).ready(function(){
	$('.controlBtn').each(function(){
		$(this).bind('click',function(){
			var ref = $(this).parent().parent().attr('ref');
			if($(this).hasClass('controlFold')){
				$(this).removeClass('controlFold').addClass('controlUnFold');
				$(this).removeClass('icon-plus-sign').addClass('icon-minus-sign');
				$("li[ref='"+ref+"'][mode='metaObjectChild']").show();
			}else if($(this).hasClass('controlUnFold')){
				$(this).removeClass('controlUnFold').addClass('controlFold');
				$(this).removeClass('icon-minus-sign').addClass('icon-plus-sign');
				$("li[ref='"+ref+"'][mode='metaObjectChild']").hide();
				$("li[ref='"+ref+"'][mode='metaObjectChild'] i.icon-sort-down").addClass('icon-caret-right').removeClass('icon-sort-down');
				$("li[data-root='"+ref+"']").hide();
				$("li[data-root='"+ref+"'] i.icon-sort-down").addClass('icon-caret-right').removeClass('icon-sort-down');
			}
		})
	});

	$("i.thirdCtl").each(function(){
		var rootName = $(this).parent().parent().data('name');
		$(this).bind('click',function(){
			if($(this).hasClass('icon-caret-right')){
				$(this).removeClass('icon-caret-right').addClass('icon-sort-down');
				$("li[mode='detailFolder'][ref='"+rootName+"']").show();
			}else if($(this).hasClass('icon-sort-down')){
				$(this).removeClass('icon-sort-down').addClass('icon-caret-right');
				$("li[ref='"+rootName+"']").hide();
				$("li[ref='"+rootName+"'] i.icon-sort-down").addClass('icon-caret-right').removeClass('icon-sort-down');
			}
			
		});
	});


	$("i.fourCtl").each(function(){
		var rootName = $(this).parent().parent().attr('ref');
		var theCtr = $(this).parent().parent().data('ctr');
		$(this).bind('click',function(){
			if($(this).hasClass('icon-caret-right')){
				$(this).removeClass('icon-caret-right').addClass('icon-sort-down');
				$("li[mode='"+theCtr+"'][ref='"+rootName+"']").show();
			}else if($(this).hasClass('icon-sort-down')){
				$(this).removeClass('icon-sort-down').addClass('icon-caret-right');
				$("li[mode='"+theCtr+"'][ref='"+rootName+"']").hide();
			}
			
		});
	});

	$("input.fourCtl").each(function(){
		var theCtr = $(this).parent().parent().parent().data('ctr');
		var ref = $(this).parent().parent().parent().attr("ref");
		$(this).bind('click',function(){
			if(theCtr && ref){
				if($(this)[0].checked){
					$("li[ref='"+ref+"'][mode='"+theCtr+"'] input[mode='"+theCtr+"']").each(function(){
						$(this)[0].checked = true;
						var fileName = $(this).next().text(); 
						var addFile = $(".left-ul li[data-name='"+fileName+"']");
						var theType = $(this).parent().parent().parent().data("type");
						if(!addFile || addFile.length == 0){
							$(".left-ul").append("<li data-name='"+fileName+"'><i onclick='del(this);' class='icon-trash'></i><span>"+fileName+"</span><span class='badge pull-right'>"+theType+"</span></li>");
						}
					});
					var folderLength = $("li[mode='detailFolder'][ref='"+ref+"']").length;
					var selectFolderLength = $("li[mode='detailFolder'][ref='"+ref+"'] input:checked").length;
					if(folderLength == selectFolderLength){
						$("li[data-name='"+ref+"'][mode='metaObjectChild'] input")[0].checked = true;
						var theType = $("li[data-name='"+ref+"'][mode='metaObjectChild']").data('type');
						if($(".left-ul li[data-name='"+ref+"']").length == 0)
							$(".left-ul").append("<li data-name='"+ref+"'><i onclick='del(this);' class='icon-trash'></i><span>"+ref+"</span><span class='badge pull-right'>"+theType+"</span></li>");
						$("li[ref='"+ref+"'][mode!='metaObjectChild'][mode!='detailFolder']").each(function(){
							var theFileName = $(this).find('em').text();
							if(theFileName) $(".left-ul li[data-name='"+theFileName+"']").remove();
						});
					}
				}else{
					$("li[mode='metaObjectChild'][data-name='"+ref+"'] input")[0].checked = false;
					$(".left-ul li[data-name='"+ref+"']").remove();
					$("li[ref='"+ref+"'][mode='"+theCtr+"'] input[mode='"+theCtr+"']").each(function(){
						var fileName = $(this).next().text(); 
						$(this)[0].checked = false;
						$(".left-ul li[data-name='"+fileName+"']").remove();
					});
					$("li[ref='"+ref+"'][mode!='metaObjectChild'][mode!='detailFolder'] input:checked").each(function(){
						var theFileName = $(this).next().text();
						var theType = $(this).parent().parent().parent().data('type');
						if(theFileName && $(".left-ul li[data-name='"+theFileName+"']").length == 0) 
							$(".left-ul").append("<li data-name='"+theFileName+"'><i onclick='del(this);' class='icon-trash'></i><span>"+theFileName+"</span><span class='badge pull-right'>"+theType+"</span></li>");
					});
				}
			}
		});
	});

	$("input.fifthCtr").each(function(){
		var theCtr = $(this).attr("mode");
		var ref = $(this).parent().parent().parent().attr('ref');
		var fileName = $(this).next().text();
		$(this).bind('click',function(){
			if(theCtr && ref){
				if(!$(this)[0].checked){
					$("li[data-name='"+ref+"'][mode='metaObjectChild'] input")[0].checked = false;
					$("li[data-ctr='"+theCtr+"'][ref='"+ref+"'] input.fourCtl")[0].checked = false;
					$(".left-ul li[data-name='"+fileName+"']").remove();
					$(".left-ul li[data-name='"+ref+"']").remove();
					$("li[ref='"+ref+"'][mode!='metaObjectChild'][mode!='detailFolder'] input:checked").each(function(){
						var theFileName = $(this).next().text();
						var theType = $(this).parent().parent().parent().data('type');
						if(theFileName && $(".left-ul li[data-name='"+theFileName+"']").length == 0) 
							$(".left-ul").append("<li data-name='"+theFileName+"'><i onclick='del(this);' class='icon-trash'></i><span>"+theFileName+"</span><span class='badge pull-right'>"+theType+"</span></li>");
					});
				}else{
					var addFile = $(".left-ul li[data-name='"+fileName+"']");
					var theType = $(this).parent().parent().parent().data('type');
					if(!addFile || addFile.length == 0){
						$(".left-ul").append("<li data-name='"+fileName+"'><i onclick='del(this);' class='icon-trash'></i><span>"+fileName+"</span><span class='badge pull-right'>"+theType+"</span></li>");
					}
					var folderChildLength = $("li[ref='"+ref+"'][mode='"+theCtr+"']").length;
					var selectChild = $("li[ref='"+ref+"'][mode='"+theCtr+"'] input:checked").length;
					if(folderChildLength == selectChild) $("li[data-ctr='"+theCtr+"'][ref='"+ref+"'] input")[0].checked = true;

					var folderLength = $("li[mode='detailFolder'][ref='"+ref+"']").length;
					var selectFolderLength = $("li[mode='detailFolder'][ref='"+ref+"'] input:checked").length;
					if(folderLength == selectFolderLength){
						var theType = $("li[data-name='"+ref+"'][mode='metaObjectChild']").data('type');
						if($(".left-ul li[data-name='"+ref+"']").length == 0)
							$(".left-ul").append("<li data-name='"+ref+"'><i onclick='del(this);' class='icon-trash'></i><span>"+ref+"</span><span class='badge pull-right'>"+theType+"</span></li>");
						$("li[data-name='"+ref+"'][mode='metaObjectChild'] input")[0].checked = true;
						$("li[ref='"+ref+"'][mode!='metaObjectChild'][mode!='detailFolder']").each(function(){
							var theFileName = $(this).find('em').text();
							if(theFileName) $(".left-ul li[data-name='"+theFileName+"']").remove();
						});
					}
				}
			}
		});
	});

	$("input[mode='metaObjectAllCheck']").each(function(){
		var ref=$(this).parent().parent().parent().attr('ref');
		$(this).bind('click',function(){
			if(ref){
				if($(this)[0].checked){
					$("input[ref='"+ref+"'][mode='metaFile']").each(function(){
						$(this)[0].checked=true;
						var fileName = $(this).next().text();
						var theType = $(this).parent().parent().parent().data('type');
						var addFile = $(".left-ul li[data-name='"+fileName+"']");
						if(!addFile || addFile.length == 0){
							$(".left-ul").append("<li data-name='"+fileName+"'><i onclick='del(this);' class='icon-trash'></i><span>"+fileName+"</span><span class='badge pull-right'>"+theType+"</span></li>");
						}
					});
					$("li[ref='"+ref+"'] input").each(function(){
						$(this)[0].checked = true;
					});
					$("li[data-root='"+ref+"'] input").each(function(){
						$(this)[0].checked = true;
					});
				}else{
					$("input[ref='"+ref+"'][mode='metaFile']").each(function(){
						$(this)[0].checked=false;
						var fileName = $(this).next().text();
						$(".left-ul li[data-name='"+fileName+"']").remove();
					});
					$("li[ref='"+ref+"'] input").each(function(){
						$(this)[0].checked = false;
						var fileName = $(this).next().text();
						$(".left-ul li[data-name='"+fileName+"']").remove();
					});
					$("li[data-root='"+ref+"'] input").each(function(){
						$(this)[0].checked = false;
						var fileName = $(this).next().text();
						$(".left-ul li[data-name='"+fileName+"']").remove();
					});
				}
			}
		});
	});

	$("input[mode='metaFile']").each(function(){
		var ref = $(this).attr('ref');
		$(this).bind('click',function(){
			if(ref){
				var fileName = $(this).next().text();
				if($(this)[0].checked){
					var addFile = $(".left-ul li[data-name='"+fileName+"']");
					if(!addFile || addFile.length == 0){
						var theType = $(this).parent().parent().parent().data('type');
						$(".left-ul").append("<li data-name='"+fileName+"'><i onclick='del(this);' class='icon-trash'></i><span>"+fileName+"</span><span class='badge pull-right'>"+theType+"</span></li>");
					}
					$("li[ref='"+fileName+"'][mode='detailFolder'] input.fourCtl").each(function(){
						$(this)[0].checked = true;
						var theCtr = $(this).parent().parent().parent().data('ctr');
						$("li[ref='"+fileName+"'][mode='"+theCtr+"'] input.fifthCtr").each(function(){
							$(this)[0].checked = true;
							var fifthFileName = $(this).next().text();
							$(".left-ul li[data-name='"+fifthFileName+"']").remove();
						});
					});
				}else{
					var rootEl = $("li[ref='"+ref+"'][mode='metaObject'] input:checked");
					if(rootEl.length > 0) rootEl[0].checked = false;
					$(".left-ul li[data-name='"+fileName+"']").remove();
					$("li[ref='"+fileName+"'][mode='detailFolder'] input.fourCtl").each(function(){
						$(this)[0].checked = false;
						var theCtr = $(this).parent().parent().parent().data('ctr');
						$("li[ref='"+fileName+"'][mode='"+theCtr+"'] input.fifthCtr").each(function(){
							$(this)[0].checked = false;
						});
					});
				}
			}
		});
	});

	$('.sfconn-syncFile').bind('click',function(){
		var accId = $("#sfconnId").val();
		$.post("/sfconn/syncFile/"+accId).done(function (data) {
			if("done" == data){
				location.reload(true);
			}else{
				alert(data);
			}	
		});
	});

	$("#newCSSaveBtn").bind('click',function(){
		var selectFiles = [];
		var csName = $("#changeSetName").val();
		if($("input[mode='metaFile']:checked").length==0 && $("input.fifthCtr:checked").length == 0){
			$("#warning").children().text("No file checked.");
			$("#warning").show();
			$("#warning").fadeOut(3000);
		}else{
			$("input[mode='metaFile']:checked").each(function(){
				var orimetaName = $(this).parent().parent().parent().data('origin_ref');
				var metaName = $(this).parent().parent().parent().attr('ref');
				var fileName = $(this).next().text().trim();
				selectFiles.push({
					fileName : fileName,
					metaName : orimetaName,
					fixedMetaName : metaName
				}); 
			});
			$("input.fifthCtr:checked").each(function(){
				var metaName = $(this).data('metaname');
				var ref = $(this).parent().parent().parent().attr('ref');
				var mode = $(this).attr('mode');
				var fixedMetaName = $("li[ref='"+ref+"'][data-ctr='"+mode+"'] span.folder").text();
				var fileName = $(this).next().text().trim();
				if($("li[mode='metaObjectChild'][data-name='"+ref+"'] input:checked").length == 0){
					selectFiles.push({
						fileName : fileName,
						metaName : metaName,
						fixedMetaName : fixedMetaName
					}); 
				}
			});
		}
		if(csName =='' || csName == null){
			$("#warning").children().text("Please fill up the Changeset name");
			$("#warning").show();
			$("#warning").fadeOut(3000);
		}
		if(selectFiles.length > 5000){
			$("#warning").text("Too many files checked( >5000 ).");
			$("#warning").show();
			$("#warning").fadeOut(3000);
		}
		if(selectFiles && selectFiles.length>0 && selectFiles.length <= 5000 && csName!='' && csName != null){
			var req_url = "/sfconn/"+$("#sfconnId").val()+"/changeSets";
			if(location.search.indexOf('csId')>-1){
				req_url += location.search;
			}
			$.post(req_url,{
				selectFiles : selectFiles,
				csName : $("#changeSetName").val()
			},function(data){
				if("done"==data.message){
					window.open("/sfconn/"+$("#sfconnId").val()+"/changeSets/"+data.csId,"_self");
				}else{
					$("#errMessage").text("ERROR! "+data.message);
					$("#errMessage").show();
				}
			});
		}
	});

	$("#searchFile").bind('keyup',function(){
		var str = $(this).val().trim().toLowerCase();
		if($("li[ref]").length > 0 ){
			if(str){
				$("li[ref]").hide();
				$("li[mode='metaObjectChild']").each(function(){
					var fileName = $(this).data('name').trim().toLowerCase();
					if(fileName && fileName.indexOf(str)>-1){
						$(this).show();
					}
				});
				$("input.fifthCtr").each(function(){
					var fileName = $(this).next().text().trim().toLowerCase();
					if(fileName && fileName.indexOf(str)>-1){
						$(this).parent().parent().parent().show();
					}
				});
			}else{
				$("li[mode='metaObject']").show();
				$("ul.right-ul li[mode!='metaObject']").hide();
				$("li[mode='metaObject'] i.icon-minus-sign").addClass('icon-plus-sign').removeClass('icon-minus-sign');
				$("li[mode='metaObjectChild'] i.icon-sort-down").addClass('icon-caret-right').removeClass('icon-sort-down');
			}
		}
	});

});


$(document).ready(function(){
	$("li[mode='metaObjectChild'] input:checked").each(function(){
		var name = $(this).parent().parent().parent().data('name');
		$("li[ref='"+name+"'] input").each(function(){
			$(this)[0].checked = true;
		});
		$("li[ref='"+name+"'][mode!='detailFolder'] em").each(function(){
			var fileName = $(this).text();
			$(".left-ul li[data-name='"+fileName+"'] span").html("<s>"+fileName+"</s>");
		});
	});
});

$(document).ready(function(){
	setInterval(checkCSFileSync,1000*5);
});

function selectfile(obj){
	if (!/\.csv$/ig.test(obj.value)){
		alert('only csv file!');
		$(obj).val('');
		return false;
	}
}

var checkCSFileSync = function(){
	var sfconnId = $("#sfconnId").val();
	var q = {
		checkType : 'Account'
	};
	q.checkIds = sfconnId;
	if($("i.icon-spin.icon-refresh").length > 0){
		$.get("/checkStatus",q).done(function(data){
			if(data && data.length == 1){
				location.reload(true);
			}
		});
	}
};


var del = function(el){
	var fileName = $(el).next().text();
	var theType = $(el).next().next().text();
	$(el).parent().remove();
	$(".right-ul li[data-name='"+fileName+"'][data-type='"+theType+"'] input").trigger('click');
}