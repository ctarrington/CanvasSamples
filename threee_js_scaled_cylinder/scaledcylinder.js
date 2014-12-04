
var ns = ns || {};

$(document).ready(function() {

    var container;
    var camera, controls, scene, renderer;

    var width = 1000
        ,height = 800;

    var tickCtr = 0.5;
    var direction = 0.005;

    var cylinderGeometry = null;
    var cylinderMesh = null;

    function updateGeometry()
    {
        if (tickCtr < 0.5 || tickCtr > 3) { direction = -direction; }
        tickCtr = tickCtr + direction;

        cylinderMesh.scale.z = tickCtr;
        cylinderGeometry.verticesNeedUpdate = true;

    }

    function init() {
        camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );
        camera.position.z = 500;

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

        cylinderGeometry =  new THREE.CylinderGeometry(5.0, 10.0, 25.0, 12, 5, false)
        var rotationMatrix = createRotationMatrix(Math.PI / 2, Math.PI,0);
        cylinderGeometry.applyMatrix( rotationMatrix );
        cylinderGeometry.verticesNeedUpdate = true;

        var cylinderMaterial = new THREE.MeshNormalMaterial();
        cylinderMesh = new THREE.Mesh( cylinderGeometry, cylinderMaterial);
        cylinderMesh.matrixAutoUpdate = true;
        scene.add( cylinderMesh );

        // lights
        light = new THREE.AmbientLight( 0xffffff );
        scene.add( light );


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
        render();
    }

    function render() {
        updateGeometry();
        renderer.render( scene, camera );
    }


    init();

});
