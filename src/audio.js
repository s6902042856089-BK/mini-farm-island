// ==========================================================================
// AUDIO SYSTEM: Tone.js Synthesized SFX & Coastal Ambient
// ==========================================================================

let initialized = false;
let synthPlant, synthHarvest, synthCoin, synthError, synthClick, synthCorrect, synthWalk, synthLevelUp;

export async function initAudio() {
    if (initialized) return;
    try {
        if (window.Tone) {
            await window.Tone.start();
            window.Tone.Destination.volume.value = -10;

            // 1. เสียงฝีเท้าเดินเบาๆ
            synthWalk = new window.Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 2,
                oscillator: { type: "triangle" },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 }
            }).toDestination();
            synthWalk.volume.value = -18;

            // 2. เสียงปลูก: "ปุ๊บ!" สปริงเด้งดึ๋ง
            synthPlant = new window.Tone.MembraneSynth({
                pitchDecay: 0.1,
                octaves: 4,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
            }).toDestination();

            // 3. เสียงเก็บเกี่ยว: กระดิ่งระยิบระยับ (Arpeggio)
            synthHarvest = new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 }
            }).toDestination();

            // 4. เสียงเหรียญทองกริ๊งๆ
            synthCoin = new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
            }).toDestination();

            // 5. เสียง Error / ตอบผิด
            synthError = new window.Tone.Synth({
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.2 }
            }).toDestination();

            // 6. เสียงคลิก UI
            synthClick = new window.Tone.Synth({
                oscillator: { type: "sine" },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
            }).toDestination();
            synthClick.volume.value = -12;

            // 7. เสียงตอบถูก / Level Up
            synthCorrect = new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 1 }
            }).toDestination();

            synthLevelUp = new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.8 }
            }).toDestination();

            initialized = true;
        }
    } catch (e) {
        console.warn("Audio init deferred until user interaction:", e);
    }
}

export const sfx = {
    walk: () => {
        if (!initialized) return;
        synthWalk.triggerAttackRelease("C2", "16n");
    },
    plant: () => {
        if (!initialized) return;
        synthPlant.triggerAttackRelease("C4", "8n");
    },
    harvest: () => {
        if (!initialized) return;
        const now = window.Tone.now();
        synthHarvest.triggerAttackRelease("C5", "16n", now);
        synthHarvest.triggerAttackRelease("E5", "16n", now + 0.05);
        synthHarvest.triggerAttackRelease("G5", "8n", now + 0.1);
        synthHarvest.triggerAttackRelease("C6", "8n", now + 0.15);
    },
    coin: () => {
        if (!initialized) return;
        const now = window.Tone.now();
        synthCoin.triggerAttackRelease("E6", "32n", now);
        synthCoin.triggerAttackRelease("G6", "32n", now + 0.04);
        synthCoin.triggerAttackRelease("C7", "16n", now + 0.08);
    },
    click: () => {
        if (!initialized) return;
        synthClick.triggerAttackRelease("F5", "32n");
    },
    error: () => {
        if (!initialized) return;
        const now = window.Tone.now();
        synthError.triggerAttackRelease("D3", "8n", now);
        synthError.frequency.setValueAtTime("D3", now);
        synthError.frequency.exponentialRampToValueAtTime("D2", now + 0.25);
    },
    correct: () => {
        if (!initialized) return;
        const now = window.Tone.now();
        synthCorrect.triggerAttackRelease(["E5", "G5", "C6"], "2n", now);
        synthCorrect.triggerAttackRelease("E6", "8n", now + 0.15);
    },
    levelUp: () => {
        if (!initialized) return;
        const now = window.Tone.now();
        synthLevelUp.triggerAttackRelease(["C5", "E5", "G5", "C6"], "1n", now);
    }
};
