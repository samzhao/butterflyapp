$(function(){
	$('div h1').html("Width " + window.innerWidth + ", " + "Height " + window.innerHeight);
	window.onresize = function(){
		$('div h1').html("Width " + window.innerWidth + ", " + "Height " + window.innerHeight);
	};
});