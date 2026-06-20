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
const roadmapSection = document.querySelector('#si-journey');

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
            const yOffset = -100;
            const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({
                top: y,
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

// Hero Slider Logic
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dot');
let heroSlideIndex = 0;
let heroSlideInterval;

if (heroSlides.length > 0) {
    const showHeroSlides = (n) => {
        if (n >= heroSlides.length) heroSlideIndex = 0;
        if (n < 0) heroSlideIndex = heroSlides.length - 1;

        heroSlides.forEach(slide => {
            slide.style.opacity = '0';
            slide.style.pointerEvents = 'none';
            slide.style.zIndex = '1';
            slide.classList.remove('active');
        });
        
        heroDots.forEach(dot => {
            dot.style.background = 'rgba(255,255,255,0.3)';
            dot.classList.remove('active');
        });

        heroSlides[heroSlideIndex].style.opacity = '1';
        heroSlides[heroSlideIndex].style.pointerEvents = 'auto';
        heroSlides[heroSlideIndex].style.zIndex = '2';
        heroSlides[heroSlideIndex].classList.add('active');
        
        if (heroDots[heroSlideIndex]) {
            heroDots[heroSlideIndex].style.background = '#FFD700';
            heroDots[heroSlideIndex].classList.add('active');
        }
    };

    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(heroSlideInterval);
            heroSlideIndex = index;
            showHeroSlides(heroSlideIndex);
            startHeroSlideShow();
        });
    });

    const startHeroSlideShow = () => {
        heroSlideInterval = setInterval(() => {
            heroSlideIndex++;
            showHeroSlides(heroSlideIndex);
        }, 5000); // Change slide every 5 seconds
    };

    // Initialize
    showHeroSlides(heroSlideIndex);
    startHeroSlideShow();
}

// Infographic Journey Animation Logic
const animatedDials = document.querySelectorAll('.animated-dial');
const journeyPathFill = document.querySelector('.journey-path-fill');
const infographicSection = document.querySelector('#infographic-journey');

// Dial Observer
const dialObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const dial = entry.target.querySelector('.dial-circle');
            const targetPercentage = parseInt(dial.getAttribute('data-percentage'), 10);
            const valueSpan = entry.target.querySelector('.dial-value');
            
            // Start the CSS animation
            dial.style.setProperty('--p', targetPercentage);
            
            // Animate the number counter
            let current = 0;
            const duration = 2000; // 2 seconds
            const intervalTime = 20;
            const steps = duration / intervalTime;
            const increment = targetPercentage / steps;
            
            const counter = setInterval(() => {
                current += increment;
                if (current >= targetPercentage) {
                    current = targetPercentage;
                    clearInterval(counter);
                }
                valueSpan.textContent = Math.round(current) + '%';
            }, intervalTime);
            
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

animatedDials.forEach(dial => dialObserver.observe(dial));


// Interactive Cards Reveal Observer
const revealElements = document.querySelectorAll('.interactive-reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // If it has children cards, stagger them
            const cards = entry.target.querySelectorAll('.interactive-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.15}s`;
                card.classList.add('revealed');
            });
            
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

revealElements.forEach(el => revealObserver.observe(el));

// SVG Path Scroll Animation
// Initialize path lengths
const journeyPathFills = document.querySelectorAll('.journey-path-fill');

if (journeyPathFills.length > 0) {
    journeyPathFills.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });
}

const updateInfographicPath = () => {
    if (!infographicSection || journeyPathFills.length === 0) return;

    const rect = infographicSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Check if section is in view
    if (rect.top <= windowHeight && rect.bottom >= 0) {
        // Calculate scroll percentage through the section
        const currentScroll = windowHeight - rect.top;
        
        // Animate between 10% and 60% of the section to make it move much faster!
        let scrollPercent = (currentScroll - windowHeight * 0.1) / (rect.height * 0.6);
        scrollPercent = Math.min(Math.max(scrollPercent, 0), 1);
        
        journeyPathFills.forEach(path => {
            const pathLength = path.getTotalLength();
            const drawLength = pathLength * scrollPercent;
            path.style.strokeDashoffset = pathLength - drawLength;
        });

        // Mobile timeline animation
        const mobileFill = document.querySelector('.mobile-timeline-fill');
        if (mobileFill) {
            mobileFill.style.height = `${scrollPercent * 100}%`;
        }
    }
};

