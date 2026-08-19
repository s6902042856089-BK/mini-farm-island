// ==========================================================================
// INTERACTIONS & PROXIMITY SYSTEM: Coastal Proximity Badges & Triggers
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { LANDMARK_COORDS } from './config.js';
import { gameState } from './state.js';

export function createInteractionManager(camera, cropsManager, robotAssistant) {
    const actionBadge = document.getElementById('action-prompt');
    const badgeText = document.getElementById('action-prompt-text');
    const badgeKey = document.getElementById('action-prompt-key');

    let activeTarget = null;
    const tempVec = new THREE.Vector3();

    function checkProximity(playerPos) {
        if (gameState.mode !== 'exploring') {
            if (actionBadge) actionBadge.style.display = 'none';
            return null;
        }

        let nearest = null;
        let minDistance = 3.2; // ระยะการตรวจจับ

        // 1. ตรวจสอบแปลงผัก
        cropsManager.plots.forEach(plot => {
            if (plot.isLocked) return;
            const plotPos = plot.getWorldPosition();
            const d = playerPos.distanceTo(plotPos);
            if (d < minDistance) {
                minDistance = d;
                if (plot.state === 'empty') {
                    nearest = { type: 'plant', target: plot, text: 'ปลูกเมล็ดพันธุ์', pos: plotPos };
                } else if (plot.state === 'ready') {
                    nearest = { type: 'harvest', target: plot, text: 'เก็บเกี่ยวผลผลิต ✨', pos: plotPos };
                } else {
                    nearest = { type: 'growing', target: plot, text: `กำลังเติบโต (${Math.round(plot.progress * 100)}%)`, pos: plotPos };
                }
            }
        });

        // 2. ตรวจสอบหุ่นยนต์
        const robotPos = robotAssistant.getWorldPosition();
        const dRobot = playerPos.distanceTo(robotPos);
        if (dRobot < minDistance + 0.5) {
            minDistance = dRobot;
            if (gameState.robot.broken) {
                nearest = { type: 'robot_broken', target: robotAssistant, text: `หุ่นยนต์พัง! (${Math.ceil(gameState.robot.brokenTimer)}s)`, pos: robotPos };
            } else if (gameState.robot.buffActive) {
                nearest = { type: 'robot_buff', target: robotAssistant, text: `กำลังรดน้ำ 💦 (${Math.ceil(gameState.robot.buffTimer)}s)`, pos: robotPos };
            } else {
                nearest = { type: 'robot_quiz', target: robotAssistant, text: 'ตอบคำถามรับบัฟรดน้ำ 🤖', pos: robotPos };
            }
        }

        // 3. ตรวจสอบตลาดขายผลผลิต
        const marketPos = new THREE.Vector3(LANDMARK_COORDS.marketPier.x + 3.5, 1.2, LANDMARK_COORDS.marketPier.z);
        const dMarket = playerPos.distanceTo(marketPos);
        if (dMarket < minDistance + 0.8) {
            minDistance = dMarket;
            nearest = { type: 'market', target: 'market', text: 'ตลาดริมท่าเรือ 🛒 (ขายของ)', pos: marketPos };
        }

        // 4. ตรวจสอบโรงนา
        const barnPos = new THREE.Vector3(LANDMARK_COORDS.barn.x, 2.0, LANDMARK_COORDS.barn.z);
        const dBarn = playerPos.distanceTo(barnPos);
        if (dBarn < minDistance + 1.2) {
            minDistance = dBarn;
            nearest = { type: 'barn', target: 'barn', text: 'โรงนา & ต่อเติมเกาะ 🔨', pos: barnPos };
        }

        activeTarget = nearest;

        // อัปเดตตำแหน่งป้ายบนหน้าจอ (3D ➔ Screen 2D)
        if (nearest && actionBadge) {
            tempVec.copy(nearest.pos);
            tempVec.y += 1.8;
            tempVec.project(camera);

            if (tempVec.z < 1) {
                const x = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(tempVec.y * 0.5) + 0.5) * window.innerHeight;

                actionBadge.style.display = 'flex';
                actionBadge.style.left = `${x}px`;
                actionBadge.style.top = `${y}px`;
                if (badgeText) badgeText.innerText = nearest.text;
                if (badgeKey) badgeKey.innerText = nearest.type === 'growing' ? '🌱' : 'E';
            } else {
                actionBadge.style.display = 'none';
            }
        } else if (actionBadge) {
            actionBadge.style.display = 'none';
        }

        return activeTarget;
    }

    function triggerActiveInteraction() {
        return activeTarget;
    }

    return {
        checkProximity,
        triggerActiveInteraction,
        getActiveTarget: () => activeTarget
    };
}
