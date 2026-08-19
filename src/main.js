// ==========================================================================
// MASTER GAME ENGINE: Main Loop, Camera Controller, and Input Dispatcher
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { gameState, notifyStateChange } from './state.js';
import { createScene } from './scene.js';
import { ParticleManager } from './particles.js';
import { buildCoastalIsland } from './island.js';
import { createCharacter } from './character.js';
import { createFarmGrid } from './crops.js';
import { createRobotAssistant } from './quiz.js';
import { createInteractionManager } from './interactions.js';
import { createUIManager } from './ui.js';
import { initAudio, sfx } from './audio.js';
import { initSupabase } from './supabase.js';

// 1. Initial Three.js Setup
const container = document.getElementById('game-canvas-container');
const { scene, camera, renderer, animateOcean } = createScene(container);

// 2. Managers
const particleManager = new ParticleManager(scene);
const island = buildCoastalIsland(scene);
const character = createCharacter(scene, particleManager);
const crops = createFarmGrid(scene, particleManager);
const robot = createRobotAssistant(scene, particleManager);
const interactions = createInteractionManager(camera, crops, robot);

// 3. UI Manager
const ui = createUIManager(
    // onStartGame: เริ่มต้นกล้องบินลงสู่ตัวละคร (Cinematic Transition)
    () => {
        initAudio();
        gameState.mode = 'transitioning';
        transitionProgress = 0;
    },
    // onQuizAnswer: ผลการตอบคำถาม
    (isCorrect) => {
        robot.onAnswer(isCorrect);
    },
    // onUnlockPlot: ปลดล็อกแปลงผัก
    () => {
        crops.unlockNextPlot();
    }
);

// 4. Supabase
initSupabase();

// 5. Input System (Keyboard & Virtual Joystick)
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
const inputDirection = new THREE.Vector3();
let touchInputDir = new THREE.Vector2();

window.addEventListener('keydown', (e) => {
    initAudio();
    if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.code)) {
        keys[e.key] = true;
    }
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        handleActionTrigger();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key) || keys.hasOwnProperty(e.code)) {
        keys[e.key] = false;
    }
});

// Mobile Virtual Joystick
const joystickContainer = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');
let isTouchingJoystick = false;
let joystickCenter = { x: 0, y: 0 };

if (joystickContainer) {
    joystickContainer.addEventListener('touchstart', (e) => {
        isTouchingJoystick = true;
        const rect = joystickContainer.getBoundingClientRect();
        joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        handleTouchMove(e);
    });

    window.addEventListener('touchmove', (e) => {
        if (!isTouchingJoystick) return;
        handleTouchMove(e);
    });

    window.addEventListener('touchend', () => {
        isTouchingJoystick = false;
        touchInputDir.set(0, 0);
        if (joystickKnob) joystickKnob.style.transform = `translate(0px, 0px)`;
    });
}

function handleTouchMove(e) {
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenter.x;
    const dy = touch.clientY - joystickCenter.y;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 45);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * dist;
    const ky = Math.sin(angle) * dist;
    if (joystickKnob) joystickKnob.style.transform = `translate(${kx}px, ${ky}px)`;

    touchInputDir.x = kx / 45;
    touchInputDir.y = ky / 45;
}

// Action Trigger (กด E หรือคลิกปุ่มบนหน้าจอ)
const actionBadge = document.getElementById('action-prompt');
if (actionBadge) {
    actionBadge.addEventListener('click', () => {
        initAudio();
        handleActionTrigger();
    });
}

function handleActionTrigger() {
    const target = interactions.getActiveTarget();
    if (!target) return;

    if (target.type === 'plant') {
        const planted = crops.plant(target.target, gameState.selectedSeed);
        if (planted) ui.showToast(`ปลูกเมล็ดเรียบร้อย! 🌱`);
    } else if (target.type === 'harvest') {
        const harvested = crops.harvest(target.target);
        if (harvested) ui.showToast(`เก็บเกี่ยวสำเร็จ! ✨`);
    } else if (target.type === 'robot_quiz') {
        const qData = robot.generateQuestion();
        ui.openQuiz(qData);
    } else if (target.type === 'market') {
        ui.openMarket();
    } else if (target.type === 'barn') {
        // เปิดระบบอัปเกรด
        crops.unlockNextPlot();
    }
}

// 6. Camera Controller & Intro Orbit
let transitionProgress = 0;
const introCameraTarget = new THREE.Vector3(0, 2, 0);
let introAngle = 0;

function updateCamera(delta) {
    const charPos = character.getPosition();

    if (gameState.mode === 'intro') {
        // หมุนกล้องช้าๆ รอบเกาะสำหรับหน้าแรก
        introAngle += delta * 0.15;
        const camX = Math.cos(introAngle) * 34;
        const camZ = Math.sin(introAngle) * 34;
        camera.position.set(camX, 20, camZ);
        camera.lookAt(introCameraTarget);
    } else if (gameState.mode === 'transitioning') {
        // บินโฉบจากมุมสูงลงมาด้านหลังตัวละคร (Smooth Lerp)
        transitionProgress += delta * 0.9;
        const targetCamPos = new THREE.Vector3(charPos.x, charPos.y + 7.5, charPos.z + 13.0);
        camera.position.lerp(targetCamPos, 0.08);
        camera.lookAt(charPos.x, charPos.y + 1.2, charPos.z);

        if (transitionProgress >= 1.0) {
            gameState.mode = 'exploring';
            ui.showToast('ยินดีต้อนรับสู่เกาะฟาร์ม! ใช้ WASD หรือแตะปุ่มเพื่อเดินสำรวจ 🌴');
        }
    } else if (gameState.mode === 'exploring') {
        // กล้อง Third-Person ติดตามตัวละครแบบ Smooth Follow
        const targetCamPos = new THREE.Vector3(charPos.x, charPos.y + 7.5, charPos.z + 13.0);
        camera.position.lerp(targetCamPos, 0.1);
        camera.lookAt(charPos.x, charPos.y + 1.2, charPos.z);
    }
}

// 7. Master Game Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();

    // 1. ท้องทะเลและสิ่งแวดล้อม
    animateOcean(elapsed);
    island.updateEnvironment(delta, elapsed);
    particleManager.emitChimneySmoke(island.chimneyPos);

    // 2. คำนวณ Input เดิน
    inputDirection.set(0, 0, 0);
    if (keys.w || keys.ArrowUp) inputDirection.z -= 1;
    if (keys.s || keys.ArrowDown) inputDirection.z += 1;
    if (keys.a || keys.ArrowLeft) inputDirection.x -= 1;
    if (keys.d || keys.ArrowRight) inputDirection.x += 1;

    if (touchInputDir.lengthSq() > 0.01) {
        inputDirection.x += touchInputDir.x;
        inputDirection.z += touchInputDir.y;
    }

    // 3. อัปเดตตัวละคร
    if (gameState.mode === 'exploring') {
        character.update(delta, inputDirection);
        interactions.checkProximity(character.getPosition());
    }

    // 4. อัปเดตพืชผัก & หุ่นยนต์
    crops.update(delta, camera, gameState.robot.buffActive);
    robot.update(delta, elapsed);
    particleManager.update(delta);

    // 5. กล้องและเรนเดอร์
    updateCamera(delta);
    renderer.render(scene, camera);
}

// Start
notifyStateChange();
animate();
