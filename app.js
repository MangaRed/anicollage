var $container = $('#container'),
	$albumChoose = $('#albumChoose'),
	$friendsChoose = $('#friendsChoose'),
	$blackout = $('#blackout'),
	$dots = $('#dots'),
	$loader = $('#loader'),
	$loadingAlbums = $('#loadingAlbums'),
	accessToken;	

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
	url = url.replace('/http:\/\//', '//');
	if(url.search(/\/s\d{3}x\d{3}\//) != -1) {url = url.replace(/\/s\d{3}x\d{3}\//, "/"+size+"/");}
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
	Superlist();
}
function fullScreen () {
	if (document.documentElement.requestFullscreen) {document.documentElement.requestFullscreen();}
	else if (document.documentElement.mozRequestFullScreen) {document.documentElement.mozRequestFullScreen();}
	else if (document.documentElement.webkitRequestFullscreen) {document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);}
	fullScreenBtn_isNormal();
}
function normalScreen(){
	if (document.cancelFullScreen) {document.cancelFullScreen();}
	else if (document.mozCancelFullScreen) {document.mozCancelFullScreen();}
	else if (document.webkitCancelFullScreen) {document.webkitCancelFullScreen();}	
	fullScreenBtn_is();
}
function polaroid () {
	//canvas = document.styleSheets[0]['cssRules'][1]
	//img = document.styleSheets[0]['cssRules'][2]
	$(this).css('pointer-events','none');
	document.styleSheets[0]['cssRules'][2].style.display = "none";
	document.styleSheets[0]['cssRules'][1].style.display = "block";
	polaroidBtn_isNormal();
	$(this).css('pointer-events','auto');
}
function noPolaroid () {
	$(this).css('pointer-events','none');
	document.styleSheets[0]['cssRules'][1].style.display = "none";
	document.styleSheets[0]['cssRules'][2].style.display = "block";
	polaroidBtn_is();
	$(this).css('pointer-events','auto');
}
//---funciones de Album Choose---
var nAlPic = 0;
var listAlchecked = new Array();
function albumSelected(event){
	var current = event.currentTarget;
	if (listAlchecked[current.id.slice(1)] == 0){
		current.children[1].setAttribute('class', 'albumSelected');
		listAlchecked[current.id.slice(1)] = 1;
	}else{
		current.children[1].setAttribute('class', 'albumNotSelected');
		listAlchecked[current.id.slice(1)] = 0;
	}
}
function FchooseAccept(){
	listTmp = new Array();
	for (var i = 0; i < listAlchecked.length; i++) {
		if(listAlchecked[i]==1){
			for (var j = 0; j < fbList[i][3].length; j++) {
				listTmp.push(fbList[i][3][j]);
			}
		}
	}
	if(listTmp.length==0){alert("Debes seleccionar al menos un album");}
	else{
		$container.empty();
		n=0;
		list = listTmp;
		list.shuffle(); //Desordena la lista
		Superlist();
		$blackout.hide();
		$albumChoose.hide();
	}
}
function FchooseCancel () {
	$blackout.hide();
	$albumChoose.hide();
	play();
}
var dimgAl;
var newFriend = 1;
var onInit = true;
function loadAlbumChoose(){
	//Agregar imagen anterior como fondo, para poder acomodarla
	if(nAlPic>0 && nAlPic<=fbList.length){dimgAl.style.backgroundImage = 'url("'+fbList[nAlPic-1][2]+'")';}

	if(nAlPic < fbList.length){
		//Contenedor
		var DimgAl = document.createElement("div");
		DimgAl.setAttribute('id','a'+nAlPic);
		DimgAl.setAttribute('class','divPhoto');
		DimgAl.addEventListener('click', albumSelected, false);
		
		// Imagen de Album (como fondo)
		dimgAl = document.createElement("div");
		DimgAl.appendChild(dimgAl);

		//Capa oscura (T)ransparente para no escojer album
		TimgAl = document.createElement("div");
		if(nAlPic < fbList.length-2) {
			TimgAl.setAttribute('class','albumSelected');
			listAlchecked[nAlPic] = 1;
		}else{
			TimgAl.setAttribute('class','albumNotSelected');
			listAlchecked[nAlPic] = 0;
		}
		DimgAl.appendChild(TimgAl);

		//Solo cargar la imagen, no agregarla
		var imgAl = document.createElement("img");
		imgAl.addEventListener('load', loadAlbumChoose, false);
		imgAl.addEventListener('error', loadAlbumChoose, false);
		imgAl.src = fbList[nAlPic][2];
		
		//Nombre del Album (caption)
		var imgAlName = document.createElement("span");
		imgAlName.innerHTML = fbList[nAlPic][1];
		DimgAl.appendChild(imgAlName);
		
		$albumChoose.append(DimgAl);
	}else{
		//Crear botones Aceptar y Cancelar
		var DchooseAccept = document.createElement("div");

		var chooseAccept = document.createElement("div");
		chooseAccept.setAttribute('class','BtnChoose');
		chooseAccept.innerHTML ="Aceptar"
		chooseAccept.addEventListener('click', FchooseAccept, false);
		
		var chooseCancel = document.createElement("div");
		chooseCancel.setAttribute('class','BtnChoose');
		chooseCancel.innerHTML ="Cancelar"
		chooseCancel.addEventListener('click', FchooseCancel, false);
		
		DchooseAccept.appendChild(chooseAccept);
		DchooseAccept.appendChild(chooseCancel);
		$albumChoose.append(DchooseAccept);

		// Continuar con la carga de la lista de amigos(solo la primera vez)
		if(onInit){onInit=false; getFriendList();}
	}
	nAlPic++;
}
function filterAlbum () {
	if ($albumChoose.is(":hidden")){
		if($friendsChoose.is(":visible")){$friendsChoose.hide();}
		pause();
		$blackout.show();
		$albumChoose.show();
	}else {
		$blackout.hide();
		$albumChoose.hide();
		play();
	}
}

