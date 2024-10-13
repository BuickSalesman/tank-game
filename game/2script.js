//#region VARIABLES

//#region GAME AND PLAYER VARIABLES

// Game state setup.
const GameState = Object.freeze({
  PRE_GAME: "PRE_GAME",
  GAME_RUNNING: "GAME_RUNNING",
  POST_GAME: "POST_GAME",
});

// Declare the starting game state to be PRE_GAME.
let currentGameState = GameState.PRE_GAME;

// Declare player ID's.
const PLAYER_ONE = 1;
const PLAYER_TWO = 2;

//#region HTML ELEMENT VARIABLES

// Declare gameContainer element.
const gameContainer = document.getElementById("gameContainer");

// Declare both canvases.
const drawCanvas = document.getElementById("drawCanvas"); // For drawing.
const physicsCanvas = document.getElementById("physicsCanvas"); // For Matter.js rendering.

// Declare the power meter.
const powerMeterFill = document.getElementById("powerMeterFill");

// Declare the move button.
const moveButton = document.getElementById("moveButton");

// Declare the shoot button.
const shootButton = document.getElementById("shootButton");

// Declare the rules button.
const rulesButton = document.getElementById("rulzButton");

// Declare the close button within the rules modal.
const closeButton = document.querySelector(".close-button");

// Declare the rules modal.
const rulesModal = document.getElementById("rulesModal");

//Declare the end drawing button.
const endDrawButton = document.getElementById("endDrawButton");

// Declare the timer display.
const drawTimerDisplay = document.getElementById("Timer");

//#endregion HTML ELEMENT VARIABLES

// Declare height, width, and aspect ratio for the canvas.
const aspectRatio = 1 / 1.4142;
const baseHeight = Math.min(window.innerHeight * 0.95);
const width = baseHeight * aspectRatio;
const height = baseHeight;

// Set up gameContainer dimensions.
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

// Declare contexts for both canvases.
const drawCtx = drawCanvas.getContext("2d");
const physicsCtx = physicsCanvas.getContext("2d");

// Set canvas sizes (both should be the same size).
drawCanvas.width = physicsCanvas.width = width;
drawCanvas.height = physicsCanvas.height = height;
//#endregion GAME AND PLAYER VARIABLES

//#region MATTER SETUP VARIABLES

// Import Matter components.
const {
  Body,
  Bodies,
  Bounds,
  Collision,
  Constraint,
  Detector,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  Vertices,
  Vector,
  World,
} = Matter;

// Declare engine.
const engine = Engine.create();

// Declare world.
const world = engine.world;

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

// Declare runner. This allows the engine to be updated for dynamic use within the borwser.
const runner = Runner.create();

// Declare a mouse input object for capturing interactions on the physics canvas.
let mouse = Mouse.create(render.canvas);

// Declare and create the ability for objects to be able to interact with the mouse input object.
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
    mask: 0xffffffff, // Allows interaction with all objects in the world.
  },
});

//#endregion MATTER SETUP VARIABLES

//#region BODY VARIABLES

