import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

/**
 * Island & Crops 3D Asset Manager
 * Loads environment props and crop models (.glb) from assets/models/
 */
export class IslandManager {
    constructor(scene, onProgress, onComplete) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.onProgress = onProgress || (() => {});
        this.onComplete = onComplete || (() => {});
        this.models = {};
        this.cropTemplates = {};
        
        // Environment Props Registry
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
            { id: 'lighthouse', path: './assets/models/lighthouse.glb', pos: [49.0, 2.3, -16.0], scale: [1, 1, 1] },
            
            // Crop Models Registry
            { id: 'tomato', path: './assets/models/tomato.glb', isCrop: true },
            { id: 'carrot', path: './assets/models/carrot.glb', isCrop: true },
            { id: 'cabbage', path: './assets/models/cabbage.glb', isCrop: true },
            { id: 'corn', path: './assets/models/corn.glb', isCrop: true },
            { id: 'strawberry', path: './assets/models/strawberry.glb', isCrop: true },
            { id: 'watermelon', path: './assets/models/watermelon.glb', isCrop: true },
            { id: 'pineapple', path: './assets/models/pineapple.glb', isCrop: true },
            { id: 'dragonfruit', path: './assets/models/dragonfruit.glb', isCrop: true }
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

                // Apply soft shadows to all submeshes
                model.traverse((obj) => {
                    if (obj.isMesh) {
                        obj.castShadow = true;
                        obj.receiveShadow = true;
                    }
                });

                if (item.isCrop) {
                    // Store as reusable template for farm plots
                    this.cropTemplates[item.id] = model;
                } else {
                    model.position.set(...item.pos);
                    model.scale.set(...item.scale);
                    this.scene.add(model);
                    this.models[item.id] = model;
                }

                this.onItemLoaded(item.id);
            },
            undefined,
            (error) => {
                // Graceful fallback for missing local GLBs
                console.warn(`Asset ${item.path} not found, ready for upload.`);
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

    /**
     * Spawn an instance of a crop model on a farm plot
     */
    spawnCrop(cropId, scale = 1.0) {
        if (this.cropTemplates[cropId]) {
            const clone = this.cropTemplates[cropId].clone(true);
            clone.scale.setScalar(scale);
            return clone;
        }
        return null;
    }
}