//---funciones de Friends Choose---
var nFr = 0; //Nº de amigo(friend) (0 = usuario)
var nFrSelected = 0;
function friendSelected(event){
	var current = event.currentTarget;
	if (current.id.slice(1) != nFrSelected){
		current.children[1].setAttribute('class', 'albumSelected');
		document.getElementById('f'+nFrSelected).children[1].setAttribute('class', 'albumNotSelected');
		nFrSelected = parseInt(current.id.slice(1));
	}
}
var fbListSaved = false;
function FfriendsAccept(){

	$blackout.hide();
	$friendsChoose.hide();

	$container.empty();
	n=0;
	nAl = 0;
	list = new Array();

	//Reiniciar variables de loadAlbumChoose
	$albumChoose.empty();
	nAlPic = 0;
	listAlchecked = new Array();
	newFriend = 1;

	//Comprobar si fbList del amigo esta grabado
	fbListSaved = false;
	for (var i = 0; i < AllFbList.length; i++) {
		if(AllFbList[i].id == friendList[nFrSelected][0]){
			fbList = AllFbList[i].fbList;
			fbListSaved = true;
			break;
		}
	}

	if(fbListSaved){
		makelist();
	}else{
		$loader.show();
		$loadingAlbums.hide();
		fbList = new Array();
		appInit();
	}
}
function FfriendsCancel () {
	$blackout.hide();
	$friendsChoose.hide();
	play();
}

