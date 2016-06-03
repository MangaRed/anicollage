//--------FUNCIONES DE LOS  CONTROLES---------
function play() {
	Dimg.addEventListener('transitionend', newPic, false);
	transition(Xfin,Yfin,Rotfin);
}
function pause () {
	Dimg.removeEventListener('transitionend', newPic, false);

	//Aplicar posicion
	Dimg.style.left = window.getComputedStyle(Dimg).getPropertyValue('left');
	Dimg.style.top = window.getComputedStyle(Dimg).getPropertyValue('top');

	//Calcular rotacion y aplicar
	if(window.getComputedStyle(Dimg).getPropertyValue('transform')){
		var i = window.getComputedStyle(Dimg).getPropertyValue('transform').match(/\(([^,]+), ?([^,]+),/);
	}else{
		var i = window.getComputedStyle(Dimg).getPropertyValue('-webkit-transform').match(/\(([^,]+), ?([^,]+),/);
	}
	var rot = Math.round(Math.atan2(i[2], i[1]) * (180/Math.PI));	
	Dimg.style.transform = "rotate("+rot+"deg)";
	Dimg.style.webkitTransform = "rotate("+rot+"deg)";

	//Calcular tiempo restante
	var Trest = (3*(Yfin - parseFloat(Dimg.style.top)) / (Yfin - Yini)).toFixed(2);
	Dimg.style.transition = 'transform '+Trest+'s, left '+Trest+'s, top '+Trest+'s';
	Dimg.style.webkitTransition = '-webkit-transform '+Trest+'s, left '+Trest+'s, top '+Trest+'s';
}
function restart () {
	$container.empty();
	n=0;
	list.shuffle();
	extendList();
}
function fullScreen () {
	if (document.documentElement.requestFullscreen) {document.documentElement.requestFullscreen();}
	else if (document.documentElement.mozRequestFullScreen) {document.documentElement.mozRequestFullScreen();}
	else if (document.documentElement.webkitRequestFullscreen) {document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);}
}
function normalScreen(){
	if (document.cancelFullScreen) {document.cancelFullScreen();}
	else if (document.mozCancelFullScreen) {document.mozCancelFullScreen();}
	else if (document.webkitCancelFullScreen) {document.webkitCancelFullScreen();}	
}
function polaroid () {document.body.classList.add('showPolaroid');}
function noPolaroid () {document.body.classList.remove('showPolaroid');}