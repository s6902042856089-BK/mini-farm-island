// ==========================================================================
// SUPABASE INTEGRATION: Auth (Google/Email) & Cloud Save System
// ==========================================================================

import { gameState, notifyStateChange } from './state.js';

// Credentials from Supabase Project
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
    || window.__SUPABASE_URL__ 
    || 'https://acwtvjyavxpuuhkeqlln.supabase.co';

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) 
    || window.__SUPABASE_ANON_KEY__ 
    || 'sb_publishable_35sQvmZqYLxKEf5hajnxRw__Q-FdhrA';

let supabase = null;
let currentUser = null;

export function initSupabase() {
    if (window.supabase) {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client connected to:', SUPABASE_URL);
            
            // ตรวจสอบ session ปัจจุบัน
            checkUserSession();

            // ฟังการเปลี่ยนแปลง Auth State (Login / Logout)
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Supabase Auth Event:', event);
                if (session?.user) {
                    onUserLoggedIn(session.user);
                } else {
                    onUserLoggedOut();
                }
            });

            // ตั้งระบบ Auto-Save ทุกๆ 30 วินาที
            setInterval(() => {
                if (currentUser && gameState.isDirty) {
                    saveToCloud();
                }
            }, 30000);

        } catch (e) {
            console.warn('Supabase initialization error:', e);
        }
    }
}

// 1. Google OAuth Login
export async function signInWithGoogle() {
    if (!supabase) {
        alert('Supabase client ยังไม่พร้อมทำงาน');
        return;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + error.message);
        console.error('Google Sign-In Error:', error);
    }
}

// 2. Email Sign Up / Sign In
export async function signInWithEmail(email, password) {
    if (!supabase) return;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert(error.message);
    } else if (data?.user) {
        onUserLoggedIn(data.user);
    }
}

export async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    onUserLoggedOut();
    location.reload();
}

// 3. จัดการเมื่อ User ล็อกอินสำเร็จ
async function onUserLoggedIn(user) {
    currentUser = user;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Explorer';
    const avatarUrl = user.user_metadata?.avatar_url;

    gameState.player.name = fullName;
    if (avatarUrl) gameState.player.avatar = `<img src="${avatarUrl}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;">`;

    // อัปเดต UI บนหน้าเว็บ
    const authStatus = document.getElementById('hud-auth-status');
    const playerNameDisplay = document.getElementById('hud-player-name');
    const loginPromptCard = document.getElementById('btn-google-login');

    if (playerNameDisplay) playerNameDisplay.innerText = fullName;
    if (authStatus) authStatus.style.display = 'flex';
    if (loginPromptCard) {
        loginPromptCard.innerText = `เข้าสู่ระบบในชื่อ: ${fullName} ✓`;
        loginPromptCard.style.background = '#e8f8f5';
        loginPromptCard.style.borderColor = '#2ecc71';
        loginPromptCard.disabled = true;
    }

    console.log('Logged in as:', fullName, 'ID:', user.id);
    await loadCloudSave(user.id);
}

function onUserLoggedOut() {
    currentUser = null;
    gameState.player.name = 'Island Explorer';
    const authStatus = document.getElementById('hud-auth-status');
    if (authStatus) authStatus.style.display = 'none';
}

// 4. ตรวจสอบสถานะ User Session
async function checkUserSession() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        onUserLoggedIn(session.user);
    }
}

// 5. บันทึกข้อมูลฟาร์มขึ้น Cloud
export async function saveToCloud() {
    if (!supabase || !currentUser) return;

    const saveData = {
        user_id: currentUser.id,
        money: gameState.player.money,
        inventory: gameState.inventory,
        unlocked_plots: gameState.unlockedPlots,
        barn_level: gameState.barnLevel,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('game_saves').upsert(saveData, { onConflict: 'user_id' });
    if (error) {
        console.warn('Auto-save warning (สร้างตาราง game_saves บน Supabase แล้วหรือยัง?):', error.message);
    } else {
        gameState.isDirty = false;
        console.log('☁️ Game successfully saved to Supabase Cloud!');
    }
}

// 6. โหลดข้อมูลฟาร์มจาก Cloud
async function loadCloudSave(userId) {
    if (!supabase) return;
    const { data, error } = await supabase.from('game_saves').select('*').eq('user_id', userId).single();
    if (data && !error) {
        gameState.player.money = data.money ?? gameState.player.money;
        gameState.inventory = data.inventory ?? gameState.inventory;
        gameState.unlockedPlots = data.unlocked_plots ?? gameState.unlockedPlots;
        gameState.barnLevel = data.barn_level ?? gameState.barnLevel;
        notifyStateChange();
        console.log('☁️ Game loaded from Supabase Cloud successfully!');
    }
}
