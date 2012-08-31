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
	
	var renderer = new THREE.WebGLRenderer();
	var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	camera.position = cameraPosition;
	camera.lookAt(scene.position);
	
	// add the camera to the scene and the renderer to the container
	scene.add(camera);
	renderer.setSize(width, height);
	containerElement.append(renderer.domElement);
	
	return {render: function() {renderer.render(scene, camera);} };
}

function addSphere(scene, radius, params)
{
	params = params || {};
	
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
	var segments = params.segments || 32;
    var rings = params.rings || 32;
    var position = params.position || {x:0, y:0, z:0};

	var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
	sphere.position = position;
	scene.add(sphere);
	
	return sphere;
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

function updatePosition(orbiter)
{
	orbiter.position.x = 200*Math.cos(updatePosition.theta);
	orbiter.position.z = 200*Math.sin(updatePosition.theta);
	updatePosition.theta += Math.PI/100;
	
	$('#positionLabel').html("("+orbiter.position.x+", "+orbiter.position.y+", "+orbiter.position.z+")");
}
updatePosition.theta = 0;

var scene = new THREE.Scene();

addSphere(scene, 30, {position: {x:30, y:0, z:30}});
var smallSphere = addSphere(scene, 10, {position: {x:0, y:0, z:200}});

addPointLight(scene);

var view = addView(scene, $('#container'), {viewAngle: 0, cameraPosition: {x:0, y:0, z:600} });

view.render();
setInterval(function() {updatePosition(smallSphere); view.render(); }, 25);
	
});
