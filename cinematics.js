// cinematics.js - REAL PHYSICS ENGINE & HAND-DRAWN GRAPHICS
// Features: Rigid Body Physics, PID Landing Controller, Procedural Sketching

const cCanvas = document.createElement('canvas');
cCanvas.id = 'cinematics-layer';
cCanvas.style.position = 'fixed';
cCanvas.style.top = '0';
cCanvas.style.left = '0';
cCanvas.style.width = '100%';
cCanvas.style.height = '100%';
cCanvas.style.zIndex = '9999';
cCanvas.style.pointerEvents = 'none';
document.body.appendChild(cCanvas);

const cCtx = cCanvas.getContext('2d');
let cWidth, cHeight;

function resizeCinematics() {
    cWidth = cCanvas.width = window.innerWidth;
    cHeight = cCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCinematics);
resizeCinematics();

// -- PHYSICS CONSTANTS --
const GRAVITY = 9.81 * 0.05; // Scaled for pixels
const DRAG_COEFF = 0.02;
const THRUST_POWER = 0.8;

// -- HAND DRAWN HELPERS --
function drawSketchLine(ctx, x1, y1, x2, y2, color, thickness = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';

    // Draw lighter "sketch" line
    ctx.beginPath();
    ctx.moveTo(x1 + (Math.random() - 0.5) * 2, y1 + (Math.random() - 0.5) * 2);
    ctx.lineTo(x2 + (Math.random() - 0.5) * 2, y2 + (Math.random() - 0.5) * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.stroke();

    // Draw main line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.globalAlpha = 1.0;
    ctx.stroke();
}

// -- PARTICLE SYSTEM (Exhaust) --
class PhysicsParticle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.02;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(255, ${Math.floor(this.life * 200)}, 50, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4 * this.life, 0, Math.PI * 2);
        ctx.fill();
    }
}

// -- ROCKET: RIGID BODY + PID CONTROLLER --
class Rocket {
    constructor() {
        this.x = cWidth / 2;
        this.y = cHeight - 100;
        this.vy = 0;
        this.vx = 0;
        this.mass = 100;
        this.angle = 0;
        this.thrust = 0;
        this.fuel = 1000;

        this.state = 'IDLE'; // IDLE, LAUNCH, ORBIT, LANDING, LANDED
        this.particles = [];
    }

    applyPhysics() {
        // Gravity
        this.vy += GRAVITY;

        // Thrust
        if (this.thrust > 0) {
            const ax = Math.sin(this.angle) * this.thrust;
            const ay = -Math.cos(this.angle) * this.thrust;
            this.vx += ax;
            this.vy += ay;

            // Particles
            for (let i = 0; i < 3; i++) {
                this.particles.push(new PhysicsParticle(
                    this.x + (Math.random() - 0.5) * 10,
                    this.y + 60,
                    this.vx * 0.5 + (Math.random() - 0.5),
                    this.vy * 0.5 + 5 + Math.random() * 5
                ));
            }
        }

        // Drag
        this.vx *= (1 - DRAG_COEFF);
        this.vy *= (1 - DRAG_COEFF);

        // Position
        this.x += this.vx;
        this.y += this.vy;
    }

    control() {
        if (this.state === 'IDLE') {
            this.thrust = 0;
            this.y = cHeight - 100; // Stick to ground
            this.vy = 0;
        }
        else if (this.state === 'LAUNCH') {
            // Full Throttle Up
            this.thrust = THRUST_POWER * 1.5;
            // Random Jitter
            this.x = cWidth / 2 + (Math.random() - 0.5) * 2;

            if (this.y < -200) {
                this.state = 'ORBIT';
                this.y = -200; // Hold off screen
                this.vy = 0;
                this.thrust = 0;
            }
        }
        else if (this.state === 'LANDING') {
            // PID CONTROLLER FOR SOFT LANDING
            const targetY = cHeight - 150;
            const targetVel = 0;

            // Error Terms
            const errorY = targetY - this.y;
            const errorVel = targetVel - this.vy;

            // PID Constants (Tuned for 60fps)
            const kP = 0.02;
            const kD = 0.8;

            let output = (errorY * kP) - (this.vy * kD);

            // Feedforward Gravity Compensation
            output += GRAVITY;

            // Clamp Thrust
            this.thrust = Math.max(0, Math.min(output * 10, THRUST_POWER * 2)); // Dynamic Thrust

            // Cutoff
            if (Math.abs(errorY) < 5 && Math.abs(this.vy) < 0.5) {
                this.state = 'LANDED';
                this.thrust = 0;
                this.y = targetY;
                this.vy = 0;
            }
        }
        else if (this.state === 'LANDED') {
            this.thrust = 0;
            this.vy = 0; // Stick
            this.x = cWidth / 2;
        }
    }

    update() {
        this.control();
        if (this.state !== 'ORBIT' && this.state !== 'LANDED') this.applyPhysics();

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx) {
        // Draw Particles first
        for (let p of this.particles) p.draw(ctx);

        if (this.state === 'ORBIT') return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle); // Currently 0, but ready for rotation logic

        // HAND DRAWN STYLE
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;

        // Fins
        drawSketchLine(ctx, -20, 30, -40, 60, '#ff0055');
        drawSketchLine(ctx, -40, 60, -20, 50, '#ff0055');
        drawSketchLine(ctx, 20, 30, 40, 60, '#ff0055');
        drawSketchLine(ctx, 40, 60, 20, 50, '#ff0055');

        // Body (Rect approx)
        drawSketchLine(ctx, -20, -40, -20, 50, '#fff'); // Left wall
        drawSketchLine(ctx, 20, -40, 20, 50, '#fff');   // Right wall
        drawSketchLine(ctx, -20, 50, 20, 50, '#fff');   // Base

        // Nose Cone
        drawSketchLine(ctx, -20, -40, 0, -80, '#fff');
        drawSketchLine(ctx, 20, -40, 0, -80, '#fff');

        // Window
        ctx.beginPath();
        ctx.arc(0, -20, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2ff';
        ctx.fill();
        ctx.stroke();

        // Thrust Flame (Main)
        if (this.thrust > 0.1) {
            const flameLen = this.thrust * 40;
            drawSketchLine(ctx, -10, 55, 0, 55 + flameLen + Math.random() * 20, '#ffaa00', 4);
            drawSketchLine(ctx, 10, 55, 0, 55 + flameLen + Math.random() * 20, '#ffaa00', 4);
        }

        ctx.restore();
    }
}

const rocket = new Rocket();

// -- MAIN LOOP --
function animate() {
    cCtx.clearRect(0, 0, cWidth, cHeight);

    rocket.update();
    rocket.draw(cCtx);

    requestAnimationFrame(animate);
}
animate();

// -- STATE INTERFACE --
window.updateCinematicState = function (slideIndex) {
    console.log("CINEMATIC STATE UPDATE:", slideIndex);

    // Logic Mapping
    if (slideIndex === 0) {
        rocket.state = 'IDLE';
    }
    else if (slideIndex === 1) {
        // Slide 1 = Launch Slide
        rocket.state = 'LAUNCH';
    }
    else if (slideIndex === 2) {
        // Slide 2 = Landing Slide
        // Prepare for landing: Set start position at top
        if (rocket.state !== 'LANDING' && rocket.state !== 'LANDED') {
            rocket.y = -200;
            rocket.vy = 2; // Initial push down
            rocket.state = 'LANDING';
        }
    }
    // else keep standard physics?
};
