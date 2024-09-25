// Game constants
const BASE_WIDTH = 800;
const BASE_HEIGHT = 400;
let SCALE_FACTOR = 1;
let UI_SCALE_FACTOR = 1;
const GRAVITY = 0.6;
const JUMP_STRENGTH = 13;
const CHARACTER_WIDTH = 30;
const CHARACTER_HEIGHT = 30;
const MIN_OBSTACLE_DISTANCE = 200;
const OBSTACLE_WIDTH = 20;

// Game variables
let canvas, ctx;
let score, highScores;
let gameState = 'MAIN_MENU';
let currentMode = null;
let lastTime = 0;
let gameSpeed = 5; // Start with a slower speed
let obstacleFrequency = 2.5; // Start with less frequent obstacles
let difficultyLevel = 1;
let debugMode = true;
let consecutiveSameObstacles = 0;
let lastObstacleType = null;

// FPS Limiting
const FPS = 60;
const FRAME_MIN_TIME = (1000/60) * (60 / FPS) - (1000/60) * 0.5;

// Character object
const character = {
    x: 50,
    y: BASE_HEIGHT - CHARACTER_HEIGHT,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    velocityY: 0,
    isJumping: false,
    canDoubleJump: false,
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = -JUMP_STRENGTH;
            this.isJumping = true;
            this.canDoubleJump = true;
        } else if (this.canDoubleJump) {
            this.velocityY = -JUMP_STRENGTH * 0.9; 
            this.canDoubleJump = false;
        }
    },
    
    update(deltaTime) {
        this.velocityY += GRAVITY;
        this.y += this.velocityY * (deltaTime / 16);
        
        if (this.y > BASE_HEIGHT - this.height) {
            this.y = BASE_HEIGHT - this.height;
            this.velocityY = 0;
            this.isJumping = false;
            this.canDoubleJump = false;
        }
    },
    
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Obstacle object
const obstacles = {
    list: [],
    types: ['standard', 'tall', 'low', 'moving'],
    lastObstacleTime: 0,
    
    generate(currentTime) {
        if (currentTime - this.lastObstacleTime > obstacleFrequency * 1000) {
            const type = this.getRandomType();
            const obstacle = this.createObstacle(type);
            this.list.push(obstacle);
            this.lastObstacleTime = currentTime;
        }
    },
    
    getRandomType() {
        if (score < 10) {
            return 'standard';
        }

        let availableTypes = this.types.slice(0, Math.min(difficultyLevel, this.types.length));
        
        if (consecutiveSameObstacles >= 3 && availableTypes.length > 1) {
            availableTypes = availableTypes.filter(type => type !== lastObstacleType);
        }

        const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        if (selectedType === lastObstacleType) {
            consecutiveSameObstacles++;
        } else {
            consecutiveSameObstacles = 1;
        }
        
        lastObstacleType = selectedType;
        return selectedType;
    },
    
    createObstacle(type) {
        let height, width;
        const maxJumpHeight = (JUMP_STRENGTH * JUMP_STRENGTH) / (2 * GRAVITY);
        const baseHeight = maxJumpHeight * 0.5;

        switch (type) {
            case 'tall':
                height = baseHeight * 1.6; 
                width = OBSTACLE_WIDTH;
                break;
            case 'low':
                height = baseHeight * 0.4; 
                width = OBSTACLE_WIDTH * 3;
                break;
            case 'moving':
                height = baseHeight * 0.5; 
                width = OBSTACLE_WIDTH;
                break;
            default: // standard
                height = baseHeight * 0.8; // comfortably clearable with a single jump
                width = OBSTACLE_WIDTH;
        }
        
        return { 
            x: BASE_WIDTH, 
            y: BASE_HEIGHT - height, 
            width, 
            height, 
            type 
        };
    },
    
    update(deltaTime, currentTime) {
        this.list.forEach(obstacle => {
            obstacle.x -= gameSpeed * (deltaTime / 16);
            if (obstacle.type === 'moving') {
                obstacle.y = BASE_HEIGHT - obstacle.height - Math.sin(currentTime * 0.005) * 30;
            }
        });
        this.list = this.list.filter(obstacle => obstacle.x > -obstacle.width);
        this.generate(currentTime);
    },

    draw() {
        this.list.forEach(obstacle => {
            ctx.fillStyle = this.getObstacleColor(obstacle.type);
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    },
    
    getObstacleColor(type) {
        switch (type) {
            case 'tall': return 'darkred';
            case 'low': return 'orange';
            case 'moving': return 'purple';
            default: return 'green'; 
        }
    }
};

function setScaleFactor() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = windowWidth / BASE_WIDTH;
    const scaleY = windowHeight / BASE_HEIGHT;
    SCALE_FACTOR = Math.min(scaleX, scaleY, 1);
    UI_SCALE_FACTOR = Math.min(1, SCALE_FACTOR);

    canvas.width = BASE_WIDTH * SCALE_FACTOR;
    canvas.height = BASE_HEIGHT * SCALE_FACTOR;
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
}

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    setScaleFactor();
    
    highScores = {
        marathon: parseInt(localStorage.getItem('highScoreMarathon')) || 0,
        challenge: parseInt(localStorage.getItem('highScoreChallenge')) || 0
    };
    updateScoreDisplay();
    
    setupInputHandlers();
    window.addEventListener('resize', setScaleFactor);
}

function setupInputHandlers() {
    document.addEventListener('keydown', handleKeyInput);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
}

function handleKeyInput(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameState === 'PLAYING') {
            character.jump();
        } else if (gameState === 'GAME_OVER') {
            startGame(currentMode);
        }
    }
}