//Declare walls around the canvas to keep game bodies inside the canvas.
// prettier-ignore
const walls = [
  // Top.
  Bodies.rectangle(
    width / 2,
    -500,
    width + 1000,
    1000,
    {
      isStatic: true,
    }
  ),
  // Bottom.
  Bodies.rectangle(
    width / 2,
    height + 500,
    width + 1000,
    1000,
    {
      isStatic: true,
    }
  ),
  // Left.
  Bodies.rectangle(
    -500,
    height / 2,
    1000,
    height + 1000,
    {
      isStatic: true,
    }
  ),
  // Right.
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

//#region EXPLOSIONS!!!
const explosionFrames = Array.from({ length: 25 }, (_, i) => {
  const img = new Image();
  img.src = `assets/EXPLOSION/explosion4/${i + 1}.png`; // Adjusted index for 1-based filenames
  return img;
});
//#endregion EXPLOSIONS!!!

// Declare a dividing line halfway between the top and bottom of the canvas.
const dividingLine = drawCanvas.height / 2;

// Declare variable to store the which player is currently drawing, starting with player 1.
let currentPlayerDrawing = PLAYER_ONE;

// Declare counter for number of total shapes drawn.
let shapeCount = 0;

// Declare the maximum number of shapes for each player.
let maxShapeCountPlayer1 = 5;
let maxShapeCountPlayer2 = 5;

// Initialize shape counts for each player
let shapeCountPlayer1 = 0;
let shapeCountPlayer2 = 0;

// Declare maximum amount of ink allocated per shape.
const maxInkPerShape = baseHeight * 0.6;

// Declare variable to help track how much ink a player has used on the shape currently being drawn.
let totalInkUsed = 0;

//#region DRAWING MARGIN VARIABLES

// Declare width of the drawing margin so that it is wide enough for tanks to pass through.
const drawingMarginX = tankSize + width * 0.02;

// Declare height of the drawing margin so that it is high enough for tanks to pass through.
const drawingMarginY = tankSize + height * 0.02;

// Declare height of the margin on either side of the dividing line so that it is big enough for tanks to pass through.
const dividingLineMargin = tankSize + height * 0.005;

// Declare an array to store all no drawing zones.
let noDrawZones = [];

//#endregion DRAWING MARGIN VARIABLES

// Declare variable to store if player is drawing below the dividing line.
let isDrawingBelow = true;

// Declare whether the player is currently drawing.
let isDrawing = false;

// Declare an array to store points creating during drawing.
let drawingPath = [];

// Declare and array to store completed drawing paths.
let allPaths = [];

//#endregion DRAWING VARIABLES

//#region MOVE AND SHOOT VARIABLES

// Declare a variable to store what action state the player is currently in.
let actionMode = null;

// Declare a varibale to store the currently selected unit.
let selectedUnit = null;

// Declare the maximum power level of a shot.
const maxPowerLevel = 100;

// Declare a variable to store power level of a shot.
let powerLevel = 0;

// Declare the maximum distance a tank or shell can travel based on window size.
const maxTravelDistance = height * 0.04;

// Declare a scaling factor for applied force based on the maxTravelDistance.
const forceScalingFactor = maxTravelDistance / Math.pow(100, 1.5);

// Declare starting and ending mouse positions for vector calculation.
let startingMousePosition = null;
let endingMousePosition = null;

// Declare if mouse is down.
let isMouseDown = false;

// Declare if mouse is moving.
let isMouseMoving = false;

//#region WOBBLE EFFECT VARIABLES

// Declare if an object is wobling.
let isWobbling = false;

// Declare the moment at which the wobble effect is applied.
let wobbleStartTime = 0;

// Declare the initial angle of the wobble effect.
let initialWobbleAngle = 0;

// Declare number of frames between wobble oscilation.
const wobbleFrequency = 60;

// Declare maximum rotation angle in radians from the neutral position (about 2.86 degrees).
const wobbleAmplitude = 0.1;

//#endregion WOBBLE EFFECT VARIABLES

//#endregion MOVE AND SHOOT VARIABLES

//#region TURN TIMER VARIABLES

// Declare variable to store which player's turn it is.
let currentPlayerTurn = PLAYER_ONE;

// Declare how long the drawing phase is (in seconds).
let drawTimeLeft = 120;

// Declare variable for holding the interval ID for the draw phase timer.
let drawTimerInterval = null;

// Declare how long a battle phase turn is (in seconds).
let turnTimeLeft = 30;

// Declare variable for holding the interval ID for the turn timer. It is cleared when the turn ends.
let turnTimerInterval = null;

// Declare variable to store whether a player has taken an action this turn. The turn ends after they have taken an action.
let hasMovedOrShotThisTurn = false;

//#endregion VARIABLES

// SOCKET SETUP

//#endregion SOCKET SETUP

//#region WORLD SETUP

//Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

//Run renderer.
Render.run(render);

//Run the runner, this allows the engine to be updated for dynamic use within the browser.
Runner.run(runner, engine);

//Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);

//#region BODY CREATION

// Add boundary walls to the game world.
World.add(world, walls);

// Add tank(s) to the game world.
World.add(world, tanks);

// Add reactor(s) to the game world.
World.add(world, reactors);

// Add fortress(es) to the game world.
World.add(world, fortresses);

// Add turret(s) to the game world.
World.add(world, turrets);

//#endregion BODY CREATIONS

// Add the fortres no draw zones to the drawing canvas.
fortressNoDrawZone();

// Start the game with the draw phase!
initializeDrawPhase();

//#endregion WORLD SETUP

//#region EVENT HANDLERS

//#region AFTER RENDER HANDLER
Events.on(render, "afterRender", function () {
  // Redraw the diving line after every egine tick.
  drawDividingLine();

  // Add the ability to draw after every engine tick, provided it is the draw phase.
  draw();
});

//#endregion AFTER RENDER HANDLER

//#region BEFORE UPDATE HANDLER
Events.on(engine, "beforeUpdate", () => {
  if (currentGameState === GameState.GAME_RUNNING) {
    if (isMouseDown && isMouseMoving) {
      // Ensure power meter cannot increase if the action mode is "move" and the selected unit is a turret.
      processTurretControl();
    }

    // Apply wobble effect if selected unit is a tank.
    if (isWobbling && selectedUnit) {
      applyWobbleEffect();
    }
  }
});

//#endregion BEFORE UPDATE HANDLER

//#region AFTER UPDATE HANDLER

Events.on(engine, "afterUpdate", function () {
  // Handle the resting state of the shell.
  handleShellResting();

  // Handle the resting state of tanks.
  tanks.forEach(function (tank) {
    if (isResting(tank)) {
      fixTankPosition(tank);
    }
  });
});

//#endregion AFTER UPDATE HANDLER

//#region BUTTON EVENT HANDLERS

// Change action mode to "move" if move button is clicked.
moveButton.addEventListener("click", function () {
  actionMode = "move";
});

// Change action mode to "shoot" if shoot button is clicked.
shootButton.addEventListener("click", function () {
  actionMode = "shoot";
});

// Open rules modal when rules button is clicked.
rulesButton.addEventListener("click", openModal);

// Close modal when close button is clicked.
closeButton.addEventListener("click", closeModal);

// Close modal if user clicks outside the children of the rules modal.
window.addEventListener("click", function (event) {
  if (event.target === rulesModal) {
    closeModal();
  }
});

endDrawButton.addEventListener("click", function () {
  // Exit if not in PRE_GAME state
  if (currentGameState !== GameState.PRE_GAME) {
    return;
  }

  if (isPlayerDrawComplete(currentPlayerDrawing)) {
    switchPlayer();
  }

  if (areBothPlayersDoneDrawing()) {
    finalizeDrawingPhase();
  }
});

//#endregion BUTTON EVENT HANDLERS

//#region COLLISION HANDLER
Events.on(engine, "collisionStart", function (event) {
  var pairs = event.pairs;

  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    const x = (bodyA.position.x + bodyB.position.x) / 2;
    const y = (bodyA.position.y + bodyB.position.y) / 2;

    // Check if a tank collided with a shell
    if (bodiesMatch(bodyA, bodyB, "Tank", "Shell")) {
      const tank = bodyA.label === "Tank" ? bodyA : bodyB;
      const shell = bodyA.label === "Shell" ? bodyA : bodyB;
      handleTankDestruction(tank, shell, engine, drawCtx);
    }

    // Check if a shell collided with a reactor
    if (bodiesMatch(bodyA, bodyB, "Shell", "Reactor")) {
      const reactor = bodyA.label === "Reactor" ? bodyA : bodyB;
      const shell = bodyA.label === "Shell" ? bodyA : bodyB;
      handleReactorDestruction(reactor, shell, engine, drawCtx);
    }

    // Remove the shell if it hits a shape
    if (bodiesMatch(bodyA, bodyB, "Shell", "Shape")) {
      const shell = bodyA.label === "Shell" ? bodyA : bodyB;
      World.remove(engine.world, shell);
    }
  });
});
//#endregion COLLISION HANDLER

