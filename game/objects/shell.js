const ShellModule = {
  createShell: function (x, y, shellSize, initialVelocity) {
    const shell = Matter.Bodies.circle(x, y, shellSize / 2, {
      label: "Shell",
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
