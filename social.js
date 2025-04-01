// Simple username management
function handleUsernameSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const difficulty = document.getElementById('difficulty').value;
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    // Store user data
    const userData = {
        username: username,
        difficulty: difficulty
    };
    localStorage.setItem('tetrisUser', JSON.stringify(userData));
    
    // Update player name display
    document.getElementById('player-name').textContent = username;
    
    // Hide modal
    document.getElementById('username-modal').style.display = 'none';
    
    // Initialize game with user data
    if (!window.tetrisGame) {
        window.tetrisGame = new Tetris();
    }
    window.tetrisGame.initGame(userData);
}

// Screenshot and sharing functionality
async function captureScreenshot() {
    try {
        const gameBoard = document.getElementById('game-board');
        const canvas = await html2canvas(gameBoard);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Screenshot error:', error);
        return null;
    }
}

async function showShareModal() {
    const screenshot = await captureScreenshot();
    if (screenshot) {
        const modal = document.getElementById('share-modal');
        const preview = document.getElementById('screenshot-preview');
        preview.src = screenshot;
        modal.classList.remove('hidden');
    }
}

function closeShareModal() {
    document.getElementById('share-modal').classList.add('hidden');
}

async function shareToTwitter() {
    try {
        const score = document.getElementById('score').textContent;
        const level = document.getElementById('level').textContent;
        const username = JSON.parse(localStorage.getItem('tetrisUser'))?.username || 'Anonymous';
        const text = encodeURIComponent(`${username} just scored ${score} points at level ${level} in Tetris! Can you beat this score? #TetrisChallenge`);
        const url = encodeURIComponent(window.location.href);
        
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, 
            'twitter-share-dialog', 
            'width=600,height=400');
    } catch (error) {
        console.error('Twitter share error:', error);
        alert('Failed to share to Twitter. Please try again.');
    }
}

async function copyShareLink() {
    try {
        const score = document.getElementById('score').textContent;
        const level = document.getElementById('level').textContent;
        const username = JSON.parse(localStorage.getItem('tetrisUser'))?.username || 'Anonymous';
        const text = `${username} just scored ${score} points at level ${level} in Tetris! Can you beat this score?`;
        
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        alert('Share link copied to clipboard!');
    } catch (error) {
        console.error('Copy link error:', error);
        alert('Failed to copy share link. Please try again.');
    }
}

// Leaderboard functionality
function updateLeaderboard(newScore) {
    const leaderboardElement = document.getElementById('leaderboard');
    let scores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
    
    if (newScore) {
        scores.push(newScore);
    }
    
    // Sort scores and keep top 10
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('tetrisHighScores', JSON.stringify(scores));
    
    // Update UI
    leaderboardElement.innerHTML = scores
        .map((score, index) => `
            <div class="leaderboard-item">
                <div class="flex justify-between">
                    <span class="text-white">${index + 1}. ${score.username}</span>
                    <span class="text-white">${score.score}</span>
                </div>
                <div class="text-gray-400 text-sm">${score.difficulty}</div>
            </div>
        `)
        .join('');
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('username-form');
    if (form) {
        form.addEventListener('submit', handleUsernameSubmit);
    }
    
    // Check for existing user
    const savedUser = localStorage.getItem('tetrisUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        document.getElementById('player-name').textContent = userData.username;
        document.getElementById('username-modal').style.display = 'none';
        if (!window.tetrisGame) {
            window.tetrisGame = new Tetris();
        }
        window.tetrisGame.initGame(userData);
    }
    
    // Load leaderboard
    updateLeaderboard();
});