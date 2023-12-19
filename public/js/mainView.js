import * as THREE from 'three';

import { PointerLockControls } from '../jsm/controls/PointerLockControls.js';

import { MTLLoader } from '../jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../jsm/loaders/OBJLoader.js';

let camera, scene, renderer, controls, map_camera, map_renderer, shared_camera;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 3, 1000 );
	camera.position.y = 10;
	camera.position.x = userX;
	camera.position.z = userZ;

	map_camera  = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 35, 1000 );
	map_camera.position.y = 50;
	map_camera.lookAt(0,0,0);

	shared_camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 3, 1000 );
	shared_camera.position.y = 10;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

	const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 2.5 );
	light.position.set( 0.5, 1, 0.75 );
	scene.add( light );

	controls = new PointerLockControls( camera, document.body );

	const blocker = document.getElementById( 'blocker' );
	const instructions = document.getElementById( 'instructions' );

	instructions.addEventListener( 'click', function () {

		controls.lock();

	} );

	controls.addEventListener( 'lock', function () {

		instructions.style.display = 'none';
		blocker.style.display = 'none';

	} );

	controls.addEventListener( 'unlock', function () {

		blocker.style.display = 'block';
		instructions.style.display = '';

	} );

	scene.add( controls.getObject() );

	const onKeyDown = function ( event ) {

		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				break;

			case 'Space':
				if ( canJump === false ) velocity.y += 350;
				canJump = false;
				break;

		}

	};

	const onKeyUp = function ( event ) {

		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	// floor

	let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	floorGeometry.rotateX( - Math.PI / 2 );

	// vertex displacement

	let position = floorGeometry.attributes.position;

	for ( let i = 0, l = position.count; i < l; i ++ ) {

		vertex.fromBufferAttribute( position, i );

		vertex.x += 0.5 * 20 - 10;
		vertex.y += 0.5 * 2;
		vertex.z += 0.5 * 20 - 10;

		position.setXYZ( i, vertex.x, vertex.y, vertex.z );

	}

	floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

	position = floorGeometry.attributes.position;

	const floorMaterial = new THREE.MeshBasicMaterial( { transparent: true } );

	const floor = new THREE.Mesh( floorGeometry, floorMaterial );
	scene.add( floor );

	var mtlLoader = new MTLLoader();
	mtlLoader.load("models/room.mtl", function(materials)
	{
		materials.preload();

		// instantiate a loader
		var loader = new OBJLoader();
		loader.setMaterials(materials);
		// load a resource
		loader.load(
			// resource URL
			'models/room.obj',
			// called when resource is loaded
			function ( object ) {
				scene.add( object );
				object.scale.set( 0.1, 0.1, 0.1 );
				object.position.y = 1.1;
			},
			// called when loading is in progresses
			function ( xhr ) {
				//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened' );
			}
		);

	});
	
	for( var user of Users ) {

		var loader = new OBJLoader();

		loader.load(
			// resource URL
			'models/character.obj',
			// called when resource is loaded
			function ( object ) {
				object.rotateY( Math.PI );
				object.scale.set( 0.2, 0.25, 0.2 );
				object.position.x = user.positionX;
				object.position.y = 1;
				object.position.z = user.positionZ;
				scene.add( object );
				objects.push( object );
			},
			// called when loading is in progresses
			function ( xhr ) {
				//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened' + error );
			}
		);
	} 

	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth*0.9, window.innerHeight*0.9 );
	let container = document.querySelector('#content-center');
	container.appendChild( renderer.domElement );

	//

	map_renderer = new THREE.WebGLRenderer( { antialias: true } );
	map_renderer.setPixelRatio( window.devicePixelRatio );
	map_renderer.setSize( window.innerWidth*0.2, window.innerHeight*0.3 );
	map_renderer.setViewport( window.innerWidth*-0.066, 0, window.innerWidth*0.3, window.innerHeight*0.3 );
	let map_container = document.querySelector('#map');
	map_container.appendChild( map_renderer.domElement ); 

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth*0.9, window.innerHeight*0.9 );

	map_renderer.setSize( window.innerWidth*0.2, window.innerHeight*0.3 );
	map_renderer.setViewport( window.innerWidth*-0.066, 0, window.innerWidth*0.3, window.innerHeight*0.3 );

}

function animate() {

	requestAnimationFrame( animate );

	const time = performance.now();

	if ( controls.isLocked === true ) {

		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		const intersections = raycaster.intersectObjects( objects, false );

		const onObject = intersections.length > 0;

		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize(); // this ensures consistent movements in all directions

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

		if ( onObject === true ) {

			velocity.y = Math.max( 0, velocity.y );
			canJump = true;

		}

		controls.moveRight( - velocity.x * delta );
		controls.moveForward( - velocity.z * delta );

		controls.getObject().position.y += ( velocity.y * delta ); // new behavior

		if ( controls.getObject().position.y < 10 ) {

			velocity.y = 0;
			controls.getObject().position.y = 10;

			canJump = true;

		}

	}

	Users.forEach(function (user, userIndex) {
		
		if(objects.length>0) {
			console.log(objects[userIndex].children[7].material.color.set(user.color));
			objects[userIndex].position.x = user.positionX;
			objects[userIndex].position.z = user.positionZ;
			objects[userIndex].lookAt(user.rotationX+user.positionX, objects[userIndex].position.y, user.rotationZ+user.positionZ);
		}
	})

	prevTime = time;

	map_camera.position.x = camera.position.x;
	map_camera.position.z = camera.position.z;
	map_camera.rotation.z = camera.rotation.z;
	userX = camera.position.x;
	userZ = camera.position.z;
	var camera_direction = new THREE.Vector3();
	camera.getWorldDirection(camera_direction);
	userRx = camera_direction.x;
	userRy = camera_direction.y;
	userRz = camera_direction.z;
	if(shared_view == true) {
		for (var user of Users) {
			if(user.nickname == shared_username)
				shared_camera.position.x = user.positionX;
				shared_camera.position.z = user.positionZ;
				shared_camera.lookAt(user.rotationX+user.positionX, user.rotationY + shared_camera.position.y, user.rotationZ+user.positionZ);
		}
		renderer.render( scene, shared_camera );
	} else {
		renderer.render( scene, camera );
	}
	map_renderer.render( scene, map_camera );
	
}