//#region VARIABLES

//#region SETUP VARIABLES

const {
  Bounds,
  Engine,
  MouseConstraint,
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
} = Matter;

//Declare engine and world.
const engine = Engine.create();
const world = engine.world;

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

//Declare height, width, and aspect ratio for the canvas.
const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.95;
const width = baseHeight * aspectRatio;
const height = baseHeight;

// Get both canvases
const drawCanvas = document.getElementById("drawCanvas"); // For drawing
const physicsCanvas = document.getElementById("physicsCanvas"); // For Matter.js rendering

// Declare contexts for both canvases.
const drawCtx = drawCanvas.getContext("2d");

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
    wireframes: false, // I dont really understand the wrieframes thing, but it seems important to include.
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

let tankSize = width * 0.02; //rename variable to something more clear, like "smallest dimension" Allows tank to scale with the canvas width/height.

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
const dividingLine = drawCanvas.height / 2;
let shapeCount = 0; //Counter for number of shapes drawn.
let maxShapeCount = 10; //Maximum number of shapes.
//Initial state allows drawing below dividingLine.
let isDrawingBelow = true;
let isDrawing = false;
let drawingPath = [];
let allPaths = []; // Array to store all completed paths
let lastLineTime = 0; // To track when to add a new line
const lineInterval = 10; // 100 milliseconds

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
let startingMousePosition = null;
let endingMousePosition = null;
//#endregion MOVE AND SHOOT VARIABLES
//#endregion VARIABLES

//#region MATTER AND SOCKET SETUP

//Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

//MAY NEED TO MESS WITH THIS
// //Set the canvas height and width.
// canvas.width = width;
// canvas.height = height;

//Setup gameContainer.
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

//Run renderer.
Render.run(render);

//Run the runner, this allows the engine to be updated for dynamic use within the browser.
Runner.run(runner, engine);

//Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);

//#endregion MATTER AND SOCKET SETUP

//#region EVENT HANDLERS

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {});
//#endregion AFTERRENDER HANDLER

