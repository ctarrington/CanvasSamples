var ns = ns || {};

$(document).ready(function() {

var ctx = $('#hiddenCanvas')[0].getContext("2d");
var earthTexture = new THREE.Texture($('#hiddenCanvas')[0]);
	
function addView(scene, containerElement, params)
{
	params = params || {};
	var width   = containerElement.width();
    var height  = containerElement.height();
    var aspect   = width / height;
	var viewAngle = params.viewAngle || 70;
	var near = params.near || 1;
	var far = params.far || 10000;
	var cameraPosition = params.cameraPosition || {x:0, y:0, z:600};
	
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	camera.position = cameraPosition;
	camera.lookAt(scene.position);
	
	// add the camera to the scene and the renderer to the container
	scene.add(camera);
	renderer.setSize(width, height);
	containerElement.append(renderer.domElement);

	return {render: function() {renderer.render(scene, camera);}, camera: camera };
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
    
    
    var sphereMaterial = new THREE.MeshBasicMaterial({
        map : earthTexture,
        transparent : true,
        opacity: 0.7,
        blending: THREE.AdditiveAlphaBlending
    });
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
	meshes.push(sphere);
	sphere.name = 'Sphere Mesh'+radius;
	
	var group = new THREE.Object3D();
	group.rotation.z += Math.PI/4;
	group.add(sphere);
	group.name = 'Sphere'+radius;
	parent.add(group);
	
	if (orbitRadius > 0)
	{
		animations.push(createOrbitAnimation(group, orbitRadius, orbitPeriod));
	}
	return group;
}

function addPointLight(parent, params)
{
	params = params || {};
	
	var position = params.position || {x:0, y:0, z:0};
	var color = params.color || 0xFFFFFF; 
	
	var pointLight = new THREE.PointLight(color);
	pointLight.position = position;
	parent.add(pointLight);

	return pointLight;	
}

function updateTexture(seconds, period)
{
    var y = 260 + 240*Math.cos(2*Math.PI*seconds/period)

    ctx.drawImage($('#hiddenEarthImage')[0], 0,0);

    for (var ctr=0; ctr < 40; ctr++)
    {
        ctx.beginPath();
        ctx.fillStyle = "#cc3333";
        ctx.globalAlpha = 0.5;
        ctx.arc(50*(ctr+1),y,20,0,2*Math.PI,false);
        ctx.fill();
    }
    earthTexture.needsUpdate = true;
}

function createOrbitAnimation(target, radius, period)
{
	var animation = {};
	animation.tick = function() {
        var seconds = (new Date()).getTime()/1000;

        updateTexture(seconds, period);

		target.position.x = radius*Math.cos(2*Math.PI*seconds/period);
		target.position.z = radius*Math.sin(2*Math.PI*seconds/period);
        target.rotation.y = 2*Math.PI*seconds/period;
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

var meshes = [];
var scene = new THREE.Scene();
var animations = [];

var bigSphere = addSphere(scene, {radius: 100, orbitRadius: 50});
var littleSphere = addSphere(bigSphere, {radius: 20, orbitRadius: 150});
var ambientLight = new THREE.AmbientLight(0xababab);
scene.add(ambientLight);
var view = addView(scene, $('#container'));

run();

	
});
