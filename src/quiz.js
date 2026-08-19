// ==========================================================================
// QUIZ & ASSISTANT ROBOT: Math Mini-game & Watering Buff System
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { LANDMARK_COORDS } from './config.js';
import { gameState, notifyStateChange } from './state.js';
import { sfx } from './audio.js';

export function createRobotAssistant(scene, particleManager) {
    const wellRobotGroup = new THREE.Group();
    wellRobotGroup.position.set(LANDMARK_COORDS.robotWell.x, LANDMARK_COORDS.robotWell.y, LANDMARK_COORDS.robotWell.z);
    scene.add(wellRobotGroup);

    // Materials
    const matRock = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.8 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const matRoof = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    const matRobot = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.4, metalness: 0.3 });
    const matAccent = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.3, metalness: 0.2 });

    // 1. บ่อน้ำหินโบราณ (Stone Well)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.8, 16), matRock);
    base.position.y = 0.4;
    base.castShadow = true;
    base.receiveShadow = true;

    const waterWell = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.81, 16), new THREE.MeshBasicMaterial({ color: 0x2980b9 }));
    waterWell.position.y = 0.4;

    const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.0, 0.18), matWood);
    post1.position.set(0.8, 1.0, 0); post1.castShadow = true;
    const post2 = post1.clone(); post2.position.set(-0.8, 1.0, 0);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.8, 4), matRoof);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.4;
    roof.castShadow = true;

    wellRobotGroup.add(base, waterWell, post1, post2, roof);

    // 2. ตัวหุ่นยนต์ (Retro Toy Robot)
    const robotMesh = new THREE.Group();
    robotMesh.position.set(1.6, 0, 0.8);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.5), matRobot);
    body.position.y = 0.7; body.castShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.45), matRobot);
    head.position.y = 1.35; head.castShadow = true;

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMat);
    eye1.position.set(0.14, 1.4, 0.23);
    const eye2 = eye1.clone(); eye2.position.x = -0.14;

    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35), matRobot);
    ant.position.y = 1.7;
    const antTop = new THREE.Mesh(new THREE.SphereGeometry(0.09), matAccent);
    antTop.position.y = 1.9;

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 16), matAccent);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.y = 0.24;
    wheel.castShadow = true;

    robotMesh.add(body, head, eye1, eye2, ant, antTop, wheel);
    wellRobotGroup.add(robotMesh);

    // สร้างคำถาม Quiz
    function generateQuestion() {
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let n1, n2, ans;

        if (op === '+') {
            n1 = Math.floor(Math.random() * 40) + 5;
            n2 = Math.floor(Math.random() * 40) + 5;
            ans = n1 + n2;
        } else if (op === '-') {
            n1 = Math.floor(Math.random() * 50) + 20;
            n2 = Math.floor(Math.random() * 20) + 1;
            ans = n1 - n2;
        } else {
            n1 = Math.floor(Math.random() * 9) + 2;
            n2 = Math.floor(Math.random() * 9) + 2;
            ans = n1 * n2;
        }

        gameState.robot.currentAnswer = ans;

        const options = [ans];
        while (options.length < 4) {
            const wrong = ans + (Math.floor(Math.random() * 15) - 7);
            if (wrong !== ans && wrong >= 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }
        options.sort(() => Math.random() - 0.5);

        return {
            text: `${n1} ${op} ${n2} = ?`,
            options,
            answer: ans
        };
    }

    function onAnswer(isCorrect) {
        if (isCorrect) {
            gameState.robot.buffActive = true;
            gameState.robot.buffTimer = 12;
            gameState.player.correctQuizCount++;

            // เช็คเควส
            const q = gameState.quests.find(item => item.id === 'quiz_1');
            if (q && !q.done) {
                q.current = 1;
                q.done = true;
                gameState.player.money += q.reward;
                sfx.levelUp();
            }

            sfx.correct();
        } else {
            gameState.robot.broken = true;
            gameState.robot.brokenTimer = 10;
            sfx.error();
        }
        notifyStateChange();
    }

    function update(delta, elapsed) {
        if (gameState.robot.broken) {
            gameState.robot.brokenTimer -= delta;
            // สั่นหุ่นยนต์
            robotMesh.position.x = 1.6 + Math.sin(elapsed * 45) * 0.08;
            particleManager.emitSparks(wellRobotGroup.position);

            if (gameState.robot.brokenTimer <= 0) {
                gameState.robot.broken = false;
                robotMesh.position.set(1.6, 0, 0.8);
                notifyStateChange();
            }
        } else if (gameState.robot.buffActive) {
            gameState.robot.buffTimer -= delta;
            // หุ่นยนต์หมุนตัวพร้อมสเปรย์ละอองน้ำ
            robotMesh.rotation.y += delta * 6;
            particleManager.emitWaterDrop(new THREE.Vector3(LANDMARK_COORDS.farmCenter.x, 2, LANDMARK_COORDS.farmCenter.z), 7);

            if (gameState.robot.buffTimer <= 0) {
                gameState.robot.buffActive = false;
                robotMesh.rotation.y = 0;
                notifyStateChange();
            }
        } else {
            // โยกตัวดุ๊กดิ๊กเบาๆ
            robotMesh.rotation.y = Math.sin(elapsed * 2) * 0.15;
            robotMesh.position.y = Math.abs(Math.sin(elapsed * 4)) * 0.04;
        }
    }

    return {
        mesh: wellRobotGroup,
        getWorldPosition: () => {
            const vec = new THREE.Vector3();
            wellRobotGroup.getWorldPosition(vec);
            return vec;
        },
        generateQuestion,
        onAnswer,
        update
    };
}
