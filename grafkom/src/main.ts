import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Post-processing setup
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
);
composer.addPass(bloomPass);

// Projectiles array and constants
let projectiles: Projectile[] = [];
const PROJECTILE_SPEED = 0.1;
const DETECTION_RADIUS = 2;
let letterN: THREE.Mesh | undefined, number1: THREE.Mesh | undefined;

// Custom Shader Materials

// 1. Glowing Cube Material
const cubeLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        varying vec3 vPosition;
        
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        
        void main() {
            vec3 glowColor = vec3(1.0);
            float intensity = 1.0 + 0.3 * sin(time * 2.0);
            gl_FragColor = vec4(glowColor * intensity, 1.0);
        }
    `
});

// 2. Alphabet Material (Plastic-like)
const alphabetMaterial = new THREE.ShaderMaterial({
    uniforms: {
        cubePos: { value: new THREE.Vector3(0, 0, 0) },
        baseColor: { value: new THREE.Vector3(1.0, 0.843, 0.0) }, // Gold color
        viewPosition: { value: new THREE.Vector3() },
        ambientIntensity: { value: 0.401 } // Based on 201 + 200 = 401
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 cubePos;
        uniform vec3 baseColor;
        uniform vec3 viewPosition;
        uniform float ambientIntensity;
        
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        
        void main() {
            // Ambient
            vec3 ambient = baseColor * ambientIntensity;
            
            // Diffuse
            vec3 lightDir = normalize(cubePos - vWorldPos);
            float diff = max(dot(vNormal, lightDir), 0.0);
            vec3 diffuse = diff * baseColor;
            
            // Specular (Plastic-like)
            vec3 viewDir = normalize(viewPosition - vWorldPos);
            vec3 halfDir = normalize(lightDir + viewDir);
            float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
            vec3 specular = vec3(0.5) * spec;
            
            vec3 finalColor = ambient + diffuse + specular;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
});

// 3. Digit Material (Metallic)
const digitMaterial = new THREE.ShaderMaterial({
    uniforms: {
        cubePos: { value: new THREE.Vector3(0, 0, 0) },
        baseColor: { value: new THREE.Vector3(0.165, 0.322, 0.745) }, // Royal blue
        viewPosition: { value: new THREE.Vector3() },
        ambientIntensity: { value: 0.401 } // Based on 201 + 200 = 401
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 cubePos;
        uniform vec3 baseColor;
        uniform vec3 viewPosition;
        uniform float ambientIntensity;
        
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        
        void main() {
            // Ambient
            vec3 ambient = baseColor * ambientIntensity;
            
            // Diffuse
            vec3 lightDir = normalize(cubePos - vWorldPos);
            float diff = max(dot(vNormal, lightDir), 0.0);
            vec3 diffuse = diff * baseColor;
            
            // Specular (Metallic)
            vec3 viewDir = normalize(viewPosition - vWorldPos);
            vec3 reflectDir = reflect(-lightDir, vNormal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
            vec3 specular = baseColor * spec;
            
            vec3 finalColor = ambient + diffuse + specular;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
});

// Projectile class
class Projectile {
    mesh: THREE.Mesh;
    direction: THREE.Vector3;
    alive: boolean;

    constructor(position: THREE.Vector3, direction: THREE.Vector3) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.direction = direction.normalize();
        this.alive = true;
        scene.add(this.mesh);
    }

    update() {
        this.mesh.position.add(this.direction.multiplyScalar(PROJECTILE_SPEED));
        
        if (this.mesh.position.length() > 10) {
            this.destroy();
        }
    }

    destroy() {
        scene.remove(this.mesh);
        this.alive = false;
    }
}

// Create central cube
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeLightMaterial);
cubeMesh.position.set(0, 0, 0);
scene.add(cubeMesh);

// Load font and create text meshes
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    // Create letter 'n'
    const letterGeometry = new TextGeometry('n', {
        font: font,
        size: 1,
        height: 0.2
    });
    letterN = new THREE.Mesh(letterGeometry, alphabetMaterial);
    letterN.position.set(-2, 0, 0);
    scene.add(letterN);

    // Create number '1'
    const numberGeometry = new TextGeometry('1', {
        font: font,
        size: 1,
        height: 0.2
    });
    number1 = new THREE.Mesh(numberGeometry, digitMaterial);
    number1.position.set(2, 0, 0);
    scene.add(number1);
});

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Set camera position
camera.position.z = 5;

// Update projectiles function
function updateProjectiles() {
    projectiles = projectiles.filter(p => p.alive);
    projectiles.forEach(projectile => {
        projectile.update();
        
        if (letterN && number1) {
            const distanceToN = projectile.mesh.position.distanceTo(letterN.position);
            const distanceTo1 = projectile.mesh.position.distanceTo(number1.position);
            
            if (distanceToN < DETECTION_RADIUS) {
                alphabetMaterial.uniforms.ambientIntensity.value = 0.8;
            } else {
                alphabetMaterial.uniforms.ambientIntensity.value = 0.401;
            }
            
            if (distanceTo1 < DETECTION_RADIUS) {
                digitMaterial.uniforms.ambientIntensity.value = 0.8;
            } else {
                digitMaterial.uniforms.ambientIntensity.value = 0.401;
            }
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update materials
    cubeLightMaterial.uniforms.time.value += 0.05;
    alphabetMaterial.uniforms.viewPosition.value.copy(camera.position);
    digitMaterial.uniforms.viewPosition.value.copy(camera.position);
    alphabetMaterial.uniforms.cubePos.value.copy(cubeMesh.position);
    digitMaterial.uniforms.cubePos.value.copy(cubeMesh.position);

    // Update cube rotation
    cubeMesh.rotation.x += 0.01;
    cubeMesh.rotation.y += 0.01;

    // Update projectiles
    updateProjectiles();

    // Render
    composer.render();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
window.addEventListener('resize', onWindowResize, false);

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            cubeMesh.position.y += 0.1;
            break;
        case 's':
            cubeMesh.position.y -= 0.1;
            break;
        case 'a':
            camera.position.x -= 0.1;
            break;
        case 'd':
            camera.position.x += 0.1;
            break;
        case 'q':
            cubeMesh.position.z -= 0.1;
            break;
        case 'e':
            cubeMesh.position.z += 0.1;
            break;
        case ' ':
            const projectileStartPos = cubeMesh.position.clone();
            const projectileDirection = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            );
            projectiles.push(new Projectile(projectileStartPos, projectileDirection));
            break;
    }
});

// Start animation
animate();