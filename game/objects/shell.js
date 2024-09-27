const ShellModule = {
  createShell: function (x, y, shellSize, initialVelocity, playerId) {
    const shell = Matter.Bodies.circle(x, y, shellSize / 2, {
      label: "Shell",
      playerId: playerId,
      restitution: 0.1,
      friction: 1,
      frictionAir: 0.1,
      density: 0.001, // Light weight
      render: {
        fillStyle: "black",
      },
    });

    // Apply initial velocity to the shell
    Matter.Body.setVelocity(shell, initialVelocity);

    return shell;
  },
};
