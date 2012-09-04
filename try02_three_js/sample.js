var ns = ns || {};

$(document).ready(function() {
	
function addView(scene, containerElement, params)
{
	params = params || {};
	var width = params.width || 800;
	var height = params.height || 800;
	var aspect = width / height;
	var viewAngle = params.viewAngle || 45;
	var near = params.near || 0.1;
	var far = params.far || 10000;
	var cameraPosition = params.cameraPosition || {x:0, y:0, z:300};
	
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	camera.position = cameraPosition;
	camera.lookAt(scene.position);
	
	// add the camera to the scene and the renderer to the container
	scene.add(camera);
	renderer.setSize(width, height);
	containerElement.append(renderer.domElement);
	
	return {render: function() {renderer.render(scene, camera);} };
}

function addSphere(parent, params)
{
	params = params || {};
	
	var segments = params.segments || 32;
    var rings = params.rings || 32;
    var radius = params.radius || 10;
    var orbitRadius = params.orbitRadius || 25;
    var orbitPeriod = params.orbitPeriod || 60;
    var textureMap = params.textureMap;
    
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    
    
    var sphereMaterial = new THREE.MeshPhongMaterial( { map: textureMap } );
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
	
	var group = new THREE.Object3D();
	group.rotation.z += Math.PI/4;
	group.add(sphere);
	parent.add(group);
	
	if (orbitRadius > 0)
	{
		animations.push(createOrbitAnimation(group, orbitRadius, orbitPeriod));
	}
	return group;
}

function addPointLight(scene, params)
{
	params = params || {};
	
	var position = params.position || {x:0, y:0, z:0};
	var color = params.color || 0xFFFFFF; 
	
	var pointLight = new THREE.PointLight(color);
	pointLight.position = position;
	scene.add(pointLight);

	return pointLight;	
}

function createOrbitAnimation(target, radius, period)
{
	var animation = {};
	animation.tick = function() {
		var seconds = (new Date()).getTime()/1000;
		target.position.x = radius*Math.cos(2*Math.PI*seconds/period);
		target.position.z = radius*Math.sin(2*Math.PI*seconds/period);
	};	
	
	return animation;
}


function run()
{    
	for (var ctr=0; ctr < animations.length; ctr++)
	{
		animations[ctr].tick();
	}
	
	view.render();
    requestAnimationFrame(run);
}

var scene = new THREE.Scene();

var animations = [];

var moonMap = "../images/moon_1024.jpg";
var moonTexture = THREE.ImageUtils.loadTexture(moonMap);


var earthmap = "../images/earth_surface_2048.jpg";
var earthTexture = THREE.ImageUtils.loadTexture(earthmap);

var sunmap = "../images/SunTexture_2048.png";
var sunTexture = THREE.ImageUtils.loadTexture(sunmap);

var bigSphere = addSphere(scene, {radius: 50, textureMap: sunTexture, orbitRadius: 0});
var smallSphere = addSphere(scene, {radius: 25, textureMap: earthTexture, orbitRadius: 300, orbitPeriod:30});
var tinySphere = addSphere(smallSphere, {radius:10, textureMap: moonTexture, orbitRadius: 50, orbitPeriod: 10});

addPointLight(bigSphere);
var ambientLight = new THREE.AmbientLight(0x676767);
scene.add(ambientLight);

var view = addView(scene, $('#container'), {viewAngle: 0, cameraPosition: {x:0, y:0, z:1000} });

run();


	
});
