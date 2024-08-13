// Game constants
const BASE_WIDTH = 800;
const BASE_HEIGHT = 400;
let SCALE_FACTOR = 1;
let UI_SCALE_FACTOR = 1;
const GRAVITY = 0.4;
const JUMP_STRENGTH = 10;
const OBSTACLE_SPEED = 4;
const CHARACTER_WIDTH = 30;
const CHARACTER_HEIGHT = 30;
const MIN_OBSTACLE_DISTANCE = 300;
const MAX_OBSTACLE_HEIGHT = 60;
const MIN_OBSTACLE_HEIGHT = 20;
const OBSTACLE_WIDTH = 20;

// Game variables
let canvas, ctx;
let score, highScore;
let isJumping, canDoubleJump;
let lastTime = 0;
let lastObstaclePosition = 0;
let gameState = 'START';

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
        this.y += this.velocityY * (deltaTime / 16); // Normalize for 60 FPS
        
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
            const height = Math.floor(Math.random() * (MAX_OBSTACLE_HEIGHT - MIN_OBSTACLE_HEIGHT + 1)) + MIN_OBSTACLE_HEIGHT;
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
            obstacle.x -= OBSTACLE_SPEED * (deltaTime / 16); // Normalize for 60 FPS
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
    SCALE_FACTOR = Math.min(scaleX, scaleY);
    UI_SCALE_FACTOR = Math.min(1, SCALE_FACTOR);

    canvas.width = BASE_WIDTH * SCALE_FACTOR;
    canvas.height = BASE_HEIGHT * SCALE_FACTOR;
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
}

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    setScaleFactor();
    
    highScore = localStorage.getItem('highScore') || 0;
    updateScoreDisplay();
    
    document.addEventListener('keydown', handleInput);
    window.addEventListener('resize', setScaleFactor);
}

function handleInput(event) {
    if (event.code === 'Space') {
        if (gameState === 'START' || gameState === 'GAME_OVER') {
            startGame();
        } else if (gameState === 'PLAYING') {
            character.jump();
        }
    }
}

function update(deltaTime) {
    if (gameState !== 'PLAYING') return;

    character.update(deltaTime);
    obstacles.update(deltaTime);
    
    score += deltaTime / 1000; // Points per second
    updateScoreDisplay();
    
    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    if (gameState === 'START') {
        drawStartScreen();
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
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
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
    document.getElementById('highScoreValue').textContent = Math.floor(highScore);
}

function drawStartScreen() {
    ctx.fillStyle = 'black';
    ctx.font = `${24 * UI_SCALE_FACTOR}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Press Spacebar to Start', BASE_WIDTH / 2, BASE_HEIGHT / 2);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'black';
    ctx.font = `${24 * UI_SCALE_FACTOR}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 40);
    ctx.fillText(`Score: ${Math.floor(score)}`, BASE_WIDTH / 2, BASE_HEIGHT / 2);
    ctx.fillText('Press Spacebar to Restart', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 40);
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'PLAYING';
    resetGame();
}

function initialize() {
    init();
    gameState = 'START';
    lastTime = 0;
    requestAnimationFrame(gameLoop);
}

initialize();