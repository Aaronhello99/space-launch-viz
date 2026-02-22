// alien.js - Presentation Controller & Narrative System (Race-Condition Fixed)

const slides = document.querySelectorAll('.slide');
const indicator = document.getElementById('slide-indicator');
const narratorArea = document.getElementById('narrator-area');
const alienAvatar = document.querySelector('.alien-avatar');
const dialogueBox = document.querySelector('.alien-dialogue-box');
const alienTitle = document.getElementById('alien-title');
const alienMessage = document.getElementById('alien-message');

let currentSlideIndex = 0;
let isMinimized = false;
let isTransitioning = false; // Debounce lock

// -- Narrative Content --
const slideContent = [
    {
        title: "Introduction / Initialise",
        text: "Mission Control is preparing to analyse global space launch data. By connecting to the orbital network, we can investigate how space activity has changed over time. This visualisation explores who is launching rockets, how often missions occur, and what factors are driving the rapid growth of space travel.",
        position: 'ufo-pos-default'
    },
    {
        title: "Overall Launch Activity",
        text: "Early space launches were rare and mostly carried out by government space agencies. Over time, the number of launches gradually increased as technology improved and more countries developed space programs. This shows how space exploration has become more important for communication, research, and global development.",
        position: 'ufo-pos-right'
    },
    {
        title: "Increase Over Time (KEY INSIGHT SLIDE)",
        text: "The data shows a sharp increase in launches starting around the early 2010s. This rapid growth happened when private companies began launching rockets regularly. These companies introduced new technologies that made space travel faster, cheaper, and more efficient.",
        position: 'ufo-pos-default'
    },
    {
        title: "Role of Private Companies",
        text: "Private aerospace companies have transformed the space industry. Companies such as SpaceX developed reusable rockets, which significantly reduced launch costs. This allowed more frequent missions, increasing the total number of global space launches and making space more accessible than ever before.",
        position: 'ufo-pos-right'
    },
    {
        title: "Global Participation",
        text: "Space launches now involve many countries and organisations around the world. Both governments and private companies operate launch sites in different regions. This global participation shows how space exploration has become an international and commercial activity rather than being limited to a few nations.",
        position: 'ufo-pos-default'
    },
    {
        title: "Conclusion / Mission Summary",
        text: "The data reveals that space launch activity has increased dramatically over time, especially due to the rise of private companies and reusable rocket technology. Space exploration is no longer controlled only by governments, but is now driven by innovation, competition, and global demand, marking a new era in human space activity.",
        position: 'ufo-pos-top-left'
    }
];

// -- Slide Management (Race-Condition Proof) --
let transitionTimer = null;

function updateSlide() {
    // Cancel any in-progress transition
    if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
    }

    // Immediately clean up ALL slides
    document.querySelectorAll('.slide').forEach(s => {
        s.classList.remove('active', 'animate-in', 'animate-out');
    });

    const targetIndex = currentSlideIndex;

    // Activate target slide instantly (no animation overlap on rapid clicks)
    const enteringSlide = document.getElementById(`slide-${targetIndex}`);
    if (enteringSlide) {
        enteringSlide.classList.add('active', 'animate-in');
    }

    // Update indicator immediately
    if (indicator) indicator.innerText = `${targetIndex + 1} / ${slides.length}`;

    // Update narrative
    const content = slideContent[targetIndex];
    if (content) {
        animateText(content.title, content.text);
        narratorArea.className = '';
        narratorArea.classList.add(content.position || 'ufo-pos-default');
    }

    // Trigger chart render
    if (window.onSlideChange) window.onSlideChange(targetIndex);

    // Lock briefly to prevent spam
    isTransitioning = true;
    transitionTimer = setTimeout(() => {
        isTransitioning = false;
        transitionTimer = null;
    }, 300);
}

// -- Typewriter Effect --
let typeTimeout;
function animateText(title, text) {
    clearTimeout(typeTimeout);
    alienTitle.innerText = title;
    alienMessage.innerHTML = "";
    if (isMinimized) toggleMinimize(false);

    let i = 0;
    const speed = 12;
    function type() {
        if (i < text.length) {
            alienMessage.innerHTML += text.charAt(i);
            i++;
            typeTimeout = setTimeout(type, speed);
        }
    }
    type();
}

// -- UI Interaction --
function toggleMinimize(forceState = null) {
    if (forceState !== null) isMinimized = forceState;
    else isMinimized = !isMinimized;

    if (isMinimized) {
        dialogueBox.style.display = 'none';
        if (alienAvatar) { alienAvatar.style.opacity = '0.5'; alienAvatar.style.transform = 'scale(0.8)'; }
    } else {
        dialogueBox.style.display = 'flex';
        if (alienAvatar) { alienAvatar.style.opacity = '1'; alienAvatar.style.transform = 'scale(1)'; }
    }
}

document.addEventListener('click', (e) => {
    if (alienAvatar && alienAvatar.contains(e.target)) {
        toggleMinimize();
        return;
    }
    if (dialogueBox.contains(e.target) || e.target.closest('.nav-btn') || e.target.closest('.btn')) {
        return;
    }
    if (!isMinimized) toggleMinimize(true);
});

// -- Navigation Exports --
window.nextSlide = function () {
    if (isTransitioning) return; // Block rapid clicks
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        updateSlide();
    }
};

window.prevSlide = function () {
    if (isTransitioning) return; // Block rapid clicks
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSlide();
    }
};

window.jumpToSlide = function (index) {
    if (isTransitioning) return;
    if (index >= 0 && index < slides.length) {
        currentSlideIndex = index;
        updateSlide();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') window.nextSlide();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') window.prevSlide();
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    const s0 = document.getElementById('slide-0');
    if (s0) {
        s0.classList.add('active', 'animate-in');
    }
    if (indicator) indicator.innerText = `1 / ${slides.length}`;
    const content = slideContent[0];
    if (content) {
        animateText(content.title, content.text);
    }
});
