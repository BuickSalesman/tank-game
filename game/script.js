//#region VARIABLES

//#region SETUP VARIABLES

const {
  Bounds,
  Engine,
  MouseConstraint,
  Constraint,
  Mouse,
  Render,
  Runner,
  Body,
  Bodies,
  World,
  Events,
  Detector,
  Collision,
  Vertices,
  decomp,
  Vector,
} = Matter;

//Declare engine and world.
const engine = Engine.create();
const world = engine.world;

//Game state setup.
const GameState = Object.freeze({
  PRE_GAME: "PRE_GAME",
  GAME_RUNNING: "GAME_RUNNING",
  POST_GAME: "POST_GAME",
});
let currentGameState = GameState.PRE_GAME;

let actionMode = null;

//Declare player ID
const PLAYER_ONE = 1;
const PLAYER_TWO = 2;

// Declare current player drawing
let currentPlayerDrawing = PLAYER_ONE;

// Initialize shape counts for each player
let shapeCountPlayer1 = 0;
let shapeCountPlayer2 = 0;

//Declare height, width, and aspect ratio for the canvas.
const aspectRatio = 1 / 1.4142;
const baseHeight = Math.min(window.innerHeight * 0.95);
const width = baseHeight * aspectRatio;
const height = baseHeight;

//Declare both canvases
const drawCanvas = document.getElementById("drawCanvas"); // For drawing
const physicsCanvas = document.getElementById("physicsCanvas"); // For Matter.js rendering

// Declare contexts for both canvases.
const drawCtx = drawCanvas.getContext("2d");
const physicsCtx = physicsCanvas.getContext("2d");

// Set canvas sizes (both should be the same size)
drawCanvas.width = physicsCanvas.width = width;
drawCanvas.height = physicsCanvas.height = height;

// Setup gameContainer
const gameContainer = document.getElementById("gameContainer");
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

// Declare and create Matter.js renderer bound to the physics canvas.
const render = Render.create({
  element: gameContainer,
  canvas: physicsCanvas, // Use physicsCanvas for Matter.js rendering
  engine: engine,
  options: {
    width: width,
    height: height,
    background: null,
    wireframes: false, // Wireframes disabled for visual rendering
  },
});

//Declare runner, this allows the engine to be updated for dynamic use within the browser.
const runner = Runner.create();

//Declare a mouse input object.
let mouse = Mouse.create(render.canvas);

//Declare and create the ability for objects to be able to interact with the mouse input object.
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    // Stiffness controls the mouse's ability to be able to move objects around. 0 for non-interactivity.
    stiffness: 0,
    render: {
      visible: false,
    },
  },
  collisionFilter: {
    mask: 0xffffffff,
  },
});

//#endregion SETUP VARIABLES

//#region BODY VARIABLES

//Declare walls around the canvas to keep game bodies inside the canvas.
// prettier-ignore
const walls = [
  // Top
  Bodies.rectangle(
    width / 2,
    -500,
    width + 1000,
    1000,
    {
      isStatic: true,
    }
  ),
  // Bottom
  Bodies.rectangle(
    width / 2,
    height + 500,
    width + 1000,
    1000,
    {
      isStatic: true,
    }
  ),
  // Left
  Bodies.rectangle(
    -500,
    height / 2,
    1000,
    height + 1000,
    {
      isStatic: true,
    }
  ),
  // Right
  Bodies.rectangle(
    width + 500,
    height / 2,
    1000,
    height + 1000,
    {
      isStatic: true,
    }
  ),
];

//#region TANK VARIABLES

let tankSize = width * 0.02; // Allows tank to scale with the canvas width/height.

let tankHitPoints = 2;

//Player 1's tanks.
let tank1 = TankModule.createTank(width * 0.3525, height * 0.9, tankSize, PLAYER_ONE);
let tank2 = TankModule.createTank(width * 0.4275, height * 0.9, tankSize, PLAYER_ONE);

//Player 2's tanks.
let tank3 = TankModule.createTank(width * 0.6475, height * 0.1, tankSize, PLAYER_TWO);
let tank4 = TankModule.createTank(width * 0.5725, height * 0.1, tankSize, PLAYER_TWO);

//Store all tanks in an array for easy access.
let tanks = [tank1, tank2, tank3, tank4];

//#endregion TANK VARIABLES

//#region REACTOR VARIABLES
let reactorSize = tankSize;

let reactorHitPoints = 1;

//Player 1's reactors.
const reactor1 = ReactorModule.createReactor(width * 0.3525, height * 0.95, reactorSize, PLAYER_ONE);
const reactor2 = ReactorModule.createReactor(width * 0.4275, height * 0.95, reactorSize, PLAYER_ONE);

//Player 2's reactors.
const reactor3 = ReactorModule.createReactor(width * 0.6475, height * 0.05, reactorSize, PLAYER_TWO);
const reactor4 = ReactorModule.createReactor(width * 0.5725, height * 0.05, reactorSize, PLAYER_TWO);

