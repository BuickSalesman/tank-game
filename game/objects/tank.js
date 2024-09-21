const TankModule = {
  createTank: function (x, y, tankSize, tankSize) {
    // above are conflicting argument names, still works, but should figure out a way to clean up later
    return Matter.Bodies.rectangle(x, y, tankSize, tankSize, {
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
