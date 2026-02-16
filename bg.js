// bg.js - Interactive Starfield + Procedural Vector Space Debris (Professional Edition)
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let debris = [];
const STAR_COUNT = 400;
const DEBRIS_COUNT = 10;
const pointer = { x: 0, y: 0 };

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
    initDebris();
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.5,
            size: Math.random() * 1.8 + 0.2,
            opacity: Math.random(),
            speed: Math.random() * 0.15,
            hue: Math.random() > 0.85 ? (Math.random() * 60 + 180) : 0, // 15% tinted blue/cyan
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}

// Procedural debris shapes drawn with vector graphics
const debrisShapes = [
    // Satellite with solar panels
    function (ctx, s) {
        ctx.strokeStyle = `rgba(120, 180, 220, ${s.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.fillStyle = `rgba(80, 130, 180, ${s.alpha * 0.6})`;
        // Body
        ctx.fillRect(-4, -3, 8, 6);
        ctx.strokeRect(-4, -3, 8, 6);
        // Solar panel left
        ctx.fillStyle = `rgba(40, 80, 160, ${s.alpha * 0.8})`;
        ctx.fillRect(-16, -2, 10, 4);
        ctx.strokeRect(-16, -2, 10, 4);
        // Solar panel right
        ctx.fillRect(6, -2, 10, 4);
        ctx.strokeRect(6, -2, 10, 4);
        // Panel lines
        ctx.beginPath();
        ctx.moveTo(-11, -2); ctx.lineTo(-11, 2);
        ctx.moveTo(11, -2); ctx.lineTo(11, 2);
        ctx.stroke();
    },
    // Small satellite / cubesat
    function (ctx, s) {
        ctx.strokeStyle = `rgba(150, 160, 180, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(60, 70, 90, ${s.alpha * 0.7})`;
        ctx.fillRect(-3, -3, 6, 6);
        ctx.strokeRect(-3, -3, 6, 6);
        // Antenna
        ctx.beginPath();
        ctx.moveTo(0, -3); ctx.lineTo(0, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -8, 1.5, 0, Math.PI * 2);
        ctx.stroke();
    },
    // Rocket booster / debris cylinder
    function (ctx, s) {
        ctx.strokeStyle = `rgba(180, 140, 100, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(100, 80, 60, ${s.alpha * 0.5})`;
        ctx.fillRect(-2, -8, 4, 16);
        ctx.strokeRect(-2, -8, 4, 16);
        // Nozzle
        ctx.beginPath();
        ctx.moveTo(-3, 8); ctx.lineTo(-2, 8);
        ctx.moveTo(2, 8); ctx.lineTo(3, 8);
        ctx.stroke();
    },
    // Space station module
    function (ctx, s) {
        ctx.strokeStyle = `rgba(200, 200, 210, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(50, 55, 70, ${s.alpha * 0.6})`;
        // Main cylinder
        ctx.fillRect(-5, -4, 10, 8);
        ctx.strokeRect(-5, -4, 10, 8);
        // Docking port
        ctx.fillRect(-2, -7, 4, 3);
        ctx.strokeRect(-2, -7, 4, 3);
        // Solar array
        ctx.strokeStyle = `rgba(60, 120, 200, ${s.alpha})`;
        ctx.fillStyle = `rgba(30, 70, 140, ${s.alpha * 0.4})`;
        ctx.fillRect(-18, -1, 12, 2);
        ctx.strokeRect(-18, -1, 12, 2);
        ctx.fillRect(6, -1, 12, 2);
        ctx.strokeRect(6, -1, 12, 2);
    },
    // Orbital debris fragment
    function (ctx, s) {
        ctx.strokeStyle = `rgba(140, 140, 150, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.fillStyle = `rgba(80, 80, 90, ${s.alpha * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(4, -2);
        ctx.lineTo(3, 3);
        ctx.lineTo(-2, 5);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
];

function initDebris() {
    debris = [];
    for (let i = 0; i < DEBRIS_COUNT; i++) {
        debris.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.008,
            scale: Math.random() * 1.2 + 0.8,
            shapeIdx: Math.floor(Math.random() * debrisShapes.length),
            alpha: 0
        });
    }
}

let frameCount = 0;

function draw() {
    ctx.clearRect(0, 0, width, height);
    frameCount++;

    // 1. Stars with subtle twinkle
    stars.forEach(star => {
        star.y -= star.speed;
        if (star.y < 0) { star.y = height; star.x = Math.random() * width; }

        const parallaxX = (pointer.x - width / 2) * 0.04 * star.z;
        const parallaxY = (pointer.y - height / 2) * 0.04 * star.z;

        // Flashlight + twinkle
        const dx = (star.x - parallaxX) - pointer.x;
        const dy = (star.y - parallaxY) - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const twinkle = Math.sin(frameCount * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        let alpha = 0.08;
        const radius = 350;
        if (dist < radius) alpha += (1 - dist / radius) * twinkle;

        if (alpha > 0.02) {
            const sx = star.x - parallaxX;
            const sy = star.y - parallaxY;
            ctx.beginPath();
            ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
            if (star.hue > 0) {
                ctx.fillStyle = `hsla(${star.hue}, 60%, 80%, ${Math.min(1, alpha)})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha)})`;
            }
            ctx.fill();
        }
    });

    // 2. Procedural Vector Debris
    debris.forEach(item => {
        item.x += item.vx;
        item.y += item.vy;
        item.rot += item.vrot;

        if (item.x > width + 60) item.x = -60;
        if (item.x < -60) item.x = width + 60;
        if (item.y > height + 60) item.y = -60;
        if (item.y < -60) item.y = height + 60;

        const parallaxX = (pointer.x - width / 2) * 0.08;
        const parallaxY = (pointer.y - height / 2) * 0.08;
        const drawX = item.x - parallaxX;
        const drawY = item.y - parallaxY;

        // Flashlight reveal
        const dx = drawX - pointer.x;
        const dy = drawY - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetAlpha = 0.12;
        const radius = 400;
        if (dist < radius) targetAlpha += (1 - dist / radius) * 0.7;
        item.alpha += (targetAlpha - item.alpha) * 0.05; // smooth fade

        if (item.alpha > 0.03) {
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(item.rot);
            ctx.scale(item.scale, item.scale);
            debrisShapes[item.shapeIdx](ctx, item);
            ctx.restore();
        }
    });

    requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
});

resize();
draw();
