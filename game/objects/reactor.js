const ReactorModule = {
  createReactor: function (x, y, reactorSize, playerId) {
    const reactor = Matter.Bodies.circle(x, y, reactorSize / 2, {
      label: "Reactor",
      playerId: playerId,
      isStatic: true, // Make the reactor stationary
      render: {
        fillStyle: "transparent",
        strokeStyle: "black",
        lineWidth: 2,
      },
    });

    reactor.hitPoints = 1;

    return reactor;
  },
};
