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
const timerElement = document.getElementById("Timer");

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

// Define timer durations in seconds
const DRAW_PHASE_DURATION = 75;
const TURN_PHASE_DURATION = 30;

// Declare timer instances
let drawTimer = null;
let turnTimer = null;

// Declare variable to store whether a player has taken an action this turn.
let hasMovedOrShotThisTurn = false;

//#endregion TURN TIMER VARIABLES

//#endregion VARIABLES

//#region CLASSES
//#region TIMER CLASS

class Timer {
  /**
   * Creates a new Timer instance.
   * @param {number} duration - The duration of the timer in seconds.
   * @param {Function} onTick - Callback invoked every second with the remaining time.
   * @param {Function} onEnd - Callback invoked when the timer reaches zero.
   */
  constructor(duration, onTick, onEnd) {
    this.duration = duration;
    this.timeLeft = duration;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this.intervalId = null;
  }

  /**
   * Starts the timer.
   */
  start() {
    this.timeLeft = this.duration;
    this.onTick(this.timeLeft);
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.onTick(this.timeLeft);
      if (this.timeLeft <= 0) {
        this.stop();
        this.onEnd();
      }
    }, 1000);
  }

  /**
   * Stops the timer.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resets the timer to its initial duration.
   */
  reset() {
    this.stop();
    this.timeLeft = this.duration;
    this.onTick(this.timeLeft);
  }
}

//#endregion TIMER CLASS
//#endregion CLASSES

