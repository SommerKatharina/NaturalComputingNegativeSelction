new p5();
function drawCircle(x, y, radius) {
  fill(255);
  arc(x, y, radius * 2, radius * 2, 0, Math.PI * 2);
}

function drawLine(x1, y1, x2, y2) {
  line(x1, y1, x2, y2);
}

function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function findAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}

function calculateVariance(values) {
  const n = values.length;
  const mean = values.reduce((acc, val) => acc + val, 0) / n;
  const squaredDifferences = values.map((val) => (val - mean) ** 2);
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / n;
  return variance;
}

function generateRandomNormal(mean, stdDev) {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  var num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  return num * stdDev + mean;
}

Scene = {
  w: 300, // FIELD SIZE
  h: 300,
  number_boids: 15,
  swarm: [],
  radius: 30,
  angle: 270,
  neighbours(x, dir) {
    // console.log(dir)
    let r = [];
    for (let p of this.swarm) {
      if (dist(p.pos.x, p.pos.y, x.x, x.y) <= this.radius) {
        directionAngle = findAngle(x.x, x.y, x.x + dir.x, x.y + dir.y);
        angle = findAngle(x.x, x.y, p.pos.x, p.pos.y);

        //angle_points = Math.atan2(p.pos.y - x.y, p.pos.x - x.x);
        //angle_movement = Math.atan2(p.pos.y - p.dir.y, p.pos.x-p.dir.x)
        //angle_movement = Math.atan2(x.y + dir.y - x.y, x.x + dir.x - x.x);
        //const angleDiff = Math.abs(angle_points - dir);
        angleDifference = Math.abs(directionAngle - angle);
        if (angleDifference > 180) {
          angleDifference = 360 - angleDifference;
        }
        if (angleDifference <= this.angle / 2) {
          //print(angle_points)
          //print(angle_movement)
          r.push(p);
          //fill(0,186,0 )
          //ellipse( p.pos.x, p.pos.y, 5, 5 )
        } // else {
        //fill(186,0,0 )
        //ellipse( p.pos.x, p.pos.y, 5, 5 )
        //  }
        //} else {
        //    fill(0,0,186 )
        //    ellipse( p.pos.x, p.pos.y, 5, 5 )
      }
    }
    return r;
  },
};

class Particle {
  constructor() {
    this.pos = createVector(random(0, Scene.w), random(0, Scene.h));
    this.dir = p5.Vector.random2D();
    this.isFirst = true;

    // HYPERPARAMS
    this.speed = 3; // SPEED
    this.sep_bound = 10; // SEPARATION DISTANCE

    // PARAMS TO SEARCH FOR OPTIMUM
    this.coh_strength = 0; // COHESION STRENGTH
    this.align_strength = 0; // ALIGNMENT STRENGTH
    this.sep_strength = 0;
  }

  calculateAvg(N) {
    let avg_sin = 0,
      avg_cos = 0,
      avg_p = createVector(0, 0),
      avg_d = createVector(0, 0);
    for (let n of N) {
      if (n != this) {
        avg_p.add(n.pos);

        avg_d.add(n.dir);

        avg_sin += Math.sin(n.dir.heading()) / (N.length - 1);
        avg_cos += Math.cos(n.dir.heading()) / (N.length - 1);
      }
    }
    avg_p.div(N.length - 1);
    avg_d.div(N.length - 1);

    return {
      p: avg_p,
      d: avg_d,
      sin_: avg_sin,
      cos_: avg_cos,
    };
  }

  separateSwarms(N) {
    let separate = createVector(0, 0);
    for (let n of N) {
      if (n != this) {
        if (dist(this.pos.x, this.pos.y, n.pos.x, n.pos.y) <= this.sep_bound) {
          let diff = p5.Vector.sub(n.pos, this.pos);
          separate = separate.sub(diff);
        }
      }
    }
    return separate.div(N.length - 1);
  }

  avgAngle(avg_cos, avg_sin) {
    let avg_angle = Math.atan2(avg_sin, avg_cos);
    avg_angle += Math.random() * 0.5 - 0.25;

    return avg_angle;
  }

