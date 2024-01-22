const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const lifeElement = document.getElementById('life'); // Novo elemento para vidas

const snakeSize = 10;
let snakeSpeed = 100;
const canvasSize = { width: canvas.width, height: canvas.height };
let snake = [{ x: 250, y: 200 }];
let food = { x: 50, y: 50 };
let bonusFood = null;
let direction = { x: snakeSize, y: 0 };
let score = 0;
let level = 1;
let lives = 3; // Novo sistema de vidas
let obstacles = [];
let eatSound = new Audio('eat.mp3');



function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    // Verifica se a cabeça da cobrinha está na mesma posição da comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = 'Score: ' + score;
        eatSound.play(); // Toca o som ao comer a comida
        generateFood();
        addObstacle();
        if (score % 50 === 0) {
            level += 1;
            levelElement.textContent = 'Level: ' + level;
            if (snakeSpeed > 40) snakeSpeed -= 5;
        }
    } else if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
        // Verifica se a cabeça da cobrinha está na mesma posição da comida bônus
        score += 20; // Aumenta mais pontos por comida bônus
        scoreElement.textContent = 'Score: ' + score;
        eatSound.play(); // Toca o som ao comer a comida bônus
        bonusFood = null; // Remove a comida bônus após ser comida
    } else {
        snake.pop(); // Remove o último segmento da cobrinha se não comer nada
    }
}
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, snakeSize, snakeSize);
}

function drawBonusFood() {
    if (bonusFood) {
        ctx.fillStyle = 'pink';
        ctx.fillRect(bonusFood.x, bonusFood.y, snakeSize, snakeSize);
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * (canvasSize.width / snakeSize)) * snakeSize;
    food.y = Math.floor(Math.random() * (canvasSize.height / snakeSize)) * snakeSize;
}

function generateBonusFood() {
    if (!bonusFood && Math.random() < 0.05) { // 5% de chance de gerar comida bônus
        bonusFood = {
            x: Math.floor(Math.random() * (canvasSize.width / snakeSize)) * snakeSize,
            y: Math.floor(Math.random() * (canvasSize.height / snakeSize)) * snakeSize
        };
    }
}

function checkCollision() {
    // Modificado para gerenciar vidas
    const hitWall = snake[0].x < 0 || snake[0].x >= canvasSize.width ||
                    snake[0].y < 0 || snake[0].y >= canvasSize.height;
    const selfCollision = snake.slice(1).some(segment => segment.x === snake[0].x && segment.y === snake[0].y);
    const obstacleCollision = obstacles.some(obstacle => obstacle.x === snake[0].x && obstacle.y === snake[0].y);

    if (hitWall || selfCollision || obstacleCollision) {
        if (lives > 1) {
            lives--;
            lifeElement.textContent = 'Lives: ' + lives;
            resetSnake();
        } else {
            return true;
        }
    }
    return false;
}

function resetSnake() {
    snake = [{ x: 250, y: 200 }];
    direction = { x: snakeSize, y: 0 };
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(obstacle.x, obstacle.y, snakeSize, snakeSize);
    });
}

function addObstacle() {
    let newObstacle;
    do {
        newObstacle = {
            x: Math.floor(Math.random() * (canvasSize.width / snakeSize)) * snakeSize,
            y: Math.floor(Math.random() * (canvasSize.height / snakeSize)) * snakeSize
        };
    } while (
        (snake.some(segment => segment.x === newObstacle.x && segment.y === newObstacle.y)) ||
        (newObstacle.x === food.x && newObstacle.y === food.y)
    );

    obstacles.push(newObstacle);
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const goingUp = direction.y === -snakeSize;
    const goingDown = direction.y === snakeSize;
    const goingRight = direction.x === snakeSize;
    const goingLeft = direction.x === -snakeSize;

    switch(keyPressed) {
        case 37: if (!goingRight) direction = { x: -snakeSize, y: 0 }; break; // Left arrow
        case 38: if (!goingDown) direction = { x: 0, y: -snakeSize }; break; // Up arrow
        case 39: if (!goingLeft) direction = { x: snakeSize, y: 0 }; break; // Right arrow
        case 40: if (!goingUp) direction = { x: 0, y: snakeSize }; break; // Down arrow
    }
}

function gameLoop() {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
    if (checkCollision()) {
        alert('Game Over! Your score: ' + score);
        document.location.reload();
    } else {
        setTimeout(() => {
            ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
            drawFood();
            drawBonusFood();
            moveSnake();
            drawSnake();
            drawObstacles();
            generateBonusFood();
            gameLoop();
        }, snakeSpeed - (level * 5));
    }
}

document.addEventListener('keydown', changeDirection);
generateFood();
gameLoop();