//#endregion EVENT HANDLERS

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
  drawTimeLeft = 75; // Reset to desired draw phase duration
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

//#region BEFORE UPDATE HELPER FUNCTIONS

// Helper function to check if the selected unit is one of the turrets
function isSelectedTurret(unit) {
  return turrets.includes(unit);
}

// Helper function to handle the logic when the mouse is down and moving
function processTurretControl() {
  if (isSelectedTurret(selectedUnit) && actionMode === "move") {
    return; // Do nothing if the selected turret is in "move" action mode
  }
  increasePower(); // Otherwise, increase power
}

//#endregion BEFORE UPDATE HELPER FUNCTIONS

//#region AFTER UPDATE HELPER FUNCTIONS

// Helper function to check if a body is resting (i.e., has negligible velocity).
function isResting(body, threshold = 0.1) {
  const velocityMagnitude = Math.hypot(body.velocity.x, body.velocity.y);
  return velocityMagnitude < threshold;
}

// Helper function to stop any residual motion and fix the tank's position.
function fixTankPosition(tank) {
  Body.setVelocity(tank, { x: 0, y: 0 });
  Body.setAngularVelocity(tank, 0);

  if (!tank.fixedConstraint) {
    tank.fixedConstraint = Constraint.create({
      bodyA: tank,
      pointB: { x: tank.position.x, y: tank.position.y },
      stiffness: 1,
      length: 0,
      render: { visible: false },
    });
    World.add(engine.world, tank.fixedConstraint);
  }
}

