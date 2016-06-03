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
