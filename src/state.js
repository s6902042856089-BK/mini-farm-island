// ==========================================================================
// STATE MANAGEMENT: Reactive State for Coastal Farm
// ==========================================================================

export const gameState = {
    // โหมดเกม: 'intro' (หน้าโหลด/ไตเติ้ล), 'transitioning' (กล้องบินลง), 'exploring' (กำลังเล่น)
    mode: 'intro',
    
    // ข้อมูลผู้เล่น
    player: {
        name: 'Island Explorer',
        avatar: '🤠',
        money: 100,
        energy: 100,
        harvestCount: 0,
        correctQuizCount: 0
    },
    
    // คลังผลผลิต
    inventory: {
        tomato: 0,
        carrot: 0,
        cabbage: 0,
        corn: 0
    },

    // เมล็ดที่เลือกไว้สำหรับปลูก
    selectedSeed: 'tomato',

    // ระดับสิ่งปลูกสร้าง
    unlockedPlots: 6, // สูงสุด 12 แปลง
    barnLevel: 1,     // ระดับ 1-3
    windmillActive: false,

    // สถานะหุ่นยนต์ช่วยรดน้ำ
    robot: {
        buffActive: false,
        buffTimer: 0,
        broken: false,
        brokenTimer: 0,
        currentAnswer: 0
    },

    // ระบบเควส
    quests: [
        { id: 'harvest_3', title: 'เก็บเกี่ยวผลผลิต 3 ชิ้น', target: 3, current: 0, reward: 50, done: false },
        { id: 'quiz_1', title: 'ช่วยหุ่นยนต์ตอบคำถาม 1 ครั้ง', target: 1, current: 0, reward: 80, done: false },
        { id: 'expand_plot', title: 'ขยายแปลงผักเพิ่ม 1 แปลง', target: 7, current: 6, reward: 120, done: false }
    ],

    // บันทึกการเปลี่ยนแปลงเพื่อ Auto-Save
    isDirty: false
};

// Event Listeners สำหรับการอัปเดต UI เมื่อ State เปลี่ยน
const listeners = [];

export function subscribeState(listener) {
    listeners.push(listener);
}

export function notifyStateChange() {
    gameState.isDirty = true;
    for (const fn of listeners) {
        fn(gameState);
    }
}
