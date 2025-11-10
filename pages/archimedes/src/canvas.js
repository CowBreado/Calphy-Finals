  const {
    Engine,
    Render,
    Runner,
    Body,
    Bodies,
    Composite,
    Events,
    Mouse,
    MouseConstraint,
    Vertices,
    Query,
  } = Matter;

let width;
let height;
let world;

document.addEventListener("DOMContentLoaded", () => {
  const WATER_DENSITY = 0.001;
  const WATER_LEVEL_PERCENT = 0.5;

  const engine = Engine.create();
  world = engine.world;

  const container = document.getElementById("matter-container");
  width = container.clientWidth;
  height = container.clientHeight;

  const render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: "#f0f8ff",
    },
  });

  const mouse = Mouse.create(render.canvas);
  const mouseconstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });
  const ground = Bodies.rectangle(width / 2, height + 20, width + 20, 20, { isStatic: true });
  const water = Bodies.rectangle(
    width / 2,
    height * (1 - WATER_LEVEL_PERCENT / 2),
    width + 20,
    height * WATER_LEVEL_PERCENT,
    {
      isStatic: true,
      isSensor: true,
      label: "water",
      render: { fillStyle: "rgba(0, 120, 255, 0.4)" },
    },
  );

  Composite.add(engine.world, [ground, water, mouseconstraint]);
  Render.run(render);

  const runner = Runner.create();
  Runner.run(runner, engine);

  const applyBuoyancy = (body, waterLine, world, h = 1) => {
    const gravity = world.gravity;
    const g = gravity.scale * gravity.y;

    body.parts.forEach(part => {
      if (!part.vertices) {
        return;
      }

      const length = part.vertices.length;
      if (length < 3) {
        return;
      }

      const submerged = [];

      for (let i = 0; i < length; i++) {
        const current = part.vertices[i];
        const next = part.vertices[(i + 1) % length];

        if (current.y > waterLine) {
          submerged.push(current); 
        }

        if (Math.sign(current.y - waterLine) === -1 * Math.sign(next.y - waterLine)) {
          const ratio = (waterLine - current.y) / (next.y - current.y);
          submerged.push({
            x: current.x + (next.x - current.x) * ratio,
            y: waterLine,
          });
        }
      }

      if (submerged.length >= 3) {
        const area = Math.abs(Vertices.area(submerged));
        const center = Vertices.centre(submerged);

        const force = WATER_DENSITY * g * area * h;
        Body.applyForce(body, center, { x: 0, y: -1 * force });
      }
    })
  }

  const bodiesInWater = new Set();

  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (pair.bodyA.label === "water") {
        bodiesInWater.add(pair.bodyB);
      } else if (pair.bodyB.label === "water") {
        bodiesInWater.add(pair.bodyA);
      }
    }
  });

  Events.on(engine, "collisionEnd", (event) => {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (pair.bodyA.label === "water") {
        bodiesInWater.delete(pair.bodyB);
      } else if (pair.bodyB.label === "water") {
        bodiesInWater.delete(pair.bodyA);
      }
    }
  });

  Events.on(engine, "beforeUpdate", () => {
    const waterLine = water.bounds.min.y;
    
    bodiesInWater.forEach(body => {
      if (body.isStatic || body.isSleeping) return;
      applyBuoyancy(body, waterLine, world);
    });
  });

  Events.on(mouseconstraint, "mousemove", (event) => {
    const g = world.gravity.y * 9.81;

    const bodies = Composite.allBodies(world).filter(body => body.label !== "water");
    const hovered_bodies = Query.point(bodies, event.mouse.position);

    const id = "object-details";
    if (hovered_bodies.length) {
      document.body.style.cursor = "grab";

      const body = hovered_bodies[0];

      const name = body.label;
      const density = body.density * 1_000_000;
      const volume = body.area / 10_000;
      const force = WATER_DENSITY * g * volume * 1_000_000;

      document.getElementById(id).innerHTML = `
        <div class="text--name fw-bold mb-2"><span>${name}</span></div>
        <div><strong>Density (kg/m<sup>3</sup>):</strong><span> ${density.toFixed(2)}</span></div>
        <div><strong>Volume (m<sup>3</sup>):</strong><span> ${volume.toFixed(2)}</span></div>
        <div><strong>Buoyant Force (N):</strong><span> ${force.toFixed(2)}</span></div>
      `;
    } else {
      document.body.style.cursor = "default";

      document.getElementById(id).innerHTML = `<p class="text--details-none">
        No object selected. <br />
        Hover on an object to view its details!
      </p>`;
    }
  })
})
