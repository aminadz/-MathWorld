// MathWorld - Global Educational Math Games Platform

// Game State
let currentGame = null;
let gameTimer = null;
let gameScore = 0;
let gameLevel = 1;
let gameLives = 3;
let gameTime = 60;
let isGameRunning = false;
let currentQuestion = null;
let currentLanguage = 'en';

// Enhanced Achievement system
let achievements = {
    // Basic Achievements
    firstGame: { unlocked: false, name: 'First Game', description: 'Play your first game', icon: '🎮', points: 10 },
    score100: { unlocked: false, name: 'Century', description: 'Score 100 points', icon: '💯', points: 20 },
    score500: { unlocked: false, name: 'Half Thousand', description: 'Score 500 points', icon: '🔥', points: 50 },
    score1000: { unlocked: false, name: 'Thousand Master', description: 'Score 1000 points', icon: '👑', points: 100 },
    score5000: { unlocked: false, name: 'Math Legend', description: 'Score 5000 points', icon: '🏆', points: 250 },
    
    // Level Achievements
    level5: { unlocked: false, name: 'Level 5', description: 'Reach level 5', icon: '⭐', points: 30 },
    level10: { unlocked: false, name: 'Level 10', description: 'Reach level 10', icon: '🌟', points: 60 },
    level20: { unlocked: false, name: 'Level 20', description: 'Reach level 20', icon: '💫', points: 120 },
    level50: { unlocked: false, name: 'Level 50', description: 'Reach level 50', icon: '🚀', points: 300 },
    
    // Performance Achievements
    perfectGame: { unlocked: false, name: 'Perfect Game', description: 'Complete a game without mistakes', icon: '🎯', points: 100 },
    speedDemon: { unlocked: false, name: 'Speed Demon', description: 'Answer 10 questions in under 30 seconds', icon: '⚡', points: 80 },
    streak10: { unlocked: false, name: 'Hot Streak', description: 'Get 10 correct answers in a row', icon: '🔥', points: 50 },
    streak25: { unlocked: false, name: 'Unstoppable', description: 'Get 25 correct answers in a row', icon: '💥', points: 150 },
    streak50: { unlocked: false, name: 'Legendary', description: 'Get 50 correct answers in a row', icon: '👑', points: 300 },
    
    // Category Achievements
    mathMaster: { unlocked: false, name: 'Math Master', description: 'Play all game categories', icon: '🧠', points: 200 },
    additionExpert: { unlocked: false, name: 'Addition Expert', description: 'Play 50 addition games', icon: '➕', points: 75 },
    multiplicationPro: { unlocked: false, name: 'Multiplication Pro', description: 'Play 50 multiplication games', icon: '✖️', points: 75 },
    geometryGuru: { unlocked: false, name: 'Geometry Guru', description: 'Play 50 geometry games', icon: '📐', points: 75 },
    logicMaster: { unlocked: false, name: 'Logic Master', description: 'Play 50 logic games', icon: '🧩', points: 75 },
    
    // Time-based Achievements
    dailyPlayer: { unlocked: false, name: 'Daily Player', description: 'Play for 7 consecutive days', icon: '📅', points: 100 },
    weeklyWarrior: { unlocked: false, name: 'Weekly Warrior', description: 'Play for 30 consecutive days', icon: '🗓️', points: 250 },
    nightOwl: { unlocked: false, name: 'Night Owl', description: 'Play after midnight', icon: '🦉', points: 50 },
    earlyBird: { unlocked: false, name: 'Early Bird', description: 'Play before 6 AM', icon: '🐦', points: 50 },
    
    // Special Achievements
    comeback: { unlocked: false, name: 'Comeback Kid', description: 'Win a game with 1 life remaining', icon: '💪', points: 100 },
    timeMaster: { unlocked: false, name: 'Time Master', description: 'Complete a game in under 2 minutes', icon: '⏱️', points: 80 },
    accuracyKing: { unlocked: false, name: 'Accuracy King', description: 'Achieve 95% accuracy in a game', icon: '🎯', points: 120 },
    persistence: { unlocked: false, name: 'Persistence', description: 'Play for 1 hour straight', icon: '⏰', points: 150 },
    
    // Hidden Achievements
    easterEgg: { unlocked: false, name: 'Easter Egg', description: 'Find the hidden feature', icon: '🥚', points: 500, hidden: true },
    developer: { unlocked: false, name: 'Developer', description: 'Access developer mode', icon: '👨‍💻', points: 1000, hidden: true }
};

// Statistics
let playerStats = {
    totalGamesPlayed: 0,
    totalScore: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    gamesByCategory: {},
    bestStreak: 0,
    currentStreak: 0,
    lastPlayDate: null,
    highScores: {},
    gameHistory: [],
    totalPlayTime: 0,
    favoriteCategory: null,
    levelProgress: {}
};

// Local Storage Management
class StorageManager {
    static saveStats() {
        try {
            localStorage.setItem('mathworld_stats', JSON.stringify(playerStats));
            localStorage.setItem('mathworld_achievements', JSON.stringify(achievements));
            localStorage.setItem('mathworld_settings', JSON.stringify({
                language: currentLanguage,
                soundEnabled: true,
                darkMode: false,
                autoSave: true
            }));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    static loadStats() {
        try {
            const savedStats = localStorage.getItem('mathworld_stats');
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                playerStats = { ...playerStats, ...parsed };
            }

            const savedAchievements = localStorage.getItem('mathworld_achievements');
            if (savedAchievements) {
                const parsed = JSON.parse(savedAchievements);
                achievements = { ...achievements, ...parsed };
            }

            const savedSettings = localStorage.getItem('mathworld_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                currentLanguage = settings.language || 'en';
                // Apply other settings
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
    }

    static updateHighScore(gameId, score) {
        if (!playerStats.highScores[gameId] || score > playerStats.highScores[gameId]) {
            playerStats.highScores[gameId] = score;
            this.saveStats();
            return true; // New high score
        }
        return false;
    }

    static addGameHistory(gameId, score, timeSpent) {
        const gameRecord = {
            id: gameId,
            score: score,
            timeSpent: timeSpent,
            date: new Date().toISOString(),
            level: gameLevel
        };
        
        playerStats.gameHistory.unshift(gameRecord);
        if (playerStats.gameHistory.length > 100) {
            playerStats.gameHistory = playerStats.gameHistory.slice(0, 100);
        }
        
        this.saveStats();
    }

    static getGameStats(gameId) {
        const gameHistory = playerStats.gameHistory.filter(game => game.id === gameId);
        if (gameHistory.length === 0) return null;

        const totalGames = gameHistory.length;
        const totalScore = gameHistory.reduce((sum, game) => sum + game.score, 0);
        const averageScore = totalScore / totalGames;
        const bestScore = Math.max(...gameHistory.map(game => game.score));
        const totalTime = gameHistory.reduce((sum, game) => sum + game.timeSpent, 0);

        return {
            totalGames,
            totalScore,
            averageScore: Math.round(averageScore),
            bestScore,
            totalTime,
            lastPlayed: gameHistory[0].date
        };
    }
}

// Achievement Manager
class AchievementManager {
    static checkAchievements() {
        const newAchievements = [];
        
        // Score achievements
        if (playerStats.totalScore >= 100 && !achievements.score100.unlocked) {
            this.unlockAchievement('score100');
            newAchievements.push('score100');
        }
        if (playerStats.totalScore >= 500 && !achievements.score500.unlocked) {
            this.unlockAchievement('score500');
            newAchievements.push('score500');
        }
        if (playerStats.totalScore >= 1000 && !achievements.score1000.unlocked) {
            this.unlockAchievement('score1000');
            newAchievements.push('score1000');
        }
        if (playerStats.totalScore >= 5000 && !achievements.score5000.unlocked) {
            this.unlockAchievement('score5000');
            newAchievements.push('score5000');
        }
        
        // Level achievements
        if (gameLevel >= 5 && !achievements.level5.unlocked) {
            this.unlockAchievement('level5');
            newAchievements.push('level5');
        }
        if (gameLevel >= 10 && !achievements.level10.unlocked) {
            this.unlockAchievement('level10');
            newAchievements.push('level10');
        }
        if (gameLevel >= 20 && !achievements.level20.unlocked) {
            this.unlockAchievement('level20');
            newAchievements.push('level20');
        }
        if (gameLevel >= 50 && !achievements.level50.unlocked) {
            this.unlockAchievement('level50');
            newAchievements.push('level50');
        }
        
        // Streak achievements
        if (playerStats.currentStreak >= 10 && !achievements.streak10.unlocked) {
            this.unlockAchievement('streak10');
            newAchievements.push('streak10');
        }
        if (playerStats.currentStreak >= 25 && !achievements.streak25.unlocked) {
            this.unlockAchievement('streak25');
            newAchievements.push('streak25');
        }
        if (playerStats.currentStreak >= 50 && !achievements.streak50.unlocked) {
            this.unlockAchievement('streak50');
            newAchievements.push('streak50');
        }
        
        // First game achievement
        if (playerStats.totalGamesPlayed >= 1 && !achievements.firstGame.unlocked) {
            this.unlockAchievement('firstGame');
            newAchievements.push('firstGame');
        }
        
        // Category achievements
        const categories = Object.keys(playerStats.gamesByCategory);
        if (categories.length >= 10 && !achievements.mathMaster.unlocked) {
            this.unlockAchievement('mathMaster');
            newAchievements.push('mathMaster');
        }
        
        // Time-based achievements
        const now = new Date();
        const hour = now.getHours();
        if (hour >= 0 && hour < 6 && !achievements.earlyBird.unlocked) {
            this.unlockAchievement('earlyBird');
            newAchievements.push('earlyBird');
        }
        if (hour >= 23 && !achievements.nightOwl.unlocked) {
            this.unlockAchievement('nightOwl');
            newAchievements.push('nightOwl');
        }
        
        // Show notifications for new achievements
        newAchievements.forEach(achievementId => {
            this.showAchievementNotification(achievementId);
        });
        
        return newAchievements;
    }
    
    static unlockAchievement(achievementId) {
        if (achievements[achievementId] && !achievements[achievementId].unlocked) {
            achievements[achievementId].unlocked = true;
            achievements[achievementId].unlockedAt = new Date().toISOString();
            
            // Add points to total score
            playerStats.totalScore += achievements[achievementId].points || 0;
            
            // Save achievements
            StorageManager.saveStats();
            
            // Play achievement sound
            SoundManager.playAchievement();
        }
    }
    
    static showAchievementNotification(achievementId) {
        const achievement = achievements[achievementId];
        if (!achievement) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            transform: translateX(400px);
            transition: transform 0.5s ease;
            border: 2px solid #f093fb;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 2rem;">${achievement.icon}</div>
                <div>
                    <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">
                        ${achievement.name}
                    </div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">
                        ${achievement.description}
                    </div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #f093fb;">
                        +${achievement.points} points
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
        
        // Add bounce animation
        AnimationManager.bounceIn(notification);
    }
    
    static getUnlockedCount() {
        return Object.values(achievements).filter(a => a.unlocked).length;
    }
    
    static getTotalPoints() {
        return Object.values(achievements)
            .filter(a => a.unlocked)
            .reduce((total, a) => total + (a.points || 0), 0);
    }
    
    static getProgress() {
        const total = Object.keys(achievements).length;
        const unlocked = this.getUnlockedCount();
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100)
        };
    }
}

// Animation Manager
class AnimationManager {
    static addAnimation(element, animationClass, duration = 1000) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    static staggerAnimation(container, animationClass = 'slide-up', delay = 100) {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            setTimeout(() => {
                this.addAnimation(child, animationClass);
            }, index * delay);
        });
    }

    static showSuccess(element) {
        this.addAnimation(element, 'success-animation', 600);
    }

    static showError(element) {
        this.addAnimation(element, 'error-animation', 500);
    }

    static showLoading(element) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        element.innerHTML = '';
        element.appendChild(spinner);
    }

    static hideLoading(element, content) {
        element.innerHTML = content;
    }

    static typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        element.classList.add('typewriter');
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.remove('typewriter');
            }
        }, speed);
    }

    static bounceIn(element) {
        this.addAnimation(element, 'bounce-in', 800);
    }

    static shake(element) {
        this.addAnimation(element, 'shake', 500);
    }

    static pulse(element) {
        this.addAnimation(element, 'pulse-animation', 2000);
    }

    static slideInFromLeft(element) {
        this.addAnimation(element, 'slide-in-left', 600);
    }

    static slideInFromRight(element) {
        this.addAnimation(element, 'slide-in-right', 600);
    }

    static zoomIn(element) {
        this.addAnimation(element, 'zoom-in', 500);
    }

    static rotateIn(element) {
        this.addAnimation(element, 'rotate-in', 800);
    }
}

// Sound Manager
class SoundManager {
    static sounds = {
        correct: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT',
        incorrect: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT',
        levelUp: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT',
        gameOver: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT',
        click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT',
        achievement: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT'
    };

    static enabled = true;
    static volume = 0.7;

    static init() {
        // Check if sound is enabled in settings
        const settings = localStorage.getItem('mathworld_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.enabled = parsed.soundEnabled !== false;
            this.volume = parsed.soundVolume || 0.7;
        }
    }

    static play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;

        try {
            const audio = new Audio(this.sounds[soundName]);
            audio.volume = this.volume;
            audio.play().catch(e => {
                console.warn('Could not play sound:', e);
            });
        } catch (error) {
            console.warn('Sound error:', error);
        }
    }

    static playCorrect() {
        this.play('correct');
    }

    static playIncorrect() {
        this.play('incorrect');
    }

    static playLevelUp() {
        this.play('levelUp');
    }

    static playGameOver() {
        this.play('gameOver');
    }

    static playClick() {
        this.play('click');
    }

    static playAchievement() {
        this.play('achievement');
    }

    static toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }

    static setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    static saveSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('mathworld_settings') || '{}');
            settings.soundEnabled = this.enabled;
            settings.soundVolume = this.volume;
            localStorage.setItem('mathworld_settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Could not save sound settings:', error);
        }
    }

    // Generate simple beep sounds using Web Audio API
    static generateBeep(frequency = 800, duration = 200, type = 'sine') {
        if (!this.enabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Could not generate beep:', error);
        }
    }

    static playSuccessBeep() {
        this.generateBeep(800, 200, 'sine');
    }

    static playErrorBeep() {
        this.generateBeep(400, 300, 'sawtooth');
    }

    static playLevelUpBeep() {
        this.generateBeep(600, 100, 'sine');
        setTimeout(() => this.generateBeep(800, 100, 'sine'), 100);
        setTimeout(() => this.generateBeep(1000, 200, 'sine'), 200);
    }
}

// Dark Mode Manager
class DarkModeManager {
    static isDarkMode = false;

    static init() {
        // Check saved dark mode preference
        const settings = localStorage.getItem('mathworld_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.isDarkMode = parsed.darkMode || false;
        }

        // Apply dark mode if enabled
        if (this.isDarkMode) {
            this.enableDarkMode();
        }

        // Add event listener to toggle button
        const toggleButton = document.getElementById('darkModeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggle());
        }
    }

    static toggle() {
        if (this.isDarkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }

    static enableDarkMode() {
        document.body.classList.add('dark-mode');
        this.isDarkMode = true;
        this.updateIcon();
        this.saveSettings();
        
        // Play sound effect
        SoundManager.playClick();
    }

    static disableDarkMode() {
        document.body.classList.remove('dark-mode');
        this.isDarkMode = false;
        this.updateIcon();
        this.saveSettings();
        
        // Play sound effect
        SoundManager.playClick();
    }

    static updateIcon() {
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            if (this.isDarkMode) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }

    static saveSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('mathworld_settings') || '{}');
            settings.darkMode = this.isDarkMode;
            localStorage.setItem('mathworld_settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Could not save dark mode settings:', error);
        }
    }

    static isEnabled() {
        return this.isDarkMode;
    }
}

