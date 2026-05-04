const header = document.querySelector('header');
// Detect if page has a hero section that requires transparency
const hasHero = document.querySelector('.hero, .about-hero, .knowledge-hero, .contact-hero');
const isHomePage = document.body.classList.contains('home-page');

const updateHeader = () => {
    if (!header) return;
    const scrollPos = window.scrollY;

    // Homepage uses the full hero height as threshold
    // Sub-pages use a much smaller threshold for immediate responsiveness
    const threshold = isHomePage ? (window.innerHeight - 100) : 50;

    if (hasHero) {
        if (scrollPos > threshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    } else {
        header.classList.add('scrolled');
    }
};

// Use both scroll and DOMContentLoaded to ensure robust state on Vercel
window.addEventListener('scroll', updateHeader);
window.addEventListener('DOMContentLoaded', updateHeader);
updateHeader();

// Hamburger Menu Logic
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

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

// Slideshow Logic
let slideIndex = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const slideshowContainer = document.getElementById('whySISlideshow');

if (slides.length > 0) {
    const showSlides = (n) => {
        if (n >= slides.length) slideIndex = 0;
        if (n < 0) slideIndex = slides.length - 1;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[slideIndex].classList.add('active');
        if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    };

    window.currentSlide = (n) => {
        clearInterval(slideInterval);
        slideIndex = n;
        showSlides(slideIndex);
        startSlideShow();
    };

    window.changeSlide = (n) => {
        clearInterval(slideInterval);
        slideIndex += n;
        showSlides(slideIndex);
        startSlideShow();
    };

    const startSlideShow = () => {
        slideInterval = setInterval(() => {
            slideIndex++;
            showSlides(slideIndex);
        }, 6000); // Change slide every 6 seconds
    };

    // Pause on hover
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slideshowContainer.addEventListener('mouseleave', startSlideShow);
    }

    // Initialize
    showSlides(slideIndex);
    startSlideShow();
}
