// bg.js - Interactive Starfield + Space Junk (Restored)
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let junk = [];
const STAR_COUNT = 300;
const pointer = { x: 0, y: 0 };
const JUNK_ICONS = ['🛰️', '☄️', '🌑', '🛸', '⚙️', '👾'];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
    initJunk();
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.5,
            size: Math.random() * 1.5,
            opacity: Math.random(),
            speed: Math.random() * 0.2
        });
    }
}

function initJunk() {
    junk = [];
    for (let i = 0; i < 12; i++) { // 12 floating emojis
        junk.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.02,
            size: Math.random() * 30 + 20,
            icon: JUNK_ICONS[Math.floor(Math.random() * JUNK_ICONS.length)]
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Mouse Parallax Defaults
    const moveX = (pointer.x - width / 2) * 0.02;
    const moveY = (pointer.y - height / 2) * 0.02;

    // 1. Draw Stars
    stars.forEach(star => {
        star.y -= star.speed;
        if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
        }

        const parallaxX = (pointer.x - width / 2) * 0.05 * star.z;
        const parallaxY = (pointer.y - height / 2) * 0.05 * star.z;

        // Flashlight Logic
        const dx = (star.x - parallaxX) - pointer.x;
        const dy = (star.y - parallaxY) - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = 0.1;
        const radius = 300;
        if (dist < radius) alpha += (1 - dist / radius);

        if (alpha > 0) {
            ctx.beginPath();
            ctx.arc(star.x - parallaxX, star.y - parallaxY, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha)})`;
            ctx.fill();
        }
    });

    // 2. Draw Space Junk (Emojis)
    junk.forEach(item => {
        item.x += item.vx;
        item.y += item.vy;
        item.rot += item.vrot;

        if (item.x > width + 50) item.x = -50;
        if (item.x < -50) item.x = width + 50;
        if (item.y > height + 50) item.y = -50;
        if (item.y < -50) item.y = height + 50;

        const parallaxX = (pointer.x - width / 2) * 0.1;
        const parallaxY = (pointer.y - height / 2) * 0.1;
        const drawX = item.x - parallaxX;
        const drawY = item.y - parallaxY;

        // Flashlight Logic for Junk
        const dx = drawX - pointer.x;
        const dy = drawY - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = 0.2; // Junk visible but dim
        const radius = 300;
        if (dist < radius) alpha += (1 - dist / radius);

        if (alpha > 0.05) {
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(item.rot);
            ctx.font = `${item.size}px Arial`;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha)})`;
            ctx.globalAlpha = Math.min(1, alpha);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.icon, 0, 0);
            ctx.restore();
        }
    });

    requestAnimationFrame(draw);
}

// Event Listeners
window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
});

// Init
resize();
draw();
