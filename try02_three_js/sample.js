var ns = ns || {};

$(document).ready(function() {
	
function addView(scene, containerElement, params)
{
	params = params || {};
	var width = params.width || 400;
	var height = params.height || 300;
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

function addSphere(parent, radius, params)
{
	params = params || {};
	
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
	var segments = params.segments || 32;
    var rings = params.rings || 32;
    var position = params.position || {x:0, y:0, z:0};

	var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
	
	var group = new THREE.Object3D();
	group.add(sphere);
	parent.add(group);
	return group;
}

function addPointLight(scene, params)
{
	params = params || {};
	
	var position = params.position || {x:200, y:200, z:500};
	var color = params.color || 0xFFFFFF; 
	
	var pointLight = new THREE.PointLight(color);
	pointLight.position = position;
	scene.add(pointLight);

	return pointLight;	
}

function createOrbitAnimation(target, radius, speed)
{
	var animation = {};
	var theta = 0;
	animation.tick = function() {
		target.position.x = radius*Math.cos(speed*theta);
		target.position.z = radius*Math.sin(speed*theta);
		theta += Math.PI/200;
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

var bigSphere = addSphere(scene, 50, {position: {x:0, y:0, z:0}});
var smallSphere = addSphere(bigSphere, 20, {position: {x:175, y:0, z:0}});
var tinySphere = addSphere(smallSphere, 10, {position: {x:50, y:0, z:0}});
animations.push(createOrbitAnimation(bigSphere, 100, 1));
animations.push(createOrbitAnimation(smallSphere, 175, 2));
animations.push(createOrbitAnimation(tinySphere, 50, 4));



addPointLight(scene);
var view = addView(scene, $('#container'), {viewAngle: 0, cameraPosition: {x:0, y:0, z:600} });

run();


	
});
