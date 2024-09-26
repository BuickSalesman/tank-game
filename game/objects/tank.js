const TankModule = {
  createTank: function (x, y, tankSize) {
    const area = tankSize * tankSize; // Assuming a square tank
    const desiredMass = 100; // Set your desired mass
    const density = desiredMass / area;

    const tank = Matter.Bodies.rectangle(x, y, tankSize, tankSize, {
      label: "Tank",
      restitution: 0.1,
      // Require two bodies to measure friction.
      friction: 1,
      frictionAir: 0.1,
      density: density, // Set density to achieve desired mass
      render: {
        fillStyle: "transparent",
        strokeStyle: "black",
        lineWidth: 2,
      },
    });

    return tank;
  },
};
