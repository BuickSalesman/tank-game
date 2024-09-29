// THIS IS A FILE THAT ONLY ALLOWS FOR CANVAS DRAWING

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
  Vertices,
  decomp,
} = Matter;

// Declare engine and world.
const engine = Engine.create();
const world = engine.world;

// Declare height, width, and aspect ratio for the canvas.
const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.95;
const width = baseHeight * aspectRatio;
const height = baseHeight;

// Declare canvas and context.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Declare gameContainer
const gameContainer = document.getElementById("gameContainer");

// Declare and create Matter.js renderer bound to the canvas.
const render = Render.create({
  element: gameContainer,
  canvas: canvas,
  engine: engine,
  options: {
    width: width,
    height: height,
    background: null,
    wireframes: false,
  },
});

// Declare runner, this allows the engine to be updated for dynamic use within the browser.
const runner = Runner.create();

// Declare a mouse input object.
let mouse = Mouse.create(render.canvas);

// Declare and create the ability for objects to be able to interact with the mouse input object.
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.0,
    render: {
      visible: false,
    },
  },
});

let isDrawing = false;
let drawingPath = [];
let allPaths = []; // Array to store all completed paths

// Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

// Set the canvas height and width.
canvas.width = width;
canvas.height = height;

// Setup gameContainer.
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

// Run renderer.
Render.run(render);

// Run the runner, this allows the engine to be updated for dynamic use within the browser.
Runner.run(runner, engine);

// Add the ability for mouse input into the physics world.
World.add(world, mouseConstraint);

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {
  draw();
});
//#endregion AFTERRENDER HANDLER

//#region BEFOREUPDATE HANDLER
Events.on(engine, "beforeUpdate", () => {
  //stuff
});
//#endregion BEFOREUPDATE HANDLER

//#region AFTERUPDATE HANDLER
Events.on(engine, "afterUpdate", function () {
  //stuff
});
//#endregion AFTERUPDATE HANDLER

Events.on(mouseConstraint, "mousedown", function (event) {
  isDrawing = true;
  drawingPath = [];
  const { mouse } = event;
  drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
});

Events.on(mouseConstraint, "mousemove", function (event) {
  if (isDrawing) {
    drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
  }
});

Events.on(mouseConstraint, "mouseup", function (event) {
  isDrawing = false;

  if (drawingPath.length > 1) {
    // Close the shape by connecting the last point to the first point
    drawingPath.push(drawingPath[0]);
    allPaths.push([...drawingPath]); // Add the completed path to allPaths
    drawingPath = []; // Reset the current drawing path for the next shape
  }
});

Events.on(mouseConstraint, "mouseleave", function (event) {
  isDrawing = false;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

  // Draw all completed shapes
  allPaths.forEach((path) => {
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = "blue"; // Set the stroke color for the drawing
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // If currently drawing, draw the current path
  if (isDrawing && drawingPath.length > 0) {
    ctx.beginPath();
    ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
    for (let i = 1; i < drawingPath.length; i++) {
      ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
    }
    ctx.strokeStyle = "blue"; // Set the stroke color for the drawing
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