//Store all reactors in an array for easy access.
let reactors = [reactor1, reactor2, reactor3, reactor4];

//#endregion REACTOR VARIABLES

//#region FORTRESS VARIABLES
let fortressWidth = width * 0.1475;
let fortressHeight = height * 0.0575;

//Player 1's fortress.
let fortress1 = FortressModule.createFortress(width * 0.39, height * 0.95, fortressWidth, fortressHeight, PLAYER_ONE);

//Player 2's fortress.
let fortress2 = FortressModule.createFortress(width * 0.61, height * 0.05, fortressWidth, fortressHeight, PLAYER_TWO);

//Store all fortresses in an array for easy access.
let fortresses = [fortress1, fortress2];

//#endregion FORTRESS VARIABLES

//#region TURRET VARIABLES
let turretSize = reactorSize * 1.125;

let turretHitPoints = 2;

//Player 1's turrets
const turret1 = TurretModule.createTurret(width * 0.31625, height * 0.92125, turretSize, PLAYER_ONE);
const turret2 = TurretModule.createTurret(width * 0.46375, height * 0.92125, turretSize, PLAYER_ONE);

//Player 2's turrets.
const turret3 = TurretModule.createTurret(width * 0.53625, height * 0.07875, turretSize, PLAYER_TWO);
const turret4 = TurretModule.createTurret(width * 0.68375, height * 0.07875, turretSize, PLAYER_TWO);

//Store all turrets in an array for easy access.
let turrets = [turret1, turret2, turret3, turret4];

//#endregion TURRET VARIABLES

//#region SHELL VARIABLES
let shell = null;
let shells = [];

//#endregion SHELL VARIABLES

//#endregion BODY VARIABLES

//#region DRAWING VARIABLES

//#region EXPLOSIONS!!!!
const explosionFrames = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `assets/EXPLOSION/explosion4/${i}.png`; // Change this path to your actual explosion images
  explosionFrames.push(img);
}
//#endregion EXPLOSIONS!!!!

const dividingLine = drawCanvas.height / 2;
let shapeCount = 0; //Counter for number of shapes drawn.
let maxShapeCount = 10; //Maximum number of shapes.

//#region DRAWING MARGIN VARIABLES
const drawingMarginX = tankSize + width * 0.02;
const drawingMarginY = tankSize + height * 0.02;
const dividingLineMargin = tankSize + height * 0.005;
//#endregion DRAWING MARGIN VARIABLES

let totalInkUsed = 0;
const maxInkPerShape = baseHeight * 0.6;

let isDrawingBelow = true;
let isDrawing = false;
let drawingPath = [];
let allPaths = []; // Array to store all completed paths
let lastLineTime = 0; // To track when to add a new line
const lineInterval = 10; // 100 milliseconds

let noDrawZones = [];

//#endregion DRAWING VARIABLES

//#region MOVE AND SHOOT VARIABLES
const powerButton = document.getElementById("powerButton");
const powerMeterFill = document.getElementById("powerMeterFill");

let selectedUnit = null; //To store selected tank or turret.
const maxTravelDistance = height * 0.04;
const forceScalingFactor = maxTravelDistance / Math.pow(100, 1.5);
let powerLevel = 0;
const maxPowerLevel = 100;
let isMouseDown = false;
let isMouseMoving = false;
let startingMousePosition = null;
let endingMousePosition = null;

let lastPlayerToIncreasePower = null;

//#region WOBBLE

let isWobbling = false;
let wobbleStartTime = 0;
let initialWobbleAngle = 0;
const wobbleFrequency = 60; // Controls the speed of the wobble
const wobbleAmplitude = 0.1; // Maximum rotation angle in radians (about 2.86 degrees)

//#endregion WOBBLE
//#endregion MOVE AND SHOOT VARIABLES

//#region TURN TIMER VARIABLES
let currentPlayerTurn = PLAYER_ONE;
let turnTimeLeft = 45;
let turnTimerInterval = null;
let hasMovedOrShotThisTurn = false;

let drawTimeLeft = 120; // Duration of the draw phase in seconds (e.g., 120 seconds)
let drawTimerInterval = null;
const drawTimerDisplay = document.getElementById("Timer");

//#endregion TURN TIMER VARIABLES

//#region RULZ VARIABLES

//#endregion RULZ VARIABLES
const rulesButton = document.getElementById("rulzButton");
const rulesModal = document.getElementById("rulzModal");
const closeButton = document.querySelector(".close-button");
//#endregion VARIABLES

//#region MATTER AND SOCKET SETUP

//Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

//Setup gameContainer.
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

//Run renderer.
Render.run(render);

//Run the runner, this allows the engine to be updated for dynamic use within the browser.
Runner.run(runner, engine);

//Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);

startDrawTimer();

//#endregion MATTER AND SOCKET SETUP

//#region EVENT HANDLERS

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {
  drawDividingLine();
  draw();
});
//#endregion AFTERRENDER HANDLER

