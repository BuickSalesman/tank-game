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

function closeShape() {
  ctx.lineTo(startX, startY);
  ctx.stroke();

  ctx.fillStyle = "red";
  ctx.fill(); // Fill the shape with red
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
      closeShape(); // Connect the end of the drawn line to the start
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
    closeShape();
    shapeCount++;

    if (isDrawingBelow && shapeCount >= maxShapesBelow) {
      isDrawingBelow = false; // Switch to drawing above the line
    } else if (!isDrawingBelow && shapeCount >= maxShapesBelow + maxShapesAbove) {
      shapeCount = 10; // Prevent any more drawing
    }
    isDrawing = false;
  }
});
