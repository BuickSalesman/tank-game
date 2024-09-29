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

let isDrawing = false;

let drawingPath = [];

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

//#region AFTERRENDER HANDLER
Events.on(render, "afterRender", function () {
  draw(event);
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
    console.log(drawingPath);
  }
});

Events.on(mouseConstraint, "mouseup", function (event) {
  isDrawing = false;

  if (drawingPath.length > 1) {
    drawingPath.push(drawingPath[0]);
  }

  //Create solid body out of drawing.
  createMatterBodyFromDrawing();
});

Events.on(mouseConstraint, "mouseleave", function (event) {
  isDrawing = false;
});

function draw(event) {
  if (!isDrawing) return;

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
}

function createMatterBodyFromDrawing() {
  // Convert the drawingPath into an array of vertices that Matter.js can understand
  const vertices = drawingPath.map((point) => {
    return { x: point.x, y: point.y };
  });

  const hullVertices = grahamsScan(vertices);

  const centroid = calculateCentroid(vertices);

  // Create the body from the vertices
  const body = Bodies.fromVertices(centroid.x, centroid.y, [vertices], {
    ignoreBoundaryLimit: true,
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

// Helper function to calculate the polar angle between two points
function polarAngle(p0, p1) {
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

// Cross-product to determine turn direction
function crossProduct(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// Graham's scan to find the convex hull
function grahamsScan(points) {
  // Step 1: Find the point with the lowest y-coordinate (if ties, choose the leftmost point)
  let start = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < start.y || (points[i].y === start.y && points[i].x < start.x)) {
      start = points[i];
    }
  }

  // Step 2: Sort the points based on the polar angle relative to the start point
  points.sort((a, b) => {
    const angleA = polarAngle(start, a);
    const angleB = polarAngle(start, b);
    return angleA - angleB;
  });

  // Step 3: Process the points to find the convex hull
  let hull = [];
  for (let i = 0; i < points.length; i++) {
    while (hull.length >= 2 && crossProduct(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0) {
      hull.pop(); // Remove point inside the hull
    }
    hull.push(points[i]);
  }

  return hull;
}