//#region BEFOREUPDATE HANDLER
Events.on(engine, "beforeUpdate", () => {
  if (currentGameState === GameState.GAME_RUNNING) {
    if (isMouseDown && isMouseMoving) {
      if (
        (selectedUnit === turret1 ||
          selectedUnit === turret2 ||
          selectedUnit === turret3 ||
          selectedUnit === turret4) &&
        actionMode === "move"
      ) {
        return;
      } else {
        increasePower();
      }
    }

    // Apply wobble effect regardless of mouse movement
    if (isWobbling && selectedUnit) {
      applyWobbleEffect();
    }
  }
});

//#endregion BEFOREUPDATE HANDLER

//#region AFTERUPDATE HANDLER
Events.on(engine, "afterUpdate", function () {
  if (shell !== null) {
    const velocityMagnitude = Math.sqrt(shell.velocity.x * shell.velocity.x + shell.velocity.y * shell.velocity.y);

    // Set a small threshold value for determining when the shell is "resting."
    if (velocityMagnitude < 0.1) {
      // Adjust this value as necessary
      World.remove(world, shell);
      shell = null;
    }
  }

  tanks.forEach(function (tank) {
    const speed = Math.hypot(tank.velocity.x, tank.velocity.y);
    if (speed < 0.1) {
      // Stop any residual motion
      Body.setVelocity(tank, { x: 0, y: 0 });
      Body.setAngularVelocity(tank, 0);

      if (!tank.fixedConstraint) {
        // Create a constraint to fix the tank's position
        tank.fixedConstraint = Constraint.create({
          bodyA: tank,
          pointB: { x: tank.position.x, y: tank.position.y },
          stiffness: 1,
          length: 0,
          render: {
            visible: false,
          },
        });

        World.add(engine.world, tank.fixedConstraint);
      }
    }
  });
});
//#endregion AFTERUPDATE HANDLER

//#region BUTTON EVENT HANDLERS
document.getElementById("moveButton").addEventListener("click", function () {
  actionMode = "move";
});

document.getElementById("shootButton").addEventListener("click", function () {
  actionMode = "shoot";
});

rulesButton.addEventListener("click", openModal);
closeButton.addEventListener("click", closeModal);

window.addEventListener("click", function (event) {
  if (event.target === rulesModal) {
    closeModal();
  }
});

document.getElementById("endDrawButton").addEventListener("click", function () {
  if (currentGameState === GameState.PRE_GAME) {
    clearInterval(drawTimerInterval);
    drawTimerInterval = null;
    endDrawPhase();
  }
});

//#endregion BUTTON EVENT HANDLERS

//#region COLLISION HANDLERS
Events.on(engine, "collisionStart", function (event) {
  function bodiesMatch(bodyA, bodyB, label1, label2) {
    return (bodyA.label === label1 && bodyB.label === label2) || (bodyA.label === label2 && bodyB.label === label1);
  }

  var pairs = event.pairs;

  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;

    const x = (bodyA.position.x + bodyB.position.x) / 2;
    const y = (bodyA.position.y + bodyB.position.y) / 2;

    // Check if a tank collided with a shell
    if (bodiesMatch(bodyA, bodyB, "Tank", "Shell")) {
      drawExplosion(drawCtx, x, y, 0);

      // Identify tank and shell
      const tank = bodyA.label === "Tank" ? bodyA : bodyB;
      const shell = bodyA.label === "Shell" ? bodyA : bodyB;

      // Reduce hit points
      tank.hitPoints -= 1;

      // Remove shell from the world
      World.remove(engine.world, shell);

      // Check if tank is destroyed
      if (tank.hitPoints <= 0) {
        World.remove(engine.world, tank);
        drawExplosion(drawCtx, tank.position.x, tank.position.y, 0);

        // Call the function to check if all tanks of a player are destroyed
        checkAllTanksDestroyed();
      } else {
        // Optionally, update tank appearance to indicate damage
        tank.render.strokeStyle = "orange"; // Change color to indicate damage
      }
    }

    // Check if a shell collided with a reactor
    if (bodiesMatch(bodyA, bodyB, "Shell", "Reactor")) {
      drawExplosion(drawCtx, x, y, 0);

      // Identify reactor and shell
      const reactor = bodyA.label === "Reactor" ? bodyA : bodyB;
      const shell = bodyA.label === "Shell" ? bodyA : bodyB;

      // Reduce hit points
      reactor.hitPoints -= 1;

      // Remove shell from the world
      World.remove(engine.world, shell);

      // Check if reactor is destroyed
      if (reactor.hitPoints <= 0) {
        World.remove(engine.world, reactor);
        drawExplosion(drawCtx, reactor.position.x, reactor.position.y, 0);

        // Determine which player lost their reactor
        const losingPlayerId = reactor.playerId;
        const winningPlayerId = losingPlayerId === 1 ? 2 : 1;

        setTimeout(() => {
          alert(`Player ${winningPlayerId} wins! Dismiss this to replay.`);
          location.reload();
        }, 1000);
      }
    }

    if (bodiesMatch(bodyA, bodyB, "Shell", "Shape")) {
      const shell = bodyA.label === "Shell" ? bodyA : bodyB;
      World.remove(engine.world, shell);
    }

    if (bodiesMatch(bodyA, bodyB, "Tank", "Shape")) {
      console.log("Tank hit shape!");
    }
  });
});