//#region BEFOREUPDATE HANDLER
Events.on(engine, "beforeUpdate", () => {
  if (currentGameState === GameState.GAME_RUNNING && isMouseDown) {
    if (
      (selectedUnit === turret1 || selectedUnit === turret2 || selectedUnit === turret3 || selectedUnit === turret4) &&
      actionMode === "move"
    ) {
      return;
    } else {
      increasePower();
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
Events.on(engine, "collisionStart", function (event) {
  function bodiesMatch(bodyA, bodyB, label1, label2) {
    return (bodyA.label === label1 && bodyB.label === label2) || (bodyA.label === label2 && bodyB.label === label1);
  }
  var pairs = event.pairs;

  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    console.log(pair);

    // Check if a tank collided with a shell
    if (bodiesMatch(bodyA, bodyB, "Tank", "Shell")) {
      console.log("Tank hit by shell!");
      // Handle the collision between tank and shell
    }

    // Check if a shell collided with a reactor
    if (bodiesMatch(bodyA, bodyB, "Shell", "Reactor")) {
      console.log("Shell hit a reactor!");
      // Handle the collision between shell and reactor
    }

    // Add more conditions for other body types like turrets, etc.
    if (bodiesMatch(bodyA, bodyB, "Shell", "Turret")) {
      console.log("Tank hit a turret!");
      // Handle collision between tank and turret
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

//Add turret(s) to the game world.
World.add(world, turrets);

//#endregion BODY CREATIONS

//#region MOUSE EVENTS

Events.on(mouseConstraint, "mousedown", function (event) {
  if (currentGameState === GameState.TUTORIAL) {
    //teach stuff
  }
  if (currentGameState === GameState.PRE_GAME) {
    //draw stuff
    startDrawing(event);
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
    drawOnDrawCanvas(event);
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
    endDrawing(event);
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
    endDrawing(event);
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
  drawCtx.beginPath();
  drawCtx.moveTo(0, dividingLine);
  drawCtx.lineTo(drawCanvas.width, dividingLine);
  drawCtx.strokeStyle = "black";
  drawCtx.lineWidth = 2;
  drawCtx.stroke();
}

function startDrawing(event) {
  if (shapeCount >= maxShapeCount) return;

  isDrawing = true;
  drawingPath = [];
  const { mouse } = event;
  drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
  lastLineTime = Date.now(); // Initialize time for the first line
}

function drawOnDrawCanvas(event) {
  if (isDrawing) {
    const currentTime = Date.now();
    if (currentTime - lastLineTime >= lineInterval) {
      drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
      lastLineTime = currentTime; // Update the time for the next line
    }
  }
}

function endDrawing(event) {
  isDrawing = false;

  if (drawingPath.length > 1) {
    // Close the shape by connecting the last point to the first point
    drawingPath.push(drawingPath[0]);
    allPaths.push([...drawingPath]); // Add the completed path to allPaths
    drawingPath.push(drawingPath[0]);
    createMatterBodyFromDrawing(drawingPath); // Create Matter.js body from the drawn path
    drawingPath = []; // Reset the current drawing path for the next shape
  }
}

// Drawing on the drawCanvas (separate from the Matter.js canvas)
function draw() {
  if (isDrawing) {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height); // Clear the drawing canvas before drawing

    drawDividingLine();

    // Draw all completed shapes
    allPaths.forEach((path) => {
      drawCtx.beginPath();
      drawCtx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        drawCtx.lineTo(path[i].x, path[i].y);
      }
      drawCtx.strokeStyle = "blue"; // Set the stroke color for the drawing
      drawCtx.lineWidth = 2;
      drawCtx.stroke();
    });

    // If currently drawing, draw the current path
    if (isDrawing && drawingPath.length > 0) {
      drawCtx.beginPath();
      drawCtx.moveTo(drawingPath[0].x, drawingPath[0].y);
      for (let i = 1; i < drawingPath.length; i++) {
        drawCtx.lineTo(drawingPath[i].x, drawingPath[i].y);
      }
      drawCtx.strokeStyle = "blue"; // Set the stroke color for the drawing
      drawCtx.lineWidth = 2;
      drawCtx.stroke();
    }
  }
}
// Function to convert the drawn shape into a Matter.js body
function createMatterBodyFromDrawing(path) {
  // Convert the path into an array of vertices that Matter.js can understand,
  // using absolute screen coordinates.
  const vertices = path.map((point) => {
    return { x: point.x, y: point.y };
  });

  // Calculate the centroid manually from the vertices
  const centroid = calculateCentroid(vertices);

  // Adjust vertices to be relative to the centroid (Matter.js expects local coordinates)
  const relativeVertices = vertices.map((point) => ({
    x: point.x - centroid.x,
    y: point.y - centroid.y,
  }));

  // Create the body at the centroid
  const body = Bodies.fromVertices(centroid.x, centroid.y, [relativeVertices], {
    ignoreBoundaryLimit: true,
    isStatic: true,
    render: {
      fillStyle: "rgba(0, 0, 0, 0.5)",
      strokeStyle: "black",
      lineWidth: 2,
    },
    // Chamfer to smooth out the vertices and prevent sharp edges
    chamfer: {
      radius: 20, // Set this to control the amount of smoothing at vertices
    },
  });

  // Add the new body to the Matter.js world
  if (body) {
    World.add(world, body);

    // Clear the draw canvas after the body is created
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    shapeCount++;

    if (shapeCount === maxShapeCount) {
      currentGameState = GameState.GAME_RUNNING;
    }
  }
}

// Calculate the centroid of a polygon given its vertices (average x and y positions)
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

// Call the draw function on every frame
function animate() {
  drawDividingLine();
  requestAnimationFrame(animate);
  draw();
}

animate(); // Start the drawing loop

//#endregion DRAWING FUNCTIONS

//#region MOVE AND SHOOT FUNCTIONS
//To increase power meter when called.
//INCREASE POWER CALLED IN BEFOREUPDATE
function increasePower() {
  if (!actionMode) {
    return;
  } else if (powerLevel < maxPowerLevel) {
    powerLevel += 5;
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
      selectedUnit = tank;
    }
  });

  turrets.forEach((turret) => {
    if (Bounds.contains(turret.bounds, mousePosition)) {
      isMouseDown = true;
      //Save the point of click.
      startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
      //Store the selected turret.
      selectedUnit = turret;
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
      const forceMagnitude = scaledPowerLevel * forceScalingFactor * 0.1;

      if (actionMode === "move") {
        console.log(forceMagnitude);
        Body.applyForce(selectedUnit, selectedUnit.position, {
          x: -normalizedVector.x * forceMagnitude, // scale force in x direction.
          y: -normalizedVector.y * forceMagnitude, // scale force in y direction.
        });
      } else if (actionMode === "shoot") {
        console.log(forceMagnitude);
        const shellSize = 5; // Adjust as needed

        //Position the shell at the front of the tank.
        const unitSize = selectedUnit.label === "tank" ? tankSize : turretSize;
        const shellOffset = unitSize / 2 + shellSize / 2;
        const shellX = selectedUnit.position.x - normalizedVector.x * shellOffset;
        const shellY = selectedUnit.position.y - normalizedVector.y * shellOffset;

        const initialVelocity = {
          x: -normalizedVector.x * forceMagnitude * 3, //delete the quintuple multipler later this is just for fun
          y: -normalizedVector.y * forceMagnitude * 3, //delete the quintuple multipler later this is just for fun
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
//Bug where the rendered shape is offset just a bit from where it is drawn
//Bug where shapes should not be allowed to overlap
//Poly-decomp lol

//#endregion BUG LOG
