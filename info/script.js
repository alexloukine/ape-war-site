// ========================================
// ApeFortress 2 - Main JavaScript
// ========================================

// Contract Address (change this when you have one)
const CONTRACT_ADDRESS = 'TBA';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initScrollAnimations();
    initLeaderboardTimer();
    initSmoothScroll();
    initProgressiveLoading();
    initParallaxEffects();
    initLightbox();
    initExpandableCards();
    initTrailer();
    initProximityChat();
    updateAllCA();
    document.body.classList.add('loaded');
});

// ========================================
// Proximity Chat Video
// ========================================
function initProximityChat() {
    const video = document.getElementById('proximity-video');
    const unmuteBtn = document.getElementById('unmute-btn');

    if (!video || !unmuteBtn) return;

    unmuteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        unmuteBtn.classList.toggle('unmuted', !video.muted);
    });
}

// ========================================
// Theme Toggle
// ========================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Add transition class for smooth theme change
            document.body.classList.add('theme-transitioning');
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, 300);
        });
    }
}

// ========================================
// Trailer Video with Custom Controls
// ========================================
let trailerLoaded = false;

function initTrailer() {
    const trailer = document.getElementById('trailer-video');
    const overlay = document.getElementById('trailer-play-overlay');
    const wrapper = document.getElementById('trailer-wrapper');

    if (!trailer) return;

    // Load video when it comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !trailerLoaded) {
                loadTrailer();
            }
        });
    }, { rootMargin: '200px' });

    observer.observe(trailer);

    // Hide overlay when video plays
    trailer.addEventListener('play', () => {
        overlay.classList.add('hidden');
        wrapper.classList.add('video-started');
        updatePlayPauseIcon(true);
    });

    // Show overlay when video pauses/ends
    trailer.addEventListener('pause', () => {
        updatePlayPauseIcon(false);
        if (trailer.currentTime === 0 || trailer.ended) {
            overlay.classList.remove('hidden');
        }
    });

    trailer.addEventListener('ended', () => {
        overlay.classList.remove('hidden');
        updatePlayPauseIcon(false);
    });

    // Initialize custom controls
    initCustomControls();
}

function initCustomControls() {
    const trailer = document.getElementById('trailer-video');
    const wrapper = document.getElementById('trailer-wrapper');
    if (!trailer) return;

    // Elements
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressBuffered = document.getElementById('progress-buffered');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlay);
    trailer.addEventListener('click', togglePlay);

    // Volume
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => {
        trailer.volume = e.target.value;
        trailer.muted = false;
        updateVolumeIcon();
        updateVolumeFill();
    });

    // Initialize volume fill
    updateVolumeFill();

    // Progress bar
    trailer.addEventListener('timeupdate', updateProgress);
    trailer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(trailer.duration);
    });
    trailer.addEventListener('progress', updateBuffered);

    // Seek
    progressContainer.addEventListener('click', seek);
    let isDragging = false;
    progressContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        seek(e);
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) seek(e);
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Fullscreen
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

    // Show controls on mouse move
    let controlsTimeout;
    wrapper.addEventListener('mousemove', () => {
        wrapper.classList.add('controls-visible');
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (!trailer.paused) {
                wrapper.classList.remove('controls-visible');
            }
        }, 3000);
    });

    // Keyboard shortcuts
    wrapper.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'k') {
            e.preventDefault();
            togglePlay();
        } else if (e.key === 'f') {
            toggleFullscreen();
        } else if (e.key === 'm') {
            toggleMute();
        } else if (e.key === 'ArrowLeft') {
            trailer.currentTime -= 5;
        } else if (e.key === 'ArrowRight') {
            trailer.currentTime += 5;
        }
    });

    wrapper.setAttribute('tabindex', '0');
}

function togglePlay() {
    const trailer = document.getElementById('trailer-video');
    const overlay = document.getElementById('trailer-play-overlay');

    if (!trailerLoaded) {
        loadTrailer();
    }

    if (trailer.paused) {
        overlay.classList.add('hidden');
        trailer.play();
    } else {
        trailer.pause();
    }
}

function updatePlayPauseIcon(isPlaying) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
}

function toggleMute() {
    const trailer = document.getElementById('trailer-video');
    const volumeSlider = document.getElementById('volume-slider');
    trailer.muted = !trailer.muted;
    if (!trailer.muted && trailer.volume === 0) {
        trailer.volume = 0.5;
        volumeSlider.value = 0.5;
    }
    updateVolumeIcon();
    updateVolumeFill();
}

function updateVolumeFill() {
    const trailer = document.getElementById('trailer-video');
    const volumeSlider = document.getElementById('volume-slider');
    const fillPercent = trailer.muted ? 0 : trailer.volume * 100;
    volumeSlider.style.setProperty('--volume-fill', fillPercent + '%');
}

