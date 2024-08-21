//CANVAS CODE HERE

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let path = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const dividingLine = canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, dividingLine);
  ctx.lineTo(canvas.width, dividingLine);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawReactors();
  drawTanks();
}

// Function to draw the reactors
function drawReactors() {
  const reactorRadius = 15;
  const reactorDistance = 50;

  const topY = canvas.height * 0.025;
  const bottomY = canvas.height * 0.975;
  const centerX = canvas.width / 2;

  // Draw top reactors
  ctx.beginPath();
  ctx.arc(centerX - reactorDistance, topY, reactorRadius, 0, 2 * Math.PI);
  ctx.arc(centerX + reactorDistance, topY, reactorRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();

  // Draw bottom reactors
  ctx.beginPath();
  ctx.arc(centerX - reactorDistance, bottomY, reactorRadius, 0, 2 * Math.PI);
  ctx.arc(centerX + reactorDistance, bottomY, reactorRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();
}

function drawTanks() {
  const tankSize = 25;
  const reactorRadius = 20;
  const reactorDistance = 50;
  const tankOffset = 10;

  const topY = canvas.height * 0.025; // from the top
  const bottomY = canvas.height * 0.975; // from the bottom
  const centerX = canvas.width / 2;

  // Draw tanks below top reactors
  ctx.fillStyle = "blue";
  ctx.fillRect(centerX - reactorDistance - tankSize / 2, topY + reactorRadius + tankOffset, tankSize, tankSize);
  ctx.fillRect(centerX + reactorDistance - tankSize / 2, topY + reactorRadius + tankOffset, tankSize, tankSize);

  // Draw tanks above bottom reactors
  ctx.fillStyle = "red";
  ctx.fillRect(
    centerX - reactorDistance - tankSize / 2,
    bottomY - reactorRadius - tankOffset - tankSize,
    tankSize,
    tankSize
  );
  ctx.fillRect(
    centerX + reactorDistance - tankSize / 2,
    bottomY - reactorRadius - tankOffset - tankSize,
    tankSize,
    tankSize
  );
}

// window.addEventListener("resize", resizeCanvas);

resizeCanvas();

//DRAWING CODE HERE
let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let shapeCountBelow = 0;
let shapeCountAbove = 0;
const maxShapes = 5;
let isDrawingBelow = true; // Initial state allows drawing below the line

function draw(e) {
  if (!isDrawing) return;

  // Check if the current position is within the allowed region
  if (isDrawingBelow && e.offsetY <= canvas.height / 2) return;
  if (!isDrawingBelow && e.offsetY > canvas.height / 2) return;

  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function connectStartToEnd() {
  // ctx.beginPath();
  // ctx.moveTo(lastX, lastY);
  ctx.lineTo(startX, startY);
  ctx.stroke();

  ctx.fillStyle = "red";
}

canvas.addEventListener("mousedown", (e) => {
  if (isDrawingBelow && shapeCountBelow >= maxShapes) return; // Prevent drawing if max shapes reached below the line
  if (!isDrawingBelow && shapeCountAbove >= maxShapes) return; // Prevent drawing if max shapes reached above the line

  const dividingLine = canvas.height / 2;

  // Determine where to start drawing based on the current state
  if (isDrawingBelow && e.offsetY > dividingLine) {
    isDrawing = true;
    ctx.beginPath();
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [e.offsetX, e.offsetY];
  } else if (!isDrawingBelow && e.offsetY <= dividingLine) {
    isDrawing = true;
    ctx.beginPath();
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
});

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    if ((isDrawingBelow && lastY > canvas.height / 2) || (!isDrawingBelow && lastY <= canvas.height / 2)) {
      connectStartToEnd(); // Connect the end of the drawn line to the start
      if (isDrawingBelow) {
        shapeCountBelow++; // Increment the shape counter for below
        if (shapeCountBelow >= maxShapes) {
          isDrawingBelow = false; // Switch to drawing above the line
        }
      } else {
        shapeCountAbove++; // Increment the shape counter for above
      }
    }
    isDrawing = false;
  }
});

canvas.addEventListener("mouseout", () => {
  if (isDrawing) {
    connectStartToEnd();
    if (isDrawingBelow) {
      shapeCountBelow++; // Increment shape count for below when drawing stops
      if (shapeCountBelow >= maxShapes) {
        isDrawingBelow = false; // Switch to drawing above the line
      }
    } else {
      shapeCountAbove++; // Increment shape count for above
    }
    isDrawing = false;
  }
});

// let path = [];

// // Start drawing
// canvas.addEventListener("mousedown", (event) => {
//   drawing = true;
//   path = [{ x: event.offsetX, y: event.offsetY }];
//   ctx.beginPath();
//   ctx.moveTo(event.offsetX, event.offsetY);
// });

// // Track mouse movement to draw the path
// canvas.addEventListener("mousemove", (event) => {
//   if (drawing) {
//     path.push({ x: event.offsetX, y: event.offsetY });
//     ctx.lineTo(event.offsetX, event.offsetY);
//     ctx.stroke();
//   }
// });

// // Finish drawing and close the path
// canvas.addEventListener("mouseup", () => {
//   if (drawing) {
//     ctx.lineTo(path[0].x, path[0].y); // Close the path
//     ctx.closePath();
//     ctx.fillStyle = "red";
//     ctx.fill(); // Fill the shape with red
//     drawing = false;
//   }
// });

// // Optional: Handle case where mouse leaves the canvas while drawing
// canvas.addEventListener("mouseleave", () => {
//   if (drawing) {
//     ctx.lineTo(path[0].x, path[0].y); // Close the path
//     ctx.closePath();
//     ctx.fillStyle = "red";
//     ctx.fill(); // Fill the shape with red
//     drawing = false;
//   }
// });
