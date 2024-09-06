const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const gameContainer = document.getElementById("gameContainer");
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;
}

//change cursor to single pixel dot on camvas

resizeCanvas();

// canvas.addEventListener("mouseenter", () => {
//   canvas.classList.add("custom-cursor"); // Apply the custom cursor class
// });

// canvas.addEventListener("mouseleave", () => {
//   canvas.classList.remove("custom-cursor"); // Remove the custom cursor class
// });

let startX = 450; // X coordinate of the top-left corner
let startY = 900; // Y coordinate of the top-left corner
const width = 50; // Width of the rectangle
const height = 50; // Height of the rectangle

function drawLeftLine() {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, startY + height);
  ctx.stroke();
}

function drawTopLine() {
  ctx.beginPath();
  ctx.moveTo(startX, startY + height);
  ctx.lineTo(startX + width, startY + height);
  ctx.stroke();
}

function drawRightLine() {
  ctx.beginPath();
  ctx.moveTo(startX + width, startY + height);
  ctx.lineTo(startX + width, startY);
  ctx.stroke();
}

function drawBottomLine() {
  ctx.beginPath();
  ctx.moveTo(startX + width, startY);
  ctx.lineTo(startX, startY);
  ctx.stroke();
}

function drawBoxObject() {
  setTimeout(drawLeftLine, 250);
  setTimeout(drawTopLine, 500);
  setTimeout(drawRightLine, 750);
  setTimeout(drawBottomLine, 1000);

  setTimeout(() => {
    canvas.addEventListener("click", handleClickInsideBox);
  }, 1000);
}

function handleClickInsideBox(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const centerPointCoords = [width + rect.left / 2, height + rect.top / 2];
  console.log(e.clientX, rect.left, mouseX);

  if (mouseX >= startX && mouseX <= startX + width && mouseY >= startY && mouseY <= startY + height) {
    ctx.beginPath();
    ctx.arc(centerPointCoords[0], centerPointCoords[1], 15, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

drawBoxObject();
