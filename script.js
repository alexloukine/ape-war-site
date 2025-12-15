// ========================================
// ApeFortress 2 - Main JavaScript
// ========================================

// Contract Address (change this when you have one)
const CONTRACT_ADDRESS = 'TBA';

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar();
    initScrollAnimations();
    initLeaderboardTimer();
    initSmoothScroll();
    initProgressiveLoading();
    initParallaxEffects();
    updateAllCA();
});

// ========================================
// Preloader
// ========================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('loader-progress');

    document.body.classList.add('loading');

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                hidePreloader();
            }, 500);
        }
    }, 200);

    // Fallback: hide preloader after max 3 seconds
    setTimeout(() => {
        hidePreloader();
    }, 3000);
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }
}

// ========================================
// Update all CA displays
// ========================================
function updateAllCA() {
    const caElements = ['ca-nav', 'ca-hero', 'ca-text'];
    caElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = CONTRACT_ADDRESS;
        }
    });
}

// ========================================
// Copy Contract Address
// ========================================
function copyCA() {
    const caText = CONTRACT_ADDRESS;

    if (caText === 'TBA') {
        showNotification('Contract address coming soon!');
        return;
    }

    navigator.clipboard.writeText(caText).then(() => {
        showNotification('Contract address copied!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = caText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Contract address copied!');
    });
}

// Make copyCA available globally
window.copyCA = copyCA;

function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff6b35, #ff8c42);
        color: #0a0a0f;
        padding: 15px 30px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 0.9rem;
        letter-spacing: 1px;
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(255, 107, 53, 0.5);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(notificationStyles);

// ========================================
// Navbar Scroll Effect
// ========================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate stat bars when visible
                if (entry.target.classList.contains('class-card')) {
                    const bars = entry.target.querySelectorAll('.stat-bar div');
                    bars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.width = bar.style.width;
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
        '.feature-card, .mode-card, .class-card, .vehicle-card, .map-card, .token-card, .podium-place'
    );

    animatableElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Section title animations
    const sectionTitles = document.querySelectorAll('.section-title, .section-subtitle');
    sectionTitles.forEach(title => {
        title.classList.add('fade-in');
        observer.observe(title);
    });
}

// ========================================
// Leaderboard Timer
// ========================================
function initLeaderboardTimer() {
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!minutesEl || !secondsEl) return;

    function updateTimer() {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

        const diff = nextHour - now;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// ========================================
// Smooth Scroll for Navigation
// ========================================
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Progressive Loading for Images & Video
// ========================================
function initProgressiveLoading() {
    // Lazy load video
    const video = document.getElementById('hero-video');
    if (video) {
        const source = video.querySelector('source[data-src]');
        if (source) {
            source.src = source.dataset.src;
            video.load();

            video.addEventListener('loadeddata', () => {
                video.classList.add('loaded');
                const placeholder = document.getElementById('video-placeholder');
                if (placeholder) {
                    placeholder.style.opacity = '0';
                }
            });

            video.addEventListener('canplaythrough', () => {
                video.play().catch(() => {});
            });
        }
    }

    // Lazy load images with Intersection Observer
    const lazyImages = document.querySelectorAll('.lazy-image');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Create a new image to preload
                const preloadImg = new Image();
                preloadImg.onload = () => {
                    img.classList.add('loaded');
                    // Hide the placeholder
                    const placeholder = img.previousElementSibling;
                    if (placeholder && placeholder.classList.contains('map-placeholder')) {
                        placeholder.style.opacity = '0';
                    }
                };
                preloadImg.src = img.src;

                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.1
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Fallback for images that might already be cached
    lazyImages.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
            const placeholder = img.previousElementSibling;
            if (placeholder && placeholder.classList.contains('map-placeholder')) {
                placeholder.style.opacity = '0';
            }
        }
    });
}

// ========================================
// Parallax Effects
// ========================================
function initParallaxEffects() {
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${rate}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

// ========================================
// Interactive Hover Effects
// ========================================
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.feature-card, .token-card');

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
});

// ========================================
// Window Load Handler
// ========================================
window.addEventListener('load', () => {
    // Trigger initial animations after preloader
    setTimeout(() => {
        document.querySelectorAll('.hero-content .fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
});

// ========================================
// Mobile Menu Toggle (for future use)
// ========================================
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// ========================================
// Utility Functions
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimized scroll handler
const optimizedScroll = throttle(() => {
    // Additional scroll-based animations can go here
}, 16);

window.addEventListener('scroll', optimizedScroll);
