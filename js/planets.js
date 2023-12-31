import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// 1.設置一個場景
const scene = new THREE.Scene();
// const sbackground = new THREE.TextureLoader();
// scene.background = sbackground.load('img/starry2.jpg');

// 
const raycaster = new THREE.Raycaster();
// 設定滑鼠的位置
const pointer = new THREE.Vector2();

// 2.設置攝影機 （透視相機 PerspecttiveCamera（四個參數：fov-, 螢幕長寬比, near, far）
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const earthCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// 攝影機位置（x,y,z）;
// camera.position.set( 10, 10, 10);
camera.position.x = 30;

let camIndex = 0;
const cameras = [
    {
        name: '主攝影機（太陽）',
        camera: camera,
    },
    {
        name: '副攝影機（地球）',
        camera: earthCamera,
    },
];

// 3.建立模型架構
const skyGeometry = new THREE.SphereGeometry(100, 32, 16);
const skyTexture = new THREE.TextureLoader().load('img/ESO_-_Milky_Way.jpg');
const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.DoubleSide });

const sunGeometry = new THREE.SphereGeometry(5, 32, 16);
const sunTexture = new THREE.TextureLoader().load('img/sun_surface.jpeg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

const earthGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const earthTexture = new THREE.TextureLoader().load('img/earth_surface.jpeg');
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });

const moonGeometry = new THREE.SphereGeometry(0.18, 32, 16);
const moonTexture = new THREE.TextureLoader().load('img/moon_surface.jpg');
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

const sunLight = new THREE.PointLight(0x404040, 70, 0, 0);
sunLight.position.set(-2.6, 0, 0);


// -結合成物體
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
const moon = new THREE.Mesh(moonGeometry, moonMaterial);

earth.name = 'earth';
moon.name = 'moon';

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.power = 1000;
spotLight.angle = 0.172;
spotLight.target = earth;

scene.add(spotLight);
// 聚光燈輔助器
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// 加入場景中
scene.add(sky);
scene.add(sun);
sun.add(sunLight);
scene.add(earth);
earth.add(moon);

// 軸向線顯示
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

// 頭頂的標籤
const earthDiv = document.createElement('div');
earthDiv.className = 'label';
earthDiv.textContent = 'earth';
earthDiv.style.marginTop = "-1em";
const earthLabel = new CSS2DObject(earthDiv);
earthLabel.position.set(0, 1, 0);
earth.add(earthLabel);

const moonDiv = document.createElement('div');
moonDiv.className = 'label';
moonDiv.textContent = 'moon';
moonDiv.style.marginTop = "-1em";
const moonLabel = new CSS2DObject(moonDiv);
moonLabel.position.set(0, 1, 0);
moon.add(moonLabel);

// 設定父子位置（x軸）
sky.position.set = (0, 0, 0);
sun.position.set = (0, 0, 0);
earth.position.x = 12;
moon.position.x = 1;

// 頭頂標籤的渲染
let labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

// 4.渲染功能
const renderer = new THREE.WebGLRenderer();
// 設置渲染的畫面大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 將東西添加進body
document.body.appendChild(renderer.domElement);
// 用滑鼠控制畫面縮放及方向
const controls = new OrbitControls(camera, renderer.domElement);
const earthControls = new OrbitControls(earthCamera, renderer.domElement);

// 找到按鈕
const btns = document.querySelectorAll('.btns');
// 將按鈕添加監聽事件
btns.forEach((btn) => {
    btn.addEventListener('click', () => {
        camIndex = parseInt(btn.dataset.index);
        console.log(`當前攝影機：${cameras[camIndex].name}`);
    });
});

// 更新畫面，讓畫面有RWD效果
// 1.
// window.addEventListener('resize', () => {
//     resetWindow();
// });
// 2.
window.addEventListener('resize', resetWindow);
// 監聽事件這邊後面的方程式不能加()

function resetWindow() {
    // 渲染器大小重整
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    // 攝影機大小重整
    cameras.forEach((item) => {
        item.camera.aspect = window.innerWidth / window.innerHeight;
        item.camera.updateProjectionMatrix();
    });
}

window.addEventListener('mousemove', mouseMove);
function mouseMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('click', mouseClick);
function mouseClick(event) {
    if (event.target.tagName === 'BUTTON') return;
    mouseMove(event);
    raycaster.setFromCamera(pointer, cameras[camIndex].camera);
    const intersects = raycaster.intersectObject(earth);

    // if (intersects.length > 0) {
    //     camIndex = 1;
    // } else {
    //     camIndex = 0;
    // }
    camIndex = (intersects.length > 0) ? 1 : 0;
}

let earthAngle = 0;
let moonAngle = 0;
let sunAngle = 0;

// 轉動的方程式
function rotatePosition(distance = 2, earthAngle = 0) {
    let x = distance * Math.sin(earthAngle);
    let z = distance * Math.cos(earthAngle);
    return { x, z };
}

function animate() {
    requestAnimationFrame(animate);
    // scene.rotation.y += 0.001;
    // sun.rotation.y += 0.0002;
    // earth.rotation.y += 0.01;

    earthAngle += 0.005;
    moonAngle += 0.008;
    sunAngle += 0.001;

    let eObj = rotatePosition(10, earthAngle);
    let mObj = rotatePosition(2, moonAngle);
    earth.position.set(eObj.x, 0, eObj.z);
    moon.position.set(mObj.x, 0, mObj.z);
    sun.rotation.y += 0.001;
    earth.rotation.y += 0.005;

    earthCamera.position.set = (earth.position.x + 5, earth.position.y + 5, earth.position.z + 5);
    earthCamera.lookAt(earth.position);
    earthControls.saveState();

    spotLight.position.set(earth.position.x, earth.position.y + 10, earth.position.z);

    raycaster.setFromCamera(pointer, cameras[camIndex].camera);
    const intersect = raycaster.intersectObject(earth);
    if (intersect.length > 0) {
        const earth = intersect.find((item) => item.object.name === 'earth') ?? {};
        // console.log(earth);
        const arr = Object.keys(earth);
        if (arr.length !== 0) {
            scene.add(spotLight);
            scene.add(spotLightHelper);
        } else {
            scene.remove(spotLight);
            scene.remove(spotLightHelper);
        }
    }

    // 渲染器渲出來的攝影機
    renderer.render(scene, cameras[camIndex].camera);
    labelRenderer.render(scene, cameras[camIndex].camera);
}

animate();