// ==========================================================================
// CONFIGURATION: Mini Farm Island - Coastal World Edition
// ==========================================================================

export const SEED_TYPES = {
    tomato: {
        id: 'tomato',
        name: 'มะเขือเทศ 🍅',
        emoji: '🍅',
        cost: 10,
        earn: 25,
        growTime: 6,
        color: 0xff4d4f,
        description: 'โตไว ได้กำไรง่าย เหมาะกับผู้เริ่มต้น'
    },
    carrot: {
        id: 'carrot',
        name: 'แครอทฉ่ำน้ำ 🥕',
        emoji: '🥕',
        cost: 25,
        earn: 70,
        growTime: 10,
        color: 0xfa8c16,
        description: 'พืชยอดนิยม รสหวาน กรอบ อุดมด้วยวิตามิน'
    },
    cabbage: {
        id: 'cabbage',
        name: 'กะหล่ำปลีชายฝั่ง 🥬',
        emoji: '🥬',
        cost: 60,
        earn: 220,
        growTime: 16,
        color: 0x52c41a,
        description: 'กะหล่ำปลีใบเขียวฉ่ำ ขายได้ราคาดีมาก'
    },
    corn: {
        id: 'corn',
        name: 'ข้าวโพดหวาน 🌽',
        emoji: '🌽',
        cost: 120,
        earn: 450,
        growTime: 22,
        color: 0xfadb14,
        description: 'ข้าวโพดสีทอง ให้ผลตอบแทนคุ้มค่า'
    }
};

export const BUILD_COSTS = {
    plot: 150,        // ปลดล็อกแปลงผัก
    barnUpgrade1: 300, // อัปเกรดบ้าน/โรงนา ระดับ 2
    barnUpgrade2: 800, // อัปเกรดบ้าน/โรงนา ระดับ 3
    windmillBoost: 500 // ซ่อมกังหันลมเพื่อรับโบนัสการขาย
};

export const LANDMARK_COORDS = {
    spawn: { x: 0, y: 1.2, z: 10 },        // จุดเกิดตัวละครที่ท่าเรือ
    farmCenter: { x: 4.5, y: 0.8, z: -2 }, // โซนแปลงผัก
    lighthouse: { x: -14, y: 3.5, z: -8 }, // ประภาคารริมหน้าผา
    barn: { x: -6, y: 1.5, z: -10 },       // โรงนา & บ้าน
    windmill: { x: -11, y: 2.2, z: -3 },   // กังหันลม
    robotWell: { x: -3.5, y: 1.0, z: 2 },  // บ่อน้ำและหุ่นยนต์
    marketPier: { x: 0, y: 0.6, z: 12 }    // ตลาดริมท่าเรือ
};
