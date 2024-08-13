// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.5;
const JUMP_STRENGTH = 12;
const OBSTACLE_SPEED = 3;
const CHARACTER_WIDTH = 40;
const CHARACTER_HEIGHT = 40;
const MIN_OBSTACLE_DISTANCE = 200;
const MAX_OBSTACLE_HEIGHT = 80;
const MIN_OBSTACLE_HEIGHT = 20;
const OBSTACLE_WIDTH = 30;

// Game variables
let canvas, ctx;
let score, highScore;
let isJumping, canDoubleJump;
// let gameLoop;
let lastTime = 0;
let lastObstaclePosition = 0;
let gameState = 'START'; // Can be 'START', 'PLAYING', or 'GAME_OVER'

// Character object
const character = {
    x: 50,
    y: CANVAS_HEIGHT - CHARACTER_HEIGHT,
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
    
    update() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        
        if (this.y > CANVAS_HEIGHT - this.height) {
            this.y = CANVAS_HEIGHT - this.height;
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
        const minDistance = lastObstacle ? lastObstacle.x + MIN_OBSTACLE_DISTANCE : CANVAS_WIDTH;
        
        if (minDistance <= CANVAS_WIDTH) {
            const height = Math.floor(Math.random() * (MAX_OBSTACLE_HEIGHT - MIN_OBSTACLE_HEIGHT + 1)) + MIN_OBSTACLE_HEIGHT;
            this.list.push({
                x: CANVAS_WIDTH,
                y: CANVAS_HEIGHT - height,
                width: OBSTACLE_WIDTH,
                height: height
            });
            lastObstaclePosition = CANVAS_WIDTH;
        }
    },
    
    update() {
        this.list.forEach(obstacle => {
            obstacle.x -= OBSTACLE_SPEED;
        });
        this.list = this.list.filter(obstacle => obstacle.x > -obstacle.width);
        
        if (this.list.length === 0 || lastObstaclePosition <= CANVAS_WIDTH - MIN_OBSTACLE_DISTANCE) {
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

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    highScore = localStorage.getItem('highScore') || 0;
    updateScoreDisplay();
    
    document.addEventListener('keydown', handleInput);
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

    character.update();
    obstacles.update();
    
    score += deltaTime / 1000; // Points per second
    updateScoreDisplay();
    
    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
    character.y = CANVAS_HEIGHT - character.height;
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
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Spacebar to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.fillText(`Score: ${Math.floor(score)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText('Press Spacebar to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
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
    requestAnimationFrame(gameLoop);
}

initialize();