// Available Games
const games = [
    {
        id: 'addition-sprint',
        title: 'Addition Sprint',
        category: 'addition',
        description: 'Solve addition problems quickly!',
        icon: '➕'
    },
    {
        id: 'subtraction-challenge',
        title: 'Subtraction Challenge',
        category: 'subtraction',
        description: 'Master subtraction skills!',
        icon: '➖'
    },
    {
        id: 'multiplication-master',
        title: 'Multiplication Master',
        category: 'multiplication',
        description: 'Learn multiplication tables!',
        icon: '✖️'
    },
    {
        id: 'division-dynasty',
        title: 'Division Dynasty',
        category: 'division',
        description: 'Conquer division problems!',
        icon: '➗'
    },
    {
        id: 'memory-match',
        title: 'Memory Match',
        category: 'memory',
        description: 'Find matching pairs!',
        icon: '🧠'
    },
    {
        id: 'sudoku-solver',
        title: 'Sudoku Solver',
        category: 'puzzle',
        description: 'Fill the grid with numbers!',
        icon: '🔢'
    },
    {
        id: 'geometry-explorer',
        title: 'Geometry Explorer',
        category: 'geometry',
        description: 'Learn shapes and areas!',
        icon: '📐'
    },
    {
        id: 'logic-puzzles',
        title: 'Logic Puzzles',
        category: 'logic',
        description: 'Solve brain teasers!',
        icon: '🧩'
    },
    {
        id: 'fraction-master',
        title: 'Fraction Master',
        category: 'fractions',
        description: 'Master fractions and decimals!',
        icon: '🔢'
    },
    {
        id: 'percentage-pro',
        title: 'Percentage Pro',
        category: 'percentages',
        description: 'Calculate percentages and discounts!',
        icon: '💯'
    },
    {
        id: 'algebra-basics',
        title: 'Algebra Basics',
        category: 'algebra',
        description: 'Solve simple equations!',
        icon: '📐'
    },
    {
        id: 'statistics-expert',
        title: 'Statistics Expert',
        category: 'statistics',
        description: 'Calculate averages and medians!',
        icon: '📊'
    },
    {
        id: 'time-converter',
        title: 'Time Converter',
        category: 'time',
        description: 'Convert time units!',
        icon: '⏰'
    },
    {
        id: 'decimal-master',
        title: 'Decimal Master',
        category: 'decimals',
        description: 'Master decimal operations!',
        icon: '🔢'
    },
    {
        id: 'geometry-advanced',
        title: 'Advanced Geometry',
        category: 'geometry',
        description: 'Solve complex geometry problems!',
        icon: '📐'
    },
    {
        id: 'word-problems',
        title: 'Word Problems',
        category: 'word-problems',
        description: 'Solve real-world math problems!',
        icon: '📝'
    },
    {
        id: 'number-patterns',
        title: 'Number Patterns',
        category: 'patterns',
        description: 'Find the missing numbers!',
        icon: '🔍'
    },
    {
        id: 'mental-math',
        title: 'Mental Math',
        category: 'mental',
        description: 'Calculate without calculator!',
        icon: '🧠'
    },
    {
        id: 'probability',
        title: 'Probability',
        category: 'probability',
        description: 'Calculate probabilities!',
        icon: '🎲'
    },
    {
        id: 'trigonometry',
        title: 'Trigonometry',
        category: 'trigonometry',
        description: 'Solve trigonometric problems!',
        icon: '📊'
    },
    {
        id: 'kenken-puzzle',
        title: 'KenKen Puzzle',
        category: 'puzzle',
        description: 'Fill the grid with numbers using math operations!',
        icon: '🧮'
    },
    {
        id: 'kakuro-puzzle',
        title: 'Kakuro Puzzle',
        category: 'puzzle',
        description: 'Crossword with numbers!',
        icon: '🔢'
    },
    {
        id: 'magic-square',
        title: 'Magic Square',
        category: 'puzzle',
        description: 'Create magic squares with equal sums!',
        icon: '✨'
    },
    {
        id: 'number-search',
        title: 'Number Search',
        category: 'puzzle',
        description: 'Find hidden numbers in the grid!',
        icon: '🔍'
    },

    {
        id: '2048-game',
        title: '2048 Game',
        category: 'puzzle',
        description: 'Combine numbers to reach 2048!',
        icon: '🎯'
    },
    {
        id: 'memory-cards',
        title: 'Memory Cards',
        category: 'memory',
        description: 'Match pairs of cards!',
        icon: '🃏'
    },
    {
        id: 'time-quiz',
        title: 'Time Quiz',
        category: 'time',
        description: 'Test your time knowledge!',
        icon: '⏱️'
    }
];

// Language Translations
const translations = {
    en: {
        'welcome': 'Welcome to MathWorld!',
        'selectGame': 'Select a game to start playing!',
        'score': 'Score',
        'level': 'Level',
        'lives': 'Lives',
        'time': 'Time',
        'startGame': 'Next',
        'pause': 'Pause',
        'reset': 'Reset',
        'gameOver': 'Game Over!',
        'finalScore': 'Final Score',
        'levelReached': 'Level Reached',
        'playAgain': 'Play Again',
        'ready': 'Ready to start?',
        'categories': 'Categories',
        'allGames': 'All Games',
        'addition': 'Addition',
        'subtraction': 'Subtraction',
        'multiplication': 'Multiplication',
        'division': 'Division',
        'geometry': 'Geometry',
        'logic': 'Logic',
        'memory': 'Memory',
        'puzzle': 'Puzzle',
        'fractions': 'Fractions',
        'percentages': 'Percentages',
        'algebra': 'Algebra',
        'statistics': 'Statistics',
        'time': 'Time',
        'decimals': 'Decimals',
        'wordProblems': 'Word Problems',
        'patterns': 'Patterns',
        'mentalMath': 'Mental Math',
        'probability': 'Probability',
        'trigonometry': 'Trigonometry',
        'memoryCards': 'Memory Cards',
        'timeQuiz': 'Time Quiz',
        'backToMenu': 'Back to Menu',
        'searchGames': 'Search games...',
        'home': 'Home',
        'games': 'Games',
        'profile': 'Profile',
        'gamesLibrary': 'Games Library',
        'chooseGames': 'Choose from our collection of educational math games:',
        'playerProfile': 'Player Profile',
        'yourStats': 'Your MathWorld Statistics:',
        'settings': 'Settings',
        'customize': 'Customize your MathWorld experience:',
        'totalScore': 'Total Score',
        'currentLevel': 'Current Level',
        'livesRemaining': 'Lives Remaining',
        'backToGames': 'Back to Games',
        'platformSettings': 'Platform Settings',
        'language': 'Language',
        'gameSettings': 'Game Settings',
        'soundEffects': 'Sound Effects',
        'backgroundMusic': 'Background Music',
        'saveReturn': 'Save & Return',
        'resume': 'Resume',
        'check': 'Check',
        'hint': 'Hint',
        'solve': 'Solve',
        'correct': 'Correct!',
        'incorrect': 'Incorrect!',
        'gameComplete': 'Game Complete!',
        'newGame': 'New Game',
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
        'selectDifficulty': 'Select Difficulty:',
        'loading': 'Loading...',
        'fillAll': 'Please fill all cells!',
        'useAllNumbers': 'Please use each number 1-9 exactly once!',
        'downloadAndroid': 'Download Android'
    },
    ar: {
        'welcome': 'مرحباً بك في عالم الرياضيات!',
        'selectGame': 'اختر لعبة للبدء في اللعب!',
        'score': 'النقاط',
        'level': 'المستوى',
        'lives': 'الأرواح',
        'time': 'الوقت',
        'startGame': 'التالي',
        'pause': 'إيقاف مؤقت',
        'reset': 'إعادة تعيين',
        'gameOver': 'انتهت اللعبة!',
        'finalScore': 'النقاط النهائية',
        'levelReached': 'المستوى الذي وصلت إليه',
        'playAgain': 'العب مرة أخرى',
        'ready': 'جاهز للبدء؟',
        'categories': 'الفئات',
        'allGames': 'جميع الألعاب',
        'addition': 'الجمع',
        'subtraction': 'الطرح',
        'multiplication': 'الضرب',
        'division': 'القسمة',
        'geometry': 'الهندسة',
        'logic': 'المنطق',
        'memory': 'الذاكرة',
        'puzzle': 'الألغاز',
        'fractions': 'الكسور',
        'percentages': 'النسب المئوية',
        'algebra': 'الجبر',
        'statistics': 'الإحصاء',
        'time': 'الزمن',
        'decimals': 'الأعداد العشرية',
        'wordProblems': 'المسائل اللفظية',
        'patterns': 'الأنماط',
        'mentalMath': 'الحساب الذهني',
        'probability': 'الاحتمالات',
        'trigonometry': 'علم المثلثات',
        'memoryCards': 'بطاقات الذاكرة',
        'timeQuiz': 'اختبار الوقت',
        'backToMenu': 'العودة للقائمة',
        'searchGames': 'ابحث عن الألعاب...',
        'home': 'الرئيسية',
        'games': 'الألعاب',
        'profile': 'الملف الشخصي',
        'gamesLibrary': 'مكتبة الألعاب',
        'chooseGames': 'اختر من مجموعتنا من ألعاب الرياضيات التعليمية:',
        'playerProfile': 'الملف الشخصي للاعب',
        'yourStats': 'إحصائياتك في عالم الرياضيات:',
        'settings': 'الإعدادات',
        'customize': 'خصص تجربتك في عالم الرياضيات:',
        'totalScore': 'مجموع النقاط',
        'currentLevel': 'المستوى الحالي',
        'livesRemaining': 'الأرواح المتبقية',
        'backToGames': 'العودة إلى الألعاب',
        'platformSettings': 'إعدادات المنصة',
        'language': 'اللغة',
        'gameSettings': 'إعدادات اللعبة',
        'soundEffects': 'المؤثرات الصوتية',
        'backgroundMusic': 'الموسيقى الخلفية',
        'saveReturn': 'حفظ والعودة',
        'resume': 'استئناف',
        'check': 'فحص',
        'hint': 'تلميح',
        'solve': 'حل',
        'correct': 'صحيح!',
        'incorrect': 'خطأ!',
        'gameComplete': 'اكتملت اللعبة!',
        'newGame': 'لعبة جديدة',
        'easy': 'سهل',
        'medium': 'متوسط',
        'hard': 'صعب',
        'selectDifficulty': 'اختر مستوى الصعوبة:',
        'loading': 'جاري التحميل...',
        'fillAll': 'يرجى ملء جميع الخلايا!',
        'useAllNumbers': 'يرجى استخدام كل رقم من 1-9 مرة واحدة فقط!',
        'downloadAndroid': 'تحميل الأندرويد'
    },
    fr: {
        'welcome': 'Bienvenue dans MathWorld !',
        'selectGame': 'Sélectionnez un jeu pour commencer !',
        'score': 'Score',
        'level': 'Niveau',
        'lives': 'Vies',
        'time': 'Temps',
        'startGame': 'Suivant',
        'pause': 'Pause',
        'reset': 'Réinitialiser',
        'gameOver': 'Partie Terminée !',
        'finalScore': 'Score Final',
        'levelReached': 'Niveau Atteint',
        'playAgain': 'Jouer Encore',
        'ready': 'Prêt à commencer ?',
        'categories': 'Catégories',
        'allGames': 'Tous les Jeux',
        'addition': 'Addition',
        'subtraction': 'Soustraction',
        'multiplication': 'Multiplication',
        'division': 'Division',
        'geometry': 'Géométrie',
        'logic': 'Logique',
        'memory': 'Mémoire',
        'puzzle': 'Puzzle',
        'fractions': 'Fractions',
        'percentages': 'Pourcentages',
        'algebra': 'Algèbre',
        'statistics': 'Statistiques',
        'time': 'Temps',
        'decimals': 'Décimales',
        'wordProblems': 'Problèmes de mots',
        'patterns': 'Motifs',
        'mentalMath': 'Calcul mental',
        'probability': 'Probabilité',
        'trigonometry': 'Trigonométrie',
        'memoryCards': 'Cartes Mémoire',
        'timeQuiz': 'Quiz Temps',
        'backToMenu': 'Retour au Menu',
        'searchGames': 'Rechercher des jeux...',
        'home': 'Accueil',
        'games': 'Jeux',
        'profile': 'Profil',
        'gamesLibrary': 'Bibliothèque de Jeux',
        'chooseGames': 'Choisissez parmi notre collection de jeux mathématiques éducatifs :',
        'playerProfile': 'Profil du Joueur',
        'yourStats': 'Vos Statistiques MathWorld :',
        'settings': 'Paramètres',
        'customize': 'Personnalisez votre expérience MathWorld :',
        'totalScore': 'Score Total',
        'currentLevel': 'Niveau Actuel',
        'livesRemaining': 'Vies Restantes',
        'backToGames': 'Retour aux Jeux',
        'platformSettings': 'Paramètres de la Plateforme',
        'language': 'Langue',
        'gameSettings': 'Paramètres du Jeu',
        'soundEffects': 'Effets Sonores',
        'backgroundMusic': 'Musique de Fond',
        'saveReturn': 'Sauvegarder et Retourner',
        'resume': 'Reprendre',
        'check': 'Vérifier',
        'hint': 'Indice',
        'solve': 'Résoudre',
        'correct': 'Correct !',
        'incorrect': 'Incorrect !',
        'gameComplete': 'Jeu Terminé !',
        'newGame': 'Nouveau Jeu',
        'easy': 'Facile',
        'medium': 'Moyen',
        'hard': 'Difficile',
        'selectDifficulty': 'Sélectionnez la Difficulté:',
        'loading': 'Chargement...',
        'fillAll': 'Veuillez remplir toutes les cellules !',
        'useAllNumbers': 'Veuillez utiliser chaque nombre 1-9 exactement une fois !',
        'downloadAndroid': 'Télécharger Android'
    }
};

// Current Language (already declared at top)
// let currentLanguage = 'en';

function showMemoryCardsGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.textContent = translations[currentLanguage]['memoryCards'];
    optionsGrid.innerHTML = '';
    
    // Generate memory cards question
    generateMemoryCardsQuestion();
}

function showTimeQuizGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.textContent = translations[currentLanguage]['timeQuiz'];
    optionsGrid.innerHTML = '';
    
    // Generate time quiz question
    generateTimeQuizQuestion();
}

function generateMemoryCardsQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        text-align: center;
        margin-bottom: 20px;
        color: var(--light);
        font-size: 1.1rem;
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    
    let instructionText = '🎮 Find matching pairs of cards! Click on cards to flip them and find pairs.';
    if (currentLanguage === 'ar') {
        instructionText = '🎮 ابحث عن أزواج البطاقات المتطابقة! انقر على البطاقات لقلبها والعثور على الأزواج.';
    } else if (currentLanguage === 'fr') {
        instructionText = '🎮 Trouvez les paires de cartes correspondantes! Cliquez sur les cartes pour les retourner et trouver les paires.';
    }
    instructions.textContent = instructionText;
    
    // Create game stats
    const gameStats = document.createElement('div');
    gameStats.style.cssText = `
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const movesDisplay = document.createElement('div');
    movesDisplay.style.cssText = `
        color: var(--primary);
        font-weight: bold;
        font-size: 1.1rem;
    `;
    movesDisplay.innerHTML = `🔄 <span id="movesCount">0</span> ${currentLanguage === 'ar' ? 'حركة' : currentLanguage === 'fr' ? 'Mouvements' : 'Moves'}`;
    
    const pairsDisplay = document.createElement('div');
    pairsDisplay.style.cssText = `
        color: var(--success);
        font-weight: bold;
        font-size: 1.1rem;
    `;
    pairsDisplay.innerHTML = `✅ <span id="pairsCount">0</span>/8 ${currentLanguage === 'ar' ? 'أزواج' : currentLanguage === 'fr' ? 'Paires' : 'Pairs'}`;
    
    gameStats.appendChild(movesDisplay);
    gameStats.appendChild(pairsDisplay);
    
    // Create memory cards game
    const cardsContainer = document.createElement('div');
    cardsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background: var(--glass);
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    `;
    
    // Better symbols for memory game - using text symbols for better compatibility
    const symbols = [
        { symbol: '★', color: '#FFD700' }, // Gold star
        { symbol: '●', color: '#FF6B6B' }, // Red circle
        { symbol: '▲', color: '#4ECDC4' }, // Teal triangle
        { symbol: '■', color: '#45B7D1' }, // Blue square
        { symbol: '♦', color: '#96CEB4' }, // Green diamond
        { symbol: '♠', color: '#FFEAA7' }, // Yellow spade
        { symbol: '♥', color: '#DDA0DD' }, // Purple heart
        { symbol: '♣', color: '#98D8C8' }  // Mint club
    ];
    
    // Create 16 cards (8 pairs) for 4x4 grid
    const allSymbols = [...symbols, ...symbols]; // Duplicate each symbol for pairs
    const shuffledSymbols = [...allSymbols].sort(() => Math.random() - 0.5);
    
    shuffledSymbols.forEach((symbolData, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbolData.symbol;
        card.dataset.color = symbolData.color;
        card.dataset.index = index;
        card.dataset.flipped = 'false';
        card.style.cssText = `
            width: 75px;
            height: 75px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.4s ease;
            color: transparent;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border: 3px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        `;
        
        // Add card back pattern
        const cardBack = document.createElement('div');
        cardBack.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, #667eea 25%, #764ba2 25%, #764ba2 50%, #667eea 50%, #667eea 75%, #764ba2 75%);
            background-size: 20px 20px;
            border-radius: 12px;
            transition: opacity 0.3s ease;
        `;
        card.appendChild(cardBack);
        
        // Add symbol element
        const symbolElement = document.createElement('div');
        symbolElement.style.cssText = `
            position: relative;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.3s ease;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            font-size: 2.5rem;
            font-weight: bold;
            color: ${symbolData.color};
        `;
        symbolElement.textContent = symbolData.symbol;
        card.appendChild(symbolElement);
        
        card.addEventListener('click', () => flipCard(card));
        cardsContainer.appendChild(card);
    });
    
    optionsGrid.appendChild(instructions);
    optionsGrid.appendChild(gameStats);
    optionsGrid.appendChild(cardsContainer);
    
    // Game state
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    
    function flipCard(card) {
        if (flippedCards.length >= 2 || card.dataset.flipped === 'true') return;
        
        // Flip the card
        card.dataset.flipped = 'true';
        card.style.transform = 'rotateY(180deg)';
        card.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        card.querySelector('div:last-child').style.opacity = '1';
        card.querySelector('div:first-child').style.opacity = '0';
        
        flippedCards.push(card);
        moves++;
        document.getElementById('movesCount').textContent = moves;
        
        if (flippedCards.length === 2) {
            setTimeout(() => {
                if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
                    // Match found
                    flippedCards.forEach(c => {
                        c.style.background = 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)';
                        c.style.border = '3px solid #27AE60';
                        c.style.transform = 'scale(1.05)';
                    });
                    matchedPairs++;
                    document.getElementById('pairsCount').textContent = matchedPairs;
                    
                    if (matchedPairs === 8) {
                        setTimeout(() => {
                            // Game completed
                            const completionMessage = currentLanguage === 'ar' ? 
                                '🎉 ممتاز! لقد وجدت جميع الأزواج!' : 
                                currentLanguage === 'fr' ? 
                                '🎉 Excellent! Vous avez trouvé toutes les paires!' :
                                '🎉 Excellent! You found all pairs!';
                            
                            alert(completionMessage);
                            handleCorrectAnswer();
                        }, 500);
                    }
                } else {
                    // No match - flip cards back
                    flippedCards.forEach(c => {
                        c.dataset.flipped = 'false';
                        c.style.transform = 'rotateY(0deg)';
                        c.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        c.querySelector('div:last-child').style.opacity = '0';
                        c.querySelector('div:first-child').style.opacity = '1';
                    });
                }
                flippedCards = [];
            }, 1000);
        }
    }
}

function generateTimeQuizQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    
    const timeQuestions = [
        {
            question: "How many minutes are in 2 hours?",
            options: ["60", "120", "180", "240"],
            correct: 1
        },
        {
            question: "What time is 3:30 PM in 24-hour format?",
            options: ["13:30", "15:30", "17:30", "19:30"],
            correct: 1
        },
        {
            question: "How many seconds are in 5 minutes?",
            options: ["250", "300", "350", "400"],
            correct: 1
        }
    ];
    
    const question = timeQuestions[Math.floor(Math.random() * timeQuestions.length)];
    
    const questionDiv = document.createElement('div');
    questionDiv.style.cssText = `
        text-align: center;
        margin: 20px 0;
        color: var(--light);
        font-size: 1.2rem;
    `;
    questionDiv.textContent = question.question;
    optionsGrid.appendChild(questionDiv);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        max-width: 400px;
        margin: 20px auto;
    `;
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'btn btn-secondary';
        optionBtn.textContent = option;
        optionBtn.style.cssText = `
            padding: 15px;
            font-size: 1.1rem;
        `;
        optionBtn.addEventListener('click', () => {
            if (index === question.correct) {
                handleCorrectAnswer();
            } else {
                handleIncorrectAnswer();
            }
        });
        optionsContainer.appendChild(optionBtn);
    });
    
    optionsGrid.appendChild(optionsContainer);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load saved data
    StorageManager.loadStats();
    SoundManager.init();
    DarkModeManager.init();
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('mathworld-language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
        updateLanguageUI();
    }
    
    // Initialize navigation
    initializeNavigation();
    
    // Set up Android download button
    setupAndroidDownloadButton();
    
    // Initialize language switcher
    initializeLanguageSwitcher();
    
    // Initialize categories
    initializeCategories();
    
    // Initialize back to menu button
    initializeBackToMenuButton();
    
    // Initialize search
    initializeSearch();
    
    // Initialize game controls
    initializeGameControls();
    
    // Apply translations
    updateTranslations();
    
    // Show welcome screen
    showWelcomeScreen();
}