  defineDir(previousDir) {
    // INDENTIFY NEIGHBOURS TO CONSIDER
    let N = Scene.neighbours(this.pos, previousDir);

    // CALCULATE THE AVG POS AND ANGLE FOR NEIGHBOURS
    let avgs = this.calculateAvg(N);
    let avg_angle = this.avgAngle(avgs.cos_, avgs.sin_);

    // ANGLE AS AVG OF ALL NEIGHBOURS
    let dir = p5.Vector.fromAngle(avg_angle); // vector given avg angle

    // ADJUST BY ALIGNMENT
    avgs.d.mult(this.align_strength); // how strong should be the moving all in the same direction
    dir.add(avgs.d); // alignment

    // ADJUST BY COHESION
    let cohesion = p5.Vector.sub(avgs.p, this.pos); // direction between this and avg
    cohesion.mult(this.coh_strength); // how string should be the stickiness
    dir.add(cohesion); // it has to move towards the avg of swarm

    // ADJUST BY SEPARATION
    let separate = this.separateSwarms(N);
    separate.mult(this.sep_strength);
    dir.add(separate);

    // PRESERVE SPEED
    let sum_squared = sqrt(dir.magSq()); // magnitude or speed
    dir.div(sum_squared);
    dir.mult(this.speed);
    return dir;
  }

  wrap() {
    if (this.pos.x < 0) this.pos.x += Scene.w;
    if (this.pos.y < 0) this.pos.y += Scene.h;
    if (this.pos.x > Scene.w) this.pos.x -= Scene.w;
    if (this.pos.y > Scene.h) this.pos.y -= Scene.h;
  }

  draw() {
    fill(0);
    ellipse(this.pos.x, this.pos.y, 10, 10);
    // Calculate the position of the arrowhead
    let lineLength = 20;

    let sum_squared = sqrt(this.dir.magSq());

    let arrowheadX = this.pos.x + (this.dir.x / sum_squared) * lineLength;
    let arrowheadY = this.pos.y + (this.dir.y / sum_squared) * lineLength;

    let arrowLength = 5;
    let arrowBaseX = arrowheadX - (this.dir.x / sum_squared) * arrowLength;
    let arrowBaseY = arrowheadY - (this.dir.y / sum_squared) * arrowLength;

    let arrowWidth = 3;
    // Draw the arrowhead as a triangle
    triangle(
      arrowheadX,
      arrowheadY,
      arrowBaseX + arrowWidth * Math.sign(this.dir.x),
      arrowBaseY - arrowWidth * Math.sign(this.dir.y),
      arrowBaseX - arrowWidth * Math.sign(this.dir.x),
      arrowBaseY + arrowWidth * Math.sign(this.dir.y)
    );
    // draw the line between arrowhead and body
    line(this.pos.x, this.pos.y, arrowheadX, arrowheadY);
  }

  step() {
    // if it is the 1st step
    if (this.isFirst) {
      this.dir = p5.Vector.random2D();
      this.dir = this.defineDir(this.dir);
      this.isFirst = false;
    }

    // MAKE A STEP
    this.pos.add(this.dir);

    // DEFINE DIR FOR THE NEXT STEP
    this.dir = this.defineDir(this.dir);

    this.wrap();
  }
}

function calculate_velocity(direction, speed) {
  return direction.copy().mult(speed);
}

function calculate_order(p) {
  let velocity = calculate_velocity(p.dir, p.speed);
  velocity = velocity.normalize();
  return velocity;
}

function setup() {
  createCanvas(Scene.w, Scene.h);
  for (let i of Array(Scene.number_boids)) {
    Scene.swarm.push(new Particle());
  }
}

function respawnParticles() {
  Scene.swarm = [];
  for (let i of Array(Scene.number_boids)) {
    Scene.swarm.push(new Particle());
  }
}

function initPopulation(eps_0, ABC_POPULATION, ABC_POPULATION_SIZE) {
  let k = 0;
  let CURRENT_FITNESS = []
  let tries = 0
  while (k < ABC_POPULATION_SIZE) {
    // draw from uniform prior [0,1]
    let C_STR = Math.random();
    let A_STR = Math.random();
    let S_STR = Math.random();
    respawnParticles();
    for (let p of Scene.swarm) {
      reinitParams(p, C_STR, A_STR, S_STR);
    }

    STEP_COUNT = 0;
    while (STEP_COUNT < STEPS) {
      for (let p of Scene.swarm) {
        p.step();
      }
      // saveCanvas('myCanvas.jpg')
      STEP_COUNT++;
    }
    let order = calculateMetric(); // this way we only consider the last state

    // how far are we from target
    let distance = abs(order - target);

    if (distance < eps_0) {
      ABC_POPULATION.push({ C_STR, A_STR, S_STR });
      CURRENT_FITNESS.push(distance)
      k++;
    }
    tries++
  }
  ACCEPTED_FITNESSES.push(CURRENT_FITNESS)
  TRIES_PER_EPSILON.push(tries)
  return ABC_POPULATION;
}

function reinitParams(p, C_STR, A_STR, S_STR) {
  p.coh_strength = C_STR; // COHESION STRENGTH
  p.align_strength = A_STR; // ALIGNMENT STRENGTH
  p.sep_strength = S_STR;
}

