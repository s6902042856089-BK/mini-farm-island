// ==========================================================================
// PARTICLE SYSTEM: Visual FX (Dust, Smoke, Water Drops, Sparkles)
// ==========================================================================

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];

        // Materials cache
        this.matDust = new THREE.MeshBasicMaterial({ color: 0xedd6af, transparent: true, opacity: 0.7 });
        this.matWater = new THREE.MeshBasicMaterial({ color: 0x4fa4db, transparent: true, opacity: 0.8 });
        this.matSmoke = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        this.matSpark = new THREE.MeshBasicMaterial({ color: 0xff4d4f });
        this.matStar = new THREE.MeshBasicMaterial({ color: 0xfadb14 });

        this.geoSmallSphere = new THREE.SphereGeometry(0.12, 6, 6);
        this.geoTinyBox = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    }

    // 1. ละอองฝุ่นใต้เท้าเวลาเดิน/วิ่ง
    emitDust(pos) {
        if (Math.random() < 0.3) return;
        const p = new THREE.Mesh(this.geoSmallSphere, this.matDust.clone());
        p.position.copy(pos);
        p.position.y += 0.08;
        p.position.x += (Math.random() - 0.5) * 0.2;
        p.position.z += (Math.random() - 0.5) * 0.2;

        const vel = new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.3 + Math.random() * 0.3, (Math.random() - 0.5) * 0.5);
        this.scene.add(p);
        this.particles.push({ mesh: p, vel, life: 0.4, maxLife: 0.4, type: 'dust' });
    }

    // 2. ละอองน้ำรดแปลงผัก
    emitWaterDrop(centerPos, spread = 4) {
        const p = new THREE.Mesh(this.geoSmallSphere, this.matWater.clone());
        p.position.set(
            centerPos.x + (Math.random() - 0.5) * spread,
            centerPos.y + 4 + Math.random() * 2,
            centerPos.z + (Math.random() - 0.5) * spread
        );
        p.scale.set(0.6, 1.2, 0.6);
        const vel = new THREE.Vector3(0, -6 - Math.random() * 3, 0);
        this.scene.add(p);
        this.particles.push({ mesh: p, vel, life: 1.2, maxLife: 1.2, type: 'water' });
    }

    // 3. ควันลอยจากปล่องไฟ
    emitChimneySmoke(pos) {
        if (Math.random() < 0.8) return;
        const p = new THREE.Mesh(this.geoSmallSphere, this.matSmoke.clone());
        p.position.copy(pos);
        const vel = new THREE.Vector3((Math.random() - 0.5) * 0.3 + 0.2, 1.2 + Math.random() * 0.5, (Math.random() - 0.5) * 0.3);
        this.scene.add(p);
        this.particles.push({ mesh: p, vel, life: 1.5, maxLife: 1.5, type: 'smoke' });
    }

    // 4. สะเก็ดไฟตอนหุ่นยนต์พัง
    emitSparks(pos) {
        for (let i = 0; i < 3; i++) {
            const p = new THREE.Mesh(this.geoTinyBox, this.matSpark.clone());
            p.position.copy(pos);
            p.position.y += 1.2;
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                2 + Math.random() * 3,
                (Math.random() - 0.5) * 4
            );
            this.scene.add(p);
            this.particles.push({ mesh: p, vel, life: 0.6, maxLife: 0.6, gravity: -9.8, type: 'spark' });
        }
    }

    // 5. ประกายดาวเมื่อเก็บเกี่ยว
    emitHarvestStars(pos) {
        for (let i = 0; i < 8; i++) {
            const p = new THREE.Mesh(this.geoTinyBox, this.matStar.clone());
            p.position.copy(pos);
            p.position.y += 0.5;
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                2 + Math.random() * 2.5,
                (Math.random() - 0.5) * 3
            );
            this.scene.add(p);
            this.particles.push({ mesh: p, vel, life: 0.8, maxLife: 0.8, gravity: -4.0, type: 'star' });
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;

            if (p.life <= 0 || p.mesh.position.y < -1) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose?.();
                this.particles.splice(i, 1);
                continue;
            }

            p.mesh.position.addScaledVector(p.vel, delta);

            if (p.gravity) {
                p.vel.y += p.gravity * delta;
            }

            const progress = p.life / p.maxLife;

            if (p.type === 'dust') {
                p.mesh.scale.setScalar((1 - progress) * 1.5 + 0.2);
                p.mesh.material.opacity = progress * 0.7;
            } else if (p.type === 'smoke') {
                p.mesh.scale.addScalar(delta * 0.8);
                p.mesh.material.opacity = progress * 0.5;
            } else if (p.type === 'star') {
                p.mesh.rotation.x += delta * 5;
                p.mesh.rotation.y += delta * 5;
            }
        }
    }
}
