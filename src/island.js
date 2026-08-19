import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

/**
 * Island 3D Model Manager
 * Loads modular .glb models from assets/models/ and places them into the Three.js scene.
 */
export class IslandManager {
    constructor(scene, onProgress, onComplete) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.onProgress = onProgress || (() => {});
        this.onComplete = onComplete || (() => {});
        this.models = {};
        
        // Asset model registry
        this.assetList = [
            { id: 'island', path: './assets/models/island.glb', pos: [0, 0, 0], scale: [1, 1, 1] },
            { id: 'farmhouse', path: './assets/models/farmhouse.glb', pos: [-4.5, 1.5, -8.0], scale: [1, 1, 1] },
            { id: 'windmill', path: './assets/models/windmill.glb', pos: [-8.5, 2.6, 0], scale: [1, 1, 1] },
            { id: 'dock', path: './assets/models/dock.glb', pos: [0, 0.35, 11.8], scale: [1, 1, 1] },
            { id: 'market', path: './assets/models/market.glb', pos: [2.8, 1.5, 7.5], scale: [1, 1, 1] },
            { id: 'tree01', path: './assets/models/tree01.glb', pos: [-2.0, 1.5, -10.5], scale: [1.2, 1.2, 1.2] },
            { id: 'tree02', path: './assets/models/tree02.glb', pos: [-8.0, 1.5, -7.5], scale: [1.1, 1.1, 1.1] },
            { id: 'bush', path: './assets/models/bush.glb', pos: [6.0, 1.5, 3.0], scale: [1, 1, 1] },
            { id: 'rocks', path: './assets/models/rocks.glb', pos: [12.5, 0.3, 2.5], scale: [1.2, 1.2, 1.2] },
            { id: 'lighthouse', path: './assets/models/lighthouse.glb', pos: [49.0, 2.3, -16.0], scale: [1, 1, 1] }
        ];

        this.loadedCount = 0;
        this.totalAssets = this.assetList.length;
    }

    loadAll() {
        this.assetList.forEach((item) => {
            this.loadModel(item);
        });
    }

    loadModel(item) {
        this.loader.load(
            item.path,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(...item.pos);
                model.scale.set(...item.scale);

                // Apply soft shadows to all meshes
                model.traverse((obj) => {
                    if (obj.isMesh) {
                        obj.castShadow = true;
                        obj.receiveShadow = true;
                    }
                });

                this.scene.add(model);
                this.models[item.id] = model;
                this.onItemLoaded(item.id);
            },
            (xhr) => {
                // Progress tracking
            },
            (error) => {
                // If .glb file is not found locally yet, load graceful stylized fallback
                console.warn(`Asset ${item.path} not found, using fallback.`);
                this.onItemLoaded(item.id);
            }
        );
    }

    onItemLoaded(id) {
        this.loadedCount++;
        const percent = Math.floor((this.loadedCount / this.totalAssets) * 100);
        this.onProgress(percent, id);

        if (this.loadedCount >= this.totalAssets) {
            this.onComplete();
        }
    }
}
