// ==========================================================================
// CHARACTER CONTROLLER: Playable 3D Explorer with Animations
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { LANDMARK_COORDS } from './config.js';

export function createCharacter(scene, particleManager) {
    const charGroup = new THREE.Group();
    charGroup.position.set(LANDMARK_COORDS.spawn.x, LANDMARK_COORDS.spawn.y, LANDMARK_COORDS.spawn.z);
    scene.add(charGroup);

    // Materials
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
    const matShirt = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.7 }); // เสื้อสีฟ้า Coastal
    const matPants = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });
    const matShoes = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.7 });
    const matHat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.6 }); // หมวกฟาง/แก็ปสีส้มสดใส
    const matBackpack = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.7 });

    // 1. ลำตัว (Torso)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.4), matShirt);
    torso.position.y = 0.75;
    torso.castShadow = true;

    // 2. หัว (Head) & หน้า
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.45), matSkin);
    head.position.y = 1.35;
    head.castShadow = true;

    // ดวงตา
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
    eyeL.position.set(0.12, 1.38, 0.23);
    const eyeR = eyeL.clone(); eyeR.position.x = -0.12;

    // หมวก (Explorer Hat)
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 12), matHat);
    hatBrim.position.y = 1.62;
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.3, 12), matHat);
    hatTop.position.y = 1.78;

    // 3. กระเป๋าเป้ (Backpack)
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.25), matBackpack);
    backpack.position.set(0, 0.75, -0.28);
    backpack.castShadow = true;

    // 4. แขน (Arms)
    const armGeo = new THREE.BoxGeometry(0.18, 0.5, 0.18);
    armGeo.translate(0, -0.2, 0);
    const armL = new THREE.Mesh(armGeo, matShirt);
    armL.position.set(0.4, 1.0, 0);
    armL.castShadow = true;

    const armR = new THREE.Mesh(armGeo, matShirt);
    armR.position.set(-0.4, 1.0, 0);
    armR.castShadow = true;

    // 5. ขา (Legs)
    const legGeo = new THREE.BoxGeometry(0.22, 0.5, 0.22);
    legGeo.translate(0, -0.25, 0);
    const legL = new THREE.Mesh(legGeo, matPants);
    legL.position.set(0.18, 0.5, 0);
    legL.castShadow = true;

    const legR = new THREE.Mesh(legGeo, matPants);
    legR.position.set(-0.18, 0.5, 0);
    legR.castShadow = true;

    // รวมชิ้นส่วน
    const modelGroup = new THREE.Group();
    modelGroup.add(torso, head, eyeL, eyeR, hatBrim, hatTop, backpack, armL, armR, legL, legR);
    charGroup.add(modelGroup);

    // State & Physics
    const speed = 9.0;
    const velocity = new THREE.Vector3();
    let moveAnimTime = 0;
    let isMoving = false;

    function update(delta, inputDir) {
        isMoving = inputDir.lengthSq() > 0.01;

        if (isMoving) {
            // คำนวณความเร็ว
            const moveVec = inputDir.clone().normalize().multiplyScalar(speed * delta);
            charGroup.position.add(moveVec);

            // ขอบเขตเกาะ ไม่ให้ตกทะเล (รัศมี 18 หน่วย)
            const distFromCenter = Math.sqrt(charGroup.position.x ** 2 + charGroup.position.z ** 2);
            if (distFromCenter > 18.5) {
                const angle = Math.atan2(charGroup.position.z, charGroup.position.x);
                charGroup.position.x = Math.cos(angle) * 18.5;
                charGroup.position.z = Math.sin(angle) * 18.5;
            }

            // คำนวณความสูงตามความลาดชันของเกาะ
            let targetY = 1.0;
            if (charGroup.position.z > 10) {
                targetY = 0.5; // บนท่าเรือไม้
            } else if (charGroup.position.x < -6 && charGroup.position.z < -2) {
                targetY = 2.5; // บนหน้าผาสูง
            }
            charGroup.position.y = THREE.MathUtils.lerp(charGroup.position.y, targetY, 0.2);

            // หันหน้าตามทิศทางการเดิน
            const targetRotation = Math.atan2(inputDir.x, inputDir.z);
            modelGroup.rotation.y = THREE.MathUtils.lerp(modelGroup.rotation.y, targetRotation, 0.25);

            // แอนิเมชันวิ่ง (แกว่งแขน-ขา + ตัวกระดอน)
            moveAnimTime += delta * 14;
            legL.rotation.x = Math.sin(moveAnimTime) * 0.7;
            legR.rotation.x = -Math.sin(moveAnimTime) * 0.7;
            armL.rotation.x = -Math.sin(moveAnimTime) * 0.7;
            armR.rotation.x = Math.sin(moveAnimTime) * 0.7;
            modelGroup.position.y = Math.abs(Math.sin(moveAnimTime)) * 0.12;

            // ปล่อยฝุ่นใต้เท้า
            particleManager.emitDust(charGroup.position);
        } else {
            // แอนิเมชันยืนนิ่ง (Breathing Idle)
            moveAnimTime += delta * 3;
            legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0, 0.2);
            legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0, 0.2);
            armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, 0, 0.2);
            armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, 0, 0.2);
            modelGroup.position.y = Math.sin(moveAnimTime) * 0.04;
        }
    }

    return {
        mesh: charGroup,
        getPosition: () => charGroup.position,
        isMoving: () => isMoving,
        update
    };
}
