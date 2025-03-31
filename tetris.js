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

class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.nextCanvas = document.getElementById('next-piece');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.score = 0;
        this.level = 1;
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.gameOver = false;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.combo = 0;
        
        this.initBoard();
        this.initNextPieceDisplay();
        this.initControls();
        this.addParticleSystem();
        
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    addParticleSystem() {
        this.particles = [];
        this.particleContainer = document.createElement('div');
        this.particleContainer.style.position = 'absolute';
        this.particleContainer.style.inset = '0';
        this.particleContainer.style.pointerEvents = 'none';
        this.canvas.appendChild(this.particleContainer);
    }

    createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.borderRadius = '50%';
        particle.style.filter = 'blur(1px)';
        this.particleContainer.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 2;
        const lifetime = 1000;
        const created = Date.now();

        return { element: particle, angle, velocity, lifetime, created };
    }

    updateParticles() {
        const now = Date.now();
        this.particles = this.particles.filter(particle => {
            const age = now - particle.created;
            if (age > particle.lifetime) {
                particle.element.remove();
                return false;
            }

            const progress = age / particle.lifetime;
            const x = parseFloat(particle.element.style.left) + Math.cos(particle.angle) * particle.velocity;
            const y = parseFloat(particle.element.style.top) + Math.sin(particle.angle) * particle.velocity;
            
            particle.element.style.left = x + 'px';
            particle.element.style.top = y + 'px';
            particle.element.style.opacity = 1 - progress;

            return true;
        });
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
                block.style.transition = 'background-color 0.2s ease';
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

        // Touch events for swipe controls
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.gameOver) return;
            
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    this.movePiece(-1, 0);
                } else {
                    this.movePiece(1, 0);
                }
            } else {
                if (diffY > 0) {
                    this.rotatePiece();
                } else {
                    this.movePiece(0, 1);
                }
            }
            
            touchStartX = touchEndX;
            touchStartY = touchEndY;
        });
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
        
        // Draw current piece with glow effect
        if (!this.gameOver) {
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

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastDrop;
        
        if (deltaTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.lastDrop = timestamp;
        }
        
        this.drawBoard();
        this.drawNextPiece();
        this.updateScore();
        this.updateParticles();
        
        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            this.showGameOver();
        }
    }

    showGameOver() {
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center flex-col glass-effect';
        overlay.innerHTML = `
            <h2 class="text-4xl font-bold text-white mb-4 neon-text">GAME OVER</h2>
            <p class="text-2xl text-white mb-8">Score: ${this.score}</p>
            <button onclick="location.reload()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Play Again
            </button>
        `;
        this.canvas.appendChild(overlay);
        
        // Show game over ad
        (adsbygoogle = window.adsbygoogle || []).push({});
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
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
                this.hardDrop();
                break;
        }
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {}
    }

    movePiece(dx, dy) {
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
                }
            }
            return false;
        }
        return true;
    }

    rotatePiece() {
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
        } else {
            // Add rotation particles
            const centerX = (this.currentPiece.pos.x + matrix.length / 2) * BLOCK_SIZE;
            const centerY = (this.currentPiece.pos.y + matrix.length / 2) * BLOCK_SIZE;
            for (let i = 0; i < 5; i++) {
                this.particles.push(this.createParticle(centerX, centerY, this.currentPiece.color));
            }
        }
    }

    collision() {
        const matrix = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] && (
                    !this.board[pos.y + y] ||
                    this.board[pos.y + y][pos.x + x] === undefined ||
                    this.board[pos.y + y][pos.x + x]
                )) {
                    return true;
                }
            }
        }
        return false;
    }

    mergePiece() {
        const matrix = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.board[pos.y + y][pos.x + x] = this.currentPiece.color;
                    // Add merge particles
                    const particleX = (pos.x + x) * BLOCK_SIZE;
                    const particleY = (pos.y + y) * BLOCK_SIZE;
                    for (let i = 0; i < 3; i++) {
                        this.particles.push(this.createParticle(particleX, particleY, this.currentPiece.color));
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // Add clear line particles
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    const particleX = x * BLOCK_SIZE;
                    const particleY = y * BLOCK_SIZE;
                    for (let i = 0; i < 2; i++) {
                        this.particles.push(this.createParticle(particleX, particleY, this.board[y][x]));
                    }
                }

                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.combo++;
            const bonus = this.combo * linesCleared * 50;
            this.score += linesCleared * 100 * this.level + bonus;
            this.level = Math.floor(this.score / 1000) + 1;
        } else {
            this.combo = 0;
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Tetris();
});