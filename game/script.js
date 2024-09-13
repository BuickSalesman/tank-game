const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

// Create engine and world.
const engine = Engine.create();
const world = engine.world;

// Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.8;
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

let tank = TankModule.createTank(width / 2, height - 200);
World.add(world, tank);

// Create a mouse input object.
let mouse = Matter.Mouse.create(render.canvas);

// Create the ability for abojects to be able to interact with the mouse input object.
let mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    // Stiffness controls the mouse's ability to be able to move objects around. 0 for non-interactivity.
    stiffness: 0,
    render: {
      visible: true,
    },
  },
});

// Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);

// Set up an event listener for mousedown.
Matter.Events.on(mouseConstraint, "mousedown", function (event) {
  // Define the x,y coordinates of the mouse at time of the event.
  let mousePosition = event.mouse.position;

  // Check if the mouse click was winthin the bounds of the tank body.
  if (Matter.Bounds.contains(tank.bounds, mousePosition)) {
    console.log("clicky");
  }
});

// POWER METER
// Select appropriate DOM elements by their ID's.
const powerButton = document.getElementById("powerButton");
const powerMeterFill = document.getElementById("powerMeterFill");

let powerLevel = 0;
let powerFillInterval;
const maxPowerLevel = 100;
let isMouseDown = false;

// Track power when mouse is down and within the tank boundaries.
Events.on(mouseConstraint, "mousedown", function (event) {
  let mousePosition = event.mouse.position;
  if (Matter.Bounds.contains(tank.bounds, mousePosition)) {
    isMouseDown = true;
  }
});

// Apply force when mouse is up.
Events.on(mouseConstraint, "mouseup", () => {
  if (powerLevel > 0) {
    const forceMagnitude = powerLevel * 0.000005;
    Body.applyForce(tank, tank.position, { x: 0, y: -forceMagnitude * 10 });
  }
  resetPower();
});

// Update the power meter during each engine tick
Events.on(engine, "beforeUpdate", () => {
  if (isMouseDown) {
    increasePower();
  }
});

function increasePower() {
  if (powerLevel < maxPowerLevel) {
    powerLevel += 8;
    powerLevel = Math.min(powerLevel, 100); // Ensure power meter does not exceed 100.
    powerMeterFill.style.height = `${powerLevel}%`;
  }
}

function resetPower() {
  powerLevel = 0;
  powerMeterFill.style.height = "0%";
  isMouseDown = false;
}
