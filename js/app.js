var $container = $('#container'),
	$albumChoose = $('#albumChoose'),
	$friendsChoose = $('#friendsChoose'),
	$blackout = $('#blackout'),
	$dots = $('#dots'),
	$loader = $('#loader'),
	$loadingAlbums = $('#loadingAlbums'),
	accessToken;	

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
		if(!res.albums){alert('connection error'); return;}
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
	});
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
// Facebook connect
// $(document).ready(function() {
// 	$.ajaxSetup({ cache: true });
// 	$.getScript('//connect.facebook.net/en_US/'+(productionState ? 'sdk.js' : 'sdk/debug.js'), function(){
// 		FB.init({
// 			appId	: (productionState ? '640362006115757' : '640370879448203'), //production and test
// 			xfbml	: true,
// 			status	: true,
// 			cookie	: true,
// 			version	: 'v2.6'
// 		});
// 		FB.getLoginStatus( function(response) {
// 			if (response.status === 'connected') { appInit(response);} // User connected to fb and app
// 			else{ $loader.hide(); $('#fbLoginBtn').show(); } //not connected, show login
// 		});
// 	});
// });
  window.fbAsyncInit = function() {
    FB.init({
      appId      : (productionState ? '640362006115757' : '640370879448203'), //production and test
      xfbml      : true,
      version    : 'v2.6'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>