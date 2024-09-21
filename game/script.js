const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

// Create engine and world.
const engine = Engine.create();
const world = engine.world;

// Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.95;
const width = baseHeight * aspectRatio;
const height = baseHeight;

const canvas = document.getElementById("gameCanvas");
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

// Run renderer
Render.run(render);

// Create a runner, this allows the engine to be updated for dynamic use within the browser.
const runner = Runner.create();
Runner.run(runner, engine);

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
  //Left
  Bodies.rectangle(
    -500,
    height / 2,
    1000,
    height + 1000,
    {isStatic: true}
  ),
  //Right
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
let tank = TankModule.createTank(width / 2, height - 200, tankSize, tankSize); //conflicting argument names, still works, but might cause problems later.
World.add(world, tank);

// Create a mouse input object.
let mouse = Matter.Mouse.create(render.canvas);

// Create the ability for abojects to be able to interact with the mouse input object.
let mouseConstraint = Matter.MouseConstraint.create(engine, {
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

// POWER METER AND DIRECTIONAL INPUT
// Select appropriate DOM elements by their ID's.
const powerButton = document.getElementById("powerButton");
const powerMeterFill = document.getElementById("powerMeterFill");

let powerLevel = 0;
const maxPowerLevel = 100;
let isMouseDown = false;
let startingMousePosition = null;
let endingMousePosition = null;

// Track power when mouse is down and within the tank boundaries. Start tracking mouse dragging.
Events.on(mouseConstraint, "mousedown", function (event) {
  let mousePosition = event.mouse.position;
  if (Matter.Bounds.contains(tank.bounds, mousePosition)) {
    isMouseDown = true;
    // Save the point of click
    startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
  }
});

// Apply force when mouse is up.
Matter.Events.on(mouseConstraint, "mouseup", function (event) {
  if (isMouseDown) {
    isMouseDown = false;
    endingMousePosition = { x: event.mouse.position.x, y: event.mouse.position.y }; // Store the end position

    // Calculate the vector from the starting to the ending position
    let vector = {
      x: endingMousePosition.x - startingMousePosition.x,
      y: endingMousePosition.y - startingMousePosition.y,
    };

    // Do fancy math so that the vector does not affect to power of force applied to tank.
    const vectorLength = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    let normalizedVector = { x: vector.x / vectorLength, y: vector.y / vectorLength };

    // Apply force based on the vector, if powerLevel is greater than 0
    if (powerLevel > 0) {
      //Non-linear scaling for a cleaner repesentation of power.
      const scaledPowerLevel = Math.pow(powerLevel, 1.5);

      const forceMagnitude = scaledPowerLevel * 0.0158;
      Body.applyForce(tank, tank.position, {
        x: -normalizedVector.x * forceMagnitude, // scale force in x direction
        y: -normalizedVector.y * forceMagnitude, // scale force in y direction
      });
    }

    // Ensure that power meter and other values are reset after mouseup
    resetPower();
  }
});

// Update the power meter during each engine tick
Events.on(engine, "beforeUpdate", () => {
  if (isMouseDown) {
    increasePower();
  }
});

function increasePower() {
  if (powerLevel < maxPowerLevel) {
    powerLevel += 1;
    powerLevel = Math.min(powerLevel, 100); // Ensure power meter does not exceed 100.
    powerMeterFill.style.height = `${powerLevel}%`;
  }
}

function resetPower() {
  powerLevel = 0;
  powerMeterFill.style.height = "0%";
  isMouseDown = false;
}

//Shape drawing!
const ctx = canvas.getContext("2d");
let isDrawing = false;
let vertices = [];
let shapes = [];

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  vertices = [{ x: e.clientX, y: e.clientY }];
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    vertices.push({ x: e.clientX, y: e.clientY });
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  closeShape(vertices);
  createSolidBody(vertices);
});

function closeShape(vertices) {
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  vertices.forEach((v) => ctx.lineTo(v.x, v.y));
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 150, 0, 0.5)"; // Example fill color
  ctx.fill();
}

function createSolidBody(vertices) {
  const body = Matter.Bodies.fromVertices(
    vertices[0].x,
    vertices[0].y,
    [vertices],
    { isStatic: true, render: { fillStyle: "#00FF00" } } // Example style
  );
  Matter.World.add(world, body);
}