function calculateMetric() {
  let distances = [];
  let velocities = createVector(0, 0);
  for (let p of Scene.swarm) {
    let N = Scene.neighbours(p.pos, p.dir);
    for (let n of N) {
      if (n != this) {
        distance = dist(p.pos.x, p.pos.y, n.pos.x, n.pos.y);
        distances.push(distance);
      }
    }
    // print(distances);
    let sum = 0;
    for (let i = 0; i < distances.length; i++) {
      sum += distances[i];
    }
    let mean = sum / distances.length;
    // print("MEAN:", mean);
    velocities.add(calculate_order(p));
  }
  velocities = velocities.mag();
  let order = velocities / Scene.number_boids;
  return order;
}

let STEPS = 300;
let target = 1; // target of approximation?
let N_POPULATION = 20;
let ABC_POPULATION = [];
let ACCEPTED_STATES = [];
let ACCEPTED_FITNESSES = [];
let TRIES_PER_EPSILON = [];
let EPS_0 = 0.8;

// init 20 accepted individuals (sets of params - drawn from uniform distr)

// this func is a loop over steps
function draw() {
  ABC_POPULATION = initPopulation(EPS_0, ABC_POPULATION, N_POPULATION);
  ACCEPTED_STATES.push(ABC_POPULATION);
  let EPS = [0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  let k = 0;
  let CURRENT_ACCEPTED = [];
  let CURRENT_FITNESS = [];
  for (let e of EPS) {
    k = 0;
    CURRENT_ACCEPTED = [];
    CURRENT_FITNESS = [];
    tries = 0
    while (k < N_POPULATION) {
      //console.log(i);

      respawnParticles();

      // reinint params with given ones
      idx = Math.floor(Math.random() * N_POPULATION);
      //a_idx = Math.floor(Math.random() * N_POPULATION);
      //s_idx = Math.floor(Math.random() * N_POPULATION);

      C_STR_Values = ABC_POPULATION.map((obj) => obj.C_STR);
      A_STR_Values = ABC_POPULATION.map((obj) => obj.A_STR);
      S_STR_Values = ABC_POPULATION.map((obj) => obj.S_STR);

      c_var = calculateVariance(C_STR_Values);
      a_var = calculateVariance(A_STR_Values);
      s_var = calculateVariance(S_STR_Values);

      c_dist = generateRandomNormal(0, c_var);
      a_dist = generateRandomNormal(0, a_var);
      s_dist = generateRandomNormal(0, s_var);

      C_STR = ABC_POPULATION[idx].C_STR + c_dist;
      A_STR = ABC_POPULATION[idx].A_STR + a_dist;
      S_STR = ABC_POPULATION[idx].S_STR + s_dist;

      if (C_STR >= 0 && A_STR >= 0 && S_STR >= 0) {
        for (let p of Scene.swarm) {
          reinitParams(p, C_STR, A_STR, S_STR);
        }

        // TODO HERE WE NEED TO REMOVE PREVIOUS GEN AND RESPAWN PARTICLES !!!!!!!!!!!
        // simulate generation
        STEP_COUNT = 0;

        while (STEP_COUNT < STEPS) {
          background(220);
          for (let p of Scene.swarm) {
            p.step();
            // p.draw();
          }
          // saveCanvas('myCanvas.jpg')
          STEP_COUNT++;
        }

        // sampled data
        let order = calculateMetric(); // this way we only consider the last state

        // how far are we from target
        let distance = abs(order - target);

        console.log(distance);
        // if distance lower then threshold, accept this sample
        if (distance < e) {
          console.log("ACCEPTERD");
          CURRENT_ACCEPTED.push({ C_STR, A_STR, S_STR });
          CURRENT_FITNESS.push(distance)
          k++;
        }
      }
      tries++
      // ACCEPTED_STATES
    }
    ACCEPTED_STATES.push(CURRENT_ACCEPTED);
    ACCEPTED_FITNESSES.push(CURRENT_FITNESS)
    TRIES_PER_EPSILON.push(tries)
    ABC_POPULATION = CURRENT_ACCEPTED;
  }
  console.log(ACCEPTED_STATES);
  console.log(ACCEPTED_FITNESSES);
  console.log(TRIES_PER_EPSILON)
  let writer1 = createWriter("states.json");
  let writer2 = createWriter("fitnesses.txt");
  let writer3 = createWriter("tries.txt");
  json_string = JSON.stringify(ACCEPTED_STATES)
  writer1.print(json_string);
  writer1.close();
  writer2.print(ACCEPTED_FITNESSES);
  writer2.close();
  writer3.print(TRIES_PER_EPSILON);
  writer3.close();

  noLoop(); // Stop further simulations after 20 individuals finished their simulations
}
