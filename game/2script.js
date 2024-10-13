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

//#endregion HTML ELEMENT VARIABLES

// Set up gameContainer dimensions.
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

// Declare height, width, and aspect ratio for the canvas.
const aspectRatio = 1 / 1.4142;
const baseHeight = Math.min(window.innerHeight * 0.95);
const width = baseHeight * aspectRatio;
const height = baseHeight;

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

// Declare current player drawing

//#region EXPLOSIONS!!!
const explosionFrames = Array.from({ length: 25 }, (_, i) => {
  const img = new Image();
  img.src = `assets/EXPLOSION/explosion4/${i + 1}.png`; // Adjusted index for 1-based filenames
  return img;
});
//#endregion EXPLOSIONS!!!

// Declare a dividing line halfway between the top and bottom of the canvas.
const dividingLine = drawCanvas.height / 2;

// Declare which player will be the first to draw their shapes.
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
const drawingMarginX = tankSize + width * 0.02;
const drawingMarginY = tankSize + height * 0.02;
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

//#endregion MOVE AND SHOOT VARIABLES

//#endregion VARIABLES
