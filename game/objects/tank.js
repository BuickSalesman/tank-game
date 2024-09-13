const TankModule = {
  createTank: function (x, y) {
    return Matter.Bodies.rectangle(x, y, 20, 20, {
      label: "Tank",
      restitution: 0.1,
      // Requires two bodies to measure friction.
      friction: 1,
      frictionAir: 0.1,
      density: 1,
      render: {
        fillStyle: "transparent",
        strokeStyle: "black",
        lineWidth: 2,
      },
    });
  },
};
