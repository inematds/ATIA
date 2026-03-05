// ATIA - Main JavaScript
// Frontend Interactivity

/* ========================================
   MOBILE MENU
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Close menu on ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    /* ========================================
       SMOOTH SCROLL
       ======================================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ========================================
       SCROLL ANIMATIONS
       ======================================== */

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all level cards and stat cards
    document.querySelectorAll('.level-card, .stat-card').forEach(el => {
        observer.observe(el);
    });

    /* ========================================
       EXTERNAL LINKS
       ======================================== */

    // Add target="_blank" and icon to external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.hostname.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    /* ========================================
       LAZY LOADING IMAGES
       ======================================== */

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /* ========================================
       TOPIC EXPANSION SYSTEM (FEP Pattern)
       ======================================== */

    // Toggle topic explanations using event delegation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.topic-button')) {
            const button = e.target.closest('.topic-button');
            const topicItem = button.closest('.topic-item');
            const explanation = topicItem.querySelector('.topic-explanation');

            if (explanation) {
                // Toggle (mostra/esconde) a explicação
                explanation.classList.toggle('hidden');

                // COMPORTAMENTO ACCORDION: Fecha outras explicações abertas no mesmo card
                const chapterCard = topicItem.closest('.chapter-card');
                if (chapterCard) {
                    chapterCard.querySelectorAll('.topic-explanation').forEach(exp => {
                        if (exp !== explanation) {
                            exp.classList.add('hidden');
                        }
                    });
                }
            }
        }
    });

});

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Debounce function for performance
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

// Get query parameter
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Storage helpers
const Storage = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};

console.log('🎓 ATIA loaded successfully');
