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
}

var scene = new THREE.Scene();


addSphere(scene, 20, {position: {x:10, y:0, z:0}});
addSphere(scene, 20, {position: {x:50, y:50, z:50}});

// create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 50;
pointLight.position.y = 50;
pointLight.position.z = 100;

// add to the scene
scene.add(pointLight);

var view = addView(scene, $('#container'));
view.render();
	
});
