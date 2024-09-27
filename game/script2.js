//#region MATTER SETUP
const { Bounds, Engine, MouseConstraint, Mouse, Render, Runner, Bodies, World, Events } = Matter;
// Create engine and world.
const engine = Engine.create();
const world = engine.world;

const GameState = Object.freeze({
  PRE_GAME: "PRE_GAME",
  GAME_RUNNING: "GAME_RUNNING",
  POST_GAME: "POST_GAME",
});
let currentGameState = GameState.GAME_RUNNING;

// Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.95;
const width = baseHeight * aspectRatio;
const height = baseHeight;
////////////////////////////////////////////////////
let startX, startY, lastX, lastY; //for drawing stuff
////////////////////////////////////////////////////

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = width;
canvas.height = height;

const gameContainer = document.getElementById("gameContainer");
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

// Create Matter.js renderer bound to the canvas.
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

// Run renderer.
Render.run(render);

// Create a runner, this allows the engine to be updated for dynamic use within the browser.
const runner = Runner.create();
Runner.run(runner, engine);

//#endregion MATTER SETUP

//#region GAME WORLD SETUP

//Create dividing line.

Matter.Events.on(render, "afterRender", function () {
  // Use your existing ctx
  const dividingLine = canvas.height / 2;

  // Draw the dividing line
  ctx.beginPath();
  ctx.moveTo(0, dividingLine);
  ctx.lineTo(canvas.width, dividingLine);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
});

//Create walls around the canvas to keep game bodies inside the canvas.
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

World.add(world, walls);

let tankSize = width * 0.025; //rename variable to something more clear, like "smallest dimension" Allows tank to scale with the canvas width/height.
let tank1 = TankModule.createTank(width / 2, height - 200, tankSize);
let tank2 = TankModule.createTank(width / 2.5, height - 200, tankSize);
let tank3 = TankModule.createTank(width / 2, height - 100, tankSize);
let tank4 = TankModule.createTank(width / 2.5, height - 100, tankSize);
World.add(world, tank1);
World.add(world, tank2);
World.add(world, tank3);
World.add(world, tank4);

let tanks = [tank1, tank2, tank3, tank4];

// Create a mouse input object.
let mouse = Mouse.create(render.canvas);

// Create the ability for abojects to be able to interact with the mouse input object.
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

// Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);
//#endregion WORLD SETUP

//#region MOUSE EVENTS

// Track power when mouse is down and within the tank boundaries. Start tracking mouse dragging.
let vertices = [];

Events.on(mouseConstraint, "mousedown", function (event) {
  let mousePosition = event.mouse.position;
  if (currentGameState === GameState.PRE_GAME) {
    // draw stuff
    isDrawing = true;
    Matter.Events.on(render, "afterRender", function () {
      ctx.beginPath();
      [startX, startY] = [event.offsetX, event.offsetY];
      [lastX, lastY] = [event.offsetX, event.offsetY];
      vertices = [{ x: event.offsetX, y: event.offsetY }];
    });
  }

  if (currentGameState === GameState.GAME_RUNNING) {
    // Move Stuff
    if (Bounds.contains(tanks.bounds, mousePosition)) {
      isMouseDown = true;
      // Save the point of click.
      startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
    }
  }

  if (currentGameState === GameState.POST_GAME) {
    // Game Over/reset
  }
});

Events.on(mouseConstraint, "mousemove", function (event) {
  if (currentGameState === GameState.PRE_GAME) {
    if (!isDrawing) return;
    draw(event);
  }

  if (currentGameState === GameState.GAME_RUNNING) {
    // Move Stuff
  }

  if (currentGameState === GameState.POST_GAME) {
    // Game Over/reset
  }
});

// Apply force when mouse is up.
Events.on(mouseConstraint, "mouseup", function (event) {
  if (currentGameState === GameState.PRE_GAME) {
    isDrawing = false;
    // draw stuff
  }

  if (currentGameState === GameState.GAME_RUNNING) {
    // Move Stuff
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
        Matter.Body.applyForce(tank, tank.position, {
          x: -normalizedVector.x * forceMagnitude, // scale force in x direction.
          y: -normalizedVector.y * forceMagnitude, // scale force in y direction.
        });
      }

      // Ensure that power meter and other values are reset after mouseup.
      resetPower();
    }
  }

  if (currentGameState === GameState.POST_GAME) {
    // Game Over/reset
  }
});

Events.on(mouseConstraint, "mouseleave", function (event) {});

//#endregion MOUSE EVENTS

//#region SHAPE DRAWING!
//Shape drawing!
let isDrawing = false;
let shapes = [];

// Adjust mouse coordinates to canvas coordinates.
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect(); // Get the bounding box of the canvas.
  const scaleX = canvas.width / rect.width; // Horizontal scale factor.
  const scaleY = canvas.height / rect.height; // Vertical scale factor.

  return {
    // Adjust mouse position based on the scaled canvas.
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

function draw(event) {
  Matter.Events.on(render, "afterRender", function () {
    console.log("event", event);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.strokeStyle = "black"; // Draw lines in black
    ctx.stroke();

    [lastX, lastY] = [event.offsetX, event.offsetY];
  });
}
//#endregion SHAPE DRAWING!

//#region POWER METER AND DIRECTIONAL INPUT
// Select appropriate DOM elements by their ID's.
const powerButton = document.getElementById("powerButton");
const powerMeterFill = document.getElementById("powerMeterFill");

let powerLevel = 0;
const maxPowerLevel = 100;
let isMouseDown = false;
let startingMousePosition = null;
let endingMousePosition = null;

// Update the power meter during each engine tick.
if (GameState.GAME_RUNNING) {
  Events.on(engine, "beforeUpdate", () => {
    if (isMouseDown) {
      increasePower();
    }
  });
}

// To increase power meter when called.

function increasePower() {
  if (powerLevel < maxPowerLevel) {
    powerLevel += 1;
    powerLevel = Math.min(powerLevel, 100); // Ensure power meter does not exceed 100.
    powerMeterFill.style.height = `${powerLevel}%`;
  }
}

// To reset power meter when called.
function resetPower() {
  powerLevel = 0;
  powerMeterFill.style.height = "0%";
  isMouseDown = false;
}

//#endregion