// Navigation Functions
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections first
    hideAllSections();
    
    // Show the selected section
    switch (sectionId) {
        case 'home':
            showHomeSection();
            break;
        case 'games':
            showGamesSection();
            break;
        case 'profile':
            showProfileSection();
            break;
        case 'settings':
            showSettingsSection();
            break;
        default:
            showHomeSection();
    }
}

function hideAllSections() {
    // Hide game area content
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.style.display = 'none';
    optionsGrid.style.display = 'none';
}

function showHomeSection() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.style.display = 'block';
    optionsGrid.style.display = 'block';
    
    // Show welcome content
    document.querySelector('.game-title').textContent = translations[currentLanguage]['welcome'];
    question.textContent = translations[currentLanguage]['selectGame'];
    
    // Show game selection
    showGameSelection(games);
}

function showGamesSection() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.style.display = 'block';
    optionsGrid.style.display = 'block';
    
    // Show games content
    document.querySelector('.game-title').textContent = translations[currentLanguage]['gamesLibrary'];
    question.textContent = translations[currentLanguage]['chooseGames'];
    
    // Show all games in a grid
    showGamesLibrary();
}

function showProfileSection() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.style.display = 'block';
    optionsGrid.style.display = 'block';
    
    // Show profile content
    document.querySelector('.game-title').textContent = translations[currentLanguage]['playerProfile'];
    question.textContent = translations[currentLanguage]['yourStats'];
    
    showProfileStats();
}

function showSettingsSection() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    question.style.display = 'block';
    optionsGrid.style.display = 'block';
    
    // Show settings content
    document.querySelector('.game-title').textContent = translations[currentLanguage]['settings'];
    question.textContent = translations[currentLanguage]['customize'];
    
    showSettingsOptions();
}

// Language Functions
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
}

function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('mathworld-language', lang);
        
        // Update document direction and language
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // Update language UI
        updateLanguageUI();
        
        // Update translations
        updateTranslations();
    }
}

function updateLanguageUI() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

function updateTranslations() {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach((element, index) => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLanguage] && translations[currentLanguage][key]) {
                // Add staggered animation for category items
                if (element.classList.contains('category-item')) {
                    element.style.animationDelay = `${index * 0.05}s`;
                }
                element.textContent = translations[currentLanguage][key];
            }
        });
        
        // Update placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[currentLanguage] && translations[currentLanguage][key]) {
                element.placeholder = translations[currentLanguage][key];
            }
        });
        
        // Update specific elements
        const gameTitle = document.querySelector('.game-title');
        if (gameTitle) {
            gameTitle.textContent = translations[currentLanguage]['welcome'];
        }
        
        // Mark translations as loaded
        document.body.classList.add('translations-loaded');
    }, 100);
    
    // Don't clear question and options here - let the game functions handle it
    // This prevents interference with game content
    
    // Update category labels
    updateCategoryLabels();
}

function updateCategoryLabels() {
    // Update category labels with proper translations
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const translationKey = item.getAttribute('data-i18n');
        
        if (translations[currentLanguage] && translations[currentLanguage][translationKey]) {
            item.textContent = translations[currentLanguage][translationKey];
        }
    });
}

function showBackToMenuButton() {
    const backBtn = document.getElementById('backToMenuBtn');
    if (backBtn) {
        backBtn.style.display = 'block';
    }
}

function hideBackToMenuButton() {
    const backBtn = document.getElementById('backToMenuBtn');
    if (backBtn) {
        backBtn.style.display = 'none';
    }
}

function backToMenu() {
    // Hide back button
    hideBackToMenuButton();
    
    // Clear current game
    currentGame = null;
    
    // Reset game state
    resetGameState();
    
    // Show welcome screen
    showWelcomeScreen();
}

function initializeBackToMenuButton() {
    const backBtn = document.getElementById('backToMenuBtn');
    if (backBtn) {
        backBtn.addEventListener('click', backToMenu);
    }
}

// Category Functions
function initializeCategories() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            selectCategory(category);
        });
    });
}

function selectCategory(category) {
    // Hide back button when returning to menu
    hideBackToMenuButton();
    
    // Clear previous content first
    const questionElement = document.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    if (questionElement) {
        questionElement.textContent = '';
    }
    if (optionsGrid) {
        optionsGrid.innerHTML = '';
        optionsGrid.className = 'options-grid'; // Reset to default class
    }
    
    // Update active category
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Filter games
    filterGames(category);
}

function filterGames(category) {
    const filteredGames = category === 'all' ? games : games.filter(game => game.category === category);
    showGameSelection(filteredGames);
}

function showGameSelection(gamesList) {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    // Clear previous content completely
    question.textContent = '';
    optionsGrid.innerHTML = '';
    
    // Set new content
    question.textContent = translations[currentLanguage]['selectGame'];
    
    gamesList.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'option-btn';
        gameCard.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">${game.icon}</div>
            <div style="font-size: 1.1rem; font-weight: 600;">${game.title}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">${game.description}</div>
        `;
        gameCard.onclick = () => {
            console.log('Starting game:', game);
            startGame(game);
        };
        optionsGrid.appendChild(gameCard);
    });
}

function showGamesLibrary() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'option-btn';
        gameCard.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">${game.icon}</div>
            <div style="font-size: 1.1rem; font-weight: 600;">${game.title}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">${game.description}</div>
            <div style="font-size: 0.8rem; margin-top: 10px; color: var(--warning);">Category: ${game.category}</div>
        `;
        gameCard.onclick = () => {
            console.log('Starting game:', game);
            startGame(game);
        };
        optionsGrid.appendChild(gameCard);
    });
}

function showProfileStats() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    const statsCard = document.createElement('div');
    statsCard.style.cssText = 'background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; text-align: center; max-width: 500px; margin: 0 auto;';
    statsCard.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 20px;">🏆</div>
        <h3 style="color: var(--warning); margin-bottom: 20px;">Your Achievements</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                <div style="font-size: 2rem; color: var(--success);">${gameScore}</div>
                <div>${translations[currentLanguage]['totalScore']}</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                <div style="font-size: 2rem; color: var(--warning);">${gameLevel}</div>
                <div>${translations[currentLanguage]['currentLevel']}</div>
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <div style="font-size: 1.5rem; color: var(--accent);">${gameLives}</div>
            <div>${translations[currentLanguage]['livesRemaining']}</div>
        </div>
        <button class="btn btn-primary" onclick="showHomeSection()">${translations[currentLanguage]['backToGames']}</button>
    `;
    
    optionsGrid.appendChild(statsCard);
}

function showSettingsOptions() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    const settingsCard = document.createElement('div');
    settingsCard.style.cssText = 'background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; text-align: center; max-width: 500px; margin: 0 auto;';
    settingsCard.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 20px;">⚙️</div>
        <h3 style="color: var(--warning); margin-bottom: 20px;">${translations[currentLanguage]['platformSettings']}</h3>
        
        <div style="text-align: left; margin-bottom: 20px;">
            <h4 style="color: var(--success); margin-bottom: 10px;">${translations[currentLanguage]['language']}</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="changeLanguage('en')" style="flex: 1;">🇺🇸 English</button>
                <button class="btn btn-secondary" onclick="changeLanguage('ar')" style="flex: 1;">🇸🇦 العربية</button>
                <button class="btn btn-secondary" onclick="changeLanguage('fr')" style="flex: 1;">🇫🇷 Français</button>
            </div>
        </div>
        

        
        <button class="btn btn-primary" onclick="showHomeSection()">${translations[currentLanguage]['saveReturn']}</button>
    `;
    
    optionsGrid.appendChild(settingsCard);
}

// Search Functions
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length > 0) {
            const filteredGames = games.filter(game => 
                game.title.toLowerCase().includes(query) ||
                game.description.toLowerCase().includes(query) ||
                game.category.toLowerCase().includes(query)
            );
            showGameSelection(filteredGames);
        } else {
            showGameSelection(games);
        }
    });
}

// Game Control Functions
function initializeGameControls() {
    const startBtn = document.getElementById('startGameBtn');
    const pauseBtn = document.getElementById('pauseGameBtn');
    const resetBtn = document.getElementById('resetGameBtn');
    
    startBtn.addEventListener('click', startCurrentGame);
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
}

function startCurrentGame() {
    if (currentGame) {
        startGame(currentGame);
    } else {
        showGameSelection(games);
    }
}

