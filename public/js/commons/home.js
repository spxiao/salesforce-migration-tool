"use strict";


$(document).ready(function(){
	$(".homebg").css("height",$(window).height()-124);
	$(window).bind('resize',function(){
		$(".homebg").css("height",$(window).height()-124);
	});
});