//#region MATTER SETUP

const { Bounds, Engine, MouseConstraint, Mouse, Render, Runner, Body, Bodies, World, Events, Detector, Vertices } =
  Matter;

//Use poly-decomp library to assist with accurately representing convex polygons.
console.log(window.decomp);
//#region VARIABLES

//Game state setup.
const GameState = Object.freeze({
  TUTORIAL: "TUTORIAL",
  PRE_GAME: "PRE_GAME",
  GAME_RUNNING: "GAME_RUNNING",
  POST_GAME: "POST_GAME",
});
let currentGameState = GameState.PRE_GAME;

let actionMode = null;

//Declare player ID
const PLAYER_ONE = 1;
const PLAYER_TWO = 2;

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

//Player 1's tanks.
let tank1 = TankModule.createTank(width * 0.4, height * 0.9, tankSize, PLAYER_ONE);
let tank2 = TankModule.createTank(width * 0.6, height * 0.9, tankSize, PLAYER_ONE);

//Player 2's tanks.
let tank3 = TankModule.createTank(width * 0.4, height * 0.1, tankSize, PLAYER_TWO);
let tank4 = TankModule.createTank(width * 0.6, height * 0.1, tankSize, PLAYER_TWO);

//Store all tanks in an array for easy access.
let tanks = [tank1, tank2, tank3, tank4];
let selectedTank = null;

//#endregion TANK VARIABLES

//#region REACTOR VARIABLES
let reactorSize = tankSize * 1.25;

//Player 1's reactors.
const reactor1 = ReactorModule.createReactor(width * 0.4, height * 0.95, reactorSize, PLAYER_ONE);
const reactor2 = ReactorModule.createReactor(width * 0.6, height * 0.95, reactorSize, PLAYER_ONE);

//Player 2's reactors.
const reactor3 = ReactorModule.createReactor(width * 0.4, height * 0.05, reactorSize, PLAYER_TWO);
const reactor4 = ReactorModule.createReactor(width * 0.6, height * 0.05, reactorSize, PLAYER_TWO);

//Store all reactors in an array for easy access.
let reactors = [reactor1, reactor2, reactor3, reactor4];

//#endregion REACTOR VARIABLES

//#region SHELL VARIABLES
let shell = null;
//#endregion SHELL VARIABLES

//#endregion BODY VARIABLES

//#region DRAWING VARIABLES
const dividingLine = canvas.height / 2;

//Counter for number of shapes drawn.
let shapeCount = 0;

//Initial state allows drawing below dividingLine.
let isDrawingBelow = true;

let isDrawing = false;

let drawingPath = [];
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

//#region EVENT HANDLERS

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {
  drawDividingLine();

  if (drawingPath.length > 0) {
    ctx.beginPath();
    ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
    for (let i = 1; i < drawingPath.length; i++) {
      ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
    }
    ctx.strokeStyle = "blue"; // Set the stroke color for the drawing
    ctx.lineWidth = 2;
    ctx.stroke();
  }
});
//#endregion AFTERRENDER HANDLER

