// Importing Matter.js modules
const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

// Create an engine and world
const engine = Engine.create();
const world = engine.world;

// Disable gravity for top-down view
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

// Define the aspect ratio for portrait orientation (Height is taller than width)
const aspectRatio = 1 / 1.4142;
const baseHeight = window.innerHeight * 0.8; // Set the height to 80% of the window height
const width = baseHeight * aspectRatio; // Calculate the width using the flipped aspect ratio
const height = baseHeight; // Set the height

// Set up the canvas dimensions dynamically
const canvas = document.getElementById("gameCanvas");
canvas.width = width;
canvas.height = height;

// Also set the container's width and height dynamically
const gameContainer = document.getElementById("gameContainer");
gameContainer.style.width = `${width}px`;
gameContainer.style.height = `${height}px`;

// Create a Matter.js renderer bound to the canvas
const render = Render.create({
  element: gameContainer,
  canvas: canvas,
  engine: engine,
  options: {
    width: width,
    height: height,
    wireframes: false, // Set to true for debugging wireframes
    background: "#ffffff",
  },
});

// Run the renderer
Render.run(render);

// Create a Matter.js runner to update the engine
const runner = Runner.create();
Runner.run(runner, engine);

// Create static walls around the world to keep the tank inside
const walls = [
  Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }), // top
  Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }), // bottom
  Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }), // left
  Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }), // right
];
World.add(world, walls);

// Create and add the tank1 to the world
let tank1 = createTank(width / 2, height - 200);
World.add(world, tank1);

let tank2 = createTank(width - 50, height - 100);
World.add(world, tank2);

// Tank movement logic using keyboard
document.addEventListener("keydown", function (event) {
  const forceMagnitude = 0.05;
  switch (event.key) {
    case "ArrowUp": // or 'w'
    case "W":
    case "w":
      Body.applyForce(tank1, tank1.position, { x: 0, y: -forceMagnitude });
      break;
    case "ArrowDown": // or 's'
    case "S":
    case "s":
      Body.applyForce(tank1, tank1.position, { x: 0, y: forceMagnitude });
      break;
    case "ArrowLeft": // or 'a'
    case "A":
    case "a":
      Body.applyForce(tank1, tank1.position, { x: -forceMagnitude, y: 0 });
      break;
    case "ArrowRight": // or 'd'
    case "D":
    case "d":
      Body.applyForce(tank1, tank1.position, { x: forceMagnitude, y: 0 });
      break;
  }
});