// Missing function: showGameSelection
function showGameSelection(gamesList) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    gamesList.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'option-btn';
        gameCard.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">${game.icon}</div>
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 5px;">${game.title}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">${game.description}</div>
        `;
        
        gameCard.addEventListener('click', () => {
            startGame(game);
        });
        
        optionsGrid.appendChild(gameCard);
    });
}

function startGame(game) {
    console.log('startGame called with:', game);
    if (!game || !game.id) {
        console.error('Invalid game object:', game);
        return;
    }
    
    // Show back to menu button
    showBackToMenuButton();
    
    // Clear previous content
    const questionElement = document.querySelector('.question');
    const optionsGrid = document.getElementById('optionsGrid');
    
    if (questionElement) {
        questionElement.textContent = '';
    }
    if (optionsGrid) {
        optionsGrid.innerHTML = '';
        optionsGrid.className = 'options-grid'; // Reset to default class
    }
    
    currentGame = game;
    document.querySelector('.game-title').textContent = game.title;
    
    // Reset game state without showing welcome screen
    resetGameState();
    
    // Show game based on type
    switch (game.id) {
        case 'addition-sprint':
            showAdditionGame();
            break;
        case 'subtraction-challenge':
            showSubtractionGame();
            break;
        case 'multiplication-master':
            showMultiplicationGame();
            break;
        case 'division-dynasty':
            showDivisionGame();
            break;
        case 'memory-match':
            showMemoryGame();
            break;
        case 'sudoku-solver':
            showSudokuGame();
            break;
        case 'geometry-explorer':
            showGeometryGame();
            break;
        case 'logic-puzzles':
            showLogicGame();
            break;
        case 'fraction-master':
            showFractionGame();
            break;
        case 'percentage-pro':
            showPercentageGame();
            break;
        case 'algebra-basics':
            showAlgebraGame();
            break;
        case 'statistics-expert':
            showStatisticsGame();
            break;
        case 'time-converter':
            showTimeGame();
            break;
        case 'decimal-master':
            showDecimalGame();
            break;
        case 'geometry-advanced':
            showAdvancedGeometryGame();
            break;
        case 'word-problems':
            showWordProblemsGame();
            break;
        case 'number-patterns':
            showPatternsGame();
            break;
        case 'mental-math':
            showMentalMathGame();
            break;
        case 'probability':
            showProbabilityGame();
            break;
        case 'trigonometry':
            showTrigonometryGame();
            break;
        case 'kenken-puzzle':
            showKenKenGame();
            break;
        case 'kakuro-puzzle':
            showKakuroGame();
            break;
        case 'magic-square':
            showMagicSquareGame();
            break;
        case 'number-search':
            showNumberSearchGame();
            break;

        case '2048-game':
            show2048Game();
            break;

        case 'memory-cards':
            showMemoryCardsGame();
            break;
        case 'time-quiz':
            showTimeQuizGame();
            break;
        default:
            showAdditionGame();
    }
}

function showAdditionGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = translations[currentLanguage]['ready'];
    optionsGrid.innerHTML = '';
    
    // Generate addition question
    generateAdditionQuestion();
}

function showSubtractionGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = translations[currentLanguage]['ready'];
    optionsGrid.innerHTML = '';
    
    // Generate subtraction question
    generateSubtractionQuestion();
}

function showMultiplicationGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = translations[currentLanguage]['ready'];
    optionsGrid.innerHTML = '';
    
    // Generate multiplication question
    generateMultiplicationQuestion();
}

function showDivisionGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = translations[currentLanguage]['ready'];
    optionsGrid.innerHTML = '';
    
    // Generate division question
    generateDivisionQuestion();
}

function showMemoryGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Find matching pairs!';
    optionsGrid.innerHTML = '';
    
    // Create memory game
    createMemoryGame();
}

function showSudokuGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Fill the Sudoku grid!';
    optionsGrid.innerHTML = '';
    
    // Create sudoku game
    createSudokuGame();
}

function showGeometryGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    // Clear options first
    optionsGrid.innerHTML = '';
    
    // Show loading message
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    
    // Generate geometry question
    generateGeometryQuestion();
}

function showLogicGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    // Clear options first
    optionsGrid.innerHTML = '';
    
    // Show loading message
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    
    // Generate logic question
    generateLogicQuestion();
}

function showFractionGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Master fractions and decimals!';
    optionsGrid.innerHTML = '';
    
    // Generate fraction question
    generateFractionQuestion();
}

function showPercentageGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Calculate percentages and discounts!';
    optionsGrid.innerHTML = '';
    
    // Generate percentage question
    generatePercentageQuestion();
}

function showAlgebraGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Solve simple equations!';
    optionsGrid.innerHTML = '';
    
    // Generate algebra question
    generateAlgebraQuestion();
}

function showStatisticsGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Calculate averages and medians!';
    optionsGrid.innerHTML = '';
    
    // Generate statistics question
    generateStatisticsQuestion();
}

function showTimeGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Convert time units!';
    optionsGrid.innerHTML = '';
    
    // Generate time question
    generateTimeQuestion();
}

function showDecimalGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Master decimal operations!';
    optionsGrid.innerHTML = '';
    
    // Generate decimal question
    generateDecimalQuestion();
}

function showAdvancedGeometryGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Solve complex geometry problems!';
    optionsGrid.innerHTML = '';
    
    // Generate advanced geometry question
    generateAdvancedGeometryQuestion();
}

function showWordProblemsGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Solve real-world math problems!';
    optionsGrid.innerHTML = '';
    
    // Generate word problem
    generateWordProblem();
}

function showPatternsGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Find the missing numbers!';
    optionsGrid.innerHTML = '';
    
    // Generate pattern question
    generatePatternQuestion();
}

function showMentalMathGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Calculate without calculator!';
    optionsGrid.innerHTML = '';
    
    // Generate mental math question
    generateMentalMathQuestion();
}

function showProbabilityGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Calculate probabilities!';
    optionsGrid.innerHTML = '';
    
    // Generate probability question
    generateProbabilityQuestion();
}

function showTrigonometryGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    question.textContent = 'Solve trigonometric problems!';
    optionsGrid.innerHTML = '';
    
    // Generate trigonometry question
    generateTrigonometryQuestion();
}

function generateAdditionQuestion() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const answer = num1 + num2;
    
    let questionText = '';
    if (currentLanguage === 'ar') {
        questionText = `ما هو ناتج ${num1} + ${num2}؟`;
    } else if (currentLanguage === 'fr') {
        questionText = `Quel est le résultat de ${num1} + ${num2} ?`;
    } else {
        questionText = `What is ${num1} + ${num2}?`;
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateSubtractionQuestion() {
    const num1 = Math.floor(Math.random() * 30) + 10;
    const num2 = Math.floor(Math.random() * num1) + 1;
    const answer = num1 - num2;
    
    let questionText = '';
    if (currentLanguage === 'ar') {
        questionText = `ما هو ناتج ${num1} - ${num2}؟`;
    } else if (currentLanguage === 'fr') {
        questionText = `Quel est le résultat de ${num1} - ${num2} ?`;
    } else {
        questionText = `What is ${num1} - ${num2}?`;
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateMultiplicationQuestion() {
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    const answer = num1 * num2;
    
    let questionText = '';
    if (currentLanguage === 'ar') {
        questionText = `ما هو ناتج ${num1} × ${num2}؟`;
    } else if (currentLanguage === 'fr') {
        questionText = `Quel est le résultat de ${num1} × ${num2} ?`;
    } else {
        questionText = `What is ${num1} × ${num2}?`;
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateDivisionQuestion() {
    const num2 = Math.floor(Math.random() * 12) + 1;
    const answer = Math.floor(Math.random() * 12) + 1;
    const num1 = num2 * answer;
    
    let questionText = '';
    if (currentLanguage === 'ar') {
        questionText = `ما هو ناتج ${num1} ÷ ${num2}؟`;
    } else if (currentLanguage === 'fr') {
        questionText = `Quel est le résultat de ${num1} ÷ ${num2} ?`;
    } else {
        questionText = `What is ${num1} ÷ ${num2}?`;
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateGeometryQuestion() {
    const shapes = ['square', 'rectangle', 'triangle', 'circle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    let questionText = '';
    let answer = 0;
    
    if (shape === 'square') {
        const side = Math.floor(Math.random() * 10) + 1;
        answer = side * side;
        if (currentLanguage === 'ar') {
            questionText = `ما هي مساحة المربع الذي طول ضلعه ${side}؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est l'aire d'un carré de côté ${side} ?`;
        } else {
            questionText = `What is the area of a square with side length ${side}?`;
        }
    } else if (shape === 'rectangle') {
        const length = Math.floor(Math.random() * 10) + 1;
        const width = Math.floor(Math.random() * 10) + 1;
        answer = length * width;
        if (currentLanguage === 'ar') {
            questionText = `ما هي مساحة المستطيل الذي طوله ${length} وعرضه ${width}؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est l'aire d'un rectangle de longueur ${length} et largeur ${width} ?`;
        } else {
            questionText = `What is the area of a rectangle with length ${length} and width ${width}?`;
        }
    } else if (shape === 'triangle') {
        const base = Math.floor(Math.random() * 10) + 1;
        const height = Math.floor(Math.random() * 10) + 1;
        answer = Math.round((base * height) / 2);
        if (currentLanguage === 'ar') {
            questionText = `ما هي مساحة المثلث الذي قاعدته ${base} وارتفاعه ${height}؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est l'aire d'un triangle de base ${base} et hauteur ${height} ?`;
        } else {
            questionText = `What is the area of a triangle with base ${base} and height ${height}?`;
        }
    } else if (shape === 'circle') {
        const radius = Math.floor(Math.random() * 10) + 1;
        answer = Math.round(Math.PI * radius * radius);
        if (currentLanguage === 'ar') {
            questionText = `ما هي مساحة الدائرة التي نصف قطرها ${radius}؟ (استخدم π = 3.14)`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est l'aire d'un cercle de rayon ${radius} ? (utilisez π = 3.14)`;
        } else {
            questionText = `What is the area of a circle with radius ${radius}? (use π = 3.14)`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateLogicQuestion() {
    const questions = [
        {
            question: 'If 3 cats catch 3 mice in 3 minutes, how many cats catch 6 mice in 6 minutes?',
            answer: 3,
            options: [1, 2, 3, 6]
        },
        {
            question: 'What comes next: 2, 4, 8, 16, ...?',
            answer: 32,
            options: [24, 28, 32, 36]
        },
        {
            question: 'A farmer has 17 sheep. All but 9 die. How many are left?',
            answer: 9,
            options: [8, 9, 17, 26]
        },
        {
            question: 'What is the next number: 1, 4, 9, 16, 25, ...?',
            answer: 36,
            options: [30, 36, 42, 49]
        },
        {
            question: 'If you have 3 apples and you take away 2, how many do you have?',
            answer: 2,
            options: [1, 2, 3, 5]
        },
        {
            question: 'What comes next: 1, 1, 2, 3, 5, 8, ...?',
            answer: 13,
            options: [11, 12, 13, 21]
        },
        {
            question: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
            answer: 7.5,
            options: [0, 7.5, 15, 90]
        },
        {
            question: 'If 5 machines make 5 widgets in 5 minutes, how long does it take 100 machines to make 100 widgets?',
            answer: 5,
            options: [1, 5, 20, 100]
        },
        {
            question: 'What is the missing number: 2, 6, 12, 20, 30, ...?',
            answer: 42,
            options: [36, 40, 42, 48]
        },
        {
            question: 'If today is Wednesday, what day will it be 100 days from now?',
            answer: 'Thursday',
            options: ['Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        {
            question: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?',
            answer: 5,
            options: [5, 10, 15, 20]
        },
        {
            question: 'What is the next letter: A, C, F, J, ...?',
            answer: 'O',
            options: ['L', 'M', 'N', 'O']
        },
        {
            question: 'If 2 + 2 = 4, 3 + 3 = 6, 4 + 4 = 8, what does 5 + 5 equal?',
            answer: 10,
            options: [8, 9, 10, 11]
        },
        {
            question: 'A man is 4 years old and his sister is 3 times as old. How old will the sister be when the man is 12?',
            answer: 20,
            options: [16, 18, 20, 24]
        },
        {
            question: 'What is the pattern: 1, 8, 27, 64, ...?',
            answer: 125,
            options: [100, 125, 144, 216]
        },
        {
            question: 'If a rooster lays an egg on the roof, which way will it roll?',
            answer: 'Roosters don\'t lay eggs',
            options: ['Left', 'Right', 'Roosters don\'t lay eggs', 'Straight down']
        },
        {
            question: 'What is the next number: 1, 3, 6, 10, 15, ...?',
            answer: 21,
            options: [18, 20, 21, 25]
        },
        {
            question: 'If you\'re in a race and you pass the person in second place, what place are you in?',
            answer: 'Second',
            options: ['First', 'Second', 'Third', 'Last']
        },
        {
            question: 'What is the missing number: 1, 2, 4, 7, 11, ...?',
            answer: 16,
            options: [14, 15, 16, 17]
        },
        {
            question: 'If you have 6 black socks and 6 white socks in a drawer, how many socks do you need to pull out to guarantee a matching pair?',
            answer: 3,
            options: [2, 3, 4, 6]
        },
        {
            question: 'What is the next letter: B, D, G, K, ...?',
            answer: 'P',
            options: ['M', 'N', 'O', 'P']
        },
        {
            question: 'If 1 = 5, 2 = 25, 3 = 325, 4 = 4325, what does 5 equal?',
            answer: 54325,
            options: [54325, 54321, 54320, 54326]
        },
        {
            question: 'What is the next number: 0, 1, 1, 2, 3, 5, 8, 13, ...?',
            answer: 21,
            options: [18, 20, 21, 24]
        },
        {
            question: 'If you have 3 boxes with 2 balls each, and you take 1 ball from each box, how many balls do you have?',
            answer: 3,
            options: [2, 3, 4, 5]
        }
    ];
    
    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    let questionText = selectedQuestion.question;
    
    // Add translations for questions
    if (currentLanguage === 'ar') {
        // Use question index to determine translation
        const questionIndex = questions.findIndex(q => q.question === selectedQuestion.question);
        
        const arabicQuestions = [
            'إذا كان 3 قطط تصطاد 3 فئران في 3 دقائق، كم قطة تحتاج لاصطياد 6 فئران في 6 دقائق؟',
            'ما هو الرقم التالي: 2، 4، 8، 16، ...؟',
            'مزارع لديه 17 خروف. مات كل الخراف عدا 9. كم خروف تبقى؟',
            'ما هو الرقم التالي: 1، 4، 9، 16، 25، ...؟',
            'إذا كان لديك 3 تفاحات وأخذت 2، كم تفاحة لديك؟',
            'ما هو الرقم التالي: 1، 1، 2، 3، 5، 8، ...؟',
            'ساعة تظهر 3:15. ما الزاوية بين عقرب الساعة وعقرب الدقائق؟',
            'إذا كانت 5 آلات تصنع 5 منتجات في 5 دقائق، كم دقيقة تحتاج 100 آلة لصنع 100 منتج؟',
            'ما هو الرقم المفقود: 2، 6، 12، 20، 30، ...؟',
            'إذا كان اليوم الأربعاء، فما هو اليوم بعد 100 يوم؟',
            'مضرب وكرة يكلفان 1.10 دولار. المضرب يكلف دولار واحد أكثر من الكرة. كم تكلف الكرة؟',
            'ما هو الحرف التالي: أ، ج، ف، ي، ...؟',
            'إذا كان 2 + 2 = 4، 3 + 3 = 6، 4 + 4 = 8، فما قيمة 5 + 5؟',
            'رجل عمره 4 سنوات وأخته أكبر منه بثلاث مرات. كم سيكون عمر الأخت عندما يصبح الرجل 12 سنة؟',
            'ما هو النمط: 1، 8، 27، 64، ...؟',
            'إذا وضع ديك بيضة على السطح، في أي اتجاه ستتدحرج؟',
            'ما هو الرقم التالي: 1، 3، 6، 10، 15، ...؟',
            'إذا كنت في سباق وتجاوزت الشخص في المركز الثاني، في أي مركز أنت؟',
            'ما هو الرقم المفقود: 1، 2، 4، 7، 11، ...؟',
            'إذا كان لديك 6 جوارب سوداء و 6 جوارب بيضاء في درج، كم جورب تحتاج لسحبه لضمان الحصول على زوج متطابق؟',
            'ما هو الحرف التالي: ب، د، ج، ك، ...؟',
            'إذا كان 1 = 5، 2 = 25، 3 = 325، 4 = 4325، فما قيمة 5؟',
            'ما هو الرقم التالي: 0، 1، 1، 2، 3، 5، 8، 13، ...؟',
            'إذا كان لديك 3 صناديق في كل منها كرتان، وأخذت كرة واحدة من كل صندوق، كم كرة لديك؟'
        ];
        
        if (questionIndex >= 0 && questionIndex < arabicQuestions.length) {
            questionText = arabicQuestions[questionIndex];
        }
    } else if (currentLanguage === 'fr') {
        // Use question index to determine translation
        const questionIndex = questions.findIndex(q => q.question === selectedQuestion.question);
        
        const frenchQuestions = [
            'Si 3 chats attrapent 3 souris en 3 minutes, combien de chats attrapent 6 souris en 6 minutes ?',
            'Quel est le prochain nombre : 2, 4, 8, 16, ... ?',
            'Un fermier a 17 moutons. Tous sauf 9 meurent. Combien en reste-t-il ?',
            'Quel est le prochain nombre : 1, 4, 9, 16, 25, ... ?',
            'Si vous avez 3 pommes et que vous en prenez 2, combien en avez-vous ?',
            'Quel est le prochain nombre : 1, 1, 2, 3, 5, 8, ... ?',
            'Une horloge montre 3:15. Quel est l\'angle entre l\'aiguille des heures et celle des minutes ?',
            'Si 5 machines font 5 widgets en 5 minutes, combien de temps faut-il à 100 machines pour faire 100 widgets ?',
            'Quel est le nombre manquant : 2, 6, 12, 20, 30, ... ?',
            'Si aujourd\'hui c\'est mercredi, quel jour sera-t-il dans 100 jours ?',
            'Une batte et une balle coûtent 1,10$. La batte coûte 1$ de plus que la balle. Combien coûte la balle ?',
            'Quelle est la prochaine lettre : A, C, F, J, ... ?',
            'Si 2 + 2 = 4, 3 + 3 = 6, 4 + 4 = 8, que vaut 5 + 5 ?',
            'Un homme a 4 ans et sa sœur a 3 fois son âge. Quel âge aura la sœur quand l\'homme aura 12 ans ?',
            'Quel est le motif : 1, 8, 27, 64, ... ?',
            'Si un coq pond un œuf sur le toit, dans quelle direction roulera-t-il ?',
            'Quel est le prochain nombre : 1, 3, 6, 10, 15, ... ?',
            'Si vous êtes dans une course et que vous dépassez la personne en deuxième place, quelle est votre place ?',
            'Quel est le nombre manquant : 1, 2, 4, 7, 11, ... ?',
            'Si vous avez 6 chaussettes noires et 6 chaussettes blanches dans un tiroir, combien de chaussettes devez-vous tirer pour garantir une paire assortie ?',
            'Quelle est la prochaine lettre : B, D, G, K, ... ?',
            'Si 1 = 5, 2 = 25, 3 = 325, 4 = 4325, que vaut 5 ?',
            'Quel est le prochain nombre : 0, 1, 1, 2, 3, 5, 8, 13, ... ?',
            'Si vous avez 3 boîtes avec 2 balles chacune, et que vous prenez 1 balle de chaque boîte, combien de balles avez-vous ?'
        ];
        
        if (questionIndex >= 0 && questionIndex < frenchQuestions.length) {
            questionText = frenchQuestions[questionIndex];
        }
    }
    
    document.querySelector('.question').textContent = questionText;
    
    // Show options
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    selectedQuestion.options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        
        // Translate text options
        let optionText = option;
        if (typeof option === 'string') {
            if (currentLanguage === 'ar') {
                if (option === 'Thursday') optionText = 'الخميس';
                else if (option === 'Wednesday') optionText = 'الأربعاء';
                else if (option === 'Friday') optionText = 'الجمعة';
                else if (option === 'Saturday') optionText = 'السبت';
                else if (option === 'Second') optionText = 'الثاني';
                else if (option === 'First') optionText = 'الأول';
                else if (option === 'Third') optionText = 'الثالث';
                else if (option === 'Last') optionText = 'الأخير';
                else if (option === 'Left') optionText = 'يسار';
                else if (option === 'Right') optionText = 'يمين';
                else if (option === 'Straight down') optionText = 'مستقيم للأسفل';
                else if (option === 'Roosters don\'t lay eggs') optionText = 'الديكة لا تبيض';
            } else if (currentLanguage === 'fr') {
                if (option === 'Thursday') optionText = 'Jeudi';
                else if (option === 'Wednesday') optionText = 'Mercredi';
                else if (option === 'Friday') optionText = 'Vendredi';
                else if (option === 'Saturday') optionText = 'Samedi';
                else if (option === 'Second') optionText = 'Deuxième';
                else if (option === 'First') optionText = 'Premier';
                else if (option === 'Third') optionText = 'Troisième';
                else if (option === 'Last') optionText = 'Dernier';
                else if (option === 'Left') optionText = 'Gauche';
                else if (option === 'Right') optionText = 'Droite';
                else if (option === 'Straight down') optionText = 'Tout droit vers le bas';
                else if (option === 'Roosters don\'t lay eggs') optionText = 'Les coqs ne pondent pas d\'œufs';
            }
        }
        
        optionBtn.textContent = optionText;
        optionBtn.onclick = () => handleAnswer(option, selectedQuestion.answer);
        optionsGrid.appendChild(optionBtn);
    });
}

function generateOptions(correctAnswer, count) {
    const options = [correctAnswer];
    
    while (options.length < count) {
        let wrongAnswer;
        do {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
        } while (wrongAnswer === correctAnswer || wrongAnswer < 0 || options.includes(wrongAnswer));
        
        options.push(wrongAnswer);
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
}

function showOptions(options, correctAnswer) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleAnswer(option, correctAnswer);
        optionsGrid.appendChild(optionBtn);
    });
}

function handleAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning && currentGame) {
                // Generate next question based on current game
                switch (currentGame.id) {
                    case 'addition-sprint':
                        generateAdditionQuestion();
                        break;
                    case 'subtraction-challenge':
                        generateSubtractionQuestion();
                        break;
                    case 'multiplication-master':
                        generateMultiplicationQuestion();
                        break;
                    case 'division-dynasty':
                        generateDivisionQuestion();
                        break;
                    case 'geometry-explorer':
                        generateGeometryQuestion();
                        break;
                    case 'geometry-advanced':
                        generateAdvancedGeometryQuestion();
                        break;
                    case 'logic-puzzles':
                        generateLogicQuestion();
                        break;
                    case 'fraction-master':
                        generateFractionQuestion();
                        break;
                    case 'percentage-pro':
                        generatePercentageQuestion();
                        break;
                    case 'algebra-basics':
                        generateAlgebraQuestion();
                        break;
                    case 'statistics-expert':
                        generateStatisticsQuestion();
                        break;
                    case 'time-converter':
                        generateTimeQuestion();
                        break;
                    case 'decimal-master':
                        generateDecimalQuestion();
                        break;
                    case 'word-problems':
                        generateWordProblemsQuestion();
                        break;
                    case 'number-patterns':
                        generatePatternsQuestion();
                        break;
                    case 'mental-math':
                        generateMentalMathQuestion();
                        break;
                    case 'probability':
                        generateProbabilityQuestion();
                        break;
                                        case 'trigonometry':
                        generateTrigonometryQuestion();
                        break;
                    case 'kenken-puzzle':
                        generateKenKenQuestion();
                        break;
                    case 'kakuro-puzzle':
                        generateKakuroQuestion();
                        break;
                    case 'magic-square':
                        generateMagicSquareQuestion();
                        break;
                    case 'number-search':
                        generateNumberSearchQuestion();
                        break;

                    case '2048-game':
                        generate2048Question();
                        break;

                    case 'memory-cards':
                        generateMemoryCardsQuestion();
                        break;
                    case 'time-quiz':
                        generateTimeQuizQuestion();
                        break;
                    default:
                        // Default to addition if game type not found
                        generateAdditionQuestion();
                }
            }
        }, 1000);
    } else {
        handleIncorrectAnswer();
    }
    
    // Show feedback
    showAnswerFeedback(selectedAnswer, correctAnswer);
}

function showAnswerFeedback(selectedAnswer, correctAnswer) {
    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => {
        const optionText = option.textContent.trim();
        if (optionText === correctAnswer.toString()) {
            option.classList.add('correct');
        } else if (optionText === selectedAnswer.toString() && optionText !== correctAnswer.toString()) {
            option.classList.add('incorrect');
        }
    });
    
    // Remove feedback classes after 2 seconds
    setTimeout(() => {
        options.forEach(option => {
            option.classList.remove('correct', 'incorrect');
        });
    }, 2000);
}

function handleCorrectAnswer() {
    gameScore += 10 * gameLevel;
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = gameScore;
    
    // Add success animation and sound
    AnimationManager.showSuccess(scoreElement);
    SoundManager.playSuccessBeep();
    
    // Update statistics
    playerStats.totalScore += 10 * gameLevel;
    playerStats.correctAnswers++;
    playerStats.totalQuestionsAnswered++;
    playerStats.currentStreak++;
    
    if (playerStats.currentStreak > playerStats.bestStreak) {
        playerStats.bestStreak = playerStats.currentStreak;
    }
    
    // Level up every 5 correct answers
    if (gameScore % 50 === 0) {
        gameLevel++;
        const levelElement = document.getElementById('level');
        levelElement.textContent = gameLevel;
        AnimationManager.bounceIn(levelElement);
        SoundManager.playLevelUpBeep();
        playerStats.levelProgress[currentGame] = gameLevel;
    }
    
    // Check achievements
    AchievementManager.checkAchievements();
    
    // Save stats
    StorageManager.saveStats();
}

