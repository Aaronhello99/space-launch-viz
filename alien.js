// alien.js - Presentation Controller & Narrative System (ANIMATION FIXED)

const slides = document.querySelectorAll('.slide');
const indicator = document.getElementById('slide-indicator');
const narratorArea = document.getElementById('narrator-area');
const alienAvatar = document.querySelector('.alien-avatar');
const dialogueBox = document.querySelector('.alien-dialogue-box');
const alienTitle = document.getElementById('alien-title');
const alienMessage = document.getElementById('alien-message');

let currentSlideIndex = 0;
let isMinimized = false;

// -- Narrative Content --
const slideContent = [
    {
        title: "Mission Briefing",
        text: "Welcome to the Orbital Monitor System. This dashboard provides a structured analysis of global space launch activity from 1957 to 2024. All data is sourced from the United Nations Office for Outer Space Affairs. Select 'Initialize Data Link' to proceed.",
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
        text: "This choropleth map tracks the cumulative number of objects launched by each nation from 1957 to 2024. Use the timeline slider to observe the progressive expansion of space-faring capabilities from a single nation to over 80 countries with registered orbital objects.",
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

// -- Slide Management --

function updateSlide() {
    // 1. Identify Leaving Slide (Currently Active)
    const leavingSlide = document.querySelector('.slide.active');
    const targetIndex = currentSlideIndex;

    if (leavingSlide) {
        // Trigger Exit Animation
        leavingSlide.classList.add('animate-out');
        leavingSlide.classList.remove('active'); // CSS keeps it visible via animate-out
        leavingSlide.classList.remove('animate-in');
    }

    // 2. Wait for Overlap (500ms) to Warp In next slide
    // Total animation is 0.8s, so 0.3s overlap
    const delay = leavingSlide ? 500 : 0;

    setTimeout(() => {
        // Clean up ALL slides to ensure no stragglers
        document.querySelectorAll('.slide').forEach(s => {
            if (s.id !== `slide-${targetIndex}`) {
                s.classList.remove('active');
                s.classList.remove('animate-in');
                s.classList.remove('animate-out');
                // s.style.opacity = 0; // Handled by CSS class default
            }
        });

        // Activate New Slide
        const enteringSlide = document.getElementById(`slide-${targetIndex}`);
        if (enteringSlide) {
            enteringSlide.classList.add('active');
            enteringSlide.classList.add('animate-in'); // Trigger Entry Animation
        }

        // Logic Updates
        const content = slideContent[targetIndex];
        if (content) {
            animateText(content.title, content.text);
            narratorArea.className = '';
            narratorArea.classList.add(content.position || 'ufo-pos-default');

            if (targetIndex === 2 && window.startViz2Animation) {
                setTimeout(() => window.startViz2Animation(), 1000);
            }
        }

        if (indicator) indicator.innerText = `${targetIndex + 1} / ${slides.length}`;
        if (window.onSlideChange) window.onSlideChange(targetIndex);

    }, delay);
}

// -- Typewriter Effect --
let typeTimeout;
function animateText(title, text) {
    clearTimeout(typeTimeout);
    alienTitle.innerText = `[ ${title} ]`;
    alienMessage.innerHTML = "";
    if (isMinimized) toggleMinimize(false);

    let i = 0;
    const speed = 15;
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
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        updateSlide();
    }
};

window.prevSlide = function () {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSlide();
    }
};

window.jumpToSlide = function (index) {
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
    // Initial State: Slide 0 Active instantly
    const s0 = document.getElementById('slide-0');
    if (s0) {
        s0.classList.add('active');
        s0.classList.add('animate-in');
    }
    updateSlide();
});
