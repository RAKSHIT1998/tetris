// Social Media Authentication
async function signInWithFacebook() {
    try {
        const response = await new Promise((resolve, reject) => {
            FB.login((response) => {
                if (response.authResponse) {
                    resolve(response);
                } else {
                    reject('User cancelled login or did not fully authorize.');
                }
            }, { scope: 'public_profile,email' });
        });

        const userInfo = await new Promise((resolve) => {
            FB.api('/me', { fields: 'name,email' }, (response) => {
                resolve(response);
            });
        });

        handleSocialLogin({
            provider: 'facebook',
            id: response.authResponse.userID,
            name: userInfo.name,
            email: userInfo.email
        });
    } catch (error) {
        console.error('Facebook login error:', error);
        alert('Failed to login with Facebook. Please try again.');
    }
}

async function signInWithGoogle() {
    try {
        const auth2 = gapi.auth2.getAuthInstance();
        const googleUser = await auth2.signIn();
        const profile = googleUser.getBasicProfile();

        handleSocialLogin({
            provider: 'google',
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail()
        });
    } catch (error) {
        console.error('Google login error:', error);
        alert('Failed to login with Google. Please try again.');
    }
}

async function signInWithApple() {
    try {
        const response = await AppleID.auth.signIn();
        
        handleSocialLogin({
            provider: 'apple',
            id: response.user.id,
            name: response.user.name?.firstName + ' ' + response.user.name?.lastName,
            email: response.user.email
        });
    } catch (error) {
        console.error('Apple login error:', error);
        alert('Failed to login with Apple. Please try again.');
    }
}

function handleSocialLogin(userData) {
    // Store user data
    localStorage.setItem('tetrisUser', JSON.stringify(userData));
    
    // Update UI
    document.getElementById('player-name').textContent = userData.name;
    
    // Close auth modal
    document.getElementById('auth-modal').style.display = 'none';
    
    // Initialize game with user data
    window.tetrisGame.initGame(userData);
}

// Social Media Sharing
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

async function shareToFacebook() {
    try {
        const screenshot = await captureScreenshot();
        if (!screenshot) throw new Error('Failed to capture screenshot');

        const score = document.getElementById('score').textContent;
        const level = document.getElementById('level').textContent;

        FB.ui({
            method: 'share',
            href: window.location.href,
            quote: `Just scored ${score} points at level ${level} in Tetris! Can you beat my score?`,
            hashtag: '#TetrisChallenge'
        }, function(response) {
            if (response && !response.error_message) {
                alert('Successfully shared to Facebook!');
            } else {
                alert('Failed to share to Facebook. Please try again.');
            }
        });
    } catch (error) {
        console.error('Facebook share error:', error);
        alert('Failed to share to Facebook. Please try again.');
    }
}

async function shareToTwitter() {
    try {
        const score = document.getElementById('score').textContent;
        const level = document.getElementById('level').textContent;
        const text = encodeURIComponent(`Just scored ${score} points at level ${level} in Tetris! Can you beat my score? #TetrisChallenge`);
        const url = encodeURIComponent(window.location.href);
        
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, 
            'twitter-share-dialog', 
            'width=600,height=400');
    } catch (error) {
        console.error('Twitter share error:', error);
        alert('Failed to share to Twitter. Please try again.');
    }
}

// Friends Leaderboard
function getFriendsLeaderboard() {
    const currentUser = JSON.parse(localStorage.getItem('tetrisUser'));
    if (!currentUser) return [];

    // Get all high scores
    const allScores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
    
    // If using Facebook, we can get friend list
    if (currentUser.provider === 'facebook') {
        FB.api('/me/friends', async (response) => {
            if (response.data) {
                const friendIds = response.data.map(friend => friend.id);
                // Filter scores to only include friends
                const friendScores = allScores.filter(score => 
                    friendIds.includes(score.userId) || score.userId === currentUser.id
                );
                updateLeaderboardUI(friendScores);
            }
        });
    } else {
        // Without Facebook friend list, just show all scores
        updateLeaderboardUI(allScores);
    }
}

function updateLeaderboardUI(scores) {
    const leaderboardElement = document.getElementById('leaderboard');
    const currentUser = JSON.parse(localStorage.getItem('tetrisUser'));

    const leaderboardHTML = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((score, index) => `
            <div class="leaderboard-item ${score.userId === currentUser.id ? 'bg-purple-900/20' : ''}">
                <div class="flex justify-between">
                    <span class="text-white">${index + 1}. ${score.username}</span>
                    <span class="text-white">${score.score}</span>
                </div>
                <div class="text-gray-400 text-sm">${score.difficulty}</div>
            </div>
        `)
        .join('');

    leaderboardElement.innerHTML = leaderboardHTML;
}

// Load html2canvas for screenshot functionality
const script = document.createElement('script');
script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(script);