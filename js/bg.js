/*--------------------
Vars
--------------------*/
const deg = (a) => (Math.PI / 180) * a;
const rand = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));
const opt = {
    particles: window.width / 500 ? 250 : 125,
    noiseScale: 0.005,
    angle: (Math.PI / 180) * -90,
    h1: rand(0, 360),
    h2: rand(0, 360),
    s1: rand(20, 90),
    s2: rand(20, 90),
    l1: rand(30, 80),
    l2: rand(30, 80),
    strokeWeight: 2,
    tail: 82,
};

changeTitleColor();

const Particles = [];
let time = 0;
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
    opt.angle += deg(random(60, 60)) * (Math.random() > 0.5 ? 1 : -1);
    setTimeout(() => {
        changeTitleColor();
    }, 120);

    for (let p of Particles) {
        p.randomize();
    }
});

/*--------------------
Particle (Triangle/Polygonal)
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
        // Size determines the side length of the triangle
        this.size = this.hueSem > 0.5 ? 6 : 5; 
    }

    randomize() {
        this.hueSem = Math.random();
        this.hue = this.hueSem > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
        this.sat = this.hueSem > 0.5 ? opt.s1 : opt.s2;
        this.light = this.hueSem > 0.5 ? opt.l1 : opt.l2;
        this.maxSpeed = this.hueSem > 0.5 ? 3 : 2;
        // Update size on randomization
        this.size = this.hueSem > 0.5 ? 6 : 5;
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

    // MODIFIED: Renders a filled triangle centered at (this.x, this.y)
    render() {
        fill(`hsla(${this.hue}, ${this.sat}%, ${this.light}%, .8)`);
        noStroke(); 

        // Temporarily translate and rotate the canvas to draw a triangle centered at (this.x, this.y)
        push();
        translate(this.x, this.y);
        
        // Optional: Rotate the triangle to align with the direction of flow (a)
        let a = Math.atan2(this.vy, this.vx) + deg(90); 
        rotate(a);

        // Define the vertices of the triangle relative to the center (0, 0)
        let s = this.size;
        triangle(
            0, -s,           // Top vertex
            -s * 0.866, s * 0.5, // Bottom-left vertex (0.866 is approx sin(60)/cos(60) factor)
            s * 0.866, s * 0.5  // Bottom-right vertex
        );
        
        pop(); // Restore the original canvas transformation
        this.updatePrev();
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
    // No rectMode or initial stroke settings needed for this triangle setup
}

/*--------------------
Draw
--------------------*/
let inGame = false;
function draw() {
    if (!inGame && document.visibilityState == 'visible') {
        time++;
        // Use a high alpha (95) to ensure distinct, sharp shapes and prevent trails
        background(0, 95); 

        for (let p of Particles) {
            p.update();
            p.render();
        }
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
