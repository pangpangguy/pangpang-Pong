// Canvas
const { body } = document;

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');
const welcomeScreen = document.createElement('div');
// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -5;
  speedX = speedY;
  computerSpeed = 5;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 1;
let isGameOver = true;
let isNewGame = true;

//Level
let challenging = false;

function changeComputerSpeed() {
  if (challenging) computerSpeed = 8;
  else {
    computerSpeed = 4;
  }
}
// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Player Paddle (Bottom)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer Paddle (Top)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([10]);  //4 pixels per dash
  context.moveTo(0, 350); //y value
  context.lineTo(500, 350); //x value
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill(); //filled color

  // Score
  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}


// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -5;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -8) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 8) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  if (playerMoved) {  //computer will only moved if the player has moved
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else {
      paddleTopX -= computerSpeed;
    }
  }
}

function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden = true;
  // // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');
  // // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;
  const playAgain = document.createElement('h2');
  playAgain.textContent = 'Play again : ';
  gameOverEl.append(title, playAgain);
  //Levels
  const normalBtn = document.createElement('button');
  const hardBtn = document.createElement('button');
  normalBtn.addEventListener('click', function () {
    startGame()
    challenging = false;
  });
  hardBtn.addEventListener('click', function () {
    startGame()
    challenging = true;
  });
  normalBtn.classList.add('level-btn');
  hardBtn.classList.add('level-btn');
  normalBtn.textContent = 'Normal';
  hardBtn.textContent = 'Challenging';
  gameOverEl.append(normalBtn);
  gameOverEl.append(hardBtn);


  body.appendChild(gameOverEl);

}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;

    // Set Winner
    const winner = playerScore === winningScore ? 'Player 1' : 'Computer';
    showGameOverEl(winner);
  }
}

// Called Every Frame
function animate() {
  renderCanvas();
  ballMove(); //change the speed of ball
  ballBoundaries(); //check if ball reached boundaries
  computerAI();
  gameOver();//Check at every frame if target score is reached
  if (!isGameOver) {  //Stops rendering when game is over
    window.requestAnimationFrame(animate); //keep calling and updating itself(better than setInterval)
  }
}

// Start Game, Reset Everything
function startGame() {
  if (isGameOver && !isNewGame) { //only round when there s game over screen AND new game is pressed
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  changeComputerSpeed();
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();  //put ball back to center, resets speed
  createCanvas();
  animate();
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true; //for AI to react when payer first moved

    //e.clientX = x value of cursor in the canvas
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = widmth - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

function initialisation() {
  const welcomeScreen = document.createElement('div');
  createCanvas();
  canvas.hidden = true;

  const normalBtn = document.createElement('button');
  const hardBtn = document.createElement('button');

  const welcometitle = document.createElement('h1');
  welcometitle.textContent = 'Pong AI';
  const subtitleOne = document.createElement('h3');
  subtitleOne.textContent = 'Best of 5';
  const subtitleTwo = document.createElement('h3');
  subtitleTwo.textContent = 'Choose your Level:';

  normalBtn.addEventListener('click', function () {
    body.removeChild(welcomeScreen);
    challenging = false;
    canvas.hidden = false;
    startGame();
  });
  hardBtn.addEventListener('click', function () {
    startGame()
    body.removeChild(welcomeScreen);
    challenging = true;
    canvas.hidden = false;
  });
  normalBtn.classList.add('level-btn');
  hardBtn.classList.add('level-btn');
  normalBtn.textContent = 'Normal';
  hardBtn.textContent = 'Challenging';
  welcomeScreen.append(welcometitle, subtitleOne, subtitleTwo, normalBtn, hardBtn);
  welcomeScreen.classList.add('game-over-container');
  body.appendChild(welcomeScreen);


}
// On Load
initialisation()
