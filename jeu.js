///////////////////// VARIABLES
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom ); 

var i, j;
var u, uu, uuu;
var v;

////////////////////// FIN VARIABLES
window.addEventListener('load', init, false); // voir l'argument false ?


function resize(){
	height = window.innerHeight;
	width = window.innerWidth;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}


function init(){
	createScene();
	createLights();
	createSea();
	createGround();
	createSun();
	loadTree1();
	loop();
}

function loop(){ 
		requestAnimationFrame(loop);
	stats.begin();
	animateTree();
	sea.moveWaves();
	//render();
	//rayMouse();
	if(abc==1){
		cylinder.position.z -= 4
		cylinder.rotateY(0.01)
		//cylinder.lookAt(0,0,0)
	}
	vitesse();
	moveSun();
	mousePicker();
	//sea.mesh.geometry.dispose();

	renderer.render(scene, camera);

	stats.end();
	

}

function mousePicker(){

	
	var material = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});
	var rayO = new THREE.Vector3()
	rayO.setFromMatrixPosition( camera.matrixWorld );
	
	var dire = new THREE.Vector3()
	dire.set( mouse.x, mouse.y, 0.5 ).unproject( camera ).sub( rayO ).normalize(); // tester console.log le vecteur avec 0.5, 0 ,1

	var ray = new THREE.Ray(rayO, dire)
	console.log("debut")
	console.log(ray.direction.x)
	console.log(ray.direction.y)
	console.log(ray.direction.z)
	
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(rayO.x, rayO.y, rayO.z ),
		new THREE.Vector3(camera.position.x + dire.x*15000, camera.position.y + dire.y*15000, camera.position.z + dire.z*15000 )
	);

	var line = new THREE.Line( geometry, material );
	//scene.add( line );



}

var elem;
var cameraRotateX = 0;
var cameraRotateY = 0;
document.onmousemove = function vue(e){

	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
	
	camera.rotation.order = 'YXZ'; // default is 'XYZ'
	camera.rotateX(-e.movementY*0.2*Math.PI/180);
	camera.rotateY(-e.movementX*0.2*Math.PI/180);
	camera.rotation.z = 0;
	
	// usefull stuff ?? :
	//cameraRotateX -= e.movementX*0.5;
	//cameraRotateY -= e.movementY*0.5;

}

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var scene, fieldOfView, aspectRatio, height, width, nearPlane, farPlane, renderer, container;
function createScene(){
	height = window.innerHeight;
	width = window.innerWidth;

	scene = new THREE.Scene();

	scene.fog = new THREE.Fog(0xf7d9aa, 100, 15000);

	aspectRatio = width / height;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 15000;

	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

	camera.position.x = 0; // gauche/droite
	camera.position.z = 0; // profondeur
	camera.position.y = 1000; // hauteur

	renderer = new THREE.WebGLRenderer({ // voir tous les arguments existants
		alpha: true,
		antialias: true,
		//physicallyCorrectLights: true	
		//toneMapping: THREE.ReinhardToneMapping
		//cull: THREE.CullFaceFront
		shadowMap: THREE.PCFSoftShadowMap
	});

	renderer.setSize(width, height);
	renderer.shadowMap.enabled = true;

	container = document.getElementById('jeu'); // REMPLACER PAR JQUERY
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', resize, false); 
}

var hemisphereLight, shadowLight;
function createLights(){
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9); // VOIR .9 ET 0.9 ?
	//shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
	shadowLight = new THREE.PointLight(0xffffff, 1);
	shadowLight.shadow.bias = - 0.001;

	shadowLight.position.set(0, 0, 0);
	shadowLight.castShadow = true;

	/*shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	*/
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 10000;

	shadowLight.shadow.mapSize.width = 4096; // Resolution de l'ombre important !
	shadowLight.shadow.mapSize.height = 4096;
	//shadowLight.radius = 1 // adoucir bord ombre ?

	var helper = new THREE.PointLightHelper(shadowLight, 500)
	scene.add(helper)

	scene.add(hemisphereLight);  
	scene.add(shadowLight);

}



function myRandomNoise(x, y){
	var val = arrayNoise[(offsetNoiseArray/2)+x+y*nbYvert] // la moitié de l'offsetNoise pour pouvoir déborder avant ou après quand on fait x-1, y-1
	return (val*2-1)*terrainAmplitude
}

