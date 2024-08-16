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
let shapeCountBelow = 0;
let shapeCountAbove = 0;
const maxShapes = 5;
let isDrawingBelow = true; // Initial state allows drawing below the line

function draw(e) {
  if (!isDrawing) return;

  // Check if the current position is within the allowed region
  if (isDrawingBelow && e.offsetY <= canvas.height / 2) return;
  if (!isDrawingBelow && e.offsetY > canvas.height / 2) return;

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
  if (isDrawingBelow && shapeCountBelow >= maxShapes) return; // Prevent drawing if max shapes reached below the line
  if (!isDrawingBelow && shapeCountAbove >= maxShapes) return; // Prevent drawing if max shapes reached above the line

  const dividingLine = canvas.height / 2;

  // Determine where to start drawing based on the current state
  if (isDrawingBelow && e.offsetY > dividingLine) {
    isDrawing = true;
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [e.offsetX, e.offsetY];
  } else if (!isDrawingBelow && e.offsetY <= dividingLine) {
    isDrawing = true;
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
