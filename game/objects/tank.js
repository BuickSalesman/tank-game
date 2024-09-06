// Function to create a tank, accessible globally
window.createTank = function (x, y) {
  return Matter.Bodies.rectangle(x, y, 30, 30, {
    label: "Tank",
    render: {
      fillStyle: "blue",
    },
  });
};
