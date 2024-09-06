// Importing Matter.js modules
const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

// Create an engine and world
const engine = Engine.create();
const world = engine.world;

// Disable gravity for top-down view
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

// Set up fixed canvas dimensions
const canvas = document.getElementById("gameCanvas");
const width = 800; // Fixed width
const height = 600; // Fixed height
canvas.width = width;
canvas.height = height;

// Create a Matter.js renderer bound to the canvas
const render = Render.create({
  element: document.getElementById("gameContainer"),
  canvas: canvas,
  engine: engine,
  options: {
    width: width,
    height: height,
    wireframes: false,
    background: "#ffffff",
  },
});

// Run the renderer
Render.run(render);

// Create a Matter.js runner to update the engine
const runner = Runner.create();
Runner.run(runner, engine);

// Create static walls around the world (so objects don't fall out)
const walls = [
  Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }), // top
  Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }), // bottom
  Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }), // left
  Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }), // right
];
World.add(world, walls);

// Create and add the tank to the world
let tank = createTank(width / 2, height - 50);
World.add(world, tank);

// Tank movement logic using keyboard
document.addEventListener("keydown", function (event) {
  const forceMagnitude = 0.05;
  switch (event.key) {
    case "ArrowUp": // or 'w'
    case "W":
    case "w":
      Body.applyForce(tank, tank.position, { x: 0, y: -forceMagnitude });
      break;
    case "ArrowDown": // or 's'
    case "S":
    case "s":
      Body.applyForce(tank, tank.position, { x: 0, y: forceMagnitude });
      break;
    case "ArrowLeft": // or 'a'
    case "A":
    case "a":
      Body.applyForce(tank, tank.position, { x: -forceMagnitude, y: 0 });
      break;
    case "ArrowRight": // or 'd'
    case "D":
    case "d":
      Body.applyForce(tank, tank.position, { x: forceMagnitude, y: 0 });
      break;
  }
});
