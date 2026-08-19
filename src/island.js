// ==========================================================================
// ISLAND ENVIRONMENT: Coastal World Archipelago & Landmarks
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { LANDMARK_COORDS } from './config.js';

export function buildCoastalIsland(scene) {
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // ==========================================
    // 1. MATERIALS (Kenney / Coastal Palette)
    // ==========================================
    const matGrass = new THREE.MeshStandardMaterial({ color: 0x76c843, roughness: 0.8, flatShading: true });
    const matSand = new THREE.MeshStandardMaterial({ color: 0xf5dfa6, roughness: 0.9, flatShading: true });
    const matRock = new THREE.MeshStandardMaterial({ color: 0x8a99a8, roughness: 0.8, flatShading: true });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x9b6b43, roughness: 0.7 });
    const matPlank = new THREE.MeshStandardMaterial({ color: 0xbf8b58, roughness: 0.7 });
    const matRoofRed = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.6 });
    const matRoofBlue = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.6 });
    const matWhiteWall = new THREE.MeshStandardMaterial({ color: 0xfdfaf2, roughness: 0.6 });
    const matFoliage = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8, flatShading: true });
    const matFoliageDark = new THREE.MeshStandardMaterial({ color: 0x1e8449, roughness: 0.8, flatShading: true });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.3, metalness: 0.5 });
    const matCloud = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, flatShading: true });

    // ==========================================
    // 2. ISLAND TERRAIN (Tiered Plateau)
    // ==========================================
    // ชายหาดทรายชั้นล่าง
    const beachGeo = new THREE.CylinderGeometry(20, 22, 2.5, 24);
    const beachMesh = new THREE.Mesh(beachGeo, matSand);
    beachMesh.position.y = -0.2;
    beachMesh.receiveShadow = true;
    beachMesh.castShadow = true;
    islandGroup.add(beachMesh);

    // ผืนหญ้าชั้นหลัก
    const grassGeo = new THREE.CylinderGeometry(18, 19.5, 1.8, 24);
    const grassMesh = new THREE.Mesh(grassGeo, matGrass);
    grassMesh.position.y = 1.0;
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    islandGroup.add(grassMesh);

    // หน้าผาชั้นบน (Highland Cliff ฝั่งประภาคาร)
    const cliffGeo = new THREE.CylinderGeometry(8, 9, 2.2, 16);
    const cliffMesh = new THREE.Mesh(cliffGeo, matGrass);
    cliffMesh.position.set(-10, 2.5, -6);
    cliffMesh.receiveShadow = true;
    cliffMesh.castShadow = true;
    islandGroup.add(cliffMesh);

    // ==========================================
    // 3. PIER & MARKET (ท่าเรือไม้ชายหาด)
    // ==========================================
    const pierGroup = new THREE.Group();
    pierGroup.position.set(0, 0.4, 15);
    
    // สะพานไม้ทอดยาวลงทะเล
    for (let i = 0; i < 7; i++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, 1.2), matPlank);
        plank.position.set(0, 0, (i - 3) * 1.4);
        plank.receiveShadow = true;
        plank.castShadow = true;
        pierGroup.add(plank);

        if (i % 2 === 0) {
            const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0), matWood);
            pillarL.position.set(-1.6, -0.8, (i - 3) * 1.4);
            pillarL.castShadow = true;
            const pillarR = pillarL.clone();
            pillarR.position.x = 1.6;
            pierGroup.add(pillarL, pillarR);
        }
    }

    // ซุ้มตลาดขายผลผลิตริมท่าเรือ
    const stall = new THREE.Group();
    stall.position.set(3.5, 0.8, 12);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 1.2), matWood);
    counter.position.y = 0.6;
    counter.castShadow = true;
    counter.receiveShadow = true;
    
    // หลังคาผ้าใบกันแดดลายทาง
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.8), matRoofRed);
    awning.position.set(0, 2.0, 0);
    awning.rotation.x = 0.2;
    awning.castShadow = true;

    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0), matWood);
    post1.position.set(-1.2, 1.0, 0.6);
    const post2 = post1.clone(); post2.position.set(1.2, 1.0, 0.6);

    // ลังใส่ผลไม้โชว์หน้าร้าน
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), matWood);
    crate.position.set(0, 1.35, 0);
    stall.add(counter, awning, post1, post2, crate);
    islandGroup.add(stall);
    islandGroup.add(pierGroup);

    // ==========================================
    // 4. LIGHTHOUSE (ประภาคารริมหน้าผา)
    // ==========================================
    const lighthouseGroup = new THREE.Group();
    lighthouseGroup.position.set(LANDMARK_COORDS.lighthouse.x, 3.6, LANDMARK_COORDS.lighthouse.z);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 1.5, 12), matRock);
    base.position.y = 0.75;
    base.castShadow = true;

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.5, 6.0, 12), matWhiteWall);
    tower.position.y = 4.5;
    tower.castShadow = true;

    // แถบสีแดงประภาคาร
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.35, 1.4, 12), matRoofRed);
    stripe.position.y = 4.5;

    // ห้องโคมไฟ
    const glassRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
    glassRoom.position.y = 8.0;

    const topRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.2, 12), matRoofRed);
    topRoof.position.y = 9.2;
    topRoof.castShadow = true;

    // ลำแสงหมุน
    const beamLight = new THREE.Mesh(
        new THREE.ConeGeometry(3.0, 16.0, 12, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xfffae0, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    beamLight.position.set(0, 8.0, 8.0);
    beamLight.rotation.x = Math.PI / 2;

    lighthouseGroup.add(base, tower, stripe, glassRoom, topRoof, beamLight);
    islandGroup.add(lighthouseGroup);

    // ==========================================
    // 5. WINDMILL (กังหันลมหมุนได้)
    // ==========================================
    const windmillGroup = new THREE.Group();
    windmillGroup.position.set(LANDMARK_COORDS.windmill.x, 2.0, LANDMARK_COORDS.windmill.z);

    const millTower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.2, 5.0, 8), matWhiteWall);
    millTower.position.y = 2.5;
    millTower.castShadow = true;

    const millDome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), matRoofBlue);
    millDome.position.y = 5.0;

    // ใบพัดกังหัน
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 4.8, 1.6);
    
    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.05), matPlank);
        blade.position.y = 1.6;
        const holder = new THREE.Group();
        holder.rotation.z = (i * Math.PI) / 2;
        holder.add(blade);
        bladesGroup.add(holder);
    }
    windmillGroup.add(millTower, millDome, bladesGroup);
    islandGroup.add(windmillGroup);

    // ==========================================
    // 6. BARN & FARM HOUSE (โรงนาและบ้าน)
    // ==========================================
    const barnGroup = new THREE.Group();
    barnGroup.position.set(LANDMARK_COORDS.barn.x, 2.0, LANDMARK_COORDS.barn.z);

    const barnBody = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.0, 4.0), matWhiteWall);
    barnBody.position.y = 1.5;
    barnBody.castShadow = true; barnBody.receiveShadow = true;

    const barnRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.2, 4), matRoofRed);
    barnRoof.rotation.y = Math.PI / 4;
    barnRoof.position.y = 4.0;
    barnRoof.castShadow = true;

    const barnDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.1), matWood);
    barnDoor.position.set(0, 1.0, 2.05);

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), matRock);
    chimney.position.set(-1.5, 4.2, -1.0);
    chimney.castShadow = true;

    barnGroup.add(barnBody, barnRoof, barnDoor, chimney);
    islandGroup.add(barnGroup);

    // ==========================================
    // 7. DECORATIONS: PALM TREES & CLOUDS
    // ==========================================
    const trees = [];
    function createPalmTree(x, z, scale = 1) {
        const tree = new THREE.Group();
        // ลำต้นโค้ง
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.5, 6), matWood);
        trunk.position.y = 1.75;
        trunk.rotation.z = (Math.random() - 0.5) * 0.2;
        trunk.castShadow = true;
        tree.add(trunk);

        // ใบปาล์มทรงพุ่ม
        for (let i = 0; i < 5; i++) {
            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 5), matFoliage);
            leaf.rotation.x = Math.PI / 2 + 0.3;
            leaf.rotation.z = (i * Math.PI * 2) / 5;
            leaf.position.y = 3.5;
            leaf.castShadow = true;
            tree.add(leaf);
        }
        tree.position.set(x, 1.8, z);
        tree.scale.setScalar(scale);
        islandGroup.add(tree);
        trees.push({ mesh: tree, offset: Math.random() * 10 });
    }

    createPalmTree(8, -10, 1.2);
    createPalmTree(11, -4, 0.9);
    createPalmTree(-12, 6, 1.1);
    createPalmTree(-6, 8, 1.0);
    createPalmTree(10, 6, 1.0);

    // ก้อนหินตกแต่งชายหาด
    function createRock(x, y, z, s = 1) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), matRock);
        rock.position.set(x, y, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        islandGroup.add(rock);
    }
    createRock(6, 0.4, 14, 0.8);
    createRock(-4, 0.4, 15, 0.6);
    createRock(-15, 2.8, -12, 1.6);
    createRock(14, 0.6, 2, 1.2);

    // เมฆ Low-Poly ลอยผ่านเกาะ
    const clouds = [];
    for (let i = 0; i < 5; i++) {
        const cloud = new THREE.Group();
        const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 0), matCloud);
        const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 0), matCloud); p2.position.set(1.5, -0.3, 0);
        const p3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), matCloud); p3.position.set(-1.4, -0.2, 0);
        cloud.add(p1, p2, p3);
        
        cloud.position.set((Math.random() - 0.5) * 60, 14 + Math.random() * 6, (Math.random() - 0.5) * 60);
        cloud.castShadow = true;
        scene.add(cloud);
        clouds.push({ mesh: cloud, speed: 0.8 + Math.random() * 0.8 });
    }

    // ฟังก์ชันอัปเดตอนิเมชันสิ่งแวดล้อม
    function updateEnvironment(delta, elapsed) {
        // หมุนใบพัดกังหันลม
        bladesGroup.rotation.z += delta * 1.5;

        // หมุนลำแสงประภาคาร
        beamLight.rotation.z += delta * 1.0;

        // ลมพัดต้นไม้โยก
        trees.forEach(t => {
            t.mesh.rotation.z = Math.sin(elapsed * 2 + t.offset) * 0.04;
        });

        // เมฆลอย
        clouds.forEach(c => {
            c.mesh.position.x += delta * c.speed;
            if (c.mesh.position.x > 40) c.mesh.position.x = -40;
        });
    }

    return {
        islandGroup,
        chimneyPos: new THREE.Vector3(LANDMARK_COORDS.barn.x - 1.5, 6.2, LANDMARK_COORDS.barn.z - 1.0),
        updateEnvironment
    };
}
