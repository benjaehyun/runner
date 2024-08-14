// Game constants
const BASE_WIDTH = 800;
const BASE_HEIGHT = 400;
let SCALE_FACTOR = 1;
let UI_SCALE_FACTOR = 1;
const GRAVITY = 0.4;
const JUMP_STRENGTH = 14;
const OBSTACLE_SPEED = 5;
const CHARACTER_WIDTH = 30;
const CHARACTER_HEIGHT = 30;
const MIN_OBSTACLE_DISTANCE = 250;
const MAX_OBSTACLE_HEIGHT = 50;
const MIN_OBSTACLE_HEIGHT = 20;
const OBSTACLE_WIDTH = 20;

// Game variables
let canvas, ctx;
let score, highScores;
let isJumping, canDoubleJump;
let lastTime = 0;
let lastObstaclePosition = 0;
let gameState = 'MAIN_MENU';
let currentMode = null;

// Character object
const character = {
    x: 50,
    y: BASE_HEIGHT - CHARACTER_HEIGHT,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    velocityY: 0,
    
    jump() {
        if (!isJumping) {
            this.velocityY = -JUMP_STRENGTH;
            isJumping = true;
            canDoubleJump = true;
        } else if (canDoubleJump) {
            this.velocityY = -JUMP_STRENGTH;
            canDoubleJump = false;
        }
    },
    
    update(deltaTime) {
        this.velocityY += GRAVITY;
        this.y += this.velocityY * (deltaTime / 16);
        
        if (this.y > BASE_HEIGHT - this.height) {
            this.y = BASE_HEIGHT - this.height;
            this.velocityY = 0;
            isJumping = false;
        }
    },
    
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Obstacle management
const obstacles = {
    list: [],
    
    generate() {
        const lastObstacle = this.list[this.list.length - 1];
        const minDistance = lastObstacle ? lastObstacle.x + MIN_OBSTACLE_DISTANCE : BASE_WIDTH;
        
        if (minDistance <= BASE_WIDTH) {
            const maxJumpableHeight = BASE_HEIGHT - character.height - (JUMP_STRENGTH * JUMP_STRENGTH) / (2 * GRAVITY);
            const height = Math.floor(Math.random() * (Math.min(MAX_OBSTACLE_HEIGHT, maxJumpableHeight) - MIN_OBSTACLE_HEIGHT + 1)) + MIN_OBSTACLE_HEIGHT;
            this.list.push({
                x: BASE_WIDTH,
                y: BASE_HEIGHT - height,
                width: OBSTACLE_WIDTH,
                height: height
            });
            lastObstaclePosition = BASE_WIDTH;
        }
    },
    
    update(deltaTime) {
        this.list.forEach(obstacle => {
            obstacle.x -= OBSTACLE_SPEED * (deltaTime / 16);
        });
        this.list = this.list.filter(obstacle => obstacle.x > -obstacle.width);
        
        if (this.list.length === 0 || lastObstaclePosition <= BASE_WIDTH - MIN_OBSTACLE_DISTANCE) {
            this.generate();
        }
    },
    
    draw() {
        ctx.fillStyle = 'red';
        this.list.forEach(obstacle => {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
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
    
    document.addEventListener('keydown', handleInput);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', setScaleFactor);
}

function handleInput(event) {
    if (event.code === 'Space') {
        if (gameState === 'PLAYING') {
            character.jump();
        } else if (gameState === 'GAME_OVER') {
            startGame(currentMode);
        }
        event.preventDefault();
    }
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / SCALE_FACTOR;
    const y = (event.clientY - rect.top) / SCALE_FACTOR;

    if (gameState === 'MAIN_MENU') {
        if (x > 200 && x < 350 && y > 200 && y < 250) {
            startGame('marathon');
        } else if (x > 450 && x < 600 && y > 200 && y < 250) {
            startGame('challenge');
        }
    } else if (gameState === 'GAME_OVER') {
        if (x > 300 && x < 500 && y > 300 && y < 350) {
            gameState = 'MAIN_MENU';
        }
    }
}

function update(deltaTime) {
    if (gameState !== 'PLAYING') return;

    character.update(deltaTime);
    obstacles.update(deltaTime);
    
    score += deltaTime / 1000;
    updateScoreDisplay();
    
    checkCollisions();
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

function gameOver() {
    gameState = 'GAME_OVER';
    if (score > highScores[currentMode]) {
        highScores[currentMode] = Math.floor(score);
        localStorage.setItem(`highScore${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`, highScores[currentMode]);
    }
}

function resetGame() {
    score = 0;
    obstacles.list = [];
    character.y = BASE_HEIGHT - character.height;
    character.velocityY = 0;
    isJumping = false;
    canDoubleJump = false;
    lastObstaclePosition = 0;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = Math.floor(score);
    document.getElementById('highScoreMarathon').textContent = highScores.marathon;
    document.getElementById('highScoreChallenge').textContent = highScores.challenge;
}

function drawMainMenu() {
    ctx.fillStyle = 'black';
    ctx.font = `${30 * UI_SCALE_FACTOR}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Choose Game Mode', BASE_WIDTH / 2, 100);

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
    ctx.fillStyle = 'black';
    ctx.font = `${30 * UI_SCALE_FACTOR}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 60);
    ctx.fillText(`Score: ${Math.floor(score)}`, BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20);
    ctx.fillText(`High Score: ${highScores[currentMode]}`, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
    ctx.fillText('Press Spacebar to Restart', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);

    ctx.fillStyle = 'blue';
    ctx.fillRect(300, 300, 200, 50);
    ctx.fillStyle = 'white';
    ctx.font = `${20 * UI_SCALE_FACTOR}px Arial`;
    ctx.fillText('Main Menu', BASE_WIDTH / 2, 330);
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
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