function handleWrongAnswer() {
    gameLives--;
    const livesElement = document.getElementById('lives');
    livesElement.textContent = gameLives;
    
    // Add error animation and sound
    AnimationManager.showError(livesElement);
    SoundManager.playErrorBeep();
    
    // Update statistics
    playerStats.totalQuestionsAnswered++;
    playerStats.currentStreak = 0;
    
    // Save stats
    StorageManager.saveStats();
    
    if (gameLives <= 0) {
        gameOver();
    }
}

function gameOver() {
    isGameRunning = false;
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    let gameOverText = '';
    let finalScoreText = '';
    let levelReachedText = '';
    let playAgainText = '';
    
    if (currentLanguage === 'ar') {
        gameOverText = 'انتهت اللعبة!';
        finalScoreText = 'النقاط النهائية:';
        levelReachedText = 'المستوى الذي وصلت إليه:';
        playAgainText = 'العب مرة أخرى';
    } else if (currentLanguage === 'fr') {
        gameOverText = 'Partie Terminée !';
        finalScoreText = 'Score Final :';
        levelReachedText = 'Niveau Atteint :';
        playAgainText = 'Jouer Encore';
    } else {
        gameOverText = 'Game Over!';
        finalScoreText = 'Final Score:';
        levelReachedText = 'Level Reached:';
        playAgainText = 'Play Again';
    }
    
    question.textContent = gameOverText;
    optionsGrid.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3>${finalScoreText} ${gameScore}</h3>
            <p>${levelReachedText} ${gameLevel}</p>
            <button class="btn btn-primary" onclick="resetGame()">${playAgainText}</button>
        </div>
    `;
}

function startTimer() {
    gameTimer = setInterval(() => {
        if (isGameRunning && gameTime > 0) {
            gameTime--;
            document.getElementById('time').textContent = gameTime;
            
            if (gameTime <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

function pauseGame() {
    isGameRunning = false;
    document.getElementById('startGameBtn').style.display = 'inline-block';
    document.getElementById('pauseGameBtn').style.display = 'none';
    
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function resetGameState() {
    isGameRunning = false;
    gameScore = 0;
    gameLevel = 1;
    gameLives = 3;
    gameTime = 60;
    
    // Update UI
    document.getElementById('score').textContent = gameScore;
    document.getElementById('level').textContent = gameLevel;
    document.getElementById('lives').textContent = gameLives;
    document.getElementById('time').textContent = gameTime;
    
    // Reset buttons
    document.getElementById('startGameBtn').style.display = 'inline-block';
    document.getElementById('pauseGameBtn').style.display = 'none';
    
    // Clear timer
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function resetGame() {
    resetGameState();
    
    // Show welcome screen
    showWelcomeScreen();
}

function showWelcomeScreen() {
    document.querySelector('.game-title').textContent = translations[currentLanguage]['welcome'];
    document.querySelector('.question').textContent = translations[currentLanguage]['selectGame'];
    document.getElementById('optionsGrid').innerHTML = '';
    
    // Show game selection
    showGameSelection(games);
}

// Memory Game Functions
function createMemoryGame() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    const symbols = ['🔢', '⭐', '🎯', '🎨', '🚀', '🌟', '💎', '🎪'];
    const gameSymbols = [...symbols, ...symbols]; // Duplicate for pairs
    const shuffledSymbols = gameSymbols.sort(() => Math.random() - 0.5);
    
    let flippedCards = [];
    let matchedPairs = 0;
    
    shuffledSymbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.setAttribute('data-symbol', symbol);
        card.setAttribute('data-index', index);
        card.innerHTML = '❓';
        
        card.addEventListener('click', function() {
            if (flippedCards.length < 2 && !this.classList.contains('flipped') && !this.classList.contains('matched')) {
                this.classList.add('flipped');
                this.innerHTML = symbol;
                flippedCards.push(this);
                
                if (flippedCards.length === 2) {
                    setTimeout(() => {
                        if (flippedCards[0].getAttribute('data-symbol') === flippedCards[1].getAttribute('data-symbol')) {
                            // Match found
                            flippedCards.forEach(card => {
                                card.classList.add('matched');
                                card.style.background = 'var(--success)';
                            });
                            matchedPairs++;
                            
                            if (matchedPairs === symbols.length) {
                                // Game won
                                handleCorrectAnswer();
                                setTimeout(() => {
                                    showMemoryGame();
                                }, 2000);
                            }
                        } else {
                            // No match
                            flippedCards.forEach(card => {
                                card.classList.remove('flipped');
                                card.innerHTML = '❓';
                            });
                        }
                        flippedCards = [];
                    }, 1000);
                }
            }
        });
        
        optionsGrid.appendChild(card);
    });
    
    // Add CSS for memory grid
    optionsGrid.style.display = 'grid';
    optionsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    optionsGrid.style.gap = '15px';
    optionsGrid.style.maxWidth = '600px';
    optionsGrid.style.margin = '0 auto';
}

// Sudoku Game Functions
function createSudokuGame() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create difficulty selector
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.marginBottom = '20px';
    difficultyContainer.style.textAlign = 'center';
    
    const difficultyLabel = document.createElement('h3');
    difficultyLabel.textContent = translations[currentLanguage]['selectDifficulty'] || 'Select Difficulty:';
    difficultyLabel.style.marginBottom = '15px';
    difficultyLabel.style.color = 'var(--warning)';
    
    const difficultyButtons = document.createElement('div');
    difficultyButtons.style.display = 'flex';
    difficultyButtons.style.gap = '10px';
    difficultyButtons.style.justifyContent = 'center';
    difficultyButtons.style.flexWrap = 'wrap';
    
    const difficulties = [
        { level: 'easy', name: translations[currentLanguage]['easy'] || 'Easy' },
        { level: 'medium', name: translations[currentLanguage]['medium'] || 'Medium' },
        { level: 'hard', name: translations[currentLanguage]['hard'] || 'Hard' }
    ];
    
    difficulties.forEach(diff => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.textContent = diff.name;
        btn.addEventListener('click', () => {
            generateSudokuPuzzle(diff.level);
            difficultyContainer.style.display = 'none';
        });
        difficultyButtons.appendChild(btn);
    });
    
    difficultyContainer.appendChild(difficultyLabel);
    difficultyContainer.appendChild(difficultyButtons);
    optionsGrid.appendChild(difficultyContainer);
}

function generateSudokuPuzzle(difficulty = 'medium') {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create sudoku board
    const sudokuBoard = document.createElement('div');
    sudokuBoard.className = 'sudoku-board';
    
    // Predefined puzzles (0 = empty) — different difficulties
    const puzzles = {
        easy: [
            [5,3,0,0,7,0,0,0,0],
            [6,0,0,1,9,5,0,0,0],
            [0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],
            [4,0,0,8,0,3,0,0,1],
            [7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],
            [0,0,0,4,1,9,0,0,5],
            [0,0,0,0,8,0,0,7,9]
        ],
        medium: [
            [0,0,0,2,6,0,7,0,1],
            [6,8,0,0,7,0,0,9,0],
            [1,9,0,0,0,4,5,0,0],
            [8,2,0,1,0,0,0,4,0],
            [0,0,4,6,0,2,9,0,0],
            [0,5,0,0,0,3,0,2,8],
            [0,0,9,3,0,0,0,7,4],
            [0,4,0,0,5,0,0,3,6],
            [7,0,3,0,1,8,0,0,0]
        ],
        hard: [
            [0,0,0,0,0,0,0,1,2],
            [0,0,0,0,0,7,4,0,0],
            [0,0,0,5,0,0,0,0,0],
            [0,0,0,0,6,0,0,0,0],
            [0,0,0,3,0,8,0,0,0],
            [0,0,0,0,1,0,0,0,0],
            [0,0,0,0,0,2,0,0,0],
            [0,0,7,0,0,0,0,0,0],
            [9,4,0,0,0,0,0,0,0]
        ]
    };
    
    // Use selected difficulty
    const puzzle = JSON.parse(JSON.stringify(puzzles[difficulty]));
    
    // Store solution by running solver
    const solution = solveSudoku(JSON.parse(JSON.stringify(puzzle)));
    
    // Create rows and cells
    for (let r = 0; r < 9; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'sudoku-row';
        
        for (let c = 0; c < 9; c++) {
            const val = puzzle[r][c];
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            if (val !== 0) {
                cell.classList.add('prefilled');
                cell.innerHTML = `<div>${val}</div>`;
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.inputMode = 'numeric';
                input.pattern = '[1-9]';
                input.addEventListener('input', (e) => {
                    const v = e.target.value.replace(/[^1-9]/g, '');
                    e.target.value = v;
                    if (v) {
                        checkCellConflict(Number(v), r, c, sudokuBoard);
                        // Check if puzzle is complete
                        if (checkSudokuComplete(sudokuBoard)) {
                            handleCorrectAnswer();
                            setTimeout(() => {
                                createSudokuGame();
                            }, 2000);
                        }
                    }
                });
                cell.appendChild(input);
            }
            
            rowDiv.appendChild(cell);
        }
        
        sudokuBoard.appendChild(rowDiv);
    }
    
    // Create title after the grid
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:800; margin-bottom:8px; font-size:1.2rem; color:var(--warning); text-align:center;';
    title.textContent = 'Fill the Sudoku grid!';
    
    // Create controls
    const controls = document.createElement('div');
    controls.className = 'sudoku-controls';
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-secondary';
    checkBtn.textContent = 'Check';
    checkBtn.addEventListener('click', () => {
        const current = readBoard(sudokuBoard);
        if (!current) return;
        const ok = compareBoards(current, solution);
        if (ok) {
            handleCorrectAnswer();
            setTimeout(() => {
                createSudokuGame();
            }, 2000);
        } else {
            alert('Incorrect — keep trying.');
        }
    });
    
    const hintBtn = document.createElement('button');
    hintBtn.className = 'btn btn-secondary';
    hintBtn.textContent = 'Hint';
    hintBtn.addEventListener('click', () => {
        // Reveal one empty cell from solution
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const row = sudokuBoard.children[r]; // First 9 children are rows
                const cell = row.children[c];
                if (!cell.classList.contains('prefilled') && (!cell.querySelector('input') || cell.querySelector('input').value === '')) {
                    const val = solution[r][c];
                    if (cell.querySelector('input')) {
                        cell.querySelector('input').value = val;
                        cell.classList.add('prefilled');
                        cell.innerHTML = `<div>${val}</div>`;
                    }
                    return;
                }
            }
        }
        alert('Puzzle completed!');
    });
    
    const solveBtn = document.createElement('button');
    solveBtn.className = 'btn btn-primary';
    solveBtn.textContent = 'Solve';
    solveBtn.addEventListener('click', () => {
        // Fill entire board with solution
        for (let r = 0; r < 9; r++) {
            const row = sudokuBoard.children[r];
            for (let c = 0; c < 9; c++) {
                const cell = row.children[c];
                const val = solution[r][c];
                cell.classList.add('prefilled');
                cell.innerHTML = `<div>${val}</div>`;
            }
        }
        handleCorrectAnswer();
        setTimeout(() => {
            createSudokuGame();
        }, 2000);
    });
    
    controls.appendChild(checkBtn);
    controls.appendChild(hintBtn);
    controls.appendChild(solveBtn);
    
    sudokuBoard.appendChild(controls);
    optionsGrid.appendChild(sudokuBoard);
    
    // Add CSS for sudoku
    optionsGrid.style.display = 'block';
    optionsGrid.style.textAlign = 'center';
}

function readBoard(wrap) {
    const out = Array.from({length: 9}, () => Array(9).fill(0));
    for (let r = 0; r < 9; r++) {
        const row = wrap.children[r]; // First 9 children are rows
        for (let c = 0; c < 9; c++) {
            const cell = row.children[c];
            if (cell.classList.contains('prefilled')) {
                out[r][c] = Number(cell.textContent) || 0;
            } else {
                const inp = cell.querySelector('input');
                if (!inp) return null;
                const v = inp.value.trim();
                out[r][c] = v === '' ? 0 : Number(v) || 0;
            }
        }
    }
    return out;
}

function compareBoards(a, b) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (a[i][j] !== b[i][j]) return false;
        }
    }
    return true;
}

function checkCellConflict(val, r, c, wrap) {
    if (!val) return;
    
    // Check row
    for (let cc = 0; cc < 9; cc++) {
        if (cc === c) continue;
        const row = wrap.children[r];
        const cell = row.children[cc];
        const text = cell.classList.contains('prefilled') ? 
            cell.textContent : 
            (cell.querySelector('input') ? cell.querySelector('input').value : '');
        if (Number(text) === val) {
            flashConflict(cell);
            flashConflict(wrap.children[r].children[c]);
        }
    }
    
    // Check column
    for (let rr = 0; rr < 9; rr++) {
        if (rr === r) continue;
        const row = wrap.children[rr];
        const cell = row.children[c];
        const text = cell.classList.contains('prefilled') ? 
            cell.textContent : 
            (cell.querySelector('input') ? cell.querySelector('input').value : '');
        if (Number(text) === val) {
            flashConflict(cell);
            flashConflict(wrap.children[r].children[c]);
        }
    }
    
    // Check box
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
            if (rr === r && cc === c) continue;
            const row = wrap.children[rr];
            const cell = row.children[cc];
            const text = cell.classList.contains('prefilled') ? 
                cell.textContent : 
                (cell.querySelector('input') ? cell.querySelector('input').value : '');
            if (Number(text) === val) {
                flashConflict(cell);
                flashConflict(wrap.children[r].children[c]);
            }
        }
    }
}

function flashConflict(el) {
    el.style.border = '2px solid var(--danger)';
    setTimeout(() => {
        el.style.border = '1px solid rgba(255,255,255,0.3)';
    }, 700);
}

function checkSudokuComplete(wrap) {
    for (let r = 0; r < 9; r++) {
        const row = wrap.children[r];
        for (let c = 0; c < 9; c++) {
            const cell = row.children[c];
            if (cell.classList.contains('prefilled')) {
                const val = Number(cell.textContent);
                if (val === 0 || isNaN(val)) return false;
            } else {
                const inp = cell.querySelector('input');
                if (!inp || inp.value === '') return false;
            }
        }
    }
    return true;
}

// New Game Functions
function generateFractionQuestion() {
    const questionTypes = ['simplify', 'compare', 'convert'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    let options = [];
    
    if (type === 'simplify') {
        const numerator = Math.floor(Math.random() * 20) + 2;
        const denominator = Math.floor(Math.random() * 20) + 2;
        const gcd = findGCD(numerator, denominator);
        const simplifiedNum = numerator / gcd;
        const simplifiedDen = denominator / gcd;
        
        if (currentLanguage === 'ar') {
            questionText = `بسط الكسر ${numerator}/${denominator}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Simplifiez la fraction ${numerator}/${denominator}`;
        } else {
            questionText = `Simplify the fraction ${numerator}/${denominator}`;
        }
        
        answer = `${simplifiedNum}/${simplifiedDen}`;
        options = generateFractionOptions(answer, 4);
        
    } else if (type === 'compare') {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const den1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const den2 = Math.floor(Math.random() * 10) + 1;
        
        const value1 = num1 / den1;
        const value2 = num2 / den2;
        
        if (currentLanguage === 'ar') {
            questionText = `أي الكسرين أكبر: ${num1}/${den1} أم ${num2}/${den2}؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle fraction est plus grande : ${num1}/${den1} ou ${num2}/${den2} ?`;
        } else {
            questionText = `Which fraction is larger: ${num1}/${den1} or ${num2}/${den2}?`;
        }
        
        answer = value1 > value2 ? `${num1}/${den1}` : `${num2}/${den2}`;
        options = [`${num1}/${den1}`, `${num2}/${den2}`, 'Equal', 'Cannot compare'];
        
    } else if (type === 'convert') {
        const decimal = (Math.random() * 2).toFixed(2);
        const fraction = decimalToFraction(parseFloat(decimal));
        
        if (currentLanguage === 'ar') {
            questionText = `حول العدد العشري ${decimal} إلى كسر`;
        } else if (currentLanguage === 'fr') {
            questionText = `Convertissez le décimal ${decimal} en fraction`;
        } else {
            questionText = `Convert the decimal ${decimal} to a fraction`;
        }
        
        answer = fraction;
        options = generateFractionOptions(fraction, 4);
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        showFractionOptions(options, answer);
    }, 10);
}

function generatePercentageQuestion() {
    const questionTypes = ['basic', 'discount', 'increase'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'basic') {
        const number = Math.floor(Math.random() * 100) + 10;
        const percentage = Math.floor(Math.random() * 20) + 5;
        answer = Math.round((number * percentage) / 100);
        
        if (currentLanguage === 'ar') {
            questionText = `ما هو ${percentage}% من ${number}؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Qu'est-ce que ${percentage}% de ${number} ?`;
        } else {
            questionText = `What is ${percentage}% of ${number}?`;
        }
        
    } else if (type === 'discount') {
        const originalPrice = Math.floor(Math.random() * 100) + 50;
        const discountPercent = Math.floor(Math.random() * 30) + 10;
        answer = Math.round(originalPrice * (1 - discountPercent / 100));
        
        if (currentLanguage === 'ar') {
            questionText = `سعر قميص ${originalPrice} دينار، خصم ${discountPercent}%. ما هو السعر بعد الخصم؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Une chemise coûte ${originalPrice} dinars, remise de ${discountPercent}%. Quel est le prix après remise ?`;
        } else {
            questionText = `A shirt costs ${originalPrice} dinars with ${discountPercent}% discount. What's the final price?`;
        }
        
    } else if (type === 'increase') {
        const originalValue = Math.floor(Math.random() * 100) + 20;
        const increasePercent = Math.floor(Math.random() * 25) + 5;
        answer = Math.round(originalValue * (1 + increasePercent / 100));
        
        if (currentLanguage === 'ar') {
            questionText = `عدد الطلاب ${originalValue}، زاد ${increasePercent}%. كم عدد الطلاب الآن؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Il y a ${originalValue} étudiants, augmentation de ${increasePercent}%. Combien d'étudiants maintenant ?`;
        } else {
            questionText = `There are ${originalValue} students with ${increasePercent}% increase. How many students now?`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateAlgebraQuestion() {
    const questionTypes = ['linear', 'simple'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'linear') {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const x = Math.floor(Math.random() * 10) + 1;
        const c = a * x + b;
        
        if (currentLanguage === 'ar') {
            questionText = `حل المعادلة: ${a}x + ${b} = ${c}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Résolvez l'équation : ${a}x + ${b} = ${c}`;
        } else {
            questionText = `Solve the equation: ${a}x + ${b} = ${c}`;
        }
        
        answer = x;
        
    } else if (type === 'simple') {
        const x = Math.floor(Math.random() * 10) + 1;
        const y = Math.floor(Math.random() * 10) + 1;
        const result = x + y;
        
        if (currentLanguage === 'ar') {
            questionText = `إذا كان x = ${x} و y = ${y}، فما قيمة x + y؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Si x = ${x} et y = ${y}, quelle est la valeur de x + y ?`;
        } else {
            questionText = `If x = ${x} and y = ${y}, what is the value of x + y?`;
        }
        
        answer = result;
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateStatisticsQuestion() {
    const questionTypes = ['mean', 'median', 'mode'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'mean') {
        const numbers = [];
        for (let i = 0; i < 5; i++) {
            numbers.push(Math.floor(Math.random() * 20) + 1);
        }
        answer = Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
        
        if (currentLanguage === 'ar') {
            questionText = `احسب المتوسط للأرقام: ${numbers.join(', ')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Calculez la moyenne des nombres : ${numbers.join(', ')}`;
        } else {
            questionText = `Calculate the mean of: ${numbers.join(', ')}`;
        }
        
    } else if (type === 'median') {
        const numbers = [];
        for (let i = 0; i < 5; i++) {
            numbers.push(Math.floor(Math.random() * 20) + 1);
        }
        numbers.sort((a, b) => a - b);
        answer = numbers[2]; // Middle number
        
        if (currentLanguage === 'ar') {
            questionText = `احسب الوسيط للأرقام: ${numbers.join(', ')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Calculez la médiane des nombres : ${numbers.join(', ')}`;
        } else {
            questionText = `Calculate the median of: ${numbers.join(', ')}`;
        }
        
    } else if (type === 'mode') {
        const numbers = [1, 1, 2, 3, 3, 3, 4, 5];
        answer = 3; // Most frequent
        
        if (currentLanguage === 'ar') {
            questionText = `ما هو المنوال للأرقام: ${numbers.join(', ')}؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quel est le mode des nombres : ${numbers.join(', ')} ?`;
        } else {
            questionText = `What is the mode of: ${numbers.join(', ')}?`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateTimeQuestion() {
    const questionTypes = ['convert', 'add', 'subtract'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'convert') {
        const hours = Math.floor(Math.random() * 5) + 1;
        const minutes = Math.floor(Math.random() * 60);
        answer = hours * 60 + minutes;
        
        if (currentLanguage === 'ar') {
            questionText = `حول ${hours} ساعة و ${minutes} دقيقة إلى دقائق`;
        } else if (currentLanguage === 'fr') {
            questionText = `Convertissez ${hours} heures et ${minutes} minutes en minutes`;
        } else {
            questionText = `Convert ${hours} hours and ${minutes} minutes to minutes`;
        }
        
    } else if (type === 'add') {
        const hours1 = Math.floor(Math.random() * 3) + 1;
        const minutes1 = Math.floor(Math.random() * 30);
        const hours2 = Math.floor(Math.random() * 2) + 1;
        const minutes2 = Math.floor(Math.random() * 30);
        
        const totalMinutes = (hours1 + hours2) * 60 + minutes1 + minutes2;
        const resultHours = Math.floor(totalMinutes / 60);
        const resultMinutes = totalMinutes % 60;
        
        if (currentLanguage === 'ar') {
            questionText = `أضف ${hours1}:${minutes1.toString().padStart(2, '0')} + ${hours2}:${minutes2.toString().padStart(2, '0')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Ajoutez ${hours1}:${minutes1.toString().padStart(2, '0')} + ${hours2}:${minutes2.toString().padStart(2, '0')}`;
        } else {
            questionText = `Add ${hours1}:${minutes1.toString().padStart(2, '0')} + ${hours2}:${minutes2.toString().padStart(2, '0')}`;
        }
        
        answer = `${resultHours}:${resultMinutes.toString().padStart(2, '0')}`;
        
    } else if (type === 'subtract') {
        const hours1 = Math.floor(Math.random() * 5) + 2;
        const minutes1 = Math.floor(Math.random() * 60);
        const hours2 = Math.floor(Math.random() * 2) + 1;
        const minutes2 = Math.floor(Math.random() * 30);
        
        const total1 = hours1 * 60 + minutes1;
        const total2 = hours2 * 60 + minutes2;
        const diff = total1 - total2;
        const resultHours = Math.floor(diff / 60);
        const resultMinutes = diff % 60;
        
        // Ensure resultMinutes is positive
        const finalHours = resultMinutes < 0 ? resultHours - 1 : resultHours;
        const finalMinutes = resultMinutes < 0 ? resultMinutes + 60 : resultMinutes;
        
        if (currentLanguage === 'ar') {
            questionText = `اطرح ${hours1}:${minutes1.toString().padStart(2, '0')} - ${hours2}:${minutes2.toString().padStart(2, '0')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Soustrayez ${hours1}:${minutes1.toString().padStart(2, '0')} - ${hours2}:${minutes2.toString().padStart(2, '0')}`;
        } else {
            questionText = `Subtract ${hours1}:${minutes1.toString().padStart(2, '0')} - ${hours2}:${minutes2.toString().padStart(2, '0')}`;
        }
        
        answer = `${finalHours}:${finalMinutes.toString().padStart(2, '0')}`;
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateTimeOptions(answer, 4);
        showTimeOptions(options, answer);
    }, 10);
}

// Helper functions for new games
function findGCD(a, b) {
    return b === 0 ? a : findGCD(b, a % b);
}

function decimalToFraction(decimal) {
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
    return `${h1}/${k1}`;
}

function generateFractionOptions(correctAnswer, count) {
    const options = [correctAnswer];
    
    while (options.length < count) {
        let wrongAnswer;
        if (Math.random() < 0.5) {
            // Generate random fraction
            const num = Math.floor(Math.random() * 20) + 1;
            const den = Math.floor(Math.random() * 20) + 1;
            wrongAnswer = `${num}/${den}`;
        } else {
            // Generate random decimal
            wrongAnswer = (Math.random() * 2).toFixed(2);
        }
        
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    return options.sort(() => Math.random() - 0.5);
}

function generateTimeOptions(correctAnswer, count) {
    const options = [correctAnswer];
    
    while (options.length < count) {
        let wrongAnswer;
        if (Math.random() < 0.5) {
            // Generate random time format
            const hours = Math.floor(Math.random() * 5);
            const minutes = Math.floor(Math.random() * 60);
            wrongAnswer = `${hours}:${minutes.toString().padStart(2, '0')}`;
        } else {
            // Generate random minutes
            wrongAnswer = Math.floor(Math.random() * 300);
        }
        
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    return options.sort(() => Math.random() - 0.5);
}

function showFractionOptions(options, correctAnswer) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleFractionAnswer(option, correctAnswer);
        optionsGrid.appendChild(optionBtn);
    });
}

function showTimeOptions(options, correctAnswer) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleTimeAnswer(option, correctAnswer);
        optionsGrid.appendChild(optionBtn);
    });
}

function handleFractionAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateFractionQuestion();
            }
        }, 1000);
    } else {
        handleWrongAnswer();
    }
    
    // Show feedback
    showAnswerFeedback(selectedAnswer, correctAnswer);
}

function handleTimeAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateTimeQuestion();
            }
        }, 1000);
    } else {
        handleWrongAnswer();
    }
    
    // Show feedback
    showAnswerFeedback(selectedAnswer, correctAnswer);
}

// New Game Question Generators
function generateDecimalQuestion() {
    const questionTypes = ['add', 'subtract', 'multiply', 'divide'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'add') {
        const num1 = (Math.random() * 100).toFixed(1);
        const num2 = (Math.random() * 100).toFixed(1);
        answer = (parseFloat(num1) + parseFloat(num2)).toFixed(1);
        
        if (currentLanguage === 'ar') {
            questionText = `أضف: ${num1} + ${num2}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Additionnez: ${num1} + ${num2}`;
        } else {
            questionText = `Add: ${num1} + ${num2}`;
        }
        
    } else if (type === 'subtract') {
        const num1 = (Math.random() * 100 + 50).toFixed(1);
        const num2 = (Math.random() * 50).toFixed(1);
        answer = (parseFloat(num1) - parseFloat(num2)).toFixed(1);
        
        if (currentLanguage === 'ar') {
            questionText = `اطرح: ${num1} - ${num2}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Soustrayez: ${num1} - ${num2}`;
        } else {
            questionText = `Subtract: ${num1} - ${num2}`;
        }
        
    } else if (type === 'multiply') {
        const num1 = (Math.random() * 20 + 1).toFixed(1);
        const num2 = (Math.random() * 10 + 1).toFixed(1);
        answer = (parseFloat(num1) * parseFloat(num2)).toFixed(1);
        
        if (currentLanguage === 'ar') {
            questionText = `اضرب: ${num1} × ${num2}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Multipliez: ${num1} × ${num2}`;
        } else {
            questionText = `Multiply: ${num1} × ${num2}`;
        }
        
    } else if (type === 'divide') {
        const num1 = (Math.random() * 50 + 10).toFixed(1);
        const num2 = (Math.random() * 5 + 1).toFixed(1);
        answer = (parseFloat(num1) / parseFloat(num2)).toFixed(1);
        
        if (currentLanguage === 'ar') {
            questionText = `اقسم: ${num1} ÷ ${num2}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Divisez: ${num1} ÷ ${num2}`;
        } else {
            questionText = `Divide: ${num1} ÷ ${num2}`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateDecimalOptions(answer, 4);
        showDecimalOptions(options, answer);
    }, 10);
}

function generateWordProblem() {
    const problemTypes = ['shopping', 'age', 'distance', 'work'];
    const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'shopping') {
        const item1 = Math.floor(Math.random() * 20) + 5;
        const item2 = Math.floor(Math.random() * 15) + 3;
        const total = item1 + item2;
        answer = total;
        
        if (currentLanguage === 'ar') {
            questionText = `اشترى أحمد قلم بـ ${item1} دينار ودفتر بـ ${item2} دينار. كم دفع إجمالاً؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Ahmed a acheté un stylo pour ${item1} dinars et un cahier pour ${item2} dinars. Combien a-t-il payé au total ?`;
        } else {
            questionText = `Ahmed bought a pen for ${item1} dinars and a notebook for ${item2} dinars. How much did he pay in total?`;
        }
        
    } else if (type === 'age') {
        const currentAge = Math.floor(Math.random() * 20) + 10;
        const yearsLater = Math.floor(Math.random() * 10) + 5;
        answer = currentAge + yearsLater;
        
        if (currentLanguage === 'ar') {
            questionText = `عمر سارة الآن ${currentAge} سنة. كم سيكون عمرها بعد ${yearsLater} سنوات؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Sarah a maintenant ${currentAge} ans. Quel âge aura-t-elle dans ${yearsLater} ans ?`;
        } else {
            questionText = `Sarah is now ${currentAge} years old. How old will she be in ${yearsLater} years?`;
        }
        
    } else if (type === 'distance') {
        const speed = Math.floor(Math.random() * 50) + 20;
        const time = Math.floor(Math.random() * 5) + 2;
        answer = speed * time;
        
        if (currentLanguage === 'ar') {
            questionText = `سيارة تسير بسرعة ${speed} كم/ساعة لمدة ${time} ساعات. كم المسافة المقطوعة؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Une voiture roule à ${speed} km/h pendant ${time} heures. Quelle distance a-t-elle parcourue ?`;
        } else {
            questionText = `A car travels at ${speed} km/h for ${time} hours. What distance did it cover?`;
        }
        
    } else if (type === 'work') {
        const workers = Math.floor(Math.random() * 5) + 2;
        const days = Math.floor(Math.random() * 7) + 3;
        answer = workers * days;
        
        if (currentLanguage === 'ar') {
            questionText = `${workers} عمال يعملون لمدة ${days} أيام. كم إجمالي أيام العمل؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `${workers} ouvriers travaillent pendant ${days} jours. Combien de jours de travail au total ?`;
        } else {
            questionText = `${workers} workers work for ${days} days. How many total work days?`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generatePatternsQuestion() {
    const patterns = [
        {
            sequence: [2, 4, 6, 8, 10],
            answer: 12,
            question: 'What is the next number in the sequence: 2, 4, 6, 8, 10, ?'
        },
        {
            sequence: [1, 4, 9, 16, 25],
            answer: 36,
            question: 'What is the next number in the sequence: 1, 4, 9, 16, 25, ?'
        },
        {
            sequence: [1, 1, 2, 3, 5],
            answer: 8,
            question: 'What is the next number in the sequence: 1, 1, 2, 3, 5, ?'
        }
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    let questionText = pattern.question;
    
    if (currentLanguage === 'ar') {
        questionText = `ما هو الرقم التالي في المتتالية: ${pattern.sequence.join(', ')}، ؟`;
    } else if (currentLanguage === 'fr') {
        questionText = `Quel est le prochain nombre dans la séquence: ${pattern.sequence.join(', ')}, ?`;
    }
    
    document.querySelector('.question').textContent = questionText;
    
    setTimeout(() => {
        const options = generateOptions(pattern.answer, 4);
        showOptions(options, pattern.answer);
    }, 10);
}

function generatePatternQuestion() {
    const patternTypes = ['arithmetic', 'geometric', 'fibonacci'];
    const type = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    let questionText = '';
    let answer = 0;
    let sequence = [];
    
    if (type === 'arithmetic') {
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 5) + 2;
        sequence = [start, start + diff, start + 2*diff, start + 3*diff, '?'];
        answer = start + 4*diff;
        
        if (currentLanguage === 'ar') {
            questionText = `أكمل التسلسل: ${sequence.join(', ')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Complétez la séquence : ${sequence.join(', ')}`;
        } else {
            questionText = `Complete the sequence: ${sequence.join(', ')}`;
        }
        
    } else if (type === 'geometric') {
        const start = Math.floor(Math.random() * 5) + 2;
        const ratio = Math.floor(Math.random() * 3) + 2;
        sequence = [start, start * ratio, start * ratio * ratio, '?'];
        answer = start * ratio * ratio * ratio;
        
        if (currentLanguage === 'ar') {
            questionText = `أكمل التسلسل: ${sequence.join(', ')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Complétez la séquence : ${sequence.join(', ')}`;
        } else {
            questionText = `Complete the sequence: ${sequence.join(', ')}`;
        }
        
    } else if (type === 'fibonacci') {
        sequence = [1, 1, 2, 3, 5, '?'];
        answer = 8;
        
        if (currentLanguage === 'ar') {
            questionText = `أكمل تسلسل فيبوناتشي: ${sequence.join(', ')}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Complétez la séquence de Fibonacci : ${sequence.join(', ')}`;
        } else {
            questionText = `Complete the Fibonacci sequence: ${sequence.join(', ')}`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateMentalMathQuestion() {
    const questionTypes = ['quick-add', 'quick-multiply', 'estimation'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'quick-add') {
        const num1 = Math.floor(Math.random() * 50) + 10;
        const num2 = Math.floor(Math.random() * 50) + 10;
        const num3 = Math.floor(Math.random() * 50) + 10;
        answer = num1 + num2 + num3;
        
        if (currentLanguage === 'ar') {
            questionText = `احسب ذهنياً: ${num1} + ${num2} + ${num3}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Calculez mentalement : ${num1} + ${num2} + ${num3}`;
        } else {
            questionText = `Calculate mentally: ${num1} + ${num2} + ${num3}`;
        }
        
    } else if (type === 'quick-multiply') {
        const num1 = Math.floor(Math.random() * 10) + 5;
        const num2 = Math.floor(Math.random() * 10) + 5;
        answer = num1 * num2;
        
        if (currentLanguage === 'ar') {
            questionText = `احسب ذهنياً: ${num1} × ${num2}`;
        } else if (currentLanguage === 'fr') {
            questionText = `Calculez mentalement : ${num1} × ${num2}`;
        } else {
            questionText = `Calculate mentally: ${num1} × ${num2}`;
        }
        
    } else if (type === 'estimation') {
        const num1 = Math.floor(Math.random() * 100) + 50;
        const num2 = Math.floor(Math.random() * 100) + 50;
        answer = Math.round((num1 + num2) / 10) * 10; // Round to nearest 10
        
        if (currentLanguage === 'ar') {
            questionText = `قدر النتيجة: ${num1} + ${num2} (أقرب عشرة)`;
        } else if (currentLanguage === 'fr') {
            questionText = `Estimez le résultat : ${num1} + ${num2} (au dix près)`;
        } else {
            questionText = `Estimate the result: ${num1} + ${num2} (to nearest 10)`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

// Helper functions for new games
function generateDecimalOptions(correctAnswer, count) {
    const options = [correctAnswer];
    
    while (options.length < count) {
        let wrongAnswer;
        if (Math.random() < 0.5) {
            // Generate random decimal
            wrongAnswer = (Math.random() * 200).toFixed(1);
        } else {
            // Generate random integer
            wrongAnswer = Math.floor(Math.random() * 200);
        }
        
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    return options.sort(() => Math.random() - 0.5);
}

function showDecimalOptions(options, correctAnswer) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleDecimalAnswer(option, correctAnswer);
        optionsGrid.appendChild(optionBtn);
    });
}

function handleDecimalAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateDecimalQuestion();
            }
        }, 1000);
    } else {
        handleWrongAnswer();
    }
    
    // Show feedback
    showAnswerFeedback(selectedAnswer, correctAnswer);
}

// Additional game functions
function generateAdvancedGeometryQuestion() {
    const questionTypes = ['area', 'perimeter', 'volume', 'angles'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'area') {
        const length = Math.floor(Math.random() * 10) + 5;
        const width = Math.floor(Math.random() * 10) + 5;
        answer = length * width;
        
        if (currentLanguage === 'ar') {
            questionText = `مستطيل طوله ${length} سم وعرضه ${width} سم. ما مساحته؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Un rectangle a une longueur de ${length} cm et une largeur de ${width} cm. Quelle est son aire ?`;
        } else {
            questionText = `A rectangle has length ${length} cm and width ${width} cm. What is its area?`;
        }
        
    } else if (type === 'perimeter') {
        const side = Math.floor(Math.random() * 10) + 5;
        answer = side * 4;
        
        if (currentLanguage === 'ar') {
            questionText = `مربع طول ضلعه ${side} سم. ما محيطه؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Un carré a un côté de ${side} cm. Quel est son périmètre ?`;
        } else {
            questionText = `A square has side length ${side} cm. What is its perimeter?`;
        }
        
    } else if (type === 'volume') {
        const length = Math.floor(Math.random() * 5) + 3;
        const width = Math.floor(Math.random() * 5) + 3;
        const height = Math.floor(Math.random() * 5) + 3;
        answer = length * width * height;
        
        if (currentLanguage === 'ar') {
            questionText = `مكعب أبعاده ${length} × ${width} × ${height} سم. ما حجمه؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Un cube a des dimensions ${length} × ${width} × ${height} cm. Quel est son volume ?`;
        } else {
            questionText = `A cube has dimensions ${length} × ${width} × ${height} cm. What is its volume?`;
        }
        
    } else if (type === 'angles') {
        const angle1 = Math.floor(Math.random() * 60) + 30;
        const angle2 = Math.floor(Math.random() * 60) + 30;
        answer = 180 - angle1 - angle2;
        
        if (currentLanguage === 'ar') {
            questionText = `في مثلث، زاويتان ${angle1}° و ${angle2}°. ما قياس الزاوية الثالثة؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Dans un triangle, deux angles sont ${angle1}° et ${angle2}°. Quelle est la mesure du troisième angle ?`;
        } else {
            questionText = `In a triangle, two angles are ${angle1}° and ${angle2}°. What is the measure of the third angle?`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateOptions(answer, 4);
        showOptions(options, answer);
    }, 10);
}

function generateProbabilityQuestion() {
    const questionTypes = ['basic', 'dice', 'cards'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'basic') {
        const total = Math.floor(Math.random() * 10) + 5;
        const favorable = Math.floor(Math.random() * total) + 1;
        answer = `${favorable}/${total}`;
        
        if (currentLanguage === 'ar') {
            questionText = `صندوق يحتوي على ${total} كرات، ${favorable} منها حمراء. ما احتمال اختيار كرة حمراء؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Une boîte contient ${total} balles, ${favorable} sont rouges. Quelle est la probabilité de choisir une balle rouge ?`;
        } else {
            questionText = `A box contains ${total} balls, ${favorable} are red. What's the probability of choosing a red ball?`;
        }
        
    } else if (type === 'dice') {
        const target = Math.floor(Math.random() * 6) + 1;
        answer = '1/6';
        
        if (currentLanguage === 'ar') {
            questionText = `ما احتمال ظهور الرقم ${target} عند رمي حجر النرد؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est la probabilité d'obtenir ${target} en lançant un dé ?`;
        } else {
            questionText = `What's the probability of getting ${target} when rolling a die?`;
        }
        
    } else if (type === 'cards') {
        const suit = ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)];
        answer = '1/4';
        
        if (currentLanguage === 'ar') {
            questionText = `ما احتمال اختيار ورقة ${suit} من مجموعة أوراق اللعب؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est la probabilité de choisir une carte ${suit} d'un jeu de cartes ?`;
        } else {
            questionText = `What's the probability of choosing a ${suit} card from a deck?`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateProbabilityOptions(answer, 4);
        showProbabilityOptions(options, answer);
    }, 10);
}