//Hacer lista de amigos
var friendList = new Array();
friendList[0] = new Array(); //1º amigo es el usuario, aun no se consigue el id
friendList[0][1] = 'Yo';
function getFriendList(){
	FB.api('me/friends?fields=name,id&limit=5000',  function(friendsJSON) {
				for (var i=0; i < friendsJSON.data.length; i++){
					friendList[i+1] = new Array();
					friendList[i+1][0] = friendsJSON.data[i].id;
					friendList[i+1][1] = friendsJSON.data[i].name;
				}
				loadFriendsChoose();
		});
}
var dimgFr;
function loadFriendsChoose () {
		//Agregar imagen anterior como fondo, para poder acomodarla
	if(nFr>0 && nFr<=friendList.length){dimgFr.style.backgroundImage = 'url("https://graph.facebook.com/'+friendList[nFr-1][0]+'/picture?width=100&height=100")';}
	if(nFr < friendList.length){
		//Contenedor
		var DimgFr = document.createElement("div");
		DimgFr.setAttribute('id','f'+nFr);
		DimgFr.setAttribute('class','divPhoto');
		DimgFr.addEventListener('click', friendSelected, false);
		
		// Imagen de Album (como fondo)
		dimgFr = document.createElement("div");
		DimgFr.appendChild(dimgFr);

		//Capa oscura (T)ransparente para no escojer amigo
		TimgAl = document.createElement("div");
		if(nFr == 0) {TimgAl.setAttribute('class','albumSelected');}
		else {TimgAl.setAttribute('class','albumNotSelected');}
		DimgFr.appendChild(TimgAl);

		//Solo cargar la imagen, no agregarla
		var imgFr = document.createElement("img");
		imgFr.addEventListener('load', loadFriendsChoose, false);
		imgFr.addEventListener('error', loadFriendsChoose, false);
		imgFr.src = 'https://graph.facebook.com/'+friendList[nFr][0]+'/picture?width=100&height=100';
		// 'https://graph.facebook.com/'+friendList[nFr][0]+'/picture?type=square'; //(50x50)
		
		//Nombre del Album (caption)
		var imgFrName = document.createElement("span");
		imgFrName.innerHTML = friendList[nFr][1];
		DimgFr.appendChild(imgFrName);
		
		$friendsChoose.append(DimgFr);
	}else{
		//Crear botones Aceptar y Cancelar
		var DchooseAccept = document.createElement("div");

		var chooseAccept = document.createElement("div");
		chooseAccept.setAttribute('class','BtnChoose');
		chooseAccept.innerHTML ="Aceptar"
		chooseAccept.addEventListener('click', FfriendsAccept, false);
		
		var chooseCancel = document.createElement("div");
		chooseCancel.setAttribute('class','BtnChoose');
		chooseCancel.innerHTML ="Cancelar"
		chooseCancel.addEventListener('click', FfriendsCancel, false);
		
		DchooseAccept.appendChild(chooseAccept);
		DchooseAccept.appendChild(chooseCancel);
		$friendsChoose.append(DchooseAccept);
	}
	nFr++;
}

function friends () {
	if ($friendsChoose.is(":hidden")){
		if($albumChoose.is(":visible")){$albumChoose.hide();}
		pause();
		$('#controls').css('background-color','rgba(0, 0, 0, 0.6)');
		$blackout.show();
		friendsChoose.show();
	}else {
		$('#controls').css('background-color','');
		$blackout.hide();
		friendsChoose.hide();
	}
}

//---PASOS(COMIENZO)---
//Se ejecuta despues de que el  usuario se haya conectado a facebook
function login(){
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {appInit(response);} // User connected to fb and app
		else { // status = not autorized
			FB.login( function(response) { // Mostrar dialogo de permisos
				if (response.authResponse) {appInit(response);}
			}, {scope: 'user_photos,friends_photos'});
		}
	});
}

