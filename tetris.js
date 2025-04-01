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

    initBoard() {
        this.canvas.style.width = BLOCK_SIZE * BOARD_WIDTH + 'px';
        this.canvas.style.height = BLOCK_SIZE * BOARD_HEIGHT + 'px';
        this.canvas.innerHTML = '';
        
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const block = document.createElement('div');
                block.className = 'game-block absolute';
                block.style.left = x * BLOCK_SIZE + 'px';
                block.style.top = y * BLOCK_SIZE + 'px';
                block.style.width = BLOCK_SIZE + 'px';
                block.style.height = BLOCK_SIZE + 'px';
                this.canvas.appendChild(block);
            }
        }
        this.canvas.style.position = 'relative';
    }

    initNextPieceDisplay() {
        this.nextCanvas.style.width = BLOCK_SIZE * 4 + 'px';
        this.nextCanvas.style.height = BLOCK_SIZE * 4 + 'px';
        this.nextCanvas.style.position = 'relative';
        this.nextCanvas.innerHTML = '';
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const block = document.createElement('div');
                block.className = 'game-block absolute';
                block.style.left = x * BLOCK_SIZE + 'px';
                block.style.top = y * BLOCK_SIZE + 'px';
                block.style.width = BLOCK_SIZE + 'px';
                block.style.height = BLOCK_SIZE + 'px';
                this.nextCanvas.appendChild(block);
            }
        }
    }

    initControls() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Mobile controls
        document.getElementById('left-btn')?.addEventListener('click', () => this.movePiece(-1, 0));
        document.getElementById('right-btn')?.addEventListener('click', () => this.movePiece(1, 0));
        document.getElementById('down-btn')?.addEventListener('click', () => this.movePiece(0, 1));
        document.getElementById('rotate-btn')?.addEventListener('click', () => this.rotatePiece());
    }

    createPiece() {
        const shape = Object.keys(SHAPES)[Math.floor(Math.random() * Object.keys(SHAPES).length)];
        return {
            shape,
            matrix: [...SHAPES[shape]],
            pos: {x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[shape][0].length / 2), y: 0},
            color: COLORS[shape]
        };
    }

    drawBoard() {
        const blocks = Array.from(this.canvas.getElementsByClassName('game-block'));
        let index = 0;
        
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const color = this.board[y][x];
                blocks[index].style.backgroundColor = color || '#1a1a1a';
                blocks[index].style.boxShadow = color ? `0 0 10px ${color}` : 'none';
                index++;
            }
        }
        
        // Draw current piece
        if (!this.gameOver && this.currentPiece) {
            this.currentPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const pos = (this.currentPiece.pos.y + y) * BOARD_WIDTH + (this.currentPiece.pos.x + x);
                        if (blocks[pos]) {
                            blocks[pos].style.backgroundColor = this.currentPiece.color;
                            blocks[pos].style.boxShadow = `0 0 10px ${this.currentPiece.color}`;
                        }
                    }
                });
            });
        }
    }

    drawNextPiece() {
        const blocks = Array.from(this.nextCanvas.getElementsByClassName('game-block'));
        blocks.forEach(block => {
            block.style.backgroundColor = '#1a1a1a';
            block.style.boxShadow = 'none';
        });
        
        if (this.nextPiece) {
            const offsetX = Math.floor((4 - this.nextPiece.matrix[0].length) / 2);
            const offsetY = Math.floor((4 - this.nextPiece.matrix.length) / 2);
            
            this.nextPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const pos = (offsetY + y) * 4 + (offsetX + x);
                        if (blocks[pos]) {
                            blocks[pos].style.backgroundColor = this.nextPiece.color;
                            blocks[pos].style.boxShadow = `0 0 10px ${this.nextPiece.color}`;
                        }
                    }
                });
            });
        }
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastDrop;
        
        if (deltaTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.lastDrop = timestamp;
        }
        
        this.drawBoard();
        this.drawNextPiece();
        
        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        this.currentPiece.pos.x += dx;
        this.currentPiece.pos.y += dy;
        
        if (this.collision()) {
            this.currentPiece.pos.x -= dx;
            this.currentPiece.pos.y -= dy;
            
            if (dy > 0) {
                this.mergePiece();
                this.clearLines();
                this.currentPiece = this.nextPiece;
                this.nextPiece = this.createPiece();
                
                if (this.collision()) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }
            return false;
        }
        return true;
    }

    collision() {
        if (!this.currentPiece) return false;
        
        const matrix = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] && (
                    !this.board[pos.y + y] ||
                    !this.board[pos.y + y][pos.x + x] === undefined ||
                    this.board[pos.y + y][pos.x + x]
                )) {
                    return true;
                }
            }
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return;
        
        const matrix = this.currentPiece.matrix;
        const N = matrix.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                rotated[x][N - 1 - y] = matrix[y][x];
            }
        }
        
        const originalMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = rotated;
        
        if (this.collision()) {
            this.currentPiece.matrix = originalMatrix;
        }
    }

    mergePiece() {
        if (!this.currentPiece) return;
        
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.board[this.currentPiece.pos.y + y][this.currentPiece.pos.x + x] = this.currentPiece.color;
                }
            });
        });
        
        this.score += 10;
        this.scoreElement.textContent = Math.floor(this.score * this.scoreMultiplier);
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.combo++;
            const bonus = this.combo * linesCleared * 50;
            this.score += linesCleared * 100 + bonus;
            this.level = Math.floor(this.score / 1000) + 1;
            this.levelElement.textContent = this.level;
            this.scoreElement.textContent = Math.floor(this.score * this.scoreMultiplier);
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * this.speedIncrease);
        } else {
            this.combo = 0;
        }
    }

    handleKeyPress(event) {
        if (this.gameOver) return;
        
        switch(event.keyCode) {
            case 37: // Left
                this.movePiece(-1, 0);
                break;
            case 39: // Right
                this.movePiece(1, 0);
                break;
            case 40: // Down
                this.movePiece(0, 1);
                break;
            case 38: // Up (Rotate)
                this.rotatePiece();
                break;
            case 32: // Space (Hard drop)
                while (this.movePiece(0, 1)) {}
                break;
        }
    }

    showGameOver() {
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
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.tetrisGame = new Tetris();
});