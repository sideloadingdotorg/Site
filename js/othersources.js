document.addEventListener('DOMContentLoaded', function() {
    initializePage();

    addSmoothScrolling();
    
    addCardHoverEffects();
    
    addExternalLinkTracking();
    
    handleImageErrors();
});

function initializePage() {
    console.log('Othersources page initialized');
    
    const cards = document.querySelectorAll('.source-card, .community-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function addSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function addCardHoverEffects() {
    const sourceCards = document.querySelectorAll('.source-card');
    
    sourceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                this.style.transform = 'translateY(-4px) scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                }, 150);
            }
        });
    });
}

function handleImageErrors() {
    const sourceLogos = document.querySelectorAll('.source-logo');
    
    sourceLogos.forEach(logo => {
        logo.addEventListener('error', function() {
            this.classList.add('error');
            console.log('Image failed to load:', this.src);
        });
        
        logo.addEventListener('load', function() {
            this.classList.remove('error');
        });
    });
}

function addExternalLinkTracking() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const originalText = this.textContent;
            this.textContent = 'Opening...';
            
            setTimeout(() => {
                this.textContent = originalText;
            }, 1000);

            // console.log('External link clicked:', this.href); <-- not sure if u wanna add this later but im not.
        });
    });
}

function addSearchFunctionality() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search sources...';
    searchInput.className = 'search-input';
    
    const sourcesGrid = document.querySelector('.sources-grid');
    if (sourcesGrid) {
        sourcesGrid.parentNode.insertBefore(searchInput, sourcesGrid);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const sourceCards = document.querySelectorAll('.source-card');
            
            sourceCards.forEach(card => {
                const title = card.querySelector('.source-title').textContent.toLowerCase();
                const description = card.querySelector('.source-description').textContent.toLowerCase();
                const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
                card.style.display = matches ? 'block' : 'none';
                card.style.opacity = matches ? '1' : '0';
                card.style.transform = matches ? 'translateY(0)' : 'translateY(20px)';
            });
        });
    }
}

function addFilterFunctionality() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="filter-buttons">
            <button class="filter-btn" data-filter="free">Free</button>
            <button class="filter-btn" data-filter="open-source">Open Source</button>
            <button class="filter-btn" data-filter="cross-platform">Cross Platform</button>
            <button class="filter-btn" data-filter="ipa">ipa</button>
            <button class="filter-btn" data-filter="ads">ads</button>
        </div>
    `;
    
    const sourcesGrid = document.querySelector('.sources-grid');
    if (sourcesGrid) {
        sourcesGrid.parentNode.insertBefore(filterContainer, sourcesGrid);
        
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        let activeFilters = new Set();
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    activeFilters.delete(filter);
                } else {
                    this.classList.add('active');
                    activeFilters.add(filter);
                }
                
                if (activeFilters.size === 0) {
                    const sourceCards = document.querySelectorAll('.source-card');
                    sourceCards.forEach(card => {
                        card.style.display = 'block';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                    return;
                }

                const sourceCards = document.querySelectorAll('.source-card');
                sourceCards.forEach(card => {
                    const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

                    const matchesFilter = Array.from(activeFilters).some(filter => {
                        return tags.some(tag => tag.includes(filter.replace('-', ' ')));
                    });
                    
                    if (matchesFilter) {
                        card.style.display = 'block';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                    }
                });
            });
        });
    }
}

function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const sourceCards = document.querySelectorAll('.source-card');
        const focusedCard = document.querySelector('.source-card:focus');
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (focusedCard) {
                const nextCard = focusedCard.nextElementSibling;
                if (nextCard && nextCard.classList.contains('source-card')) {
                    nextCard.focus();
                }
            } else if (sourceCards.length > 0) {
                sourceCards[0].focus();
            }
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (focusedCard) {
                const prevCard = focusedCard.previousElementSibling;
                if (prevCard && prevCard.classList.contains('source-card')) {
                    prevCard.focus();
                }
            } else if (sourceCards.length > 0) {
                sourceCards[sourceCards.length - 1].focus();
            }
        }
    });

    const sourceCards = document.querySelectorAll('.source-card');
    sourceCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {    
     addSearchFunctionality();
     addFilterFunctionality();
     addKeyboardNavigation();
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.source-card, .community-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}); 
