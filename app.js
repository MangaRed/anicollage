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
		extendList();
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
	for (var i = 0; i < allFbList.length; i++) {
		if(allFbList[i].id == friendList[nFrSelected][0]){
			fbList = allFbList[i].fbList;
			fbListSaved = true;
			break;
		}
	}

	if(fbListSaved){
		makePhotoList();
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
var friendList = [ [ ] ]; //1º amigo es el usuario, aun no se consigue el id
friendList[0][1] = 'Me';
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
			}, {scope: 'user_photos, user_friends'});
		}
	});
}

//Saca albums
var allFbList = []; // to save all fbList downloaded
var fbList = []; // to save all albums and photo data
var nAl = 0; // number of album of photo data currently requesting
// var alParams = '/?fields=name,id,cover_photo, count, type&limit=25'; // to get albums
// var phParams = '/?fields=photos.limit(25){id,images,width,height}'; // to get photos
var alParams = {fields: 'albums.limit(25){name,id,cover_photo,count,type,picture}'}; // to get albums
var phParams = {fields: 'photos.limit(25){id,images,width,height}'}; // to get photos
function appInit(response){
	$('#fbLoginBtn').hide(); 
	$loader.show();
	friendList[0][0] = response.authResponse.userID;
	accessToken = response.authResponse.accessToken;
	window.firstGetAlbum = true;
	getAlbumsData(alParams);
}
function orderFbList () { // sort albums: [Profile, 2,3,4..., Timeline, Cover]
	var a, y, z, ar = [];
	$.each( fbList, function (i, v) {
		switch(v.type){
			case 'profile': a = v; break;
			case 'wall': y = v; break;
			case 'cover': z = v; break;
			default: if (v.count) {ar.push(v);}
		}
	});
	ar.unshift(a); ar.push(y,z);
	fbList = ar;
}
function getAlbumsData (params) {
	FB.api( '/' + friendList[nFrSelected][0], params,  function(res) {
		if(!res.albums){alert('connection error'); return;};
		res = res.albums;
		if(firstGetAlbum){
			firstGetAlbum = false;
			$loader.hide();
			$loadingAlbums.show();
		}
		$('#infoLoad2').text(Number($('#infoLoad2').text())+res.data.length);
		if (res.data && res.data.length){ 
			fbList = fbList.concat(res.data);
			if (res.paging && res.paging.next){ // next page
				var newAlParams = JSON.parse(JSON.stringify(alParams));
				newAlParams.after = res.paging.cursors.after;
				getAlbumsData(newAlParams);}
			else { // no more pages
				orderFbList();
				getPhotosData(phParams);
			}
		}
	});
}
function proccessPhotoData (data) {
	for (var i = 0, photo, ar, w, h; i < photos.data.length; i++){
		photo = data[i];
		//if it's album cover save url
		if (fbList[nAl].cover_photo.id == photo.id){
			fbList[nAl].cover_photo.src = modUrl(photo.source,"p100x100");}
		ar = {}; w = photo.width; h = photo.height;
		ar.src = modUrl(photo.source,"s320x320");
		//Resize photo size to fit 320x320
		if(w >= h){ar.width = 320; ar.height = Math.floor((320/w)*h);}
		else{ar.width = Math.floor((320/h)*w); ar.height = 320;}
		fbList[nAl].photos.push(ar); // save photo data to album item
	}
}
//Saca fotos
function getPhotosData(params){
	if(nAl < fbList.length){
		FB.api('/'+fbList[nAl].id, params, function(photos){
			// if(!res.albums){alert('connection error'); return;};
			// res = res.albums;
			// if (photos.data && photos.data.length){
			// 	if (!fbList[nAl].photos) {fbList[nAl].photos = [];} // if new photo request otherwise it's paging
			// 	proccessPhotoData(photos.data);
			// 	if (photos.paging && photos.paging.next){ // next page
			// 		getPhotosData(phParams+'&after='+photos.paging.cursors.after);
			// 	} else { // no more pages
			// 		$('#infoLoad1').text(++nAl);
			// 		getPhotosData(phParams);
			// 	}
			// } else {
			// 	$('#infoLoad1').text(++nAl);
			// 	getPhotosData(phParams);
			// }
		});
	} else {
		// if (newFriend == 1 && !fbListSaved) {
		// 	allFbList.push({ fbList:fbList, id:friendList[nFrSelected][0], name:friendList[nFrSelected][1] });
		// }
		// makePhotoList();
	}
}

