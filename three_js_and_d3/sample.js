var ns = ns || {};

$(document).ready(function() {
	
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
	
	var segments = (params.segments != null) ? params.segments : 32;
    var rings = (params.rings != null) ? params.rings : 32;
    var radius = (params.radius != null) ? params.radius : 10;
    var orbitRadius = (params.orbitRadius != null) ? params.orbitRadius : 25;
    var orbitPeriod = (params.orbitPeriod != null) ? params.orbitPeriod : 60;
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
	group.add(sphere);
	group.name = 'Sphere'+radius;
	parent.add(group);
	
	animations.push(createOrbitAnimation(group, orbitRadius, orbitPeriod));

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

    var first = true;
function updateTexture(seconds, period)
{
    longitude = longitude + 1;
    if (longitude > 180) {longitude = -180; }

    var y = height *(1+Math.cos(6*Math.PI*seconds/period))*.5;
    var x = width * (1+Math.cos(4*Math.PI*seconds/period))*.5;
    console.log('x = '+x+', y = '+y);

   // ctx.drawImage($('#hiddenEarthImage')[0], 0,0);

    if (countries) {

        // paint world with blue
        context.beginPath();
        context.fillStyle = "#000077";
        context.globalAlpha = 1;
        context.fillRect(0,0, width, height);

        // fill path with shapes from json data, fill them and stroke the outlines
        context.beginPath();
        path(countries);
        context.fillStyle = "#007700";
        context.fill();

        context.strokeStyle = "#ffffff";
        context.lineWidth = 0.5;
        context.stroke();



        // draw shape
        context.beginPath();
        path(d3.geo.circle()
            .origin([ longitude, latitude ]).angle(4)());
        context.fillStyle = "#cc3333";
        context.globalAlpha = 0.5;
        context.fill();

        earthTexture.needsUpdate = true;
    }
}

function createOrbitAnimation(target, radius, period)
{
	var animation = {};
	animation.tick = function() {
        var seconds = (new Date()).getTime()/1000;

        updateTexture(seconds, period);

		target.position.x = radius*Math.cos(2*Math.PI*seconds/period);
		target.position.z = radius*Math.sin(2*Math.PI*seconds/period);
        //target.rotation.y = 0.35*Math.PI;
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

var width = 960,
    height = 500;

var latitude = 0;
var longitude = 0;

var projection = d3.geo.equirectangular()
    .scale(153);

var canvas = d3.select("#hiddenCanvas");
var context = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(context);

var countries = null;
d3.json("world-110m.json", function(error, worldJson) {
    countries = topojson.object(worldJson, worldJson.objects.countries);
});

var earthTexture = new THREE.Texture($('#hiddenCanvas')[0]);

var meshes = [];
var scene = new THREE.Scene();
var animations = [];

var bigSphere = addSphere(scene, {radius: 200, orbitRadius: 0});
var ambientLight = new THREE.AmbientLight(0xababab);
scene.add(ambientLight);
var view = addView(scene, $('#container'));

run();

	
});
