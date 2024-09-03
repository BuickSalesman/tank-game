const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const gameContainer = document.getElementById("gameContainer");
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;
}

//change cursor to single pixel dot on camvas

resizeCanvas();

//define max movement distance

//define box -- x, y, width, height, velocity(vx, vy?), shooting range(invisible)
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
