import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe-container').appendChild(renderer.domElement);

const earthRadius = 2;
camera.position.z = earthRadius * 3;

const ambientLight = new THREE.AmbientLight(0x080808);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xcccccc, 0.5);
directionalLight.position.set(5, 0, 0);
scene.add(directionalLight);

const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
const textureLoader = new THREE.TextureLoader();

const earthLightsTexture = textureLoader.load('/textures/earth_lights.jpg');
const earthTexture = textureLoader.load('/textures/earth_globe.jpg');
const cloudsTexture = textureLoader.load('/textures/earth_clouds.jpg');

const earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
        dayTexture: { value: earthTexture },
        nightTexture: { value: earthLightsTexture },
        lightDirection: { value: new THREE.Vector3() },
        ambientColor: { value: new THREE.Color(ambientLight.color.getHex()) },
        diffuseColor: { value: new THREE.Color(directionalLight.color.getHex()) },
        emissiveColor: { value: new THREE.Color(0xffff80) },
        emissiveIntensity: { value: 0.0 },
        specularPower: { value: 10.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.position.x = 0;
scene.add(earthMesh);

const cloudsGeometry = new THREE.SphereGeometry(earthRadius + 0.005, 64, 64);
const cloudsMaterial = new THREE.MeshBasicMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
cloudsMesh.position.x = 0;
scene.add(cloudsMesh);

const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const positions = new Float32Array(starsCount * 3);

const starDistance = 200;

for (let i = 0; i < starsCount; i++) {
    const x = (Math.random() * 2 - 1) * starDistance;
    const y = (Math.random() * 2 - 1) * starDistance;
    const z = (Math.random() * 2 - 1) * starDistance;

    const distanceToOrigin = Math.sqrt(x*x + y*y + z*z);
    if (distanceToOrigin < earthRadius + 5) {
        i--;
        continue;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    sizeAttenuation: true
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 0, 0);

controls.minDistance = earthRadius * 1.1;
controls.maxDistance = earthRadius * 5;

controls.enableDamping = true;
controls.dampingFactor = 0.1;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

const lightInclination = Math.PI / 8;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    earthMesh.rotation.y += 0.0005;
    cloudsMesh.rotation.y += 0.0005 * 0.9;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const timeOffset = -6;
    const totalHoursOfDay = hours + (minutes / 60) + (seconds / 3600) + timeOffset;
    const angle = (totalHoursOfDay / 24) * Math.PI * 2;

    const orbitRadius = 10;
    directionalLight.position.x = Math.cos(angle) * orbitRadius * Math.cos(lightInclination);
    directionalLight.position.z = Math.sin(angle) * orbitRadius * Math.cos(lightInclination);
    directionalLight.position.y = Math.sin(lightInclination) * orbitRadius;

    const lightDirCameraSpace = new THREE.Vector3();
    lightDirCameraSpace.copy(directionalLight.position).transformDirection(camera.matrixWorldInverse);
    earthMaterial.uniforms.lightDirection.value.copy(lightDirCameraSpace).normalize();

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});