window.addEventListener('scroll', updateInfographicPath);
// Initial trigger in case it's already in view on load
updateInfographicPath();

// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// Dynamic Reviews Logic
const loadDynamicReviews = async () => {
    const videoContainer = document.getElementById('dynamicVideoReviews');
    const textContainer = document.getElementById('dynamicTextReviews');
    
    if (!videoContainer && !textContainer) return;
    
    try {
        const response = await fetch('./reviews.json');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        
        const reviews = await response.json();
        
        const videoReviews = reviews.filter(r => r.type === 'video');
        const textReviews = reviews.filter(r => r.type === 'text');
        
        if (videoContainer && videoReviews.length > 0) {
            videoContainer.innerHTML = videoReviews.map(review => `
                <div class="video-slide">
                    <div class="z-video-container" style="border-radius: 15px; margin-bottom: 1.5rem;">
                        <video controls preload="metadata">
                            <source src="${review.mediaUrl}" type="video/mp4">
                        </video>
                    </div>
                    <div style="text-align: center; padding: 0 1rem;">
                        <p style="font-style: italic; color: var(--text-dark); margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.6;">"${review.content}"</p>
                        <strong style="color: var(--primary); font-size: 1.1rem; display: block;">${review.name}</strong>
                        <span style="color: var(--text-muted); font-size: 0.9rem;">${review.role || ''}</span>
                    </div>
                </div>
            `).join('');
        }
        
        if (textContainer && textReviews.length > 0) {
            textContainer.innerHTML = textReviews.map(review => `
                <div class="text-review-card">
                    <p style="font-style: italic; color: var(--text-dark); margin-bottom: 1.5rem; line-height: 1.6;">"${review.content}"</p>
                    <div>
                        <strong style="color: var(--secondary); display: block; font-size: 1rem;">${review.name}</strong>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">${review.role || ''}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load dynamic reviews:', error);
    }
};

window.addEventListener('DOMContentLoaded', loadDynamicReviews);

// Contact Form Submission Logic
const contactForms = document.querySelectorAll('#contactForm, .contact-form');
contactForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        let statusDiv = form.querySelector('#contactStatusMessage, .contactStatusMessage');
        
        // If status div doesn't exist in this form, create it dynamically
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = 'contactStatusMessage';
            statusDiv.style.display = 'none';
            statusDiv.style.padding = '1rem';
            statusDiv.style.borderRadius = '8px';
            statusDiv.style.marginTop = '1rem';
            form.appendChild(statusDiv);
        }
        
        const formData = new FormData(form);
        
        // If the form has a "Full Name" instead of firstName/lastName, map it
        if (formData.has('fullName') && !formData.has('firstName')) {
            const names = formData.get('fullName').split(' ');
            formData.set('firstName', names[0]);
            if (names.length > 1) {
                formData.set('lastName', names.slice(1).join(' '));
            }
        }
        // Fallback mapping if input names are missing but placeholders exist
        if (!formData.has('firstName')) {
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (input.placeholder && input.placeholder.toLowerCase().includes('name') && !formData.has('firstName')) {
                    formData.set('firstName', input.value);
                }
                if (input.placeholder && input.placeholder.toLowerCase().includes('email') && !formData.has('email')) {
                    formData.set('email', input.value);
                }
                if (input.tagName === 'TEXTAREA' && !formData.has('message')) {
                    formData.set('message', input.value);
                }
            });
        }
        
        btn.disabled = true;
        btn.innerText = 'Sending...';
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#e2e3e5';
        statusDiv.style.color = '#383d41';
        statusDiv.innerText = 'Processing your request...';

        try {
            const response = await fetch('/submit_contact.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusDiv.style.background = '#d4edda';
                statusDiv.style.color = '#155724';
                statusDiv.innerText = 'Thank you! Your message has been successfully sent.';
                form.reset();
            } else {
                statusDiv.style.background = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.innerText = 'Error: ' + (result.error || 'Failed to send message.');
            }
        } catch (error) {
            statusDiv.style.background = '#f8d7da';
            statusDiv.style.color = '#721c24';
            statusDiv.innerText = 'An unexpected error occurred. Please try again later.';
            console.error('Contact form error:', error);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Send Message';
        }
    });
});