//#region SOCKET SETUP

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
// After Render Handler
Events.on(render, "afterRender", function () {
  // Redraw the dividing line and drawings after every engine tick.
  updateAfterRender();

  // Add the ability to draw after every engine tick, provided it is the draw phase.
  if (currentGameState === GameState.PRE_GAME) {
    draw(); // Ensure that the draw function is called during the draw phase
  }
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
// rulesButton.addEventListener("click", openModal);

// Close modal when close button is clicked.
// closeButton.addEventListener("click", closeModal);

// Close modal if user clicks outside the children of the rules modal.
window.addEventListener("click", function (event) {
  if (event.target === rulesModal) {
    // closeModal();
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

    // saveClickPoint(event);
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
    endingMousePosition = { x: event.mouse.position.x, y: event.mouse.position.y };
    // releaseAndApplyForce(endingMousePosition);
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

//#endregion MOUSE EVENTS

//#region FUNCTIONS

//#region TURN AND TIMER FUNCTIONS

/**
 * Initializes and starts the draw phase timer.
 */
function initializeDrawPhase() {
  if (currentGameState === GameState.PRE_GAME) {
    // Fixed comparison
    drawTimer = new Timer(DRAW_PHASE_DURATION, updateDrawTimerDisplay, endDrawPhase);
    drawTimer.start();
  }
}

/**
 * Initializes and starts the turn timer.
 */
function startTurnTimer() {
  hasMovedOrShotThisTurn = false;
  turnTimer = new Timer(TURN_PHASE_DURATION, updateTurnTimerDisplay, endTurn);
  turnTimer.start();
}

/**
 * Updates the draw timer display.
 * @param {number} timeLeft - The remaining time in seconds.
 */
function updateDrawTimerDisplay(timeLeft) {
  if (timerElement) {
    timerElement.textContent = `${timeLeft}`;
  }
}

/**
 * Updates the turn timer display.
 * @param {number} timeLeft - The remaining time in seconds.
 */
function updateTurnTimerDisplay(timeLeft) {
  if (timerElement) {
    timerElement.textContent = `${timeLeft}`;
  }
}

/**
 * Ends the current turn and switches to the next player.
 */
function endTurn() {
  currentPlayerTurn = currentPlayerTurn === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  startTurnTimer();
}

/**
 * Finalizes the drawing phase after both players are done.
 */

//#endregion TURN AND TIMER FUNCTIONS

//#region DRAWING FUNCTIONS

//#region NO-DRAW ZONES FUNCTIONS

/**
 * Creates no-draw zones around fortresses to prevent overlapping drawings.
 */
function fortressNoDrawZone() {
  fortresses.forEach((fortress) => {
    const zone = createRectangularZone(
      fortress.position.x,
      fortress.position.y,
      fortressWidth,
      fortressHeight,
      baseHeight * 0.05
    );
    noDrawZones.push(zone);
  });
}

/**
 * Creates a rectangular no-draw zone with padding.
 * @param {number} centerX - X-coordinate of the center.
 * @param {number} centerY - Y-coordinate of the center.
 * @param {number} width - Width of the fortress.
 * @param {number} height - Height of the fortress.
 * @param {number} padding - Additional padding around the fortress.
 * @returns {Array} Array of points defining the rectangle.
 */
function createRectangularZone(centerX, centerY, width, height, padding) {
  const halfWidth = width / 2 + padding;
  const halfHeight = height / 2 + padding;

  return [
    { x: centerX - halfWidth, y: centerY - halfHeight }, // Top-Left
    { x: centerX + halfWidth, y: centerY - halfHeight }, // Top-Right
    { x: centerX + halfWidth, y: centerY + halfHeight }, // Bottom-Right
    { x: centerX - halfWidth, y: centerY + halfHeight }, // Bottom-Left
  ];
}

/**
 * Draws all no-draw zones on the canvas.
 */
function drawNoDrawZones() {
  drawCtx.strokeStyle = "red";
  drawCtx.lineWidth = 2;
  noDrawZones.forEach((zone) => {
    drawCtx.beginPath();
    drawCtx.moveTo(zone[0].x, zone[0].y);
    for (let i = 1; i < zone.length; i++) {
      drawCtx.lineTo(zone[i].x, zone[i].y);
    }
    drawCtx.closePath();
    drawCtx.stroke();

    // Draw the X inside the rectangle
    drawCtx.beginPath();
    // Diagonal from Top-Left to Bottom-Right
    drawCtx.moveTo(zone[0].x, zone[0].y);
    drawCtx.lineTo(zone[2].x, zone[2].y);
    // Diagonal from Top-Right to Bottom-Left
    drawCtx.moveTo(zone[1].x, zone[1].y);
    drawCtx.lineTo(zone[3].x, zone[3].y);
    drawCtx.stroke();
  });
}

/**
 * Clears all no-draw zones from the canvas.
 */
function removeFortressNoDrawZones() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  noDrawZones = [];
}

//#endregion NO-DRAW ZONES FUNCTIONS

//#region EXPLOSION FUNCTIONS

/**
 * Draws an explosion animation at the specified coordinates.
 * @param {CanvasRenderingContext2D} context - The drawing context.
 * @param {number} x - X-coordinate of the explosion center.
 * @param {number} y - Y-coordinate of the explosion center.
 * @param {number} frame - Current frame index.
 */
function handleExplosion(context, x, y, frame = 0) {
  if (frame < explosionFrames.length) {
    context.clearRect(x - 50, y - 50, 100, 100);
    context.drawImage(explosionFrames[frame], x - 50, y - 50, 100, 100); // Adjust size and position as needed
    setTimeout(() => handleExplosion(context, x, y, frame + 1), 45); // Advance to the next frame every 45ms
  }
}

//#endregion EXPLOSION FUNCTIONS

//#region DIVIDING LINE FUNCTIONS

/**
 * Draws the dividing line on the canvas.
 */
function drawDividingLine() {
  drawCtx.beginPath();
  drawCtx.moveTo(0, dividingLine);
  drawCtx.lineTo(drawCanvas.width, dividingLine);
  drawCtx.strokeStyle = "black";
  drawCtx.lineWidth = 2;
  drawCtx.stroke();
}

//#endregion DIVIDING LINE FUNCTIONS

//#region SHAPE DRAWING FUNCTIONS

/**
 * Redraws all existing shapes on the canvas.
 */
function redrawAllShapes() {
  allPaths.forEach((path) => {
    if (path.length > 0) {
      drawCtx.beginPath();
      drawCtx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        drawCtx.lineTo(path[i].x, path[i].y);
      }
      drawCtx.closePath();
      drawCtx.strokeStyle = "blue";
      drawCtx.lineWidth = 2;
      drawCtx.stroke();
    }
  });

  // Re-draw no-draw zones if in pre-game state
  if (currentGameState === GameState.PRE_GAME) {
    drawNoDrawZones();
  }
}

/**
 * Generates all points along a line using linear interpolation.
 * @param {number} x0 - Starting x-coordinate.
 * @param {number} y0 - Starting y-coordinate.
 * @param {number} x1 - Ending x-coordinate.
 * @param {number} y1 - Ending y-coordinate.
 * @returns {Object[]} Array of points along the line.
 */
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

/**
 * Checks if two polygons overlap.
 * @param {Object[]} polygonA - First polygon defined by an array of points.
 * @param {Object[]} polygonB - Second polygon defined by an array of points.
 * @returns {boolean} True if polygons overlap, else false.
 */
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

/**
 * Determines if two line segments intersect.
 * @param {Object} p0 - Start point of first line segment.
 * @param {Object} p1 - End point of first line segment.
 * @param {Object} p2 - Start point of second line segment.
 * @param {Object} p3 - End point of second line segment.
 * @returns {boolean} True if segments intersect, else false.
 */
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

/**
 * Checks if a point is inside a polygon using the ray-casting algorithm.
 * @param {Object} point - The point to check.
 * @param {Object[]} polygon - The polygon defined by an array of points.
 * @returns {boolean} True if the point is inside the polygon, else false.
 */
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

/**
 * Redraws all existing shapes and the dividing line on the canvas.
 */
function redrawCanvas() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawDividingLine();
  redrawAllShapes();
}

/**
 * Generates and adds Matter.js bodies from drawn shapes.
 */
function createBodiesFromShapes() {
  for (let i = 0; i < allPaths.length; i++) {
    const path = allPaths[i];

    // Create circles along the line segments of the path
    const circleRadius = 2; // Adjust the radius as needed

    for (let j = 0; j < path.length - 1; j++) {
      const startPoint = path[j];
      const endPoint = path[j + 1];

      // Use linear interpolation to get every point along the line
      const points = getLinePoints(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

      points.forEach((point) => {
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
      });
    }
  }

  allPaths = [];
}

/**
 * Handles the drawing logic during mouse move events.
 * @param {MouseEvent} event - The mouse event.
 */
function draw(event) {
  if (currentGameState !== GameState.PRE_GAME) {
    return;
  }
  if (!isDrawing) return;

  const mousePosition = { ...mouseConstraint.mouse.position };

  // Enforce drawing area per player
  if (currentPlayerDrawing === PLAYER_ONE) {
    mousePosition.y = Math.max(mousePosition.y, dividingLine + dividingLineMargin);
  } else if (currentPlayerDrawing === PLAYER_TWO) {
    mousePosition.y = Math.min(mousePosition.y, dividingLine - dividingLineMargin);
  }

  // Clamp mouse position within drawable area horizontally
  mousePosition.x = Math.max(drawingMarginX, Math.min(mousePosition.x, width - drawingMarginX));

  // Clamp mouse position within drawable area vertically
  mousePosition.y = Math.max(drawingMarginY, Math.min(mousePosition.y, height - drawingMarginY));

  // Calculate the length of the new segment
  const lastPoint = drawingPath[drawingPath.length - 1];
  const dx = mousePosition.x - lastPoint.x;
  const dy = mousePosition.y - lastPoint.y;
  const segmentLength = Math.hypot(dx, dy);

  // Check if adding this segment would exceed max ink
  if (totalInkUsed + segmentLength > maxInkPerShape) {
    // Limit the segment length to the remaining ink
    const remainingInk = maxInkPerShape - totalInkUsed;
    const ratio = remainingInk / segmentLength;
    if (ratio > 0) {
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
    drawingPath.push(mousePosition);
  }

  // Redraw the canvas
  redrawCanvas();

  // Draw the current path
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

/**
 * Handles the completion of a drawing action.
 */
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
      // Optionally alert the user about the invalid shape
      // alert("Shapes cannot overlap, or be in no draw zones. Try drawing again.");

      // Clear the drawing
      redrawCanvas();
    } else {
      // Shape is valid, add it to allPaths
      allPaths.push([...drawingPath]);

      // Increment shape count for current player
      if (currentPlayerDrawing === PLAYER_ONE) {
        shapeCountPlayer1++;
        if (shapeCountPlayer1 >= maxShapeCountPlayer1) {
          // Switch to player 2
          currentPlayerDrawing = PLAYER_TWO;
        }
      } else if (currentPlayerDrawing === PLAYER_TWO) {
        shapeCountPlayer2++;
        if (shapeCountPlayer2 >= maxShapeCountPlayer2) {
          // Both players have finished drawing
          finalizeDrawingPhase();
        }
      }

      // Clear the drawing and re-draw all shapes
      redrawCanvas();
    }
  }
}

/**
 * Starts the drawing process when the mouse is pressed.
 */
function startDrawing() {
  if (currentGameState !== GameState.PRE_GAME) {
    return;
  }
  const mousePosition = { ...mouseConstraint.mouse.position };

  // Enforce drawing area per player
  if (currentPlayerDrawing === PLAYER_ONE) {
    isDrawingBelow = true;
    mousePosition.y = Math.max(mousePosition.y, dividingLine + dividingLineMargin);
  } else if (currentPlayerDrawing === PLAYER_TWO) {
    isDrawingBelow = false;
    mousePosition.y = Math.min(mousePosition.y, dividingLine - dividingLineMargin);
  }

  // Clamp mouse position within drawable area horizontally
  mousePosition.x = Math.max(drawingMarginX, Math.min(mousePosition.x, width - drawingMarginX));

  // Clamp mouse position within drawable area vertically
  mousePosition.y = Math.max(drawingMarginY, Math.min(mousePosition.y, height - drawingMarginY));

  totalInkUsed = 0;
  isDrawing = true;
  drawingPath = [mousePosition];
}

/**
 * Redraws the dividing line and current drawings after each engine tick.
 */
function updateAfterRender() {
  // Redraw the dividing line
  drawDividingLine();

  // Redraw all shapes and no-draw zones if in pre-game state
  if (currentGameState === GameState.PRE_GAME) {
    redrawAllShapes();
  }
}

/**
 * Handles the explosion animation on a specific body.
 * @param {Matter.Body} body - The body where the explosion occurs.
 */
function handleBodyExplosion(body) {
  handleExplosion(drawCtx, body.position.x, body.position.y, 0);
}

/**
 * Finalizes the drawing phase by transitioning the game state.
 */
function finalizeDrawingPhase() {
  if (drawTimer) {
    drawTimer.stop();
    drawTimer = null;
  }
  endDrawPhase();
}

//#endregion SHAPE DRAWING FUNCTIONS

//#region END DRAW BUTTON FUNCTIONS
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

function endDrawPhase() {
  currentGameState = GameState.GAME_RUNNING;
  createBodiesFromShapes();
  removeFortressNoDrawZones();
  // setTimeout(() => coinFlip(), 500);
  startTurnTimer();
}

//#endregion END DRAW BUTTON FUNCTIONS

//#endregion DRAWING FUNCTIONS

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
