const header = document.querySelector('header');
// Detect if page has a hero section that requires transparency
const hasHero = document.querySelector('.hero, .about-hero, .knowledge-hero, .contact-hero');

const updateHeader = () => {
    if (!header) return;
    const scrollPos = window.scrollY;
    const heroHeight = window.innerHeight - 100;

    if (hasHero) {
        if (scrollPos > heroHeight) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    } else {
        // If no hero section is detected, always show the background
        header.classList.add('scrolled');
    }
};

// Use both scroll and DOMContentLoaded to ensure robust state on Vercel
window.addEventListener('scroll', updateHeader);
window.addEventListener('DOMContentLoaded', updateHeader);
updateHeader();

// Immersive Kundalini Trisula (Spirals) Scroll Logic
const energySpirals = document.querySelector('.energy-spirals');
const spiralPaths = document.querySelectorAll('.energy-spirals path');
const energyTip = document.querySelector('.energy-tip');
const kundaliniContainer = document.querySelector('.kundalini-container');
const roadmapSection = document.querySelector('#roadmap');

const updateKundalini = () => {
    if (!roadmapSection) return;
    
    const roadmapTop = roadmapSection.offsetTop;
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollPercent = scrollPos / (document.documentElement.scrollHeight - windowHeight);
    
    if (energySpirals) {
        if (scrollPos > roadmapTop - 400) {
            energySpirals.style.opacity = '1';
        } else {
            energySpirals.style.opacity = '0';
        }

        const startPos = roadmapTop - 400;
        const totalPath = document.documentElement.scrollHeight - startPos - windowHeight;
        const drawPercent = Math.min(Math.max((scrollPos - startPos) / totalPath, 0), 1);
        const offset = 2000 - (drawPercent * 2000);
        
        spiralPaths.forEach(path => {
            path.style.strokeDashoffset = offset;
        });

        if (energyTip) {
            const tipY = 800 - (drawPercent * 800);
            energyTip.setAttribute('cy', tipY);
        }
    }
    
    if (kundaliniContainer) {
        const opacity = Math.min(0.1 + (scrollPercent * 0.2), 0.3);
        kundaliniContainer.style.opacity = opacity;
    }
};

window.addEventListener('scroll', updateKundalini);
updateKundalini();

// Journey Roadmap Progress
const journeyWrapper = document.querySelector('.journey-wrapper');
const journeySteps = document.querySelectorAll('.journey-step');

const updateJourneyProgress = () => {
    if (!journeyWrapper) return;
    
    const rect = journeyWrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    if (rect.top < windowHeight && rect.bottom > 0) {
        journeySteps.forEach((step, index) => {
            const stepRect = step.getBoundingClientRect();
            if (stepRect.top < windowHeight * 0.75) {
                step.classList.add('active');
            }
        });
    }
};

window.addEventListener('scroll', updateJourneyProgress);

// Intersection Observer for Section Entry
const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section, .outreach-card, .benefit-row').forEach(el => {
    observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});
