const ReactorModule = {
  createReactor: function (x, y, reactorSize) {
    const reactor = Matter.Bodies.circle(x, y, reactorSize / 2, {
      label: "Reactor",
      isStatic: true, // Make the reactor stationary
      render: {
        fillStyle: "transparent",
        strokeStyle: "black",
        lineWidth: 2,
      },
    });

    return reactor;
  },
};
