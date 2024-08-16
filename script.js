const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 600);
const CANVAS_HEIGHT = (canvas.height = 600);

const dividingLine = CANVAS_HEIGHT / 2;

ctx.beginPath();
ctx.moveTo(0, dividingLine);
ctx.lineTo(CANVAS_WIDTH, dividingLine);
ctx.strokeStyle = "black";
ctx.lineWidth = 2; // Adjust line width as needed
ctx.stroke();
