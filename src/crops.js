import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { SEED_TYPES, LANDMARK_COORDS } from './config.js';
import { gameState, notifyStateChange } from './state.js';
import { sfx } from './audio.js';
import { saveToCloud } from './supabase.js';

export function createFarmGrid(scene, particleManager) {
    const gridGroup = new THREE.Group();
    gridGroup.position.set(LANDMARK_COORDS.farmCenter.x, LANDMARK_COORDS.farmCenter.y, LANDMARK_COORDS.farmCenter.z);
    scene.add(gridGroup);

    const matWoodFrame = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const matSoilDry = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.9 });
    const matSoilWet = new THREE.MeshStandardMaterial({ color: 0x482d16, roughness: 0.8 });
    const matGreen = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.7 });
    const matDarkGreen = new THREE.MeshStandardMaterial({ color: 0x1e8449, roughness: 0.7 });

    const plotSize = 2.4;
    const gap = 0.3;
    const frameGeo = new THREE.BoxGeometry(plotSize, 0.25, plotSize);
    const soilGeo = new THREE.BoxGeometry(plotSize - 0.24, 0.26, plotSize - 0.24);

    const PLOT_COORDS = [
        { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 },
        { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 },
        { c: 0, r: 2 }, { c: 1, r: 2 }, { c: 2, r: 2 },
        { c: 0, r: 3 }, { c: 1, r: 3 }, { c: 2, r: 3 }
    ];

    const plots = [];

    for (let i = 0; i < PLOT_COORDS.length; i++) {
        const plotGroup = new THREE.Group();
        const coord = PLOT_COORDS[i];

        const frame = new THREE.Mesh(frameGeo, matWoodFrame);
        frame.receiveShadow = true;
        frame.castShadow = true;

        const soil = new THREE.Mesh(soilGeo, matSoilDry);
        soil.receiveShadow = true;
        soil.userData = { plotIndex: i };

        plotGroup.add(frame, soil);
        plotGroup.position.set((coord.c - 1) * (plotSize + gap), 0.15, (coord.r - 1.5) * (plotSize + gap));

        const isLocked = i >= gameState.unlockedPlots;
        plotGroup.visible = !isLocked;
        gridGroup.add(plotGroup);

        plots.push({
            index: i,
            mesh: soil,
            group: plotGroup,
            state: 'empty', // 'empty', 'growing', 'ready'
            seedType: null,
            progress: 0,
            cropMesh: null,
            progressBar: null,
            isLocked: isLocked,
            getWorldPosition: () => {
                const vec = new THREE.Vector3();
                plotGroup.getWorldPosition(vec);
                return vec;
            }
        });
    }

    // สร้างโมเดล 3D ของผลผลิตแต่ละชนิด
    function generateCropMesh(type) {
        const crop = new THREE.Group();
        const conf = SEED_TYPES[type];

        if (type === 'tomato') {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.7, 6), matDarkGreen);
            stem.position.y = 0.35;
            const fruit1 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff4d4f, roughness: 0.3 }));
            fruit1.position.set(0.18, 0.45, 0.15);
            const fruit2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff4d4f, roughness: 0.3 }));
            fruit2.position.set(-0.2, 0.35, -0.15);
            crop.add(stem, fruit1, fruit2);
        } else if (type === 'carrot') {
            const root = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0xfa8c16, roughness: 0.5 }));
            root.rotation.x = Math.PI;
            root.position.y = 0.4;
            const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 5), matGreen);
            leaves.position.y = 0.9;
            crop.add(root, leaves);
        } else if (type === 'cabbage') {
            const cab = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), new THREE.MeshStandardMaterial({ color: 0x52c41a, roughness: 0.7 }));
            cab.position.y = 0.45;
            const leafBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.2, 0.1, 8), matDarkGreen);
            leafBase.position.y = 0.1;
            crop.add(cab, leafBase);
        } else if (type === 'corn') {
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6), matDarkGreen);
            stalk.position.y = 0.6;
            const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xfadb14, roughness: 0.4 }));
            cob.position.set(0.15, 0.7, 0);
            cob.rotation.z = -0.3;
            crop.add(stalk, cob);
        }

        crop.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return crop;
    }

    // หลอด Progress Bar ลอยเหนือแปลง
    function createProgressBar() {
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide, depthTest: false })
        );
        const fgGeo = new THREE.PlaneGeometry(1.14, 0.14);
        fgGeo.translate(0.57, 0, 0);
        const fg = new THREE.Mesh(
            fgGeo,
            new THREE.MeshBasicMaterial({ color: 0x2ecc71, side: THREE.DoubleSide, depthTest: false })
        );
        fg.position.set(-0.57, 0, 0.01);
        fg.scale.x = 0.01;

        const group = new THREE.Group();
        group.add(bg, fg);
        group.position.y = 1.4;
        group.renderOrder = 999;
        return { group, bar: fg };
    }

    // ปลูกพืช
    function plant(plot, seedKey) {
        if (plot.state !== 'empty') return false;
        const seed = SEED_TYPES[seedKey];
        if (gameState.player.money < seed.cost) {
            sfx.error();
            return false;
        }

        gameState.player.money -= seed.cost;
        plot.state = 'growing';
        plot.seedType = seedKey;
        plot.progress = 0;
        plot.mesh.material = matSoilWet;

        plot.cropMesh = generateCropMesh(seedKey);
        plot.cropMesh.scale.set(0.1, 0.1, 0.1);
        plot.group.add(plot.cropMesh);

        plot.progressBar = createProgressBar();
        plot.group.add(plot.progressBar.group);

        sfx.plant();
        notifyStateChange();
        saveToCloud();
        return true;
    }

    // เก็บเกี่ยว
    function harvest(plot) {
        if (plot.state !== 'ready') return false;
        const seedKey = plot.seedType;

        gameState.inventory[seedKey]++;
        gameState.player.harvestCount++;

        // เช็คเควส
        const harvestQuest = gameState.quests.find(q => q.id === 'harvest_3');
        if (harvestQuest && !harvestQuest.done) {
            harvestQuest.current++;
            if (harvestQuest.current >= harvestQuest.target) {
                harvestQuest.done = true;
                gameState.player.money += harvestQuest.reward;
                sfx.levelUp();
            }
        }

        particleManager.emitHarvestStars(plot.getWorldPosition());
        sfx.harvest();

        plot.group.remove(plot.cropMesh);
        plot.cropMesh = null;
        plot.state = 'empty';
        plot.seedType = null;
        plot.mesh.material = matSoilDry;

        notifyStateChange();
        saveToCloud();
        return true;
    }

    // ปลดล็อกแปลงใหม่
    function unlockNextPlot() {
        if (gameState.unlockedPlots >= 12) return false;
        const p = plots[gameState.unlockedPlots];
        p.isLocked = false;
        p.group.visible = true;
        gameState.unlockedPlots++;

        const quest = gameState.quests.find(q => q.id === 'expand_plot');
        if (quest && !quest.done) {
            quest.current = gameState.unlockedPlots;
            if (quest.current >= quest.target) {
                quest.done = true;
                gameState.player.money += quest.reward;
                sfx.levelUp();
            }
        }

        sfx.coin();
        notifyStateChange();
        saveToCloud();
        return true;
    }

    // Loop อัปเดตการเติบโต
    function update(delta, camera, isBuffActive) {
        const speedMultiplier = isBuffActive ? 1.6 : 1.0;

        plots.forEach(plot => {
            if (plot.state === 'growing') {
                const conf = SEED_TYPES[plot.seedType];
                plot.progress += (delta / conf.growTime) * speedMultiplier;

                if (plot.progress >= 1.0) {
                    plot.progress = 1.0;
                    plot.state = 'ready';
                    plot.group.remove(plot.progressBar.group);
                    plot.progressBar = null;
                    plot.cropMesh.scale.set(1.2, 1.2, 1.2);
                    setTimeout(() => { if (plot.cropMesh) plot.cropMesh.scale.set(1.0, 1.0, 1.0); }, 200);
                } else {
                    const scale = 0.15 + plot.progress * 0.85;
                    plot.cropMesh.scale.set(scale, scale, scale);
                    plot.progressBar.bar.scale.x = Math.max(0.01, plot.progress);
                    plot.progressBar.group.quaternion.copy(camera.quaternion);
                }
            } else if (plot.state === 'ready' && plot.cropMesh) {
                plot.cropMesh.rotation.y += delta * 1.5;
            }
        });
    }

    return {
        plots,
        plant,
        harvest,
        unlockNextPlot,
        update
    };
}