function generateTrigonometryQuestion() {
    const questionTypes = ['sin', 'cos', 'tan'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let questionText = '';
    let answer = 0;
    
    if (type === 'sin') {
        const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
        const values = { 30: '1/2', 45: '√2/2', 60: '√3/2' };
        answer = values[angle];
        
        if (currentLanguage === 'ar') {
            questionText = `ما قيمة sin(${angle}°)؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est la valeur de sin(${angle}°) ?`;
        } else {
            questionText = `What is the value of sin(${angle}°)?`;
        }
        
    } else if (type === 'cos') {
        const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
        const values = { 30: '√3/2', 45: '√2/2', 60: '1/2' };
        answer = values[angle];
        
        if (currentLanguage === 'ar') {
            questionText = `ما قيمة cos(${angle}°)؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est la valeur de cos(${angle}°) ?`;
        } else {
            questionText = `What is the value of cos(${angle}°)?`;
        }
        
    } else if (type === 'tan') {
        const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
        const values = { 30: '1/√3', 45: '1', 60: '√3' };
        answer = values[angle];
        
        if (currentLanguage === 'ar') {
            questionText = `ما قيمة tan(${angle}°)؟`;
        } else if (currentLanguage === 'fr') {
            questionText = `Quelle est la valeur de tan(${angle}°) ?`;
        } else {
            questionText = `What is the value of tan(${angle}°)?`;
        }
    }
    
    // Update question first
    document.querySelector('.question').textContent = questionText;
    
    // Use setTimeout to ensure DOM is updated before showing options
    setTimeout(() => {
        const options = generateTrigonometryOptions(answer, 4);
        showTrigonometryOptions(options, answer);
    }, 10);
}

// Helper functions for new games
function generateProbabilityOptions(correctAnswer, count) {
    const options = [correctAnswer];
    const commonProbabilities = ['1/2', '1/3', '1/4', '1/6', '2/3', '3/4', '5/6'];
    
    while (options.length < count) {
        const wrongAnswer = commonProbabilities[Math.floor(Math.random() * commonProbabilities.length)];
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    return options.sort(() => Math.random() - 0.5);
}

function generateTrigonometryOptions(correctAnswer, count) {
    const options = [correctAnswer];
    const commonValues = ['1/2', '√2/2', '√3/2', '1/√3', '1', '√3'];
    
    while (options.length < count) {
        const wrongAnswer = commonValues[Math.floor(Math.random() * commonValues.length)];
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    return options.sort(() => Math.random() - 0.5);
}

function showProbabilityOptions(options, correctAnswer) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleProbabilityAnswer(option, correctAnswer);
        optionsGrid.appendChild(optionBtn);
    });
}

function showTrigonometryOptions(options, correctAnswer) {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleTrigonometryAnswer(option, correctAnswer);
        optionsGrid.appendChild(optionBtn);
    });
}

function handleProbabilityAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateProbabilityQuestion();
            }
        }, 1000);
    } else {
        handleWrongAnswer();
    }
    
    // Show feedback
    showAnswerFeedback(selectedAnswer, correctAnswer);
}

function handleTrigonometryAnswer(selectedAnswer, correctAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateTrigonometryQuestion();
            }
        }, 1000);
    } else {
        handleWrongAnswer();
    }
    
    // Show feedback
    showAnswerFeedback(selectedAnswer, correctAnswer);
}

// Simple backtracking solver
function solveSudoku(grid) {
    const findEmpty = (g) => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (g[i][j] === 0) return [i, j];
            }
        }
        return null;
    };
    
    const valid = (g, r, c, v) => {
        for (let i = 0; i < 9; i++) if (g[r][i] === v) return false;
        for (let i = 0; i < 9; i++) if (g[i][c] === v) return false;
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
        for (let i = br; i < br + 3; i++) {
            for (let j = bc; j < bc + 3; j++) {
                if (g[i][j] === v) return false;
            }
        }
        return true;
    };
    
    function solver(g) {
        const pos = findEmpty(g);
        if (!pos) return true;
        const [r, c] = pos;
        for (let v = 1; v <= 9; v++) {
            if (valid(g, r, c, v)) {
                g[r][c] = v;
                if (solver(g)) return true;
                g[r][c] = 0;
            }
        }
        return false;
    }
    
    const gCopy = grid.map(row => row.slice());
    solver(gCopy);
    return gCopy;
}

// Missing functions that need to be added
function pauseGame() {
    if (isGameRunning) {
        isGameRunning = false;
        if (gameTimer) {
            clearInterval(gameTimer);
        }
        document.getElementById('pauseGameBtn').style.display = 'none';
        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('startGameBtn').textContent = translations[currentLanguage]['resume'] || 'Resume';
    }
}

function resetGame() {
    isGameRunning = false;
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    gameScore = 0;
    gameLevel = 1;
    gameLives = 3;
    gameTime = 60;
    currentQuestion = null;
    
    updateGameStats();
    showWelcomeScreen();
    
    document.getElementById('pauseGameBtn').style.display = 'none';
    document.getElementById('startGameBtn').style.display = 'inline-block';
    document.getElementById('startGameBtn').textContent = translations[currentLanguage]['startGame'] || 'Start Game';
}

function updateGameStats() {
    document.getElementById('score').textContent = gameScore;
    document.getElementById('level').textContent = gameLevel;
    document.getElementById('lives').textContent = gameLives;
    document.getElementById('time').textContent = gameTime;
}

// Add sound effects (optional)
function playSound(type) {
    // Simple sound feedback using Web Audio API
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        } else if (type === 'incorrect') {
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

// Enhanced game feedback
function handleCorrectAnswer() {
    gameScore += 10 * gameLevel;
    updateGameStats();
    playSound('correct');
    
    // Show success message
    const question = document.querySelector('.question');
    const originalText = question.textContent;
    question.textContent = translations[currentLanguage]['correct'] || 'Correct!';
    question.style.color = '#28a745';
    
    setTimeout(() => {
        question.textContent = originalText;
        question.style.color = '';
    }, 1000);
}

function handleIncorrectAnswer() {
    gameLives--;
    updateGameStats();
    playSound('incorrect');
    
    // Show error message
    const question = document.querySelector('.question');
    const originalText = question.textContent;
    question.textContent = translations[currentLanguage]['incorrect'] || 'Incorrect!';
    question.style.color = '#dc3545';
    
    setTimeout(() => {
        question.textContent = originalText;
        question.style.color = '';
    }, 1000);
    
    if (gameLives <= 0) {
        endGame();
    }
}

function endGame() {
    isGameRunning = false;
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    const question = document.querySelector('.question');
    question.textContent = translations[currentLanguage]['gameOver'] || 'Game Over!';
    question.style.color = '#dc3545';
    
    // Show final score
    setTimeout(() => {
        question.innerHTML = `
            ${translations[currentLanguage]['gameOver'] || 'Game Over!'}<br>
            ${translations[currentLanguage]['finalScore'] || 'Final Score'}: ${gameScore}<br>
            ${translations[currentLanguage]['levelReached'] || 'Level Reached'}: ${gameLevel}
        `;
    }, 1000);
}

// New Puzzle Games Functions

// KenKen Puzzle Game
function showKenKenGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    // Clear options first
    optionsGrid.innerHTML = '';
    
    // Show loading message
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    
    // Generate KenKen puzzle
    generateKenKenQuestion();
}

function generateKenKenQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create a simple 3x3 KenKen puzzle
    const kenkenContainer = document.createElement('div');
    kenkenContainer.className = 'puzzle-grid';
    kenkenContainer.style.cssText = `
        grid-template-columns: repeat(3, 1fr);
        max-width: 400px;
    `;
    
    // KenKen puzzle data (3x3 grid with cages)
    const cages = [
        { cells: [0, 1], operation: '+', target: 5 },
        { cells: [2], operation: '=', target: 2 },
        { cells: [3, 6], operation: '+', target: 4 },
        { cells: [4, 5], operation: '+', target: 6 },
        { cells: [7, 8], operation: '+', target: 7 }
    ];
    
    // Create grid cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'puzzle-cell';
        cell.style.cssText = `
            width: 100px;
            height: 100px;
            background: white;
            border: 2px solid #34495e;
            font-size: 1.2rem;
            position: relative;
        `;
        
        // Add cage information
        const cage = cages.find(c => c.cells.includes(i));
        if (cage) {
            const cageInfo = document.createElement('div');
            cageInfo.style.cssText = `
                position: absolute;
                top: 2px;
                left: 2px;
                font-size: 0.7rem;
                color: #666;
            `;
            cageInfo.textContent = `${cage.target}${cage.operation}`;
            cell.appendChild(cageInfo);
        }
        
        // Add input for user
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '3';
        input.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            background: transparent;
        `;
        cell.appendChild(input);
        
        kenkenContainer.appendChild(cell);
    }
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        text-align: center;
        margin: 20px 0;
        color: var(--light);
        font-size: 1.1rem;
    `;
    
    let instructionText = 'Fill the grid with numbers 1-3. Each row and column must contain 1, 2, 3. Follow the cage operations!';
    if (currentLanguage === 'ar') {
        instructionText = 'املأ الشبكة بالأرقام 1-3. كل صف وعمود يجب أن يحتوي على 1، 2، 3. اتبع عمليات الأقفاص!';
    } else if (currentLanguage === 'fr') {
        instructionText = 'Remplissez la grille avec les nombres 1-3. Chaque ligne et colonne doit contenir 1, 2, 3. Suivez les opérations des cages !';
    }
    
    instructions.textContent = instructionText;
    
    // Add check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = translations[currentLanguage]['check'] || 'Check';
    checkBtn.style.marginTop = '20px';
    checkBtn.addEventListener('click', () => {
        checkKenKenSolution(kenkenContainer, cages);
    });
    
    optionsGrid.appendChild(instructions);
    optionsGrid.appendChild(kenkenContainer);
    optionsGrid.appendChild(checkBtn);
}

function checkKenKenSolution(container, cages) {
    const inputs = container.querySelectorAll('input');
    const grid = [];
    
    // Collect values
    for (let i = 0; i < inputs.length; i++) {
        const value = parseInt(inputs[i].value) || 0;
        grid.push(value);
    }
    
    // Check if all cells are filled
    if (grid.some(val => val === 0 || val < 1 || val > 3)) {
        alert(translations[currentLanguage]['fillAll'] || 'Please fill all cells with numbers 1-3!');
        return;
    }
    
    // Check rows and columns
    let isValid = true;
    for (let i = 0; i < 3; i++) {
        const row = [grid[i*3], grid[i*3+1], grid[i*3+2]];
        const col = [grid[i], grid[i+3], grid[i+6]];
        
        if (new Set(row).size !== 3 || new Set(col).size !== 3) {
            isValid = false;
            break;
        }
    }
    
    // Check cages
    if (isValid) {
        for (const cage of cages) {
            const values = cage.cells.map(i => grid[i]);
            let result = false;
            
            if (cage.operation === '+') {
                result = values.reduce((a, b) => a + b, 0) === cage.target;
            } else if (cage.operation === '-') {
                result = Math.abs(values[0] - values[1]) === cage.target;
            } else if (cage.operation === '*') {
                result = values.reduce((a, b) => a * b, 1) === cage.target;
            } else if (cage.operation === '/') {
                result = Math.max(values[0], values[1]) / Math.min(values[0], values[1]) === cage.target;
            } else if (cage.operation === '=') {
                result = values[0] === cage.target;
            }
            
            if (!result) {
                isValid = false;
                break;
            }
        }
    }
    
    if (isValid) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateKenKenQuestion();
            }
        }, 1000);
    } else {
        handleIncorrectAnswer();
    }
}

// Magic Square Game
function showMagicSquareGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    // Clear options first
    optionsGrid.innerHTML = '';
    
    // Show loading message
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    
    // Generate Magic Square
    generateMagicSquareQuestion();
}

function generateMagicSquareQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create a 3x3 Magic Square
    const magicContainer = document.createElement('div');
    magicContainer.className = 'puzzle-grid';
    magicContainer.style.cssText = `
        grid-template-columns: repeat(3, 1fr);
        max-width: 400px;
    `;
    
    // Pre-fill some numbers
    const magicSquare = [
        [8, 0, 0],
        [0, 5, 0],
        [0, 0, 2]
    ];
    
    // Create grid cells
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.className = 'puzzle-cell';
            cell.style.cssText = `
                width: 100px;
                height: 100px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                font-size: 1.8rem;
                color: white;
            `;
            
            if (magicSquare[i][j] !== 0) {
                cell.textContent = magicSquare[i][j];
                cell.style.background = 'rgba(255, 255, 255, 0.1)';
            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.max = '9';
                input.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border: none;
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    background: transparent;
                    color: white;
                `;
                input.setAttribute('data-row', i);
                input.setAttribute('data-col', j);
                cell.appendChild(input);
            }
            
            magicContainer.appendChild(cell);
        }
    }
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        text-align: center;
        margin: 20px 0;
        color: var(--light);
        font-size: 1.1rem;
    `;
    
    let instructionText = 'Fill the magic square! Each row, column, and diagonal must sum to 15. Use numbers 1-9 exactly once.';
    if (currentLanguage === 'ar') {
        instructionText = 'املأ المربع السحري! كل صف وعمود وقطر يجب أن يكون مجموعه 15. استخدم الأرقام 1-9 مرة واحدة فقط.';
    } else if (currentLanguage === 'fr') {
        instructionText = 'Remplissez le carré magique ! Chaque ligne, colonne et diagonale doit totaliser 15. Utilisez les nombres 1-9 exactement une fois.';
    }
    
    instructions.textContent = instructionText;
    
    // Add check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = translations[currentLanguage]['check'] || 'Check';
    checkBtn.style.marginTop = '20px';
    checkBtn.addEventListener('click', () => {
        checkMagicSquareSolution(magicContainer);
    });
    
    optionsGrid.appendChild(instructions);
    optionsGrid.appendChild(magicContainer);
    optionsGrid.appendChild(checkBtn);
}