//Saca albums
var AllFbList = new Array(); //Guardará todos los fbList descargados, para no volverlos a cargar
var fbList = new Array();
function appInit(response){
	$('#fbLoginBtn').hide(); 
	$loader.show();
	friendList[0][0] = response.authResponse.userID;
	accessToken = response.authResponse.accessToken;
	FB.api( '/' + friendList[nFrSelected][0] + '/albums?fields=name,id,cover_photo',  function(albums) {
		for (var i=0; i < albums.data.length; i++){
			fbList[i] = [albums.data[i].id, albums.data[i].name, albums.data[i].cover_photo];
		}
		$loader.hide();
		$loadingAlbums.show();
		$('#infoLoad2').text(albums.data.length);
		//Ordenar lista de albums: [Profile, 2,3,4..., Timeline, Cover]
		var i0, i1, i2;
		$.each(fbList, function (i, v) {
			if(v[1]=='Profile Pictures'){i0 = i;}
			else if(v[1]=='Timeline Photos'){i1 = i;}
			else if(v[1]=='Cover Photos'){i2 = i;}
		})
		fbList.swap(i0, 0);
		fbList.swap(i1, fbList.length-2);
		fbList.swap(i2, fbList.length-1);

		// getPhotos('/photos?fields=id,source,width,height&limit=25');
	});
}
//Saca fotos
var nAl = 0;
function getPhotos(urlParams){
	if(nAl < fbList.length){
		FB.api('/'+fbList[nAl][0]+urlParams, function(photos){
			if (photos && photos.data && photos.data.length){
				if(!fbList[nAl][3]) {fbList[nAl][3] = new Array();}
				var le = fbList[nAl][3].length;
				for (j = 0; j < photos.data.length; j++){
					if(fbList[nAl][2] == photos.data[j].id){fbList[nAl][2] = modUrl(photos.data[j].source,"p100x100");}
					fbList[nAl][3][le+j] = new Array();
					fbList[nAl][3][le+j][0] = modUrl(photos.data[j].source,"s320x320");
					if(photos.data[j].width >= photos.data[j].height){
						fbList[nAl][3][le+j][1] = 320;
						fbList[nAl][3][le+j][2] = Math.floor((320/photos.data[j].width)*photos.data[j].height);
					}else{
						fbList[nAl][3][le+j][1] = Math.floor((320/photos.data[j].height)*photos.data[j].width);
						fbList[nAl][3][le+j][2] = 320;
					}
				}
				if(photos.paging && photos.paging.next){
					getPhotos('/photos?fields=id,source,width,height&limit=25&after='+photos.paging.cursors.after);
				}else{
					nAl++;
					$('#infoLoad1').text(nAl);
					getPhotos('/photos?fields=id,source,width,height&limit=25');
				}
			}else{
				if(photos.data.length==0){ // Si no hay fotos borrar el album
					fbList.splice(nAl,1); 
					nAl--;
					$('#infoLoad2').text(parseInt(albums.data.length)-1);
				}
				nAl++;
				$('#infoLoad1').text(nAl);
				getPhotos('/photos?fields=id,source,width,height&limit=25');
			}
		});
	}
	else{
		if(newFriend == 1 && !fbListSaved) {AllFbList.push({ fbList:fbList, id:friendList[nFrSelected][0], name:friendList[nFrSelected][1] });}
		makelist();
	}
}

//Crea la lista de fotos
var list = new Array();
function makelist(){
	for (var i = 0; i < fbList.length - 2; i++) {
			for (var j = 0; j < fbList[i][3].length; j++) {
				list.push(fbList[i][3][j]);
			};
		};
		list.shuffle(); //Desordena la lista
		Superlist();
}

