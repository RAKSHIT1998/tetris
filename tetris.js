// Previous code remains the same until the class definition

class Tetris {
    constructor() {
        this.setupAuth();
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
        
        // Load saved high scores and initialize friends leaderboard
        this.loadHighScores();
        getFriendsLeaderboard();
    }

    // ... (previous methods remain the same)

    showGameOver() {
        // Save high score
        this.saveHighScore();
        
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center flex-col glass-effect';
        overlay.innerHTML = `
            <h2 class="text-4xl font-bold text-white mb-4 neon-text">GAME OVER</h2>
            <p class="text-2xl text-white mb-2">Score: ${this.score}</p>
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

    saveHighScore() {
        const userData = JSON.parse(localStorage.getItem('tetrisUser'));
        if (!userData) return;
        
        const newScore = {
            userId: userData.id,
            username: userData.name,
            score: this.score,
            difficulty: this.currentUser?.difficulty || 'medium',
            date: new Date().toISOString()
        };
        
        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10
        
        localStorage.setItem('tetrisHighScores', JSON.stringify(this.highScores));
        
        // Update both global and friends leaderboards
        this.updateLeaderboard();
        getFriendsLeaderboard();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highscoreElement.textContent = this.highScore;
        }
    }

    // ... (rest of the previous methods remain the same)
}

// Make the game instance globally accessible for social features
window.addEventListener('load', () => {
    window.tetrisGame = new Tetris();
});