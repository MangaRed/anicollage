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