//Genera posicion y rotacion final
var n = 0; //numero de foto 0
function Superlist(){
	var cw = -1; //multiplicador de rotacion(hacia la derecha= -1, hacia la izq = 1)(ClockWise)
	var maxfilas = Math.floor(window.innerHeight/300);
	var fila = 1; //numero de fila
	var entre = 0; //entre, distancia en que se juntan las fotos
	var n0 = 0; //el numero de la primera foto de una nueva capa
	var Y = Math.floor((window.innerHeight%300)/2); //posicion Y final (comienza en la foto 1)
	var X = -entre/2; //posicion X final (comienza en la foto 1)
	while(n<list.length){ //genera las posiciones X Y finales de cada foto
		var Rotfin = (Math.floor(Math.random()*20) + 5)*cw; // Genera rotacion de (-25 a -5)  o de (5 a 25)
		list[n][3] = X; list[n][4] = Y; list[n][5] = Rotfin; //Guarda posicion y rotacion
		n++; X += list[n-1][1] - entre; cw = -cw; //Prepara para la siguiente foto
		if(n<list.length-1){ //hasta la penultima foto
			if (X + list[n][1] - entre > window.innerWidth){ //Si se llena una fila de fotos
				X = -entre/2;
				Y += 300 - entre/2;
				fila++;
			}
			if (fila > maxfilas) { //Nueva capa de fotos
				fila = 1; Y = Math.floor((window.innerHeight%300)/2);
				list.shuffle(n0, n-1); //Desordena solo la capa actual
				n0 = n;
			}
		}else{ list.shuffle(n0, n-1); // ultima foto
		}
	}
	n = 0;
	$loader.hide();
	$loadingAlbums.hide();
	if ( !$('#play').hasClass('paused') ) {playBtn_isPause();}
	$('#restart').show();
	$('#friends').show();
	newPic();
	// Cargar cover de albums para escojer por primera vez y por cada amigo
	if(newFriend == 1) { loadAlbumChoose(); newFriend = 0; }
	$('#filterAlbum').show();

}
var context, Dimg, img, Xini, Xfin, Yini, Yfin, Rotfin;
function newPic(event){
	if(n < list.length && (n==0 || event.propertyName == "left" || event.type == "error")){
		//Variables
		Rotfin = list[n][5];
		var CW = Rotfin/Math.abs(Rotfin); //Clockwise = 1, CCW = -1
		var Rotini = Rotfin - 20*CW;
		Xfin = list[n][3];
		Xini = Xfin - 300*CW;
		Yfin = list[n][4];
		Yini = Yfin - window.innerHeight - 50;

		//Insertar contenedor de imagen
		Dimg = document.createElement('div');
		Dimg.style.left = Xini + "px";
		Dimg.style.top = Yini + "px";
		Dimg.style.width = list[n][1] + "px";
		Dimg.style.height = list[n][2] + "px";
		Dimg.style.transform = "rotate("+Rotini+"deg)";
		Dimg.style.webkitTransform = "rotate("+Rotini+"deg)";
		Dimg.addEventListener('transitionend', newPic, false);

		//Insertar canvas (polaroid)
		var canvas = document.createElement('canvas');
		canvas.width=300;
		canvas.height=360;
		context = canvas.getContext('2d');
		context.fillStyle="#EEE";
		context.fillRect(0,0,300,360);

		//Insertar imagen
		img = new Image();
		img.addEventListener('load', onLoadImg, false);
		img.addEventListener('error', newPic, false);
		img.src = list[n][0];

		Dimg.appendChild(canvas);
		Dimg.appendChild(img);
		$container.append(Dimg);

		//Avance
		n++;
	}
}
function onLoadImg(){
	var w = Math.min(img.width,img.height);
	var x = Math.floor((img.width - w )/2);
	var y = Math.floor((img.height - w)/4);
	context.drawImage(img,x,y,w,w,20,20,260,260);
	transition(Xfin,Yfin,Rotfin);
}
// ----------------- REG LISTENERS------------------
$('#toggleControls').click( function () {
	var classes = document.body.classList;
	if (classes.contains('showControls')) {  // go close
		this.dataset.title = 'Open controls';
		classes.remove('showControls');
	}else { // go open
		this.dataset.title = 'Close controls';
		classes.add('showControls'); 
	}
});
$('#play').click( function () {
	this.style.pointerEvents = 'none';
	if (this.classList.contains('flipped')){ // go pause
		pause();
		this.dataset.title = 'Play animation';
		this.classList.remove('flipped'); 
	} else { // go play
		play();
		this.dataset.title = 'Pause animation';
		this.classList.add('flipped'); 
	}
	this.style.pointerEvents = 'auto';
});
$('#restart').click( function () {
	this.style.pointerEvents = 'none';
	restart();
	this.style.pointerEvents = 'auto';
});
$('#fullScreen').click( function () {
	this.style.pointerEvents = 'none';
	if (this.classList.contains('flipped')){ // go normal screen
		normalScreen();
		this.dataset.title = 'Exit fullscreen';
		this.classList.remove('flipped'); 
	} else { // go fullscreen
		fullScreen();
		this.dataset.title = 'Go fullscreen';
		this.classList.add('flipped'); 
	}
	this.style.pointerEvents = 'auto';
});
$('#polaroid').click( function () {
	this.style.pointerEvents = 'none';
	if (this.classList.contains('flipped')){ // go normal
		noPolaroid();
		this.dataset.title = 'Normal frame';
		this.classList.remove('flipped'); 
	} else { // go polaroid
		polaroid();
		this.dataset.title = 'Polaroid frame';
		this.classList.add('flipped'); 
	}
	this.style.pointerEvents = 'auto';
});
$('#filterAlbum').click( function () {
	this.style.pointerEvents = 'none';
	filterAlbum();
	this.style.pointerEvents = 'auto';
});
$('#friends').click( function () {
	this.style.pointerEvents = 'none';
	friends();
	this.style.pointerEvents = 'auto';
});
/
/--------------------EXECUTIONS---------------------
$(document).ready(function() {
	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/en_US/sdk.js', function(){
		FB.init({
			appId	: '100308213652145',
			xfbml	: false,
			status	: true,
			cookie	: true,
			version	: 'v2.4'
		});
		FB.getLoginStatus( function(response) {
			if (response.status === 'connected') { appInit(response);} // User connected to fb and app
			else{
				$loader.hide();
				$('#fbLoginBtn').show();
			}
		});
	});
});
