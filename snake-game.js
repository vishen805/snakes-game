// game stat
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameStartTime = 0;
let gameTime = 0;
let gameInterval;
let timerInterval;

// game setting
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const GAME_SPEED = 150; // 毫秒

// init game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // setting key eveny
    document.addEventListener('keydown', handleKeyPress);
    
    // init snake
    resetGame();
}

// reset game
function resetGame() {
    snake = [
        { x: 10, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameTime = 0;
    generateFood();
    updateUI();
}

// start game
function startGame() {
    gameState = 'playing';
    gameStartTime = Date.now();
    
    // show the gmae
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('gameOverMenu').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameInfo').style.display = 'block';
    
    // start game loop
    gameInterval = setInterval(gameLoop, GAME_SPEED);
    timerInterval = setInterval(updateTimer, 1000);
    
    // reset draw
    draw();
}

// pause game
function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        document.getElementById('pauseMenu').style.display = 'block';
    }
}

// resume game
function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pauseMenu').style.display = 'none';
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// restart game
function restartGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    document.getElementById('pauseMenu').style.display = 'none';
    resetGame();
    startGame();
}

// back to menu
function backToMenu() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameState = 'menu';
    
    // hide all game element
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('gameInfo').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('gameOverMenu').style.display = 'none';
    document.getElementById('startMenu').style.display = 'block';
    
    resetGame();
}

// game over
function gameOver() {
    gameState = 'gameOver';
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    
    // final score
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTime').textContent = formatTime(gameTime);
    document.getElementById('finalLength').textContent = snake.length;
    
    // game over scene
    document.getElementById('gameOverMenu').style.display = 'block';
}

// main game loop
function gameLoop() {
    if (gameState !== 'playing') return;
    
    // chnage direction
    direction = nextDirection;
    
    // move snake
    moveSnake();
    
    // checking hit
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // checking eat food
    if (checkFoodCollision()) {
        eatFood();
    }
    
    // re draw
    draw();
}

// move snake
function moveSnake() {
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    snake.unshift(head);
    
    // remove tail if it didnt eat food
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

// check hitting
function checkCollision() {
    const head = snake[0];
    
    // check hitting wall
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        return true;
    }
    
    // check hitting itself
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// check hit food
function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// eat food
function eatFood() {
    score += 10;
    generateFood();
    updateUI();
}

// generate food
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
    } while (isSnakePosition(food.x, food.y));
}

// check snake position to generate food
function isSnakePosition(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// draw game
function draw() {
    // clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // diiferent color for head
            ctx.fillStyle = '#8BC34A';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });
    
    // drwa food
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
}

// keyborad input
function handleKeyPress(event) {
    if (gameState === 'playing') {
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                event.preventDefault();
                pauseGame();
                break;
        }
    } else if (gameState === 'paused' && event.key === ' ') {
        event.preventDefault();
        resumeGame();
    }
}

// timer
function updateTimer() {
    if (gameState === 'playing') {
        gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
        updateUI();
    }
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = formatTime(gameTime);
    document.getElementById('length').textContent = snake.length;
}

// format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// load the game
window.addEventListener('load', initGame);