//#endregion COLLISION HANDLERS

//#endregion EVENT HANDLERS

//#region BODY CREATION

//Add boundary walls to the game world.
World.add(world, walls);

//Add tank(s) to the game world.
World.add(world, tanks);

//Add reactor(s) to the game world.
World.add(world, reactors);

//Add fortress(es) to the game world.
World.add(world, fortresses);
fortressNoDrawZone();

//Add turret(s) to the game world.
World.add(world, turrets);

//#endregion BODY CREATIONS

//#region MOUSE EVENTS

Events.on(mouseConstraint, "mousedown", function (event) {
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
    startDrawing(event);
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    //shoot stuff
    isMouseMoving = false;

    saveClickPoint(event);
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

Events.on(mouseConstraint, "mousemove", function (event) {
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
    draw(event);
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    isMouseMoving = true;
    //shoot stuff
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

Events.on(mouseConstraint, "mouseup", function (event) {
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
    endDrawing(event);
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    //shoot stuff
    const endingMousePosition = { x: event.mouse.position.x, y: event.mouse.position.y };
    releaseAndApplyForce(endingMousePosition);
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

//#endregion MOUSE EVENTS

//#region FUNCTIONS

//#region TURN AND TIMER FUNCTIONS
// Function to start the draw timer
function startDrawTimer() {
  drawTimeLeft = 20; // Reset to desired draw phase duration
  updateDrawTimerDisplay();

  drawTimerInterval = setInterval(() => {
    drawTimeLeft--;
    updateDrawTimerDisplay();

    if (drawTimeLeft <= 0) {
      clearInterval(drawTimerInterval);
      endDrawPhase();
    }
  }, 1000); // Update every second
}

function updateDrawTimerDisplay() {
  if (drawTimerDisplay) {
    drawTimerDisplay.textContent = `${drawTimeLeft}`;
  }
}

function endDrawPhase() {
  clearInterval(drawTimerInterval);
  drawTimerInterval = null;
  currentGameState = GameState.GAME_RUNNING;
  createBodiesFromShapes();
  removeFortressNoDrawZones();
  setTimeout(() => {
    coinFlip();
  }, 500);
  startTurnTimer();
}

// Initialize the draw timer  game starts
function initializeDrawPhase() {
  if ((currentGameState = GameState.PRE_GAME)) {
    startDrawTimer();
  }
}

function startTurnTimer() {
  hasMovedOrShotThisTurn = false;
  turnTimeLeft = 46; // Reset turn time
  if (turnTimerInterval) {
    clearInterval(turnTimerInterval);
  }
  turnTimerInterval = setInterval(() => {
    turnTimeLeft--;
    updateTurnTimerDisplay(); // Update UI
    if (turnTimeLeft <= 0) {
      clearInterval(turnTimerInterval);
      endTurn();
    }
  }, 1000); // Update every second
}

function endTurn() {
  if (turnTimerInterval) {
    clearInterval(turnTimerInterval);
    turnTimerInterval = null;
  }
  currentPlayerTurn = currentPlayerTurn === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  startTurnTimer();
}

function updateTurnTimerDisplay() {
  const timerElement = document.getElementById("Timer");
  timerElement.textContent = `${turnTimeLeft}`;
}

//#endregion TURN AND TIMER FUNCTIONS

//#region DRAWING FUNCTIONS

//#region NODRAWZONE FUNCTIONS
function fortressNoDrawZone() {
  fortresses.forEach((fortress) => {
    const x = fortress.position.x;
    const y = fortress.position.y;
    const width = fortressWidth;
    const height = fortressHeight;

    const fortressPadding = baseHeight * 0.05;

    const halfFortressWidth = width / 2 + fortressPadding;
    const halfFortressHeight = height / 2 + fortressPadding;

    const rectangle = [
      { x: x - halfFortressWidth, y: y - halfFortressHeight },
      { x: x + halfFortressWidth, y: y - halfFortressHeight },
      { x: x + halfFortressWidth, y: y + halfFortressHeight },
      { x: x - halfFortressWidth, y: y + halfFortressHeight },
    ];

    noDrawZones.push(rectangle);
  });
}

function drawNoDrawZones() {
  drawCtx.strokeStyle = "red";
  drawCtx.lineWidth = 2;
  noDrawZones.forEach((rectangle) => {
    // Draw the rectangle
    drawCtx.beginPath();
    drawCtx.moveTo(rectangle[0].x, rectangle[0].y);
    for (let i = 1; i < rectangle.length; i++) {
      drawCtx.lineTo(rectangle[i].x, rectangle[i].y);
    }
    drawCtx.closePath();
    drawCtx.stroke();

    // Draw the X inside the rectangle
    drawCtx.beginPath();
    // Line from top-left to bottom-right
    drawCtx.moveTo(rectangle[0].x, rectangle[0].y);
    drawCtx.lineTo(rectangle[2].x, rectangle[2].y);
    // Line from top-right to bottom-left
    drawCtx.moveTo(rectangle[1].x, rectangle[1].y);
    drawCtx.lineTo(rectangle[3].x, rectangle[3].y);
    drawCtx.stroke();
  });
}

function removeFortressNoDrawZones() {
  noDrawZones = [];
}
//#endregion NODRAWZONE FUNCTIONS

function drawExplosion(drawCtx, x, y, frame) {
  if (frame < explosionFrames.length) {
    drawCtx.clearRect(x - 50, y - 50, 100, 100);
    drawCtx.drawImage(explosionFrames[frame], x - 50, y - 50, 100, 100); // Adjust size and position as needed
    setTimeout(() => drawExplosion(drawCtx, x, y, frame + 1), 45); // Advance to the next frame every 45ms
  }
}

//Draw dividing line on canvas.
function drawDividingLine() {
  drawCtx.beginPath();
  drawCtx.moveTo(0, dividingLine);
  drawCtx.lineTo(drawCanvas.width, dividingLine);
  drawCtx.strokeStyle = "black";
  drawCtx.lineWidth = 2;
  drawCtx.stroke();
}

function startDrawing() {
  if (currentGameState !== GameState.PRE_GAME) {
    return;
  }
  const mousePosition = mouseConstraint.mouse.position;

  // Enforce drawing area per player
  if (currentPlayerDrawing === PLAYER_ONE) {
    isDrawingBelow = true;
    if (mousePosition.y < dividingLine + dividingLineMargin) {
      mousePosition.y = dividingLine + dividingLineMargin;
    }
  } else if (currentPlayerDrawing === PLAYER_TWO) {
    isDrawingBelow = false;
    if (mousePosition.y > dividingLine - dividingLineMargin) {
      mousePosition.y = dividingLine - dividingLineMargin;
    }
  }

  // Clamp mouse position within drawable area horizontally
  mousePosition.x = Math.max(drawingMarginX, Math.min(mousePosition.x, width - drawingMarginX));

  // Clamp mouse position within drawable area vertically
  mousePosition.y = Math.max(drawingMarginY, Math.min(mousePosition.y, height - drawingMarginY));

  totalInkUsed = 0;
  isDrawing = true;
  drawingPath = [];
  drawingPath.push({ x: mousePosition.x, y: mousePosition.y });
}

function draw() {
  const mousePosition = mouseConstraint.mouse.position;

  if (!isDrawing) return;

  // Enforce drawing area per player
  if (currentPlayerDrawing === PLAYER_ONE) {
    if (mousePosition.y < dividingLine + dividingLineMargin) {
      mousePosition.y = dividingLine + dividingLineMargin;
    }
  } else if (currentPlayerDrawing === PLAYER_TWO) {
    if (mousePosition.y > dividingLine - dividingLineMargin) {
      mousePosition.y = dividingLine - dividingLineMargin;
    }
  }

  // Clamp mouse position within drawable area horizontally
  mousePosition.x = Math.max(drawingMarginX, Math.min(mousePosition.x, width - drawingMarginX));

  // Clamp mouse position within drawable area vertically
  mousePosition.y = Math.max(drawingMarginY, Math.min(mousePosition.y, height - drawingMarginY));

  // Calculate the length of the new segment
  const lastPoint = drawingPath[drawingPath.length - 1];
  const dx = mousePosition.x - lastPoint.x;
  const dy = mousePosition.y - lastPoint.y;
  const segmentLength = Math.sqrt(dx * dx + dy * dy);

  // Check if adding this segment would exceed max ink
  if (totalInkUsed + segmentLength > maxInkPerShape) {
    // Limit the segment length to the remaining ink
    const remainingInk = maxInkPerShape - totalInkUsed;
    const ratio = remainingInk / segmentLength;
    if (ratio > 0) {
      // Add the last possible point within the ink limit
      const limitedX = lastPoint.x + dx * ratio;
      const limitedY = lastPoint.y + dy * ratio;
      drawingPath.push({ x: limitedX, y: limitedY });
      totalInkUsed = maxInkPerShape;
    }
    // Stop drawing
    isDrawing = false;
    endDrawing();
    return;
  } else {
    // Update totalInkUsed and continue drawing
    totalInkUsed += segmentLength;
    drawingPath.push({ x: mousePosition.x, y: mousePosition.y });
  }

  // Clear the canvas and redraw
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawDividingLine();

  // Re-draw existing shapes
  redrawAllShapes();

  // Draw the current path
  if (drawingPath.length > 0) {
    drawCtx.beginPath();
    drawCtx.moveTo(drawingPath[0].x, drawingPath[0].y);
    for (let i = 1; i < drawingPath.length; i++) {
      drawCtx.lineTo(drawingPath[i].x, drawingPath[i].y);
    }
    // Optionally change color based on ink usage
    const inkUsageRatio = totalInkUsed / maxInkPerShape;
    if (inkUsageRatio > 0.66) {
      drawCtx.strokeStyle = "red";
    } else if (inkUsageRatio > 0.33) {
      drawCtx.strokeStyle = "orange";
    } else {
      drawCtx.strokeStyle = "blue";
    }
    drawCtx.lineWidth = 2;
    drawCtx.stroke();
  }
}

function endDrawing() {
  // End drawing
  isDrawing = false;

  if (drawingPath.length > 1) {
    const firstPoint = drawingPath[0];
    const lastPoint = drawingPath[drawingPath.length - 1];
    const distance = Math.hypot(lastPoint.x - firstPoint.x, lastPoint.y - firstPoint.y);
    const snapThreshold = 1;

    if (distance <= snapThreshold) {
      drawingPath[drawingPath.length - 1] = { x: firstPoint.x, y: firstPoint.y };
    } else {
      drawingPath.push({ x: firstPoint.x, y: firstPoint.y });
    }

    // Before adding the shape, check for overlaps with existing shapes
    let overlaps = false;

    for (let i = 0; i < allPaths.length; i++) {
      if (polygonsOverlap(drawingPath, allPaths[i])) {
        overlaps = true;
        break;
      }
    }

    // Check overlap with no-draw zones
    if (!overlaps) {
      for (let i = 0; i < noDrawZones.length; i++) {
        if (polygonsOverlap(drawingPath, noDrawZones[i])) {
          overlaps = true;
          break;
        }
      }
    }

    if (overlaps) {
      // alert("Shapes cannot overlap, or be in no draw zones. Try drawing again.");
      // Do not increment shapeCount
      // Clear the drawing
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      drawDividingLine(); // Re-draw the dividing line
      // Re-draw existing shapes
      redrawAllShapes();
    } else {
      // Shape is valid, add it to allPaths
      allPaths.push(drawingPath);

      // Increment shape count for current player
      if (currentPlayerDrawing === PLAYER_ONE) {
        shapeCountPlayer1++;
        if (shapeCountPlayer1 >= 5) {
          // Switch to player 2
          currentPlayerDrawing = PLAYER_TWO;
        }
      } else if (currentPlayerDrawing === PLAYER_TWO) {
        shapeCountPlayer2++;
        if (shapeCountPlayer2 >= 5) {
          // Both players have finished drawing
          currentGameState = GameState.GAME_RUNNING;
          // After max shapes, create Matter.js bodies from shapes
          createBodiesFromShapes();
          removeFortressNoDrawZones();
          setTimeout(() => {
            coinFlip();
          }, 500);
          clearInterval(drawTimerInterval);
          drawTimerInterval = null;
          startTurnTimer();
        }
      }

      // Clear the drawing and re-draw all shapes
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      drawDividingLine(); // Re-draw the dividing line
      redrawAllShapes();
    }
  }
}

function redrawAllShapes() {
  for (let i = 0; i < allPaths.length; i++) {
    const path = allPaths[i];
    if (path.length > 0) {
      drawCtx.beginPath();
      drawCtx.moveTo(path[0].x, path[0].y);
      for (let j = 1; j < path.length; j++) {
        drawCtx.lineTo(path[j].x, path[j].y);
      }
      drawCtx.closePath();
      drawCtx.strokeStyle = "blue";
      drawCtx.lineWidth = 2;
      drawCtx.stroke();
    }
  }

  drawNoDrawZones();
}

function createBodiesFromShapes() {
  for (let i = 0; i < allPaths.length; i++) {
    const path = allPaths[i];

    // Create circles along the line segments of the path
    const circleRadius = 2; // Adjust the radius as needed

    for (let j = 0; j < path.length - 1; j++) {
      const startPoint = path[j];
      const endPoint = path[j + 1];

      // Use Bresenham's line algorithm or similar to get every pixel along the line
      const points = getLinePoints(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

      for (const point of points) {
        const circle = Bodies.circle(point.x, point.y, circleRadius, {
          isStatic: true,
          label: "Shape",
          render: { fillStyle: "black" },
          collisionFilter: {
            group: 0,
            category: CATEGORY_SHAPE,
            mask: CATEGORY_SHELL | CATEGORY_TANK,
          },
          friction: 0.005,
          restitution: 0,
        });
        World.add(engine.world, circle);
      }
    }
  }

  allPaths = [];
}

function getLinePoints(x0, y0, x1, y1) {
  const points = [];

  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);

  let dx = x1 - x0;
  let dy = y1 - y0;

  let steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) {
    points.push({ x: x0, y: y0 });
    return points;
  }

  let xStep = dx / steps;
  let yStep = dy / steps;

  let x = x0;
  let y = y0;

  for (let i = 0; i <= steps; i++) {
    points.push({ x: Math.round(x), y: Math.round(y) });
    x += xStep;
    y += yStep;
  }

  return points;
}

function polygonsOverlap(polygonA, polygonB) {
  // Check if any edges of polygonA intersect with any edges of polygonB
  for (let i = 0; i < polygonA.length; i++) {
    const a1 = polygonA[i];
    const a2 = polygonA[(i + 1) % polygonA.length];

    for (let j = 0; j < polygonB.length; j++) {
      const b1 = polygonB[j];
      const b2 = polygonB[(j + 1) % polygonB.length];

      if (doLineSegmentsIntersect(a1, a2, b1, b2)) {
        return true; // Polygons overlap
      }
    }
  }

  // Additionally, check if one polygon is completely inside another
  if (isPointInPolygon(polygonA[0], polygonB) || isPointInPolygon(polygonB[0], polygonA)) {
    return true;
  }

  return false; // Polygons do not overlap
}

function doLineSegmentsIntersect(p0, p1, p2, p3) {
  const s1X = p1.x - p0.x;
  const s1Y = p1.y - p0.y;
  const s2X = p3.x - p2.x;
  const s2Y = p3.y - p2.y;

  const denominator = -s2X * s1Y + s1X * s2Y;
  if (denominator === 0) return false; // Lines are parallel

  const s = (-s1Y * (p0.x - p2.x) + s1X * (p0.y - p2.y)) / denominator;
  const t = (s2X * (p0.y - p2.y) - s2Y * (p0.x - p2.x)) / denominator;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return true; // Collision detected
  }

  return false; // No collision
}

function isPointInPolygon(point, polygon) {
  let collision = false;

  let next = 0;
  for (let current = 0; current < polygon.length; current++) {
    next = (current + 1) % polygon.length;

    const vc = polygon[current];
    const vn = polygon[next];

    if (
      vc.y > point.y !== vn.y > point.y &&
      point.x < ((vn.x - vc.x) * (point.y - vc.y)) / (vn.y - vc.y + 0.00001) + vc.x
    ) {
      collision = !collision;
    }
  }
  return collision;
}

//#endregion DRAWING FUNCTIONS

//#region MOVE AND SHOOT FUNCTIONS

//INCREASE POWER CALLED IN BEFOREUPDATE
function startWobble() {
  if (!isWobbling && selectedUnit) {
    isWobbling = true;
    wobbleStartTime = Date.now();
    initialWobbleAngle = selectedUnit.angle;
  }
}

function applyWobbleEffect() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - wobbleStartTime;

  const wobbleAngle = wobbleAmplitude * Math.cos(elapsedTime / wobbleFrequency);
  Body.setAngle(selectedUnit, initialWobbleAngle + wobbleAngle);
}

//To increase power meter when called.
function increasePower() {
  if (!actionMode) {
    return;
  } else if (powerLevel < maxPowerLevel) {
    powerLevel += 4;
    powerLevel = Math.min(powerLevel, 100); //Ensure power meter does not exceed 100.
    powerMeterFill.style.height = `${powerLevel}%`;

    if (powerLevel >= maxPowerLevel) {
      const endingMousePosition = { x: mouseConstraint.mouse.position.x, y: mouseConstraint.mouse.position.y };
      releaseAndApplyForce(endingMousePosition);
    }
  }
}

//To reset power meter when called.
function resetPower() {
  powerLevel = 0;
  powerMeterFill.style.height = "0%";
  isMouseDown = false;
}

//To save the x,y coords of mouse click within a tank.
function saveClickPoint(event) {
  if (hasMovedOrShotThisTurn) return;
  let mousePosition = event.mouse.position;
  tanks.forEach((tank) => {
    if (Bounds.contains(tank.bounds, mousePosition) && tank.playerId === currentPlayerTurn) {
      isMouseDown = true;
      //Save the point of click.
      startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
      //Store the selected tank.
      selectedUnit = tank;

      startWobble();
    }
  });

  turrets.forEach((turret) => {
    if (Bounds.contains(turret.bounds, mousePosition) && turret.playerId === currentPlayerTurn) {
      isMouseDown = true;
      //Save the point of click.
      startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
      //Store the selected turret.
      selectedUnit = turret;
    }
  });
}

//To apply normalized force and direction to the tank.
function releaseAndApplyForce(endingMousePosition) {
  if (isMouseDown) {
    isMouseDown = false;

    if (isWobbling && selectedUnit) {
      isWobbling = false;
      Body.setAngle(selectedUnit, initialWobbleAngle);
    }

    //Calculate the vector from the starting to the ending position.
    let vector = {
      x: endingMousePosition.x - startingMousePosition.x,
      y: endingMousePosition.y - startingMousePosition.y,
    };

    //Do fancy math so that the vector does not affect to power of force applied to tank.
    const vectorLength = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    //Avoid division by 0.
    if (vectorLength === 0) {
      resetPower();
      //possibly end player turn here
      return;
    }

    let normalizedVector = { x: vector.x / vectorLength, y: vector.y / vectorLength };
    let actionTaken = false;

    //Apply force based on the vector, if powerLevel is greater than 0.
    if (powerLevel > 0) {
      //Non-linear scaling for a cleaner representation of power.
      const scaledPowerLevel = Math.pow(powerLevel, 1.5);
      const forceMagnitude = scaledPowerLevel * forceScalingFactor * 0.1;

      // Apply punishment or reward based on powerLevel
      let adjustmentPercentage = 0;

      if (powerLevel > 95) {
        adjustmentPercentage = -5 * (powerLevel - 95);
      } else if (powerLevel >= 85 && powerLevel <= 95) {
        adjustmentPercentage = 5 * (powerLevel - 85);
      }

      // Apply adjustment to forceMagnitude
      const adjustedForceMagnitude = forceMagnitude * (1 + adjustmentPercentage / 100);

      if (actionMode === "move") {
        console.log(adjustedForceMagnitude);
        if (selectedUnit.fixedConstraint) {
          World.remove(engine.world, selectedUnit.fixedConstraint);
          selectedUnit.fixedConstraint = null;
        }
        Body.applyForce(selectedUnit, selectedUnit.position, {
          x: -normalizedVector.x * adjustedForceMagnitude, // scale force in x direction.
          y: -normalizedVector.y * adjustedForceMagnitude, // scale force in y direction.
        });
        actionTaken = true;
      } else if (actionMode === "shoot") {
        console.log(adjustedForceMagnitude);
        const shellSize = 5; // Adjust as needed

        //Position the shell at the front of the tank.
        const unitSize = selectedUnit.label === "tank" ? tankSize : turretSize;
        const shellOffset = unitSize / 2 + shellSize / 2;
        const shellX = selectedUnit.position.x - normalizedVector.x * shellOffset;
        const shellY = selectedUnit.position.y - normalizedVector.y * shellOffset;

        const initialVelocity = {
          x: -normalizedVector.x * adjustedForceMagnitude * 3, // Adjust multiplier as needed
          y: -normalizedVector.y * adjustedForceMagnitude * 3, // Adjust multiplier as needed
        };

        let playerId;
        if (selectedUnit === tank1 || selectedUnit === tank2 || selectedUnit === turret1 || selectedUnit === turret2) {
          playerId = "PLAYER_ONE";
        } else if (
          selectedUnit === tank3 ||
          selectedUnit === tank4 ||
          selectedUnit === turret3 ||
          selectedUnit === turret4
        ) {
          playerId = "PLAYER_TWO";
        }

        //Create the shell with initial velocity.
        shell = ShellModule.createShell(shellX, shellY, shellSize, initialVelocity, playerId);

        //Add shell to the world.
        World.add(world, shell);
        actionTaken = true;
      }
    }

    //Ensure that power meter and other values are reset after mouseup.
    resetPower();
    if (actionTaken && !hasMovedOrShotThisTurn) {
      hasMovedOrShotThisTurn = true;
      endTurn();
    }
  }
}
//#endregion MOVE AND SHOOT FUNCTIONS

//#region COIN FLIP FUNCTIONS
function coinFlip() {
  // Randomly decide which player goes first (50% chance for each)
  const result = Math.random() < 0.5 ? PLAYER_ONE : PLAYER_TWO;

  // Set the current player's turn based on the coin flip result
  currentPlayerTurn = result;

  // Display the result in the console or on the UI
  alert(`Player ${currentPlayerTurn} wins the coin flip and goes first!`);
}
//#endregion COIN FLIP FUNCTIONS

//#region WIN OR LOSE FUNCTIONS
function checkAllTanksDestroyed() {
  const player1TanksDestroyed = tank1.hitPoints <= 0 && tank2.hitPoints <= 0;
  const player2TanksDestroyed = tank3.hitPoints <= 0 && tank4.hitPoints <= 0;

  if (player1TanksDestroyed) {
    setTimeout(() => {
      alert("Player 2 wins! Dismiss this to replay.");
      location.reload(); // Refresh the page to restart the game
    }, 1000);
  } else if (player2TanksDestroyed) {
    setTimeout(() => {
      alert("Player 1 wins! Dismiss this to replay.");
      location.reload(); // Refresh the page to restart the game
    }, 1000);
  }
}
//#endregion WIN OR LOSE FUNCTIONS

//#region RULZ FUNCTIONS
function openModal() {
  rulesModal.style.display = "block";
}

// Function to Close Modal
function closeModal() {
  rulesModal.style.display = "none";
}
//#endregion RULZ FUNCTIONS

//#endregion FUNCTIONS

//#region BUG LOG
//Sometimes when shapes are snapped shut, it throws the shapes cannot overlap error.
//Tanks should not be able to shoot themselves
//If the power meter is maxed but there is no vector, tank becomes stuck in place and is unmovable (this happened one time, have not been able to duplicate.)
//#endregion BUG LOG
