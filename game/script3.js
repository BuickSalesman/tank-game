//#region MATTER SETUP
const { Bounds, Engine, MouseConstraint, Mouse, Render, Runner, Body, Bodies, World, Events } = Matter;

//#region VARIABLES

//Game state setup.
const GameState = Object.freeze({
  TUTORIAL: "TUTORIAL",
  PRE_GAME: "PRE_GAME",
  GAME_RUNNING: "GAME_RUNNING",
  POST_GAME: "POST_GAME",
});
let currentGameState = GameState.GAME_RUNNING;

let actionMode = null;

//Declare engine and world.
const engine = Engine.create();
const world = engine.world;

//Declare height, width, and aspect ratio for the canvas.
const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.95;
const width = baseHeight * aspectRatio;
const height = baseHeight;

//Declare canvas and context.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//Declare gameContainer
const gameContainer = document.getElementById("gameContainer");

//Declare and create Matter.js renderer bound to the canvas.
const render = Render.create({
  element: gameContainer,
  canvas: canvas,
  engine: engine,
  options: {
    width: width,
    height: height,
    background: null,
    wireframes: false,
    // I dont really understand the wrieframes thing, but it seems important to include.
  },
});

//Declare runner, this allows the engine to be updated for dynamic use within the browser.
const runner = Runner.create();

//Declare a mouse input object.
let mouse = Mouse.create(render.canvas);

//Declare and create the ability for abojects to be able to interact with the mouse input object.
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    // Stiffness controls the mouse's ability to be able to move objects around. 0 for non-interactivity.
    stiffness: 0.0,
    render: {
      visible: false,
    },
  },
});

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
    {isStatic: true}
  ),
  // Bottom
  Bodies.rectangle(
    width / 2,
    height + 500,
    width + 1000,
    1000,
    {isStatic: true}
  ),
  // Left
  Bodies.rectangle(
    -500,
    height / 2,
    1000,
    height + 1000,
    {isStatic: true}
  ),
  // Right
  Bodies.rectangle(
    width + 500,
    height / 2,
    1000,
    height + 1000,
    {isStatic: true}
  ),
];

//#region TANK VARIABLES
let tankSize = width * 0.025; //rename variable to something more clear, like "smallest dimension" Allows tank to scale with the canvas width/height.

//Change the points where the tanks are edded into the game world to percentages of canvas size, change to add 2 above and 2 below the dividing line.
let tank1 = TankModule.createTank(width / 2, height - 200, tankSize);

//#endregion TANK VARIABLES
//#region REACTOR VARIABLES
let reactorSize = tankSize * 1.25;

const reactor = ReactorModule.createReactor(400, 200, reactorSize);
//#endregion REACTOR VARIABLES
//#region SHELL VARIABLES
//#endregion SHELL VARIABLES
//#endregion BODY VARIABLES

//#region DRAWING VARIABLES
const dividingLine = canvas.height / 2;
//#endregion DRAWING VARIABLES

//#region MOVE AND SHOOT VARIABLES
const powerButton = document.getElementById("powerButton");
const powerMeterFill = document.getElementById("powerMeterFill");

let powerLevel = 0;
const maxPowerLevel = 100;
let isMouseDown = false;
let startingMousePosition = null;
let endingMousePosition = null;
//#endregion MOVE AND SHOOT VARIABLES

//#endregion VARIABLES

//Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

//Set the canvas height and width.
canvas.width = width;
canvas.height = height;

//Setup gameContainer.
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

//Run renderer.
Render.run(render);

//Run the runner, this allows the engine to be updated for dynamic use within the browser.
Runner.run(runner, engine);

//Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);
//#endregion MATTER SETUP

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {
  drawDividingLine();
});
//#endregion AFTERRENDER HANDLER

//#region BEFOREUPDATE HANDLER
Events.on(engine, "beforeUpdate", () => {
  if (currentGameState === GameState.GAME_RUNNING && isMouseDown) {
    increasePower();
  }
});
//#endregion BEFOREUPDATE HANDLER

