var ns = ns || {};

$(document).ready(function() {

    var container;
    var camera, controls, scene, renderer;

    var threeDeeWidth = 1000
        ,threeDeeHeight = 800;

    var path = null;
    var earthTexture = null;
    var width = 1000,
        height = 500;
    var countries = null;
    var longitude = 0
       ,latitude = 0;

    fetchPrerequisites();

    function updateTexture(seconds, period)
    {
        longitude = longitude + 1;
        if (longitude > 180) {longitude = -180; }

        latitude = 40*Math.cos(2*Math.PI*seconds/period);
        latitude = 0;


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

    function fetchPrerequisites()
    {
        queue()
            .defer(d3.json, "world-110m.json")
            .await(init);
    }

    function init(error, worldJson) {

        $('#loading').hide();
        var projection = d3.geo.equirectangular()
            .translate([ width / 2, height / 2])
            .scale(500 / Math.PI);


        var mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        context = mapCanvas.getContext("2d");
        $('#2Dcontainer').append(mapCanvas);


        path = d3.geo.path()
            .projection(projection)
            .context(context);


        countries = topojson.object(worldJson, worldJson.objects.countries);

        earthTexture = new THREE.Texture(mapCanvas);

        camera = new THREE.PerspectiveCamera( 60, threeDeeWidth / threeDeeHeight, 1, 1000 );
        camera.position.z = 500;

        controls = new THREE.TrackballControls( camera, $('div#3Dcontainer')[0] );

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];

        controls.addEventListener( 'change', render );

        // world
        scene = new THREE.Scene();

        var radius = 100;
        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material =  new THREE.MeshBasicMaterial({
            map : earthTexture,
            blending: THREE.AdditiveAlphaBlending
        });


        var mesh = new THREE.Mesh( geometry, material );
        mesh.matrixAutoUpdate = false;
        scene.add( mesh );

        // lights
        light = new THREE.AmbientLight( 0xffffff );
        scene.add( light );


        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( threeDeeWidth, threeDeeHeight );

        container = document.getElementById( '3Dcontainer' );
        container.appendChild( renderer.domElement );


        window.addEventListener( 'resize', onWindowResize, false );

        animate();

    }

    function onWindowResize() {

        camera.aspect = threeDeeWidth / threeDeeHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( threeDeeWidth, threeDeeHeight );

        controls.handleResize();

        render();

    }

    function animate() {

        requestAnimationFrame( animate );
        controls.update();
        render();
    }

    function render() {
        updateTexture();
        renderer.render( scene, camera );
    }




});
