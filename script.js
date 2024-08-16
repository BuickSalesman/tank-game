//CANVAS CODE HERE

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

//DRAWING CODE HERE
let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let shapeCount = 0;
const maxShapes = 5;

function draw(e) {
  if (!isDrawing) return;

  // Check if the current position is below the dividing line
  if (e.offsetY <= canvas.height / 2) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function connectStartToEnd() {
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(startX, startY);
  ctx.stroke();
}

canvas.addEventListener("mousedown", (e) => {
  if (shapeCount >= maxShapes) return; // Prevent drawing if max shapes reached

  const dividingLine = canvas.height / 2;

  // Only start drawing if the mouse is below the dividing line
  if (e.offsetY > dividingLine) {
    isDrawing = true;
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
});

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    // Ensure the last point is also below the dividing line
    if (lastY > canvas.height / 2) {
      connectStartToEnd(); // Connect the end of the drawn line to the start
      shapeCount++; // Increment the shape counter after completing a shape
    }
    isDrawing = false;
  }
});

canvas.addEventListener("mouseout", () => {
  if (isDrawing) {
    connectStartToEnd();
    shapeCount++; // Increment shape count when drawing stops
    isDrawing = false; // Stop drawing
  }
});
