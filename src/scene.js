// ==========================================================================
// SCENE & GRAPHICS ENGINE: Coastal World Three.js Setup
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export function createScene(container) {
    const scene = new THREE.Scene();

    // ท้องฟ้าสีฟ้าพาสเทลสไตล์ Coastal World
    const skyColor = new THREE.Color(0x8fe0ff);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x9ee5ff, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // ตำแหน่งเริ่มต้นสำหรับ Intro Wide Shot
    camera.position.set(30, 22, 32);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // ตั้งค่าแสงเงาสไตล์ภาพยนตร์ (ACESFilmic)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // แสง 1: Hemisphere Light (ท้องฟ้าสีฟ้า + พื้นหญ้าอุ่น)
    const hemiLight = new THREE.HemisphereLight(0xd4f3ff, 0x82a952, 0.85);
    scene.add(hemiLight);

    // แสง 2: Directional Sun Light (แสงอาทิตย์สีทองสร้างเงา)
    const sunLight = new THREE.DirectionalLight(0xfff3db, 1.2);
    sunLight.position.set(25, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    
    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // ทะเลสไตล์ Low-Poly Turquoise พร้อมคลื่นพลิ้ว
    const waterGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x36b8e8,
        roughness: 0.1,
        metalness: 0.2,
        flatShading: true,
        transparent: true,
        opacity: 0.88
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.6;
    water.receiveShadow = true;
    scene.add(water);

    // ข้อมูลสำหรับคลื่นน้ำ
    const waveVertices = [];
    const posAttr = waterGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        waveVertices.push({
            x: posAttr.getX(i),
            y: posAttr.getY(i),
            ang: Math.random() * Math.PI * 2,
            amp: 0.15 + Math.random() * 0.15,
            speed: 0.015 + Math.random() * 0.02
        });
    }

    function animateOcean(elapsed) {
        for (let i = 0; i < waveVertices.length; i++) {
            const v = waveVertices[i];
            posAttr.setZ(i, Math.sin(v.ang + elapsed * v.speed * 80) * v.amp);
        }
        posAttr.needsUpdate = true;
    }

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return {
        scene,
        camera,
        renderer,
        sunLight,
        animateOcean
    };
}
