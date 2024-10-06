const ShellModule = {
  createShell: function (x, y, shellSize, initialVelocity, playerId) {
    const area = tankSize * tankSize; // Assuming a square tank
    const desiredMass = 100; // Set your desired mass
    const density = desiredMass / area;

    const shell = Matter.Bodies.circle(x, y, shellSize / 2, {
      label: "Shell",
      playerId: playerId,
      restitution: 0.1,
      friction: 1,
      frictionAir: 0.1,
      density: density, // Light weight
      render: {
        fillStyle: "black",
      },
      collisionFilter: {
        group: 1,
        category: 0,
        mask: 0,
      },
    });

    // Apply initial velocity to the shell
    Matter.Body.setVelocity(shell, initialVelocity);

    return shell;
  },
};