function checkMagicSquareSolution(container) {
    const inputs = container.querySelectorAll('input');
    const grid = [];
    
    // Initialize grid
    for (let i = 0; i < 3; i++) {
        grid[i] = [];
        for (let j = 0; j < 3; j++) {
            grid[i][j] = 0;
        }
    }
    
    // Fill grid with existing values and user inputs
    const cells = container.children;
    for (let i = 0; i < cells.length; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const cell = cells[i];
        
        if (cell.textContent && !cell.querySelector('input')) {
            grid[row][col] = parseInt(cell.textContent);
        } else if (cell.querySelector('input')) {
            const value = parseInt(cell.querySelector('input').value) || 0;
            grid[row][col] = value;
        }
    }
    
    // Check if all cells are filled
    const allNumbers = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] === 0 || grid[i][j] < 1 || grid[i][j] > 9) {
                alert(translations[currentLanguage]['fillAll'] || 'Please fill all cells with numbers 1-9!');
                return;
            }
            allNumbers.push(grid[i][j]);
        }
    }
    
    // Check if all numbers 1-9 are used exactly once
    if (new Set(allNumbers).size !== 9) {
        alert(translations[currentLanguage]['useAllNumbers'] || 'Please use each number 1-9 exactly once!');
        return;
    }
    
    // Check magic square property (sum = 15)
    const targetSum = 15;
    let isValid = true;
    
    // Check rows
    for (let i = 0; i < 3; i++) {
        const rowSum = grid[i][0] + grid[i][1] + grid[i][2];
        if (rowSum !== targetSum) {
            isValid = false;
            break;
        }
    }
    
    // Check columns
    if (isValid) {
        for (let j = 0; j < 3; j++) {
            const colSum = grid[0][j] + grid[1][j] + grid[2][j];
            if (colSum !== targetSum) {
                isValid = false;
                break;
            }
        }
    }
    
    // Check diagonals
    if (isValid) {
        const diag1 = grid[0][0] + grid[1][1] + grid[2][2];
        const diag2 = grid[0][2] + grid[1][1] + grid[2][0];
        if (diag1 !== targetSum || diag2 !== targetSum) {
            isValid = false;
        }
    }
    
    if (isValid) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateMagicSquareQuestion();
            }
        }, 1000);
    } else {
        handleIncorrectAnswer();
    }
}

// Number Search Game
function showNumberSearchGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    // Clear options first
    optionsGrid.innerHTML = '';
    
    // Show loading message
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    
    // Generate Number Search
    generateNumberSearchQuestion();
}

function generateNumberSearchQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create a 6x6 number search grid
    const searchContainer = document.createElement('div');
    searchContainer.className = 'puzzle-grid';
    searchContainer.style.cssText = `
        grid-template-columns: repeat(6, 1fr);
        max-width: 500px;
    `;
    
    // Generate random numbers and ensure target numbers are present
    const numbers = [];
    const hiddenNumbers = [15, 23, 31, 42, 56, 67, 78, 89, 91];
    
    // First, place all target numbers in random positions
    const usedPositions = new Set();
    hiddenNumbers.forEach((targetNum) => {
        let randomPos;
        do {
            randomPos = Math.floor(Math.random() * 36);
        } while (usedPositions.has(randomPos));
        usedPositions.add(randomPos);
        numbers[randomPos] = targetNum;
    });
    
    // Fill remaining positions with random numbers
    for (let i = 0; i < 36; i++) {
        if (!numbers[i]) {
            let randomNum;
            do {
                randomNum = Math.floor(Math.random() * 100) + 1;
            } while (hiddenNumbers.includes(randomNum)); // Avoid duplicates with target numbers
            numbers[i] = randomNum;
        }
    }
    
    // Add some similar numbers to make it more challenging
    const similarNumbers = [16, 24, 32, 41, 55, 66, 77, 88, 90]; // Similar to target numbers
    const similarPositions = [];
    for (let i = 0; i < 3; i++) { // Add 3 similar numbers
        let randomPos;
        do {
            randomPos = Math.floor(Math.random() * 36);
        } while (usedPositions.has(randomPos) || similarPositions.includes(randomPos));
        similarPositions.push(randomPos);
        numbers[randomPos] = similarNumbers[i];
    }
    
    // Create grid cells
    for (let i = 0; i < 36; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        cell.textContent = numbers[i];
        cell.setAttribute('data-number', numbers[i]);
        cell.setAttribute('data-index', i);
        
        cell.addEventListener('click', () => {
            const num = parseInt(cell.getAttribute('data-number'));
            if (hiddenNumbers.includes(num) && !cell.classList.contains('found')) {
                cell.style.background = '#28a745';
                cell.style.transform = 'scale(1.1)';
                cell.classList.add('found');
                checkNumberSearchProgress(searchContainer, hiddenNumbers);
            } else if (!cell.classList.contains('found')) {
                cell.style.background = '#dc3545';
                setTimeout(() => {
                    cell.style.background = 'rgba(255, 255, 255, 0.2)';
                }, 500);
            }
        });
        
        searchContainer.appendChild(cell);
    }
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        text-align: center;
        margin: 20px 0;
        color: var(--light);
        font-size: 1.1rem;
    `;
    
    let instructionText = 'Find the hidden numbers: 15, 23, 31, 42, 56, 67, 78, 89, 91. Click on them!';
    if (currentLanguage === 'ar') {
        instructionText = 'ابحث عن الأرقام المخفية: 15، 23، 31، 42، 56، 67، 78، 89، 91. اضغط عليها!';
    } else if (currentLanguage === 'fr') {
        instructionText = 'Trouvez les nombres cachés : 15, 23, 31, 42, 56, 67, 78, 89, 91. Cliquez dessus !';
    }
    
    instructions.textContent = instructionText;
    
    // Add progress counter
    const progress = document.createElement('div');
    progress.id = 'searchProgress';
    progress.style.cssText = `
        text-align: center;
        margin: 10px 0;
        color: var(--warning);
        font-size: 1.2rem;
        font-weight: bold;
    `;
    progress.textContent = '0 / 9 found';
    
    optionsGrid.appendChild(instructions);
    optionsGrid.appendChild(progress);
    optionsGrid.appendChild(searchContainer);
}

function checkNumberSearchProgress(container, hiddenNumbers) {
    const foundCells = container.querySelectorAll('.found');
    const progress = document.getElementById('searchProgress');
    
    if (progress) {
        progress.textContent = `${foundCells.length} / 9 found`;
        
        if (foundCells.length === 9) {
            handleCorrectAnswer();
            setTimeout(() => {
                if (isGameRunning) {
                    generateNumberSearchQuestion();
                }
            }, 1000);
        }
    }
}

// 2048 Game
function show2048Game() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    // Clear options first
    optionsGrid.innerHTML = '';
    
    // Show loading message
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    
    // Generate 2048 Game
    generate2048Question();
}

function generate2048Question() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create 2048 game container
    const game2048Container = document.createElement('div');
    game2048Container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        max-width: 500px;
        margin: 20px auto;
        background: #2c3e50;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    // Initialize game state
    let game2048State = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    // Add two initial tiles
    addRandomTile(game2048State);
    addRandomTile(game2048State);
    
    // Create grid cells
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.id = `cell-${i}-${j}`;
            cell.style.cssText = `
                width: 100px;
                height: 100px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                font-weight: bold;
                color: white;
                border-radius: 10px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            
            updateCellDisplay(cell, game2048State[i][j]);
            game2048Container.appendChild(cell);
        }
    }
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        text-align: center;
        margin: 20px 0;
        color: var(--light);
        font-size: 1.1rem;
    `;
    
    let instructionText = 'Use arrow keys to move tiles. Combine same numbers to reach 2048!';
    if (currentLanguage === 'ar') {
        instructionText = 'استخدم مفاتيح الأسهم لتحريك البلاطات. اجمع الأرقام المتشابهة للوصول إلى 2048!';
    } else if (currentLanguage === 'fr') {
        instructionText = 'Utilisez les flèches pour déplacer les tuiles. Combinez les mêmes nombres pour atteindre 2048 !';
    }
    
    instructions.textContent = instructionText;
    
    // Add score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'game2048Score';
    scoreDisplay.style.cssText = `
        text-align: center;
        margin: 10px 0;
        color: var(--warning);
        font-size: 1.2rem;
        font-weight: bold;
    `;
    scoreDisplay.textContent = 'Score: 0';
    
    // Add keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            const direction = e.key.replace('Arrow', '').toLowerCase();
            moveTiles(game2048State, direction, game2048Container, scoreDisplay);
        }
    });
    
    optionsGrid.appendChild(instructions);
    optionsGrid.appendChild(scoreDisplay);
    optionsGrid.appendChild(game2048Container);
}

function addRandomTile(grid) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell[0]][randomCell[1]] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateCellDisplay(cell, value) {
    if (value === 0) {
        cell.textContent = '';
        cell.style.background = 'rgba(255, 255, 255, 0.2)';
    } else {
        cell.textContent = value;
        const colors = {
            2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
            32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
            512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };
        cell.style.background = colors[value] || '#3c3a32';
        cell.style.color = value <= 4 ? '#776e65' : '#f9f6f2';
    }
}

function moveTiles(grid, direction, container, scoreDisplay) {
    let moved = false;
    let score = parseInt(scoreDisplay.textContent.split(': ')[1]) || 0;
    
    // Create a copy for comparison
    const originalGrid = grid.map(row => [...row]);
    
    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            const row = grid[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < 4) row.push(0);
            grid[i] = row;
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            const row = grid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < 4) row.unshift(0);
            grid[i] = row;
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== 0) col.push(grid[i][j]);
            }
            for (let k = 0; k < col.length - 1; k++) {
                if (col[k] === col[k + 1]) {
                    col[k] *= 2;
                    score += col[k];
                    col.splice(k + 1, 1);
                }
            }
            while (col.length < 4) col.push(0);
            for (let i = 0; i < 4; i++) {
                grid[i][j] = col[i];
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== 0) col.push(grid[i][j]);
            }
            for (let k = col.length - 1; k > 0; k--) {
                if (col[k] === col[k - 1]) {
                    col[k] *= 2;
                    score += col[k];
                    col.splice(k - 1, 1);
                    k--;
                }
            }
            while (col.length < 4) col.unshift(0);
            for (let i = 0; i < 4; i++) {
                grid[i][j] = col[i];
            }
        }
    }
    
    // Check if grid changed
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] !== originalGrid[i][j]) {
                moved = true;
            }
        }
    }
    
    if (moved) {
        addRandomTile(grid);
        updateGridDisplay(grid, container);
        scoreDisplay.textContent = `Score: ${score}`;
        
        // Check for 2048
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 2048) {
                    handleCorrectAnswer();
                    setTimeout(() => {
                        if (isGameRunning) {
                            generate2048Question();
                        }
                    }, 1000);
                    return;
                }
            }
        }
    }
}

function updateGridDisplay(grid, container) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) {
                updateCellDisplay(cell, grid[i][j]);
            }
        }
    }
}

// Add missing functions for other games
function showKakuroGame() {
    const gameContent = document.getElementById('gameContent');
    const question = gameContent.querySelector('.question');
    const optionsGrid = gameContent.querySelector('#optionsGrid');
    
    optionsGrid.innerHTML = '';
    question.textContent = translations[currentLanguage]['loading'] || 'Loading...';
    generateKakuroQuestion();
}

function generateKakuroQuestion() {
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    // Create a simple 4x4 Kakuro puzzle
    const kakuroContainer = document.createElement('div');
    kakuroContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
        max-width: 400px;
        margin: 0 auto;
        background: #333;
        padding: 10px;
        border-radius: 10px;
    `;
    
    // Kakuro puzzle layout (0 = empty, -1 = black, numbers = clues)
    const kakuroGrid = [
        [-1, -1, 6, 3],
        [-1, 4, 0, 0],
        [7, 0, 0, 0],
        [3, 0, 0, 0]
    ];
    
    // Create grid cells
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.style.cssText = `
                width: 80px;
                height: 80px;
                background: white;
                border: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                font-weight: bold;
                position: relative;
            `;
            
            const value = kakuroGrid[i][j];
            
            if (value === -1) {
                // Black cell
                cell.style.background = '#333';
                cell.style.color = 'white';
            } else if (value > 0) {
                // Clue cell
                cell.style.background = '#f0f0f0';
                cell.style.color = '#333';
                cell.textContent = value;
            } else {
                // Input cell
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.max = '9';
                input.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border: none;
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    background: transparent;
                `;
                input.setAttribute('data-row', i);
                input.setAttribute('data-col', j);
                cell.appendChild(input);
            }
            
            kakuroContainer.appendChild(cell);
        }
    }
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        text-align: center;
        margin: 20px 0;
        color: var(--light);
        font-size: 1.1rem;
    `;
    
    let instructionText = 'Fill the white cells with numbers 1-9. The numbers in each row/column must sum to the clue numbers.';
    if (currentLanguage === 'ar') {
        instructionText = 'املأ الخلايا البيضاء بالأرقام 1-9. الأرقام في كل صف/عمود يجب أن يكون مجموعها مساوياً للأرقام الدليل.';
    } else if (currentLanguage === 'fr') {
        instructionText = 'Remplissez les cellules blanches avec les nombres 1-9. Les nombres dans chaque ligne/colonne doivent totaliser les nombres indices.';
    }
    
    instructions.textContent = instructionText;
    
    // Add check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = translations[currentLanguage]['check'] || 'Check';
    checkBtn.style.marginTop = '20px';
    checkBtn.addEventListener('click', () => {
        checkKakuroSolution(kakuroContainer, kakuroGrid);
    });
    
    optionsGrid.appendChild(instructions);
    optionsGrid.appendChild(kakuroContainer);
    optionsGrid.appendChild(checkBtn);
}

function checkKakuroSolution(container, grid) {
    const inputs = container.querySelectorAll('input');
    let isValid = true;
    
    // Check if all cells are filled
    for (const input of inputs) {
        const value = parseInt(input.value) || 0;
        if (value < 1 || value > 9) {
            alert(translations[currentLanguage]['fillAll'] || 'Please fill all cells with numbers 1-9!');
            return;
        }
    }
    
    // Check row sums
    for (let i = 1; i < 4; i++) {
        const rowSum = grid[i][0]; // Clue in first column
        if (rowSum > 0) {
            let actualSum = 0;
            for (let j = 1; j < 4; j++) {
                const input = container.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                if (input) {
                    actualSum += parseInt(input.value) || 0;
                }
            }
            if (actualSum !== rowSum) {
                isValid = false;
                break;
            }
        }
    }
    
    // Check column sums
    for (let j = 1; j < 4; j++) {
        const colSum = grid[0][j]; // Clue in first row
        if (colSum > 0) {
            let actualSum = 0;
            for (let i = 1; i < 4; i++) {
                const input = container.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                if (input) {
                    actualSum += parseInt(input.value) || 0;
                }
            }
            if (actualSum !== colSum) {
                isValid = false;
                break;
            }
        }
    }
    
    if (isValid) {
        handleCorrectAnswer();
        setTimeout(() => {
            if (isGameRunning) {
                generateKakuroQuestion();
            }
        }, 1000);
    } else {
        handleIncorrectAnswer();
    }
}









// Add missing function for Word Problems
function generateWordProblemsQuestion() {
    const problems = [
        {
            question: 'A store has 150 apples. They sell 45 apples in the morning and 30 in the afternoon. How many apples are left?',
            answer: 75
        },
        {
            question: 'Sarah has $50. She buys a book for $15 and a pen for $8. How much money does she have left?',
            answer: 27
        },
        {
            question: 'A train travels 120 km in 2 hours. What is its average speed?',
            answer: 60
        }
    ];
    
    const problem = problems[Math.floor(Math.random() * problems.length)];
    let questionText = problem.question;
    
    if (currentLanguage === 'ar') {
        if (problem.answer === 75) {
            questionText = 'متجر لديه 150 تفاحة. باع 45 تفاحة في الصباح و 30 في المساء. كم تفاحة تبقى؟';
        } else if (problem.answer === 27) {
            questionText = 'سارة لديها 50 دولار. اشترت كتاباً بـ 15 دولار وقلم بـ 8 دولارات. كم من المال تبقى لديها؟';
        } else if (problem.answer === 60) {
            questionText = 'قطار يسافر 120 كم في ساعتين. ما متوسط سرعته؟';
        }
    } else if (currentLanguage === 'fr') {
        if (problem.answer === 75) {
            questionText = 'Un magasin a 150 pommes. Ils vendent 45 pommes le matin et 30 l\'après-midi. Combien de pommes reste-t-il ?';
        } else if (problem.answer === 27) {
            questionText = 'Sarah a 50$. Elle achète un livre pour 15$ et un stylo pour 8$. Combien d\'argent lui reste-t-il ?';
        } else if (problem.answer === 60) {
            questionText = 'Un train parcourt 120 km en 2 heures. Quelle est sa vitesse moyenne ?';
        }
    }
    
    document.querySelector('.question').textContent = questionText;
    
    setTimeout(() => {
        const options = generateOptions(problem.answer, 4);
        showOptions(options, problem.answer);
    }, 10);
}

// Export functions for global access
window.showSection = showSection;
window.changeLanguage = changeLanguage;
window.startGame = startGame;
window.pauseGame = pauseGame;
window.resetGame = resetGame;
window.selectCategory = selectCategory;
window.downloadAndroid = downloadAndroid;

// Setup Android download button
function setupAndroidDownloadButton() {
    const androidButton = document.querySelector('.android-download');
    if (androidButton) {
        androidButton.addEventListener('click', function(e) {
            e.preventDefault();
            const url = 'https://mega4upload.net/tgbzeics47bg';
            window.open(url, '_blank');
            console.log('Opening Android download link:', url);
        });
    }
}

// Global function for Android download
function downloadAndroid() {
    const url = 'https://mega4upload.net/tgbzeics47bg';
    try {
        window.open(url, '_blank');
        console.log('Opening Android download link:', url);
        
        // Show success message
        if (typeof AnimationManager !== 'undefined') {
            AnimationManager.showSuccess(document.querySelector('.android-download-btn'));
        }
    } catch (error) {
        console.error('Error opening download link:', error);
        alert('Please copy this link manually: ' + url);
    }
}
