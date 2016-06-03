//-------PROTOTYPES------
Array.prototype.swap = function(a, b){ // Intercambia dos items de un array
	var tmp = this[a]; this[a] = b; this[b] = tmp;
};
Array.prototype.shuffle = function(start, end){ // Desordena una parte o todo de un array
	if(typeof start == "undefined") {start = 0;}
	if(typeof end == "undefined") {end = this.length - 1;}
	for (var i = start, j, tmp; i < end; i++) {
		j = Math.floor(Math.random() * (end - i)) + i + 1;
		tmp = this[i];
		this[i] = this[j];
		this[j] = tmp;
	}
};

//--------HELPERS---------
//Reemplaza 'http' por 'https' y modifica o agrega 's320x320'
function modUrl(url,size){ //size: s320x320 ó p200x200
	url = url.replace('/^https?\:/', '');
	if(url.search(/\/(s|p)\d{3}x\d{3}\//) != -1) {url = url.replace(/\/(s|p)\d{3}x\d{3}\//, "/"+size+"/");}
	else{url = url.replace(/\/(?!.*\/)/, "/"+size+"/");}
	return url;
}
//Movimiento de Foto
function transition(x,y,r){
	Dimg.style.left = x + "px";
	Dimg.style.top = y + "px";
	Dimg.style.transform = "rotate("+r+"deg)";
	Dimg.style.webkitTransform = "rotate("+r+"deg)";
}