function handleClick(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / SCALE_FACTOR;
    const y = (event.clientY - rect.top) / SCALE_FACTOR;
    handleInteraction(x, y);
}

function handleTouch(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (event.touches[0].clientX - rect.left) / SCALE_FACTOR;
    const y = (event.touches[0].clientY - rect.top) / SCALE_FACTOR;
    handleInteraction(x, y);
}

function handleInteraction(x, y) {
    if (gameState === 'PLAYING') {
        character.jump();
    } else if (gameState === 'GAME_OVER') {
        // Check if the click/touch is on the "Main Menu" button
        if (x > 300 && x < 500 && y > 300 && y < 350) {
            returnToMainMenu();
        } else {
            startGame(currentMode);
        }
    } else if (gameState === 'MAIN_MENU') {
        // Check if click/touch is on Marathon or Challenge button
        if (y > 200 && y < 250) {
            if (x > 200 && x < 350) {
                startGame('marathon');
            } else if (x > 450 && x < 600) {
                startGame('challenge');
            }
        }
    }
}

function returnToMainMenu() {
    gameState = 'MAIN_MENU';
    currentMode = null;
    resetGame();
    updateScoreDisplay();
}

function updateGameState(deltaTime) {
    if (gameState !== 'PLAYING') return;

    const currentTime = performance.now();
    character.update(deltaTime);
    obstacles.update(deltaTime, currentTime);
    
    score += deltaTime / 1000;
    updateDifficulty();
    checkCollisions();
    updateScoreDisplay();
}

function updateDifficulty() {
    const baseIncrease = score / 10; // Progression speed
    if (currentMode === 'challenge') {
        difficultyLevel = Math.floor(score / 15) + 1; // Faster difficulty level increase
        gameSpeed = Math.min(8, 3 + baseIncrease); // Slightly higher max speed
        obstacleFrequency = Math.max(0.7, 2.5 - baseIncrease * 0.15); // Faster decrease in obstacle frequency
    } else {
        gameSpeed = Math.min(6, 3 + baseIncrease * 0.3);
        obstacleFrequency = Math.max(1.2, 2.5 - baseIncrease * 0.1);
    }
}

function checkCollisions() {
    obstacles.list.forEach(obstacle => {
        if (character.x < obstacle.x + obstacle.width &&
            character.x + character.width > obstacle.x &&
            character.y < obstacle.y + obstacle.height &&
            character.y + character.height > obstacle.y) {
            gameOver();
        }
    });
}

function getInitialObstacleType() {
    if (score < 4) {
        return 'standard';
    }
    return obstacles.getRandomType();
}

function gameOver() {
    gameState = 'GAME_OVER';
    if (score > highScores[currentMode]) {
        highScores[currentMode] = Math.floor(score);
        localStorage.setItem(`highScore${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`, highScores[currentMode]);
    }
}

function resetGame() {
    score = 0;
    gameSpeed = 3;
    obstacleFrequency = 2.5;
    difficultyLevel = 1;
    obstacles.list = [];
    character.y = BASE_HEIGHT - character.height;
    character.velocityY = 0;
    character.isJumping = false;
    character.canDoubleJump = true;
    consecutiveSameObstacles = 0;
    lastObstacleType = null;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = Math.floor(score);
    document.getElementById('highScoreMarathonValue').textContent = highScores.marathon;
    document.getElementById('highScoreChallengeValue').textContent = highScores.challenge;
    document.getElementById('currentMode').textContent = currentMode || 'None';
}

function draw() {
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    if (gameState === 'MAIN_MENU') {
        drawMainMenu();
    } else if (gameState === 'PLAYING') {
        character.draw();
        obstacles.draw();
    } else if (gameState === 'GAME_OVER') {
        drawGameOverScreen();
    }
}
function drawMainMenu() {
    ctx.fillStyle = 'black';
    ctx.font = `${30 * UI_SCALE_FACTOR}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('runner', BASE_WIDTH / 2, 100);

    ctx.fillStyle = 'blue';
    ctx.fillRect(200, 200, 150, 50);
    ctx.fillRect(450, 200, 150, 50);

    ctx.fillStyle = 'white';
    ctx.font = `${20 * UI_SCALE_FACTOR}px Arial`;
    ctx.fillText('Marathon', 275, 230);
    ctx.fillText('Challenge', 525, 230);

    ctx.fillStyle = 'black';
    ctx.font = `${16 * UI_SCALE_FACTOR}px Arial`;
    ctx.fillText(`High Score: ${highScores.marathon}`, 275, 280);
    ctx.fillText(`High Score: ${highScores.challenge}`, 525, 280);
}


function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    ctx.fillStyle = 'white';
    ctx.font = `${30 * UI_SCALE_FACTOR}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 60);
    ctx.fillText(`Score: ${Math.floor(score)}`, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20);
    ctx.fillText(`High Score: ${highScores[currentMode]}`, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
    ctx.fillText('Tap or Press Spacebar to Restart', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);

    ctx.fillStyle = 'blue';
    ctx.fillRect(300, 300, 200, 50);
    ctx.fillStyle = 'white';
    ctx.font = `${20 * UI_SCALE_FACTOR}px Arial`;
    ctx.fillText('Main Menu', BASE_WIDTH / 2, 330);
}


function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    const deltaTime = currentTime - lastTime;
    if (deltaTime < FRAME_MIN_TIME) return;
    
    lastTime = currentTime;
    
    updateGameState(deltaTime);
    draw();
    updateScoreDisplay(); // update score every frame
}

function startGame(mode) {
    gameState = 'PLAYING';
    currentMode = mode;
    resetGame();
}

function initialize() {
    init();
    gameState = 'MAIN_MENU';
    lastTime = 0;
    requestAnimationFrame(gameLoop);
}


initialize();