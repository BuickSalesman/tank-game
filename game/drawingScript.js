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
    stiffness: 0.2, // Allow a bit of elasticity while dragging
    render: {
      visible: true, // Make the mouse constraint visible while dragging
    },
  },
});

// Add mouseConstraint to the world
World.add(world, mouseConstraint);

let isDrawing = false;
let drawingPath = [];
let allPaths = []; // Array to store all completed paths
let lastLineTime = 0; // To track when to add a new line
const lineInterval = 10; // 100 milliseconds

// Disable gravity.
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

// Run renderer.
Render.run(render);

// Run the runner, this allows the engine to be updated for dynamic use within the browser.
Runner.run(runner, engine);

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {
  // No need to draw here; use the drawCanvas for drawing
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
  lastLineTime = Date.now(); // Initialize time for the first line
});

Events.on(mouseConstraint, "mousemove", function (event) {
  if (isDrawing) {
    const currentTime = Date.now();
    if (currentTime - lastLineTime >= lineInterval) {
      drawingPath.push({ x: mouse.position.x, y: mouse.position.y });
      lastLineTime = currentTime; // Update the time for the next line
    }
  }
});

Events.on(mouseConstraint, "mouseup", function (event) {
  isDrawing = false;

  if (drawingPath.length > 1) {
    // Close the shape by connecting the last point to the first point
    drawingPath.push(drawingPath[0]);
    allPaths.push([...drawingPath]); // Add the completed path to allPaths
    createMatterBodyFromDrawing(drawingPath); // Create Matter.js body from the drawn path
    drawingPath = []; // Reset the current drawing path for the next shape
  }
});

Events.on(mouseConstraint, "mouseleave", function (event) {
  isDrawing = false;
});

// Drawing on the drawCanvas (separate from the Matter.js canvas)
function draw() {
  if (isDrawing) {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height); // Clear the drawing canvas before drawing

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
    isStatic: false, // Allow the body to be draggable and movable
    render: {
      fillStyle: "transparent", // You can set this to a color if you want the shape to be filled
      strokeStyle: "black",
      lineWidth: 2,
    },
    // Chamfer to smooth out the vertices and prevent sharp edges
    chamfer: {
      radius: 200000, // Set this to control the amount of smoothing at vertices
    },
  });

  // Add the new body to the Matter.js world
  if (body) {
    World.add(world, body);

    // Clear the draw canvas after the body is created
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
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
  requestAnimationFrame(animate);
  draw();
}

animate(); // Start the drawing loop