//Crea la lista de fotos
var list = []; // to save photos data (url, width, height, final position x, y and rotation)
function makePhotoList(){
	for (var i = 0; i < fbList.length - 2; i++) { // Initially without two last albums
		for (var j = 0; j < fbList[i][3].length; j++) {
			list.push(fbList[i][3][j]);
		}
	}
	list.shuffle(); //Desordena la lista
	extendList();
}

//Genera posicion y rotacion final
function extendList(){
	var cw = -1; //multiplicador de rotacion(hacia la derecha= -1, hacia la izq = 1)(ClockWise)
	var maxfilas = Math.floor(window.innerHeight/300);
	var fila = 1; //numero de fila
	var entre = 0; //entre, distancia en que se juntan las fotos
	var n = 0; //numero de foto 0
	var n0 = 0; //el numero de la primera foto de una nueva capa
	var Y = Math.floor((window.innerHeight%300)/2); //posicion Y final (comienza en la foto 1)
	var X = -entre/2; //posicion X final (comienza en la foto 1)
	while ( n < list.length ){ //genera las posiciones X Y finales de cada foto
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
	$loader.hide();
	$loadingAlbums.hide();
	$('#play').each(function () {
		this.style.display = '';
		if ( !this.classList.contains('flipped') ) {this.dataset.title = 'Pause animation'; this.classList.add('flipped');}
	})
	$('#restart').show();
	$('#friends').show();
	newPic();
	// Cargar cover de albums para escojer por primera vez y por cada amigo
	// if(newFriend == 1) { loadAlbumChoose(); newFriend = 0; }
	$('#filterAlbum').show();

}
var context, Dimg, img, Xini, Xfin, Yini, Yfin, Rotfin;
var nPhoto = 0;
function newPic(event){
	// if(nPhoto < list.length && (nPhoto==0 || event.propertyName == "left" || event.type == "error")){
	if(nPhoto < list.length){
		//Variables
		Rotfin = list[nPhoto][5];
		var CW = Rotfin/Math.abs(Rotfin); //Clockwise = 1, CCW = -1
		var Rotini = Rotfin - 20*CW;
		Xfin = list[nPhoto][3];
		Xini = Xfin - 300*CW;
		Yfin = list[nPhoto][4];
		Yini = Yfin - window.innerHeight - 50;

		//Insertar contenedor de imagen
		Dimg = document.createElement('div');
		Dimg.style.left = Xini + "px";
		Dimg.style.top = Yini + "px";
		Dimg.style.width = list[nPhoto][1] + "px";
		Dimg.style.height = list[nPhoto][2] + "px";
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
		img.src = list[nPhoto][0];

		Dimg.appendChild(canvas);
		Dimg.appendChild(img);
		$container.append(Dimg);

		//Avance
		nPhoto++;
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
		this.dataset.title = 'Go fullscreen';
		this.classList.remove('flipped'); 
	} else { // go fullscreen
		fullScreen();
		this.dataset.title = 'Exit fullscreen';
		this.classList.add('flipped'); 
	}
	this.style.pointerEvents = 'auto';
});
$('#polaroid').click( function () {
	this.style.pointerEvents = 'none';
	if (this.classList.contains('flipped')){ // go normal
		noPolaroid();
		this.dataset.title = 'Polaroid frame';
		this.classList.remove('flipped'); 
	} else { // go polaroid
		polaroid();
		this.dataset.title = 'Normal frame';
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
//--------------------EXECUTIONS---------------------
$(document).ready(function() {
	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/en_US/sdk.js', function(){
		FB.init({
			appId	: '100308213652145',
			// appId	: '100543873628579', // Test app
			xfbml	: true,
			status	: true,
			cookie	: true,
			version	: 'v2.4'
		});
		FB.getLoginStatus( function(response) {
			if (response.status === 'connected') { appInit(response);} // User connected to fb and app
			else{ $loader.hide(); $('#fbLoginBtn').show(); }
		});
	});
});