function myRandomSMOOTHnoise(x, y){
	var coins  = myRandomNoise(x-1,y-1) + myRandomNoise(x-1,y+1) + myRandomNoise(x+1,y-1) + myRandomNoise(x+1,y+1)
	var cotes  = myRandomNoise(x-1,y)   + myRandomNoise(x+1,y)   + myRandomNoise(x,y-1)   + myRandomNoise(x,y+1)
	var milieu = myRandomNoise(x, y)

	var coins2  = myRandomNoise(x-2,y-2) + myRandomNoise(x-2,y+2) + myRandomNoise(x+2,y-2) + myRandomNoise(x+2,y+2)
	return (coins2/4)+(coins/8)+(milieu/8)+(cotes/4)
}

function interpolate(a, b, blend){
	var theta = blend*Math.PI
	var f = (1-Math.cos(theta))*0.5
	return a*(1-f)+b*f
}

function getInterpolatedNoise(x, y){
	var intX   = Math.floor(x) // partie entière
	var intY   = Math.floor(y)
	var floatX = (x%1).toFixed(8) // partie décimale : 8 nombres après la virgule
	var floatY = (y%1).toFixed(8)

	var height1 = myRandomSMOOTHnoise(intX  , intY  )
	var height2 = myRandomSMOOTHnoise(intX+1, intY  )
	var height3 = myRandomSMOOTHnoise(intX  , intY+1)
	var height4 = myRandomSMOOTHnoise(intX+1, intY+1)

	var i1 = interpolate(height1, height2, floatX)
	var i2 = interpolate(height3, height4, floatX)

	return interpolate(i1, i2, floatY)
}

var nbXvert = 100 // for ground
var nbYvert = 100
var nbXvertSea = 50// for sea
var nbYvertSea = 50
var mapSizeX = 10000
var mapSizeY = 10000
var seed = Math.floor(Math.random()*100000)
var terrainAmplitude = 800
var offsetYterrain = 30
var offsetNoiseArray = 4096
var arrayNoise = [nbXvert*nbYvert+offsetNoiseArray] // Je rajoute 4096 pour pouvoir sortir du tableau sans avoir de NaN
Ground = function(){
	var geomGround = new THREE.PlaneGeometry(mapSizeX, mapSizeY, nbXvert-1, nbYvert-1) // 9000, 9000, 300, 300
	geomGround.rotateX(90*Math.PI/180)
	for(i=0; i<offsetNoiseArray; i++){
		arrayNoise[i] = Math.random()
	}
	for(i=0; i<nbXvert; i++){ 
		for(j=0; j<nbYvert; j++){
			arrayNoise[offsetNoiseArray+i+j*nbYvert] = Math.random()
		}
	}
	for(i=0; i<nbXvert; i++){ 
		for(j=0; j<nbYvert; j++){
			geomGround.vertices[i+j*nbYvert].x +=  20 +Math.random()*50
			geomGround.vertices[i+j*nbYvert].z +=  20 +Math.random()*50
			geomGround.vertices[i+j*nbYvert].y = offsetYterrain + getInterpolatedNoise(i/6, j/6) //(abc*2-1)*terrainAmplitude //myRandomNoise(seed, i, j*nbYvert)
		}
	}

	var matGround = new THREE.MeshPhongMaterial({
		color: 0x99bf2a,
		transparent:false,
		opacity:1,
		vertexColors: THREE.FaceColors,
		shading:THREE.FlatShading,
		side: THREE.DoubleSide //THREE.BackSide, 
		//shadowSide: THREE.BothSide,
		//clipShadows: true
		//blending: THREE.NormalBlending,
		//shininess: 1000
		//specular: 0xff0000,
		//precision: "highp",
		//flatShading: true,
		//depthTest:      false,
		//combine : THREE.AddOperation
		//emissive: 0x0000ff
	});

	this.mesh = new THREE.Mesh(geomGround, matGround);

	var sumFaceVertexY = 0
	for(i=0; i<this.mesh.geometry.faces.length; i++){
		sumFaceVertexY +=   this.mesh.geometry.vertices[this.mesh.geometry.faces[i].a].y +
							this.mesh.geometry.vertices[this.mesh.geometry.faces[i].b].y +
							this.mesh.geometry.vertices[this.mesh.geometry.faces[i].c].y 
		
		this.mesh.geometry.faces[i].color.setRGB(0, (sumFaceVertexY/3-30)/(500-30), 0) // (x-min)/(max-min)
		if(sumFaceVertexY<0){
			this.mesh.geometry.faces[i].color.setRGB(237/255, 237/255, 16/255)
		}
		sumFaceVertexY = 0
	}

	this.mesh.receiveShadow = true;
	this.mesh.castShadow = true;
}

