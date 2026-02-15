// complex_simulation.js - HYPERSPACE GRAPHICS ENGINE
// 1. Spawns CPU Burners (Background)
// 2. Renders Hyperspace Tunnel (Visual "Cool Factor" + GPU Load)

// -- 1. CPU MELT (Workers) --
const threadCount = navigator.hardwareConcurrency || 8;
const workers = [];
for (let i = 0; i < threadCount; i++) {
    const w = new Worker('worker.js');
    w.postMessage('start');
    workers.push(w);
}

// -- 2. HYPERSPACE VISUALIZER (Main Thread) --
const canvas = document.createElement('canvas');
canvas.id = 'hyperspace-layer';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '1'; // Behind UI but visible (Space Junk is typically z-0 or z-1)
// Let's put this at z-index 5 to sit BEHIND charts but IN FRONT of starfield?
// Actually if starfield is z-0, charts are z-10. This is z-1.
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let width, height, cx, cy;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
}
window.addEventListener('resize', resize);
resize();

const STARS = 2000;
const speed = 20;
const stars = [];

class WarpStar {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = initial ? Math.random() * 2000 : 2000; // Depth
        this.pz = this.z; // Previous Z for trail
        this.color = Math.random() > 0.8 ? '#00f2ff' : (Math.random() > 0.5 ? '#ff0055' : '#ffffff');
    }

    update() {
        this.pz = this.z;
        this.z -= speed;

        if (this.z < 1) {
            this.reset();
        }
    }

    draw() {
        const sx = (this.x / this.z) * 500 + cx;
        const sy = (this.y / this.z) * 500 + cy;

        const px = (this.x / this.pz) * 500 + cx;
        const py = (this.y / this.pz) * 500 + cy;

        // Clip
        if (sx < 0 || sx > width || sy < 0 || sy > height) return;

        const r = (1 - this.z / 2000) * 3;

        ctx.beginPath();
        ctx.lineWidth = r;
        ctx.strokeStyle = this.color;
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
    }
}

// Init
for (let i = 0; i < STARS; i++) stars.push(new WarpStar());

function animate() {
    // Clear with Fade for extra motion blur feel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter'; // Additive blending for "Glow"

    stars.forEach(s => {
        s.update();
        s.draw();
    });

    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
}

animate();
