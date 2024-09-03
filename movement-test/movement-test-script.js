const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const gameContainer = document.getElementById("gameContainer");
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;
}

//change cursor to single pixel dot on camvas

resizeCanvas();

canvas.addEventListener("mouseenter", () => {
  canvas.classList.add("custom-cursor"); // Apply the custom cursor class
});

canvas.addEventListener("mouseleave", () => {
  canvas.classList.remove("custom-cursor"); // Remove the custom cursor class
});

//define max movement distance

//define box -- x, y, width, height, shooting range(invisible)
//make box -- line by line animation would be fun

//listen for click on box
//select move or shoot
//listen for second click on box - this represents starting to push the pencil down

////////start 3 second timer -- this may be shortened later
////////show power slider for 1 second -- this will be shortend later
////////listen for mouse move after click while holding on box, show a single dot relative to direction (opposite of actual movement direction) on tank within shooting range
////////if mouse is released before 1 second, do something like start over or very short move or shoot
///////calculate movement based off total time held down before releasing

//draw line from shooting dot to center of tank, extend based on movement calculation
//make box

//show last three turns of movement/shooting, with a general degradation as time goes by

//will have to add collision conditionals later obviously

const startX = 450; // X coordinate of the top-left corner
const startY = 900; // Y coordinate of the top-left corner
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
  setTimeout(drawLeftLine, 250); // Draw left line after 0.25 seconds
  setTimeout(drawTopLine, 500); // Draw top line after 0.5 seconds
  setTimeout(drawRightLine, 750); // Draw right line after 0.75 seconds
  setTimeout(drawBottomLine, 1000); // Draw bottom line after 1 second
}

drawBoxObject();
