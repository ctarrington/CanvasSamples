
var ns = ns || {};

$(document).ready(function() {

    var container;
    var camera, controls, scene, renderer;

    var width = 1000
        ,height = 800;

    var cylinderGeometry = null;
    var cylinderMesh = null;

    var colladaLoader = new THREE.ColladaLoader();
    colladaLoader.options.convertUpAxis = true;

    function updateGeometry()
    {
        // nothing yet
    }

    var debugaxis = function(axisLength){
        //Shorten the vertex function
        function v(x,y,z){
            return new THREE.Vector3(x,y,z);
        }

        //Create axis (point1, point2, colour)
        function createAxis(p1, p2, color){
            var line, lineGeometry = new THREE.Geometry(),
                lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat);
            scene.add(line);
        }

        createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
        createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
        createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
    };

    function loadMesh(name, material)
    {
        colladaLoader.load('/models/'+name+'.dae', function (collada) {
            var colladaDae = collada.scene;

            colladaDae.traverse(function (object) {
                object.name = object.name + 'OfMeshFor' + name;
                object.material = material;
            });


            colladaDae.position.set(0, 0, 0);
            var scale = 10;
            colladaDae.scale.set(scale, scale, scale);
            colladaDae.name = 'MeshFor' + name;

            scene.add(colladaDae);

        });
    }

    function init() {
        camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 150;

        controls = new THREE.TrackballControls( camera );

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

        debugaxis(200);

        var material = new THREE.MeshPhongMaterial({ ambient: 0x403E3E, color: 0xFAEEE8, specular: 0xFAFAFA, shininess: 30, shading: THREE.SmoothShading});
        loadMesh('mechanicalFlower', material);

        // lights
        light = new THREE.AmbientLight( 0xffffff );
        scene.add( light );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        directionalLight.position.set( -100, -100, 10 );
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
        directionalLight.position.set( 10, -50, -100 );
        scene.add( directionalLight );

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( width, height );

        container = document.getElementById( '3Dcontainer' );
        container.appendChild( renderer.domElement );


        window.addEventListener( 'resize', onWindowResize, false );

        animate();

    }

    function createRotationMatrix(xRot, yRot, zRot) {
        var m = new THREE.Matrix4();

        var m1 = new THREE.Matrix4();
        var m2 = new THREE.Matrix4();
        var m3 = new THREE.Matrix4();

        m1.makeRotationX(xRot);
        m2.makeRotationY(yRot);
        m3.makeRotationZ(zRot);

        m.multiplyMatrices(m1, m2);
        m.multiply(m3);

        return m;
    }

    function onWindowResize() {

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize( width, height );

        controls.handleResize();

        render();

    }

    function animate() {

        requestAnimationFrame( animate );
        controls.update();
        console.log('camera.position = '+JSON.stringify(camera.position));
        render();
    }

    function render() {
        renderer.render( scene, camera );
    }


    init();

});
