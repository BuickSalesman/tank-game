// JavaScript code to control the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let shapeCount = 0; // Counter for the number of shapes drawn
let isDrawingBelow = true; // Initial state allows drawing below the line
let maxShapesBelow = 5;
let maxShapesAbove = 5;
let isDrawing = false;
let path = [];
let startX, startY, lastX, lastY;

function resizeCanvas() {
  const gameContainer = document.getElementById("gameContainer");
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;

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

// Call resizeCanvas on load
resizeCanvas();

// Drawing logic (replacing previous drawing code)
function draw(e) {
  if (!isDrawing) return;

  // Check if the current position is within the allowed region
  if (isDrawingBelow && e.offsetY <= canvas.height / 2) return;
  if (!isDrawingBelow && e.offsetY > canvas.height / 2) return;

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = "black"; // Draw lines in black
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function connectStartToEnd() {
  ctx.lineTo(startX, startY);
  ctx.stroke();

  ctx.fillStyle = "red";
  ctx.fill(); // Fill the shape with red
}

function clearRect() {
  console.log("clicky flip flip");
  ctx.clearRect(canvas.width / 2 - 100, canvas.height - 200, 200, 200);
}

canvas.addEventListener("mousedown", (e) => {
  if (shapeCount >= 10) return; // Prevent drawing if max shapes reached

  const dividingLine = canvas.height / 2;

  // Determine where to start drawing based on the current state
  if (isDrawingBelow && e.offsetY > dividingLine) {
    isDrawing = true;
    ctx.beginPath();
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [e.offsetX, e.offsetY];
    path = [{ x: e.offsetX, y: e.offsetY }];
  } else if (!isDrawingBelow && e.offsetY <= dividingLine) {
    isDrawing = true;
    ctx.beginPath();
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [e.offsetX, e.offsetY];
    path = [{ x: e.offsetX, y: e.offsetY }];
  }
});

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    if ((isDrawingBelow && lastY > canvas.height / 2) || (!isDrawingBelow && lastY <= canvas.height / 2)) {
      connectStartToEnd(); // Connect the end of the drawn line to the start
      shapeCount++;

      if (isDrawingBelow && shapeCount >= maxShapesBelow) {
        isDrawingBelow = false; // Switch to drawing above the line
      } else if (!isDrawingBelow && shapeCount >= maxShapesBelow + maxShapesAbove) {
        shapeCount = 10; // Prevent any more drawing
      }
    }
    isDrawing = false;
  }
});

canvas.addEventListener("mouseleave", () => {
  if (isDrawing) {
    connectStartToEnd();
    shapeCount++;

    if (isDrawingBelow && shapeCount >= maxShapesBelow) {
      isDrawingBelow = false; // Switch to drawing above the line
    } else if (!isDrawingBelow && shapeCount >= maxShapesBelow + maxShapesAbove) {
      shapeCount = 10; // Prevent any more drawing
    }
    isDrawing = false;
  }
});
