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

Scene = {
  w: 600,
  h: 600,
  number_boids: 200, //15!!
  swarm: [],
  radius: 50,
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
        if (angleDifference <= this.angle/2) {
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
    this.speed = 5; // SPEED
    this.coh_strength = 0.02; // COHESION STRENGTH
    this.align_strength = 0.6; // ALIGNMENT STRENGTH
    this.sep_bound = 20; // SEPARATION DISTANCE
    this.sep_strength = 1;
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

let COUNT = 0;
let neighbour_distances = [];
let mean_dist = [];
let order_param = [];

function draw() {
  if (COUNT < 300) {
    background(220);
    //p = Scene.swarm[0]
    for (let p of Scene.swarm) {
      p.step();
      //p = Scene.swarm[0]
      /*drawCircle(p.pos.x, p.pos.y, 50)
        x = p.pos.x
        y = p.pos.y
        moveX = p.dir.x
        moveY = p.dir.y
        angleThreshold = (3*Math.PI) /2 
        radius = 50
        const angleStart = Math.atan2(moveY, moveX) - angleThreshold / 2;
      const angleEnd = Math.atan2(moveY, moveX) + angleThreshold / 2;
        drawLine(x, y, x + radius * Math.cos(angleStart), y + radius * Math.sin(angleStart));
        drawLine(x, y, x + radius * Math.cos(angleEnd), y + radius * Math.sin(angleEnd));*/
      p.draw();
    }
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
      neighbour_distances.push(distances);
      let sum = 0;
      for (let i = 0; i < distances.length; i++) {
        sum += distances[i];
      }
      let mean = sum / distances.length;
      mean_dist.push(mean);
      velocities.add(calculate_order(p));
    }
    velocities = velocities.mag();
    velocities = velocities / Scene.number_boids;
    order_param.push(velocities);
    //print(velocities / Scene.number_boids)
    var count_str = String(COUNT);
    //saveCanvas('scene_exp1_${count_str}.jpg')
    COUNT++;
  }
  //if (COUNT == 300) {
  //COUNT++;
  //let writer1 = createWriter("neighbours3.txt");
  //let writer2 = createWriter("means3.txt");
  //let writer3 = createWriter("orders3.txt");
  //writer1.print(neighbour_distances);
  //writer1.close();
  //writer2.print(mean_dist);
  //writer2.close();
  //writer3.print(order_param);
  //writer3.close();
  //}
}