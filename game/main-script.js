//#region matter-definitions
const { Engine, Render, Runner, MouseConstraint, Bodies, World, Body, Events } = Matter;

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
let isDrawing = false;
let path = [];
let startX, startY, lastX, lastY;

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

// Run renderer.
Render.run(render);

// Create a runner, this allows the engine to be updated for dynamic use within the browser.
const runner = Runner.create();
Runner.run(runner, engine);

let tankSize = width * 0.025; //rename variable to something more clear, like "smallest dimension" Allows tank to scale with the canvas width/height.
let tank = TankModule.createTank(width / 2, height - 200, tankSize);
World.add(world, tank);

// Create a mouse input object.
let mouse = Matter.Mouse.create(render.canvas);

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

let isMouseDown = false;
let startingMousePosition = null;
let endingMousePosition = null;

// Track power when mouse is down and within the tank boundaries. Start tracking mouse dragging.
Events.on(mouseConstraint, "mousedown", function (event) {
  let mousePosition = event.mouse.position;
  if (Matter.Bounds.contains(tank.bounds, mousePosition)) {
    isMouseDown = true;
    // Save the point of click.
    startingMousePosition = { x: mousePosition.x, y: mousePosition.y };
  }
});

//Shape drawing!
const ctx = canvas.getContext("2d");

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

// Shape drawing!
canvas.addEventListener("mousedown", (e) => {
  let pos = getMousePos(canvas, e);

  // Prevent drawing if mouse position is inside tank boundaries. May hook to button for ease of access during development.
  if (Matter.Bounds.contains(tank.bounds, pos)) {
    return;
  } else {
    // Start a new set of vertices.
    isDrawing = true;
    vertices = [{ x: pos.x, y: pos.y }];
  }
});

// Push each point of the mousemove into verticies array as mouse moves.
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!isDrawing) {
    return;
  } else if (isDrawing) {
    let pos = getMousePos(canvas, e);
  }

  // if (isDrawingBelow && e.offsetY <= canvas.height / 2) return;
  // if (!isDrawingBelow && e.offsetY > canvas.height / 2) return;

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = "black"; // Draw lines in black
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

// End vertex tracking on mouse up. Create shape on game board.
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  closeShape(vertices); // Snap shape closed.
  createSolidBody(vertices); // Render shape on game board.
});

function closeShape(vertices) {
  ctx.beginPath();
  ctx.lineTo(vertices[0].x, vertices[0].y);
  ctx.strokeStyle = "black";
  ctx.stroke();
  vertices.forEach((v) => ctx.lineTo(v.x, v.y));
  ctx.closePath();
}

function createSolidBody(vertices) {
  const body = Matter.Bodies.fromVertices(vertices[0].x, vertices[0].y, [vertices], {
    isStatic: true,
    render: { fillStyle: "transparent", strokeStyle: "black", lineWidth: 2 },
  });
  console.log("===", body.vertices[0].x);
  Matter.World.add(world, body);
}