Sea = function(){
	var geom = new THREE.PlaneGeometry(mapSizeX, mapSizeY, nbXvertSea-1, nbYvertSea-1);
	geom.rotateX(90*Math.PI/180)
	for(i=0; i<geom.vertices.length; i++){
		geom.vertices[i].x += 0//Math.random()*(mapSizeX/nbXvertSea)
		geom.vertices[i].y += Math.random()*30
		geom.vertices[i].z += 0//Math.random()*10
	}

	
	//geom.mergeVertices();

	var l = geom.vertices.length;

	// create an array to store new data associated to each vertex
	this.waves = [];

	for (i=0; i<l; i++){
	// get each vertex
	v = geom.vertices[i];

	// store some data associated to it
		this.waves.push({
			y:v.y,
			x:v.x,
			z:v.z,
			// a random angle
			ang:Math.random()*Math.PI*2,
			// a random distance
			amp: 10 + Math.random()*20,
			// a random speed between 0.016 and 0.048 radians / frame
			speed:0.016 + Math.random()*0.032 
		})
	}
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:0.8,
		vertexColors: THREE.FaceColors,
		shading:THREE.FlatShading,
		side: THREE.DoubleSide,
		//shadowSide: THREE.BothSide,
		//clipShadows: true
		//blending: THREE.NormalBlending,
		//shininess: 1000
		//specular: 0xff0000,
		//precision: "highp",
		//flatShading: true,
		//depthTest:      false,
		//combine : THREE.AddOperation
		
		
		//emissive: 0x0000ff
	});

	this.mesh = new THREE.Mesh(geom, mat);
	//this.mesh.receiveShadow = true;
	//this.mesh.castShadow = true; // Caster des shadows attenuées ?

}


var abc=0;
var cylinder;
document.onclick = function cl(e){
	createTree1();
	// new ball objet ball
	if(abc==0){
		//var geo = new THREE.CylinderGeometry(0.3, 0.8, 20, 32, 1);
		var geo = new THREE.SphereGeometry(2, 32, 32);
		geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		var mate = new THREE.MeshBasicMaterial({color: 0x000000});
		cylinder = new THREE.Mesh(geo, mate);
		scene.add(cylinder)
		cylinder.position.x = camera.position.x + 3
		cylinder.position.y = camera.position.y - 2
		cylinder.position.z = camera.position.z - 2
		abc++;
	}
	else{

		cylinder.position.z -= 5
		
	}


	elem = document.getElementById("jeu");

    elem.requestPointerLock = elem.requestPointerLock    ||
                              elem.mozRequestPointerLock
    elem.requestPointerLock();

}

var verts, lg;
Sea.prototype.moveWaves = function (){
	
	verts = this.mesh.geometry.vertices;
	lg = verts.length;
	
	for (var i=0; i<lg; i++){
		var v = verts[i];

		var vprops = this.waves[i];

		//v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

		vprops.ang += vprops.speed;

	}
	this.mesh.geometry.verticesNeedUpdate=true;
}

var ground;
function createGround(){
	ground = new Ground();
	ground.mesh.position.x = 0
	ground.mesh.position.y = 0
	ground.mesh.position.z = 0
	scene.add(ground.mesh)
	console.log(ground.mesh.geometry)
}

var sea;
function createSea(){
	sea = new Sea();
	sea.mesh.position.x = 0;
	sea.mesh.position.y = 0;
	sea.mesh.position.z = 0;
	scene.add(sea.mesh);
}

function createSun(){
	sun = new Sun();
	sun.mesh.position.x = shadowLight.position.x;
	sun.mesh.position.y = shadowLight.position.y;
	sun.mesh.position.z = shadowLight.position.z;
	scene.add(sun.mesh);
}

Sun = function(){
	var sunGeom = new THREE.IcosahedronGeometry(1000, 1);	
	var mat = new THREE.MeshPhongMaterial({
		color:0xcc5012,
		transparent:false,
		opacity:1,
		vertexColors: THREE.FaceColors,
		shading:THREE.FlatShading,
		side: THREE.DoubleSide,
		blending: THREE.NormalBlending,
		//shininess: 1000
		//specular: 0xff0000,
		//precision: "highp",
		//flatShading: true,
		//depthTest:      false,
		//combine : THREE.AddOperation
		//emissive: 0x0000ff
	});

	this.mesh = new THREE.Mesh(sunGeom, mat);
	this.mesh.receiveShadow = false;
	this.mesh.castShadow = false;
}