// Helper function to handle the removal of the shell when resting.
function handleShellResting() {
  if (shell !== null && isResting(shell)) {
    World.remove(world, shell);
    shell = null;
  }
}

//#endregion AFTER UPDATE HELPER FUNCTIONS

//#region END DRAW BUTTON HELPER FUNCTIONS
function isPlayerDrawComplete(player) {
  if (player === PLAYER_ONE && shapeCountPlayer1 < maxShapeCountPlayer1) {
    shapeCountPlayer1 = maxShapeCountPlayer1;
    return true;
  } else if (player === PLAYER_TWO && shapeCountPlayer2 < maxShapeCountPlayer2) {
    shapeCountPlayer2 = maxShapeCountPlayer2;
    return true;
  }
  return false;
}

function switchPlayer() {
  currentPlayerDrawing = currentPlayerDrawing === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

function areBothPlayersDoneDrawing() {
  return shapeCountPlayer1 === maxShapeCountPlayer1 && shapeCountPlayer2 === maxShapeCountPlayer2;
}

function finalizeDrawingPhase() {
  clearInterval(drawTimerInterval);
  drawTimerInterval = null;
  endDrawPhase();
}

function endDrawPhase() {
  currentGameState = GameState.GAME_RUNNING;
  createBodiesFromShapes();
  removeFortressNoDrawZones();
  setTimeout(() => coinFlip(), 500);
  startTurnTimer();
}

//#endregion END DRAW BUTTON HELPER FUNCTIONS

//#region COLLISION HANDLER HELPER FUNCTIONS

function bodiesMatch(bodyA, bodyB, label1, label2) {
  return (bodyA.label === label1 && bodyB.label === label2) || (bodyA.label === label2 && bodyB.label === label1);
}

// Helper function to handle explosions
function handleExplosion(context, x, y, frame) {
  drawExplosion(context, x, y, frame);
}

// Helper function to reduce hit points and remove the body if destroyed
function reduceHitPoints(body, engine, removalCallback) {
  body.hitPoints -= 1;
  if (body.hitPoints <= 0) {
    World.remove(engine.world, body);
    removalCallback();
  } else {
    // Optionally, update body appearance to indicate damage
    body.render.strokeStyle = "orange"; // Change color to indicate damage
  }
}

// Helper function to handle tank destruction
function handleTankDestruction(tank, shell, engine, context) {
  handleExplosion(context, tank.position.x, tank.position.y, 0);
  World.remove(engine.world, shell);

  reduceHitPoints(tank, engine, () => {
    handleExplosion(context, tank.position.x, tank.position.y, 0);
    checkAllTanksDestroyed();
  });
}

// Helper function to handle reactor destruction
function handleReactorDestruction(reactor, shell, engine, context) {
  handleExplosion(context, reactor.position.x, reactor.position.y, 0);
  World.remove(engine.world, shell);

  reduceHitPoints(reactor, engine, () => {
    handleExplosion(context, reactor.position.x, reactor.position.y, 0);
    declareReactorWinner(reactor.playerId);
  });
}

// Declare the winner based on reactor destruction
function declareReactorWinner(losingPlayerId) {
  const winningPlayerId = losingPlayerId === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  setTimeout(() => {
    alert(`Player ${winningPlayerId} wins! Dismiss this to replay.`);
    location.reload();
  }, 1000);
}

// Function to check if all tanks of a player are destroyed
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

//#endregion COLLISION HANDLER HELPER FUNCTIONS
//#endregion FUNCTIONS
