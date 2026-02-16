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
        text: "Good evening. Welcome to the Orbital Monitor System — a data-driven briefing on humanity's six decades of space launches. Over 15,000 objects have been sent into orbit since 1957. Tonight, we break down the numbers. Initialize the data link to begin.",
        position: 'ufo-pos-default'
    },
    {
        title: "Breaking Down the Numbers",
        text: "Our first chart tracks the annual count of objects launched into orbit. Three eras are visible: the Cold War buildup, the 1990s decline after the USSR collapse, and the dramatic commercial surge beginning around 2018 — driven largely by private mega-constellations.",
        position: 'ufo-pos-right'
    },
    {
        title: "The Space Race Continues",
        text: "This stacked bar chart shows how the superpowers compare. Russia dominated through the 1980s. The United States resurged in the 2020s thanks to commercial operators. China's consistent growth since 2015 marks it as the third major player. Watch the grey 'Rest of World' bar grow in recent years.",
        position: 'ufo-pos-default'
    },
    {
        title: "Mapping the Final Frontier",
        text: "The world map illustrates the global spread of space-faring nations over time. In 1957, only one nation had reached orbit. By 2024, over 80 countries have registered objects in space. Use the slider to watch the map light up decade by decade.",
        position: 'ufo-pos-right'
    },
    {
        title: "Who Owns the Skies",
        text: "This pie chart reveals the all-time national share of objects launched into space. The United States and Russia together account for a commanding majority, but China's rapidly growing slice and the expanding 'All Other Nations' segment show that space is becoming a global enterprise.",
        position: 'ufo-pos-default'
    },
    {
        title: "Inside the Data: 2023",
        text: "Finally, a treemap of the top 25 nations by launch activity in 2023. The size of each block corresponds to the number of objects launched that year. The visual hierarchy makes it immediately clear who the dominant players are — and how many emerging nations are joining the arena.",
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
