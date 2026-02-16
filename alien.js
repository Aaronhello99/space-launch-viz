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
        title: "Mission Briefing",
        text: "Welcome to the Orbital Monitor System. This dashboard provides a structured analysis of global space launch activity from 1957 to 2025. All data is sourced from the United Nations Office for Outer Space Affairs. Select 'Initialize Data Link' to proceed.",
        position: 'ufo-pos-default'
    },
    {
        title: "Temporal Analysis",
        text: "This chart plots the annual count of objects launched into outer space over the past six decades. Notable inflection points include the Cold War peak, the post-Soviet decline in the early 1990s, and the significant acceleration beginning in 2018 driven by commercial constellation deployments.",
        position: 'ufo-pos-right'
    },
    {
        title: "Comparative Analysis",
        text: "A stacked bar chart comparing launch volume across four categories: the United States, Russia, China, and all remaining nations combined. The visualization highlights the shift from a US–Russia duopoly to a multipolar landscape with China as a major contributor and the 'Rest of World' segment expanding steadily.",
        position: 'ufo-pos-default'
    },
    {
        title: "Geospatial Distribution",
        text: "This choropleth map tracks the cumulative number of objects launched by each nation from 1957 to 2025. Use the timeline slider to observe the progressive expansion of space-faring capabilities from a single nation to over 80 countries with registered orbital objects.",
        position: 'ufo-pos-right'
    },
    {
        title: "National Market Share",
        text: "The proportional breakdown of all objects ever launched into orbit, segmented by nation. The United States accounts for the dominant share, followed by Russia and China. Hover over each segment for detailed figures. The centre annotation displays the aggregate total across all nations.",
        position: 'ufo-pos-default'
    },
    {
        title: "Cumulative Rankings",
        text: "A horizontal bar chart ranking the top 15 nations by total objects launched across all recorded years. This provides a direct comparison of each country's cumulative contribution to orbital activity, sorted from highest to lowest.",
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
    alienTitle.innerText = `[ ${title} ]`;
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
