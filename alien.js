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
        title: "Introduction",
        text: "Greetings. I am Aaron. I developed the Orbital Monitor System to provide a comprehensive analysis of human activity in Near-Earth space. This presentation visualizes over six decades of launch data. Please initialize the data link to begin our assessment.",
        position: 'ufo-pos-default'
    },
    {
        title: "Temporal Analysis",
        text: "We begin with a temporal analysis of orbital traffic. The data reveals three distinct epochs: the initial Cold War expansion, a period of stabilization from 1980 to 2010, and the current exponential surge driven by commercial mega-constellations. The verticality of the recent trend line is unprecedented.",
        position: 'ufo-pos-right'
    },
    {
        title: "Entity Tracking",
        text: "This visualization tracks the cumulative output of major launching entities. Observe the red bar (USSR) dominating the early Space Race. White/Cyan (USA) catches up. But watch the 21st century carefully—China's rapid ascent and the sudden explosion of private American companies radically alter the launch landscape.",
        position: 'ufo-pos-default'
    },
    {
        title: "Geospatial Spread",
        text: "Here, we map the global distribution of launch capabilities. In 1957, access to orbit was a duopoly. Today, over 80 nations have registered objects in space. This map illustrates the democratization of orbital access, shifting from a superpower competition to a global enterprise.",
        position: 'ufo-pos-right'
    },
    {
        title: "Market Dominance",
        text: "Despite the proliferation of global actors, this market share analysis reveals a counter-intuitive trend. In the 2020s, the United States has recaptured a level of statistical dominance not seen since the Apollo era, largely due to the high-cadence operations of a single commercial provider.",
        position: 'ufo-pos-default'
    },
    {
        title: "2024 Hierarchy",
        text: "Finally, I present the 2024 launch hierarchy using a Treemap. The 'Global Space Launches' block represents the total volume. Within it, you can see the relative scale of the top 25 active nations. Note the massive visual weight of the leading superpowers compared to the long tail of emerging space nations.",
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

        // SYNC CINEMATICS (Rocket/Astronaut visibility)
        if (window.updateCinematicState) {
            window.updateCinematicState(targetIndex);
        }

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
        alienAvatar.style.opacity = '0.5';
        alienAvatar.style.transform = 'scale(0.8)';
    } else {
        dialogueBox.style.display = 'flex'; // Changed to flex for proper layout
        alienAvatar.style.opacity = '1';
        alienAvatar.style.transform = 'scale(1)';
    }
}

document.addEventListener('click', (e) => {
    if (alienAvatar.contains(e.target)) {
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
