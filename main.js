// Header scroll effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

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
    
    // Manage Spiral Visibility & Drawing
    // Only show spirals when reaching the roadmap section
    if (energySpirals) {
        if (scrollPos > roadmapTop - 400) {
            energySpirals.style.opacity = '1';
        } else {
            energySpirals.style.opacity = '0';
        }

        // Calculate drawing progress specifically from the roadmap start downwards
        const startPos = roadmapTop - 400;
        const totalPath = document.documentElement.scrollHeight - startPos - windowHeight;
        const drawPercent = Math.min(Math.max((scrollPos - startPos) / totalPath, 0), 1);
        const offset = 2000 - (drawPercent * 2000);
        
        spiralPaths.forEach(path => {
            path.style.strokeDashoffset = offset;
        });

        // Move Energy Tip along the central axis (y: 800 to 0)
        if (energyTip) {
            const tipY = 800 - (drawPercent * 800);
            energyTip.setAttribute('cy', tipY);
        }
    }
    
    // Update Backdrop Visibility
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
