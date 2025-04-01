const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = window.innerWidth > 768 ? 30 : 25;

const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
    I: '#00f2ff', // Neon blue
    O: '#ffec44', // Neon yellow
    T: '#b300ff', // Neon purple
    S: '#00ff66', // Neon green
    Z: '#ff0055', // Neon pink
    J: '#0066ff', // Bright blue
    L: '#ff6600'  // Neon orange
};

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: {
        initialSpeed: 1000,
        speedIncrease: 50,
        scoreMultiplier: 1
    },
    medium: {
        initialSpeed: 800,
        speedIncrease: 75,
        scoreMultiplier: 1.5
    },
    hard: {
        initialSpeed: 500,
        speedIncrease: 100,
        scoreMultiplier: 2
    }
};

class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.nextCanvas = document.getElementById('next-piece');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.highscoreElement = document.getElementById('highscore');
        this.leaderboardElement = document.getElementById('leaderboard');
        this.playerNameElement = document.getElementById('player-name');
        
        this.score = 0;
        this.level = 1;
        this.highScore = 0;
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.gameOver = false;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.combo = 0;
        
        // Check for existing user
        const savedUser = localStorage.getItem('tetrisUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            this.playerNameElement.textContent = userData.username;
            this.setDifficulty(userData.difficulty);
            this.initGame(userData);
        }
    }

    initGame(userData) {
        if (userData) {
            this.currentUser = userData;
            this.setDifficulty(userData.difficulty);
        }
        
        this.initBoard();
        this.initNextPieceDisplay();
        this.initControls();
        this.addParticleSystem();
        
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        // Load high scores
        this.loadHighScores();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setDifficulty(difficulty) {
        const settings = DIFFICULTY_SETTINGS[difficulty];
        this.dropInterval = settings.initialSpeed;
        this.speedIncrease = settings.speedIncrease;
        this.scoreMultiplier = settings.scoreMultiplier;
    }

    loadHighScores() {
        const scores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
        if (scores.length > 0) {
            this.highScore = scores[0].score;
            this.highscoreElement.textContent = this.highScore;
        }
        updateLeaderboard();
    }

    saveHighScore() {
        if (!this.currentUser) return;
        
        const newScore = {
            username: this.currentUser.username,
            score: Math.floor(this.score * this.scoreMultiplier),
            difficulty: this.currentUser.difficulty,
            date: new Date().toISOString()
        };
        
        updateLeaderboard(newScore);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highscoreElement.textContent = this.highScore;
        }
    }

    // ... (previous methods for game mechanics remain the same)

    showGameOver() {
        // Save high score
        this.saveHighScore();
        
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center flex-col glass-effect';
        overlay.innerHTML = `
            <h2 class="text-4xl font-bold text-white mb-4 neon-text">GAME OVER</h2>
            <p class="text-2xl text-white mb-2">Score: ${Math.floor(this.score * this.scoreMultiplier)}</p>
            <p class="text-xl text-gray-400 mb-8">Difficulty: ${this.currentUser?.difficulty || 'medium'}</p>
            <div class="flex gap-4 mb-8">
                <button onclick="showShareModal()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Share Score
                </button>
                <button onclick="location.reload()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Play Again
                </button>
            </div>
        `;
        this.canvas.appendChild(overlay);
    }

    // ... (rest of the previous methods remain the same)
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.tetrisGame = new Tetris();
});