document.addEventListener('DOMContentLoaded', function() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const embedTitle = document.getElementById('embedTitle');
    const embedIframe = document.getElementById('embedIframe');
    const embedDescription = document.getElementById('embedDescription');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!carouselTrack) return;
    
    let currentSlide = 0;
    const totalSlides = 3;
    
    const carouselData = [
        {
            title: "ricehub",
            iframeSrc: "",
            description: "i forgot the url",
            fullscreenUrl: ""
        },
        {
            title: "eonhub",
            iframeSrc: "https://eonhubapp.com",
            description: "View available certificates and status",
            fullscreenUrl: "https://eonhubapp.com"
        },
        {
            title: "WSF",
            iframeSrc: "https://wsfteam.xyz",
            description: "a guide based website (pretty cool)",
            fullscreenUrl: "https://wsfteam.xyz"
        }
    ];
    
    function generateIndicators() {
        if (carouselIndicators) {
            carouselIndicators.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement('button');
                indicator.className = 'carousel-indicator';
                indicator.setAttribute('data-slide', i);
                indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === 0) indicator.classList.add('active');
                carouselIndicators.appendChild(indicator);
            }
        }
    }
    
    function updateCarouselContent() {
        const data = carouselData[currentSlide];
        
        if (embedTitle) embedTitle.textContent = data.title;
        
        if (embedIframe) {
            embedIframe.src = data.iframeSrc;
            embedIframe.title = `${data.title} Preview`;
        }
        
        if (embedDescription) embedDescription.textContent = data.description;
        
        if (fullscreenBtn) {
            fullscreenBtn.setAttribute('data-url', data.fullscreenUrl);
        }
        
        const indicators = carouselIndicators.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
        
        carouselPrev.disabled = currentSlide === 0;
        carouselNext.disabled = currentSlide === totalSlides - 1;
    }
    
    function goToSlide(slideIndex) {
        currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));
        updateCarouselContent();
    }
    
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateCarouselContent();
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarouselContent();
        }
    }
    
    function setupFullscreenButton() {
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });
        }
    }
    
    if (carouselPrev) carouselPrev.addEventListener('click', prevSlide);
    if (carouselNext) carouselNext.addEventListener('click', nextSlide);
    
    if (carouselIndicators) {
        carouselIndicators.addEventListener('click', function(event) {
            if (event.target.classList.contains('carousel-indicator')) {
                const slideIndex = parseInt(event.target.dataset.slide);
                goToSlide(slideIndex);
            }
        });
    }
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            prevSlide();
        } else if (event.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    let autoAdvanceInterval;
    
    function startAutoAdvance() {
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }
    
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoAdvance);
        carouselContainer.addEventListener('mouseleave', startAutoAdvance);
    }
    
    generateIndicators();
    setupFullscreenButton();
    updateCarouselContent();
    startAutoAdvance();
});
