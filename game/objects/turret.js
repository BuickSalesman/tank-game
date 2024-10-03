const TurretModule = {
  createTurret: function (x, y, turretSize, playerId) {
    const turret = Matter.Bodies.circle(x, y, turretSize / 2, {
      label: "Turret",
      playerId: playerId,
      isStatic: true,
      render: {
        fillStyle: "transparent",
        strokeStyle: "black",
        lineWidth: 2,
      },
      collisionFilter: {
        group: -1,
        category: 0,
        mask: 0,
      },
    });

    return turret;
  },
};