function updateVolumeIcon() {
    const trailer = document.getElementById('trailer-video');
    const volumeIcon = document.getElementById('volume-icon');
    const muteIcon = document.getElementById('mute-icon');

    if (trailer.muted || trailer.volume === 0) {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
    } else {
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
}

function updateProgress() {
    const trailer = document.getElementById('trailer-video');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');

    if (trailer.duration) {
        const percent = (trailer.currentTime / trailer.duration) * 100;
        progressBar.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(trailer.currentTime);
    }
}

function updateBuffered() {
    const trailer = document.getElementById('trailer-video');
    const progressBuffered = document.getElementById('progress-buffered');

    if (trailer.buffered.length > 0 && trailer.duration) {
        const bufferedEnd = trailer.buffered.end(trailer.buffered.length - 1);
        const percent = (bufferedEnd / trailer.duration) * 100;
        progressBuffered.style.width = percent + '%';
    }
}

function seek(e) {
    const trailer = document.getElementById('trailer-video');
    const progressContainer = document.getElementById('progress-container');

    if (!trailer.duration) return;

    const rect = progressContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    trailer.currentTime = percent * trailer.duration;
}

function toggleFullscreen() {
    const wrapper = document.getElementById('trailer-wrapper');

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function updateFullscreenIcon() {
    const fullscreenIcon = document.getElementById('fullscreen-icon');
    const exitFullscreenIcon = document.getElementById('exit-fullscreen-icon');
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

    if (fullscreenIcon && exitFullscreenIcon) {
        fullscreenIcon.style.display = isFullscreen ? 'none' : 'block';
        exitFullscreenIcon.style.display = isFullscreen ? 'block' : 'none';
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function loadTrailer() {
    const trailer = document.getElementById('trailer-video');
    const source = trailer.querySelector('source');

    if (source && source.dataset.src) {
        source.src = source.dataset.src;
        trailer.load();
        trailerLoaded = true;
    }
}

function playTrailer() {
    const trailer = document.getElementById('trailer-video');
    const overlay = document.getElementById('trailer-play-overlay');

    if (!trailerLoaded) {
        loadTrailer();
    }

    overlay.classList.add('hidden');
    trailer.play();
}

// ========================================
// Expandable Cards
// ========================================
function initExpandableCards() {
    // Feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.classList.add('expandable-card');
        card.addEventListener('click', () => expandCard(card));
    });

    // Mode cards
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.add('expandable-card');
        card.addEventListener('click', () => expandCard(card));
    });

    // Class cards
    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.add('expandable-card');
        card.addEventListener('click', () => expandCard(card));
    });

    // Vehicle cards
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.add('expandable-card');
        card.addEventListener('click', () => expandCard(card));
    });

    // Close on overlay click
    const overlay = document.getElementById('card-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeCardOverlay();
            }
        });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            closeCardOverlay();
        }
    });
}

function expandCard(card) {
    const overlay = document.getElementById('card-overlay');
    const iconImg = document.getElementById('expanded-icon-img');
    const title = document.getElementById('expanded-title');
    const desc = document.getElementById('expanded-desc');
    const statsContainer = document.getElementById('expanded-stats');

    // Get card data
    const cardIcon = card.querySelector('img');
    const cardTitle = card.querySelector('h3');
    const cardDesc = card.querySelector('p');
    const cardStats = card.querySelector('.class-stats');

    if (cardIcon) iconImg.src = cardIcon.src;
    if (cardTitle) title.textContent = cardTitle.textContent;
    if (cardDesc) desc.textContent = cardDesc.textContent;

    // Handle stats for class cards
    if (cardStats) {
        statsContainer.innerHTML = cardStats.innerHTML;
        statsContainer.style.display = 'block';
    } else {
        statsContainer.innerHTML = '';
        statsContainer.style.display = 'none';
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCardOverlay() {
    const overlay = document.getElementById('card-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// Map Lightbox
// ========================================
const mapData = [
    { src: '../assets/images/maps/Archiapelago.jpg', title: 'Archipelago', desc: 'One main island dominates the center with a smaller island accessible by boat where the helicopter spawns. Control the seas and use naval combat to secure air superiority.' },
    { src: '../assets/images/maps/Blizzard.jpg', title: 'Blizzard', desc: 'Frozen urban warfare with giant collapsible skyscrapers. Excellent for tank gameplay and ATVs. Perfect for snipers with countless hiding spots and vantage points across the frozen cityscape.' },
    { src: '../assets/images/maps/Desert Oasis.jpg', title: 'Desert Oasis', desc: 'The biggest map in the game. Vast open dunes and ancient ruins create the perfect playground for helicopters and vehicle warfare. Ruins offer close-quarters combat while the open desert favors mobility.' },
    { src: '../assets/images/maps/Jungle.jpg', title: 'Jungle', desc: 'Dense foliage and hidden dangers. Only ATVs can weave through the thick vegetation. Perfect for sneak attack combat with rivers and destructible cover everywhere.' },
    { src: '../assets/images/maps/Pleasant Valley (Coming soon).jpg', title: 'Pleasant Valley', desc: 'Rolling hills and rural farmland turned into a warzone. Barns, silos, and farmhouses provide cover across the peaceful countryside. Coming soon!' }
];

let currentMapIndex = 0;

function initLightbox() {
    const lightbox = document.getElementById('map-lightbox');
    if (!lightbox) return;

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });
}

function openLightbox(index) {
    currentMapIndex = index;
    const lightbox = document.getElementById('map-lightbox');
    const image = document.getElementById('lightbox-image');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');

    image.src = mapData[index].src;
    title.textContent = mapData[index].title;
    desc.textContent = mapData[index].desc;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('map-lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    currentMapIndex += direction;

    // Loop around
    if (currentMapIndex < 0) {
        currentMapIndex = mapData.length - 1;
    } else if (currentMapIndex >= mapData.length) {
        currentMapIndex = 0;
    }

    const image = document.getElementById('lightbox-image');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');

    image.src = mapData[currentMapIndex].src;
    title.textContent = mapData[currentMapIndex].title;
    desc.textContent = mapData[currentMapIndex].desc;
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