//#region BUTTON EVENT HANDLERS
document.getElementById("moveButton").addEventListener("click", function () {
  actionMode = "move";
  console.log(actionMode);
});

document.getElementById("shootButton").addEventListener("click", function () {
  actionMode = "shoot";
  console.log(actionMode);
});
//#endregion BUTTON EVENT HANDLERS

//#region BODY CREATION

//Add boundary walls to the game world.
World.add(world, walls);

//Add tank(s) to the game world.
World.add(world, tank1);

World.add(world, reactor);

//#region REACTOR BODIES
//reactor stuff
//#endregion REACTOR BODIES

//#endregion BODY CREATIONS

//#region MOUSE EVENTS

Events.on(mouseConstraint, "mousedown", function (event) {
  if (currentGameState === GameState.TUTORIAL) {
    //teach stuff
  }
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    //shoot stuff
    saveClickPoint(event);
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

Events.on(mouseConstraint, "mousemove", function (event) {
  if (currentGameState === GameState.TUTORIAL) {
    //teach stuff
  }
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    //shoot stuff
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

Events.on(mouseConstraint, "mouseup", function (event) {
  if (currentGameState === GameState.TUTORIAL) {
    //teach stuff
  }
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    //shoot stuff
    releaseAndApplyForce(event);
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

Events.on(mouseConstraint, "mouseleave", function (event) {
  if (currentGameState === GameState.TUTORIAL) {
    //teach stuff
  }
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
  }
  if (currentGameState === GameState.GAME_RUNNING) {
    //shoot stuff
  }
  if (currentGameState === GameState.POST_GAME) {
    //restart stuff
  }
});

//#endregion MOUSE EVENTS

//#region FUNCTIONS

//#region DRAWING FUNCTIONS

//Draw dividing line on canvas.
function drawDividingLine() {
  ctx.beginPath();
  ctx.moveTo(0, dividingLine);
  ctx.lineTo(canvas.width, dividingLine);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
}

//#endregion DRAWING FUNCTIONS

//#region MOVE AND SHOOT FUNCTIONS

//To increase power meter when called.
//INCREASE POWER CALLED IN BEFOREUPDATE
function increasePower() {
  if (powerLevel < maxPowerLevel) {
    powerLevel += 1;
    powerLevel = Math.min(powerLevel, 100); // Ensure power meter does not exceed 100.
    powerMeterFill.style.height = `${powerLevel}%`;
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
  let mousePosition = event.mouse.position;
  if (Bounds.contains(tank1.bounds, mousePosition)) {
    isMouseDown = true;
    // Save the point of click.
    startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
  }
}

//To apply normalized force and direction to the tank.
function releaseAndApplyForce(event) {
  if (isMouseDown) {
    isMouseDown = false;
    endingMousePosition = { x: event.mouse.position.x, y: event.mouse.position.y }; // Store the end position.

    // Calculate the vector from the starting to the ending position.
    let vector = {
      x: endingMousePosition.x - startingMousePosition.x,
      y: endingMousePosition.y - startingMousePosition.y,
    };

    // Do fancy math so that the vector does not affect to power of force applied to tank.
    const vectorLength = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    let normalizedVector = { x: vector.x / vectorLength, y: vector.y / vectorLength };

    // Apply force based on the vector, if powerLevel is greater than 0.
    if (powerLevel > 0) {
      //Non-linear scaling for a cleaner repesentation of power.
      const scaledPowerLevel = Math.pow(powerLevel, 1.5);

      const forceMagnitude = scaledPowerLevel * 0.0158;
      Body.applyForce(tank1, tank1.position, {
        x: -normalizedVector.x * forceMagnitude, // scale force in x direction.
        y: -normalizedVector.y * forceMagnitude, // scale force in y direction.
      });
    }

    // Ensure that power meter and other values are reset after mouseup.
    resetPower();
  }
}

//#endregion MOVE AND SHOOT FUNCTIONS

//#endregion FUNCTIONS