//#region BEFOREUPDATE HANDLER
Events.on(engine, "beforeUpdate", () => {
  if (currentGameState === GameState.GAME_RUNNING && isMouseDown) {
    increasePower();
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
});
//#endregion AFTERUPDATE HANDLER

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

//#region COLLISION HANDLERS
//#endregion COLLISION HANDLERS

//#endregion EVENT HANDLERS

//#region BODY CREATION

//Add boundary walls to the game world.
World.add(world, walls);

//Add tank(s) to the game world.
World.add(world, tanks);

//Add reactor(s) to the game world.
World.add(world, reactors);

//#endregion BODY CREATIONS

//#region MOUSE EVENTS

//######################################
//######################################
//######################################
//######################################

//NEED TO REFACTOR THE DRAWING IN THE MOUSEEVENTS, BUT ITS WORKING.

//######################################
//######################################
//######################################
//######################################
Events.on(mouseConstraint, "mousedown", function (event) {
  if (currentGameState === GameState.TUTORIAL) {
    //teach stuff
  }
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff

    //Prevent drawing if max shapes is reached.
    if (shapeCount >= 10) return;

    isDrawing = true;
    drawingPath = [];
    const { mouse } = event;
    drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
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
    if (isDrawing) {
      drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
    }
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

    //End drawing.
    isDrawing = false;

    if (drawingPath.length > 1) {
      drawingPath.push(drawingPath[0]);
    }

    //Create solid body out of drawing.
    createMatterBodyFromDrawing();
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
    isDrawing = false;
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

function draw(event) {
  if (!isDrawing) return;
}

//NEED TO REFACTOR EVERYTHING BELOW THIS POINT!!!!

function createMatterBodyFromDrawing() {
  // Convert the drawingPath into an array of vertices that Matter.js can understand
  const vertices = drawingPath.map((point) => {
    return { x: point.x, y: point.y };
  });

  const centroid = calculateCentroid(vertices);

  // Create the body from the vertices
  const body = Bodies.fromVertices(centroid.x, centroid.y, [vertices], {
    isStatic: true,
    render: {
      fillStyle: "transparent",
      strokeStyle: "black",
      lineWidth: 2,
    },
  });

  // Add the new body to the Matter.js world
  if (body) {
    World.add(world, body);
  }

  shapeCount++;

  if (shapeCount === 10) {
    currentGameState = GameState.GAME_RUNNING;
  }
}

// Calculate the centroid of a polygon given its vertices
function calculateCentroid(vertices) {
  let xSum = 0,
    ySum = 0;
  const numVertices = vertices.length;

  // Sum the x and y coordinates
  vertices.forEach((vertex) => {
    xSum += vertex.x;
    ySum += vertex.y;
  });

  // Calculate the average x and y positions to find the centroid
  return {
    x: xSum / numVertices,
    y: ySum / numVertices,
  };
}

//#endregion DRAWING FUNCTIONS

//#region MOVE AND SHOOT FUNCTIONS

//To increase power meter when called.
//INCREASE POWER CALLED IN BEFOREUPDATE
function increasePower() {
  if (!actionMode) {
    return;
  } else if (powerLevel < maxPowerLevel) {
    powerLevel += 8;
    powerLevel = Math.min(powerLevel, 100); //Ensure power meter does not exceed 100.
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
  tanks.forEach((tank) => {
    if (Bounds.contains(tank.bounds, mousePosition)) {
      isMouseDown = true;
      //Save the point of click.
      startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
      //Store the selected tank.
      selectedTank = tank;
    }
  });
}

//To apply normalized force and direction to the tank.
function releaseAndApplyForce(event) {
  if (isMouseDown) {
    isMouseDown = false;
    endingMousePosition = { x: event.mouse.position.x, y: event.mouse.position.y }; //Store the end position.

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

    //Apply force based on the vector, if powerLevel is greater than 0.
    if (powerLevel > 0) {
      //Non-linear scaling for a cleaner repesentation of power.
      const scaledPowerLevel = Math.pow(powerLevel, 1.5);
      const forceMagnitude = scaledPowerLevel * 0.0158;

      if (actionMode === "move") {
        Body.applyForce(selectedTank, selectedTank.position, {
          x: -normalizedVector.x * forceMagnitude, // scale force in x direction.
          y: -normalizedVector.y * forceMagnitude, // scale force in y direction.
        });
      } else if (actionMode === "shoot") {
        const shellSize = 5; // Adjust as needed

        //Position the shell at the front of the tank.
        const shellOffset = tankSize / 2 + shellSize / 2;
        const shellX = selectedTank.position.x - normalizedVector.x * shellOffset;
        const shellY = selectedTank.position.y - normalizedVector.y * shellOffset;

        const initialVelocity = {
          x: -normalizedVector.x * forceMagnitude * 5, //delete the quintuple multipler later this is just for fun
          y: -normalizedVector.y * forceMagnitude * 5, //delete the quintuple multipler later this is just for fun
        };

        let playerId;
        if (selectedTank === tank1 || selectedTank === tank2) {
          playerId = "PLAYER_ONE";
        } else if (selectedTank === tank3 || selectedTank === tank4) {
          playerId = "PLAYER_TWO";
        }

        //Create the shell with initial velocity.
        shell = ShellModule.createShell(shellX, shellY, shellSize, initialVelocity, playerId);

        //Add shell to the world.
        World.add(world, shell);
        console.log(shell.playerId);
      }
    }

    //Ensure that power meter and other values are reset after mouseup.
    resetPower();
  }
}

//#endregion MOVE AND SHOOT FUNCTIONS

//#endregion FUNCTIONS

//#region BUG LOG
//Bug where if you don't remove your mouse from the tank when shooting, the shell does not disappear
//Bug where the blue drawing line does not disappear after the last shape is drawn
//Bug where if you draw convex or sharp shapes, the rendered bodies do are blobular instead
//Bug where the rendered shape is offset just a bit from where it is drawn
//Bug where shapes should not be allowed to overlap
//Bug where tanks are propelled further relative to smallness of window/canvas

//#endregion BUG LOG