var xSun = 0
var ySun = 0
var	angXsun = 0
var	angYsun = 0
var amplitude = 4000
function moveSun(){
	shadowLight.position.x = ySun + Math.cos(angXsun) * amplitude
	sun.mesh.position.x    = ySun + Math.cos(angXsun) * amplitude
	shadowLight.position.y = xSun + Math.sin(angYsun) * amplitude
	sun.mesh.position.y    = xSun + Math.sin(angYsun) * amplitude

	angXsun += 0.003
	angYsun += 0.003
}

var tree1Array = new Array;
tree1 = function(obj){
	this.treeObject = obj
}

var tree1Object;
function loadTree1(){

	var loader = new THREE.ObjectLoader(); // !! Asynchronous
	loader.load('tree4.json',
		function(obj){
			console.log(tree1Object)
			tree1Object = obj

		},
		function ( xhr ) {
			console.log( 'Tree1 ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		function ( err ) {
			console.log( 'Tree1 loading error' );
		}
	);
}
/*
var posXtest = 0;
function createTree1(){
	var t1 = new tree1();
	tree1Array.push(t1);
	console.log(tree1Array)
	tree1Array[0].treeObject.position.y += 5
	tree1Array[0].treeObject.children[1].position.x += 5
	tree1Array[0].treeObject.children[1].geometry.vertices[0].y += 5
	tree1Array[0].treeObject.children[1].geometry.verticesNeedUpdate = true;
	//console.log(tree1Array[0].treeObject.children[1].geometry.v)
	t1.treeObject.position.x = posXtest;
	posXtest += 20
	//t1.mesh.position.z = 0;
	//t1.mesh.position.x = 0;
	scene.add(t1.treeObject);
}*/
var posXtest = 50
var TI = 0;
function createTree1(){
	var loader = new THREE.ObjectLoader(); // !! Asynchronous
	loader.load('tree3.json',
		function(obj){
			tree1Array[TI] = new tree1(obj)
			console.log(tree1Array)
			tree1Array[0].treeObject.position.y += 5
			tree1Array[0].treeObject.children[1].position.x += 5
			tree1Array[0].treeObject.children[1].geometry.vertices[0].y += 5
			tree1Array[0].treeObject.children[1].geometry.verticesNeedUpdate = true;
			//console.log(tree1Array[0].treeObject.children[1].geometry.v)
			tree1Array[TI].treeObject.position.x = poserArbre.x;
			tree1Array[TI].treeObject.position.y = poserArbre.y;
			tree1Array[TI].treeObject.position.z = poserArbre.z;
			tree1Array[TI].treeObject.rotateY(360*Math.random()*Math.PI/180) 
			posXtest += 20
			//t1.mesh.position.z = 0;
			//t1.mesh.position.x = 0;
			scene.add(tree1Array[TI].treeObject);
			TI++
		},
		function ( xhr ) {
			console.log( 'Tree1 ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		function ( err ) {
			console.log( 'Tree1 loading error' );
		}
	);
}
var nbtourne = 0
function animateTree(){
	//console.log(tree1Array[0].treeObject.children[0].geometry.vertices.length)
	for(a=0; a<tree1Array.length; a++){
		var www = tree1Array[a].treeObject.children[0].geometry
		for(i=0; i< www.vertices.length/4; i++){
			www.vertices[i].x += -0.1 + (0.2*Math.random());
			www.vertices[i].y += -0.1 + (0.2*Math.random());
			www.vertices[i].z += -0.1 + (0.2*Math.random());

			www.vertices[i+1].x += -0.1 + (0.2*Math.random());
			www.vertices[i+1].y += -0.1 + (0.2*Math.random());
			www.vertices[i+1].z += -0.1 + (0.2*Math.random());

			www.vertices[i+2].x += -0.1 + (0.2*Math.random());
			www.vertices[i+2].y += -0.1 + (0.2*Math.random());
			www.vertices[i+2].z += -0.1 + (0.2*Math.random());

			www.vertices[i+3].x += -0.1 + (0.2*Math.random());
			www.vertices[i+3].y += -0.1 + (0.2*Math.random());
			www.vertices[i+3].z += -0.1 + (0.2*Math.random());
			
			//nbtourne += 3
		}
		www.verticesNeedUpdate = true;
	}
	//console.log(nbtourne)
	//nbtourne = 0
}


function render() {
	var raycaster = new THREE.Raycaster();
	var vectorVert = new THREE.Vector3(0, -1, 0);

	raycaster.set(camera.position, vectorVert);
	var intersects = raycaster.intersectObjects( scene.children );
	for (i=0; i<intersects.length; i++) {
		if(i == 0){
			//camera.position.y = intersects[i].point.y + 6
		}
	}
}

var poserArbre = new THREE.Vector3();
var mouse = new THREE.Vector2();
function rayMouse() {
	var raycasterMouse = new THREE.Raycaster();
	raycasterMouse.near = 0
	raycasterMouse.far  = 10000

	raycasterMouse.setFromCamera( mouse, camera );	
	var intersectsMouse = raycasterMouse.intersectObjects( scene.children );
	for (i=0; i<intersectsMouse.length; i++) {
		if(i == 0){
			/*
			var ee = sea.mesh.geometry.vertices;
			ee[intersectsMouse[i].face.a].y += 0.5
			ee[intersectsMouse[i].face.b].y += 0.5
			ee[intersectsMouse[i].face.c].y += 0.5*/
			//console.log("x : " + intersectsMouse[i].point.x + "y : " + intersectsMouse[i].point.y + "z : " + intersectsMouse[i].point.z)
			console.log( intersectsMouse[i].point.x)
			poserArbre.x = intersectsMouse[i].point.x
			poserArbre.y = intersectsMouse[i].point.y
			poserArbre.z = intersectsMouse[i].point.z
			//console.log(poserArbre)
			/*
			sea.mesh.geometry.vertices[intersectsMouse[i].face.a].y += 0.5
			sea.mesh.geometry.vertices[intersectsMouse[i].face.b].y += 0.5
			sea.mesh.geometry.vertices[intersectsMouse[i].face.c].y += 0.5
			*/
			sea.mesh.geometry.verticesNeedUpdate = true;
			// couleur en rouge face
			//intersectsMouse[i].face.color.setRGB(1,0,0);
			//sea.mesh.geometry.elementsNeedUpdate = true;
		}
	}
}




var haut, bas, droite, gauche;
var vitesseX = 0;
var vitesseY = 0;
document.onkeydown = function pression(e){			
	if(e.keyCode == 90){ haut 	= 	true; }
	if(e.keyCode == 68){ droite = 	true; }
	if(e.keyCode == 83){ bas 	= 	true; }
	if(e.keyCode == 81){ gauche = 	true; }
}
document.onkeyup = function relache(e){
	if(e.keyCode == 90){ haut 	= 	false; }
	if(e.keyCode == 68){ droite = 	false; }
	if(e.keyCode == 83){ bas 	=	false; }
	if(e.keyCode == 81){ gauche = 	false; }
}

document.onwheel = function roll(e){
	if(e.deltaY<0){ // zoom
		camera.position.y -= 120;
	}
	else{ // dezoom
		camera.position.y += 120;
	}
}

function vitesse(){
	if(haut 	== true && vitesseY > -50)	{ vitesseY-=1.8; }
	if(droite 	== true && vitesseX < +50)	{ vitesseX+=1.8; }
	if(bas 		== true && vitesseY < +50)	{ vitesseY+=1.8; }
	if(gauche 	== true && vitesseX > -50)	{ vitesseX-=1.8; }

	if(-0.5 < vitesseX && vitesseX < 0.5)	{ vitesseX = 0 }
	else {
		if(vitesseX > 0)					{ vitesseX -= 0.5; }
		else if(vitesseX < 0)				{ vitesseX += 0.5; }
	}

	if(-0.5 < vitesseY && vitesseY < 0.5)	{ vitesseY = 0 }
	else {
		if(vitesseY > 0)					{ vitesseY -= 0.5; }
		else if(vitesseY < 0)				{ vitesseY += 0.5; }
	}

	var VectResGetWDir = new THREE.Vector3();
	var composanteX = -(vitesseY * camera.getWorldDirection(VectResGetWDir).x)   + vitesseX * (-camera.getWorldDirection(VectResGetWDir).z)
	var composanteY =   vitesseY * (-camera.getWorldDirection(VectResGetWDir).z) + vitesseX * camera.getWorldDirection(VectResGetWDir).x
	
	camera.position.x += composanteX; // gauche droite   vitesseX
	camera.position.z += composanteY; // devant derrière vitesseY 	// A noter : ici composante Y actionne l'axe Z
	camera.position.y += -vitesseY*camera.getWorldDirection(VectResGetWDir).y
}