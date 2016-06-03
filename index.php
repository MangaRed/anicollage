<!DOCTYPE html>
<html>
<head>
<title>Animated Collage</title>
<meta charset="utf8">
<meta name="description" content="Collage of your facebook photos presented in a cool way">
<meta name="keywords" content="collage, animated, facebook, photos, friends">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="fb-root"></div>
<div id="container"></div>
<div id="blackout" style="display:none;"></div>
<div id="fbBtnWr">
	<div id="fbLoginBtn" class="fb-login-button" data-width="165" data-size="large" data-scope="user_photos,user_friends" data-show-faces="true" data-onlogin="login();" style="display:none;">Conectar con Facebook</div>
</div>
<div id="albumChoose" class="panelChoose" style="display:none"></div>
<div id="friendsChoose" class="panelChoose" style="display:none"></div>
<div id="controls" data-title="Open controls">
	<div id="play" data-title="Play animation" style="display:none;"></div>
	<div id="restart" data-title="Restart animation" style="display:none;"></div>
	<div id="fullScreen" data-title="Go fullscreen"></div>
	<div id="polaroid" data-title="Polaroid Frame"></div>
	<div id="filterAlbums" data-title="Pick album(s)" style="display:none;"></div>
	<div id="friends" data-title="Friends photos" style="display:none;"></div>
	<!-- <div id="edit" onclick="Fedit()"></div> -->
	<!-- <div id="upload" onclick="Fupload()"></div> -->
</div>
<div id="toggleControls"></div>
<div id="loader"></div>
<div id="loadingAlbums" style="display:none">Loaded <span id="infoLoad1">0</span> of <span id="infoLoad2">0</span> albums </div>
<script src="js/jquery-2.2.4.min.js"></script>
<script src="js/functions/helpers.js"></script>
<script src="js/functions/controls.js"></script>
<script src="js/functions/albumChoose.js"></script>
<script src="js/functions/friendChoose.js"></script>
<script src="js/app.js"></script>
</body>
</html>