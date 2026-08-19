import { SEED_TYPES, BUILD_COSTS } from './config.js';
import { gameState, notifyStateChange, subscribeState } from './state.js';
import { sfx } from './audio.js';
import { signInWithGoogle, saveToCloud } from './supabase.js';

export function createUIManager(onStartGame, onQuizAnswer, onUnlockPlot) {
    // Elements
    const titleScreen = document.getElementById('title-screen');
    const startBtn = document.getElementById('btn-start-game');
    const googleLoginBtn = document.getElementById('btn-google-login');
    const hud = document.getElementById('hud');
    const moneyDisplay = document.getElementById('money-display');
    const inventoryCount = document.getElementById('inventory-count');
    const seedSelector = document.getElementById('seed-selector');
    const marketModal = document.getElementById('market-modal');
    const marketList = document.getElementById('market-list');
    const sellAllBtn = document.getElementById('btn-sell-all');
    const quizModal = document.getElementById('quiz-modal');
    const quizQuestionText = document.getElementById('quiz-question');
    const quizOptionsContainer = document.getElementById('quiz-options');
    const buffIndicator = document.getElementById('buff-indicator');
    const buffTimer = document.getElementById('buff-timer');
    const questContainer = document.getElementById('quest-list');
    const shopDrawer = document.getElementById('shop-drawer');
    const buildDrawer = document.getElementById('build-drawer');

    // 1. Title Screen & Start Game Event
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            sfx.click();
            titleScreen.classList.add('fade-out');
            setTimeout(() => {
                titleScreen.style.display = 'none';
                hud.style.display = 'flex';
                onStartGame();
            }, 600);
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            sfx.click();
            signInWithGoogle();
        });
    }

    // 2. Render Seed Quick Selector (Bottom HUD)
    function renderSeedSelector() {
        if (!seedSelector) return;
        seedSelector.innerHTML = '';
        Object.keys(SEED_TYPES).forEach(key => {
            const seed = SEED_TYPES[key];
            const btn = document.createElement('div');
            btn.className = `seed-chip ${gameState.selectedSeed === key ? 'active' : ''}`;
            btn.innerHTML = `
                <span class="seed-emoji">${seed.emoji}</span>
                <span class="seed-label">${seed.name.split(' ')[0]}</span>
                <span class="seed-price">${seed.cost}🪙</span>
            `;
            btn.onclick = () => {
                sfx.click();
                gameState.selectedSeed = key;
                renderSeedSelector();
            };
            seedSelector.appendChild(btn);
        });
    }

    // 3. Render Quests in HUD
    function renderQuests() {
        if (!questContainer) return;
        questContainer.innerHTML = '';
        gameState.quests.forEach(q => {
            const item = document.createElement('div');
            item.className = `quest-item ${q.done ? 'done' : ''}`;
            item.innerHTML = `
                <div class="quest-check">${q.done ? '✓' : '○'}</div>
                <div class="quest-info">
                    <span class="quest-title">${q.title}</span>
                    <span class="quest-reward">+${q.reward}🪙</span>
                </div>
            `;
            questContainer.appendChild(item);
        });
    }

    // 4. Market Modal (Sell Crops)
    function openMarket() {
        if (!marketModal) return;
        sfx.click();
        renderMarketItems();
        marketModal.style.display = 'flex';
    }

    function closeMarket() {
        if (marketModal) marketModal.style.display = 'none';
    }

    function renderMarketItems() {
        if (!marketList) return;
        marketList.innerHTML = '';
        let totalVal = 0;
        let totalItems = 0;

        Object.keys(gameState.inventory).forEach(key => {
            const count = gameState.inventory[key];
            const seed = SEED_TYPES[key];
            const subtotal = count * seed.earn;
            totalVal += subtotal;
            totalItems += count;

            if (count > 0) {
                const row = document.createElement('div');
                row.className = 'market-row';
                row.innerHTML = `
                    <div class="market-item-name">${seed.emoji} ${seed.name.split(' ')[0]} x${count}</div>
                    <div class="market-item-price">+${subtotal} 🪙</div>
                `;
                marketList.appendChild(row);
            }
        });

        if (totalItems === 0) {
            marketList.innerHTML = `<div style="text-align: center; color: #888; padding: 20px;">ไม่มีผลผลิตในคลัง<br>ไปเก็บเกี่ยวพืชผลก่อนนะ!</div>`;
            if (sellAllBtn) sellAllBtn.disabled = true;
        } else {
            if (sellAllBtn) {
                sellAllBtn.disabled = false;
                sellAllBtn.innerText = `ขายทั้งหมด (+${totalVal} 🪙)`;
            }
        }
    }

    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', () => {
            let total = 0;
            Object.keys(gameState.inventory).forEach(key => {
                total += gameState.inventory[key] * SEED_TYPES[key].earn;
                gameState.inventory[key] = 0;
            });
            if (total > 0) {
                gameState.player.money += total;
                sfx.coin();
                showToast(`ขายผลผลิตได้รับ +${total} 🪙 ✨`);
                notifyStateChange();
                saveToCloud();
                closeMarket();
            }
        });
    }

    // 5. Quiz Modal
    function openQuiz(quizData) {
        if (!quizModal) return;
        sfx.click();
        if (quizQuestionText) quizQuestionText.innerText = quizData.text;
        if (quizOptionsContainer) {
            quizOptionsContainer.innerHTML = '';
            quizData.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.innerText = opt;
                btn.onclick = () => {
                    const isCorrect = opt === quizData.answer;
                    if (isCorrect) {
                        btn.classList.add('correct');
                        showToast('ถูกต้อง! บัฟรดน้ำทำงาน 💧');
                    } else {
                        btn.classList.add('wrong');
                        showToast('ตอบผิด! หุ่นยนต์รวนเลย 💥');
                    }
                    setTimeout(() => {
                        quizModal.style.display = 'none';
                        onQuizAnswer(isCorrect);
                    }, 800);
                };
                quizOptionsContainer.appendChild(btn);
            });
        }
        quizModal.style.display = 'flex';
    }

    function closeQuiz() {
        if (quizModal) quizModal.style.display = 'none';
    }

    // 6. Floating Notification Toast
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'floating-toast';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('fade'), 1500);
        setTimeout(() => toast.remove(), 2000);
    }

    // Update UI upon state change
    subscribeState((state) => {
        if (moneyDisplay) moneyDisplay.innerText = `${state.player.money} 🪙`;

        let totalInv = 0;
        Object.values(state.inventory).forEach(v => totalInv += v);
        if (inventoryCount) inventoryCount.innerText = `${totalInv} ชิ้น`;

        if (buffIndicator && buffTimer) {
            if (state.robot.buffActive) {
                buffIndicator.style.display = 'flex';
                buffTimer.innerText = Math.ceil(state.robot.buffTimer);
            } else {
                buffIndicator.style.display = 'none';
            }
        }

        renderQuests();
    });

    renderSeedSelector();
    renderQuests();

    return {
        openMarket,
        closeMarket,
        openQuiz,
        closeQuiz,
        showToast
    };
}
