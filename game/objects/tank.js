window.createTank = function (x, y) {
  return Matter.Bodies.rectangle(x, y, 20, 20, {
    label: "Tank",
    restitution: 0,
    friction: 1,
    render: {
      fillStyle: "transparent",
      strokeStyle: "black",
      lineWidth: 2,
    },
  });
};
