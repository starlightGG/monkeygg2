/*--------------------
Vars
--------------------*/
const deg = (a) => (Math.PI / 180) * a;
const rand = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));
const opt = {
particles: window.innerWidth / 1000 ? 50 : 25,
    noiseScale: 0.005,
    angle: (Math.PI / 180) * -90,
    h1: rand(0, 360),
    h2: rand(0, 360),
    s1: rand(20, 90),
    s2: rand(20, 90),
    l1: rand(30, 80),
    l2: rand(30, 80),
    strokeWeight: 1, // Line thickness for the mesh
    tail: 82, 
    // New setting for neighbor connection
    neighbors: 3, 
    maxConnectionDistance: 150, // Only connect if particles are close enough
};

changeTitleColor();

const Particles = [];
let time = 0;
let inGame = false; // Moved to global scope for the event listener

document.body.addEventListener('click', () => {
    if (inGame) {
        return;
    }
    opt.h1 = rand(0, 360);
    opt.h2 = rand(0, 360);
    opt.s1 = rand(20, 90);
    opt.s2 = rand(20, 90);
    opt.l1 = rand(30, 80);
    opt.l2 = rand(30, 80);
    // Use Math.random() for consistency since p5's random() is not global
    opt.angle += deg(rand(60, 60)) * (Math.random() > 0.5 ? 1 : -1); 
    setTimeout(() => {
        changeTitleColor();
    }, 120);

    for (let p of Particles) {
        p.randomize();
    }
});

/*--------------------
Particle (Position Only)
--------------------*/
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lx = x;
        this.ly = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.hueSem = Math.random();
        this.hue = this.hueSem > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
        this.sat = this.hueSem > 0.5 ? opt.s1 : opt.s2;
        this.light = this.hueSem > 0.5 ? opt.l1 : opt.l2;
        this.maxSpeed = this.hueSem > 0.5 ? 3 : 2;
    }

    randomize() {
        this.hueSem = Math.random();
        this.hue = this.hueSem > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
        this.sat = this.hueSem > 0.5 ? opt.s1 : opt.s2;
        this.light = this.hueSem > 0.5 ? opt.l1 : opt.l2;
        this.maxSpeed = this.hueSem > 0.5 ? 3 : 2;
    }

    update() {
        this.follow();

        this.vx += this.ax;
        this.vy += this.ay;

        var p = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        var a = Math.atan2(this.vy, this.vx);
        var m = Math.min(this.maxSpeed, p);
        this.vx = Math.cos(a) * m;
        this.vy = Math.sin(a) * m;

        this.x += this.vx;
        this.y += this.vy;
        this.ax = 0;
        this.ay = 0;

        this.edges();
    }

    follow() {
        let angle =
            noise(this.x * opt.noiseScale, this.y * opt.noiseScale, time * opt.noiseScale) * Math.PI * 0.5 + opt.angle;

        this.ax += Math.cos(angle);
        this.ay += Math.sin(angle);
    }

    updatePrev() {
        this.lx = this.x;
        this.ly = this.y;
    }

    edges() {
        if (this.x < 0) {
            this.x = width;
            this.updatePrev();
        }
        if (this.x > width) {
            this.x = 0;
            this.updatePrev();
        }
        if (this.y < 0) {
            this.y = height;
            this.updatePrev();
        }
        if (this.y > height) {
            this.y = 0;
            this.updatePrev();
        }
    }

    // MODIFIED: No longer renders a shape or trail. It only updates its position.
    render() {
        // This is intentionally left empty
        this.updatePrev(); 
    }
}

/*--------------------
Connection Logic
--------------------*/
function connectParticles() {
    // Stop drawing any fill or shape inside this function
    noFill(); 
    strokeWeight(opt.strokeWeight);

    for (let i = 0; i < Particles.length; i++) {
        let p1 = Particles[i];
        let distances = [];

        // 1. Calculate distances to all other particles
        for (let j = 0; j < Particles.length; j++) {
            if (i === j) continue; // Skip self

            let p2 = Particles[j];
            // Use p5.js built-in function to calculate distance
            let d = dist(p1.x, p1.y, p2.x, p2.y); 

            if (d < opt.maxConnectionDistance) {
                distances.push({ dist: d, particle: p2 });
            }
        }
        
        // 2. Sort by distance (closest first)
        distances.sort((a, b) => a.dist - b.dist);

        // 3. Draw lines to the closest N neighbors
        for (let k = 0; k < Math.min(opt.neighbors, distances.length); k++) {
            let p2 = distances[k].particle;
            let d = distances[k].dist;
            
            // Map the distance to an alpha value (closer = more opaque)
            let alpha = map(d, 0, opt.maxConnectionDistance, 0.8, 0.05);

            // Set stroke color using p1's color and calculated alpha
            stroke(`hsla(${p1.hue}, ${p1.sat}%, ${p1.light}%, ${alpha})`);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }
}


/*--------------------
Setup
--------------------*/
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('particles');

    for (let i = 0; i < opt.particles; i++) {
        Particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
    // Set stroke cap to SQUARE for sharper line ends (optional, can be REMOVE)
    strokeCap(SQUARE);
}

/*--------------------
Draw
--------------------*/
function draw() {
    if (!inGame && document.visibilityState == 'visible') {
        time++;
        // Clear background with low opacity to create faint trails of the mesh
        background(0, 15); 

        for (let p of Particles) {
            p.update();
            // p.render() is intentionally left empty/removed
        }
        
        // NEW: Draw the connecting lines
        connectParticles(); 
    } else {
        background(0);
    }
}

/*--------------------
Resize
--------------------*/
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function changeTitleColor() {
    document.getElementById('title').style.backgroundImage = `linear-gradient(hsl(${opt.h1 + 20}, ${opt.s1}%, ${
        opt.l1
    }%), hsl(${opt.h2}, ${opt.s2}%, ${opt.l2}%))`;
}
