document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.guides-carousel');
    const track = document.querySelector('.guides-track');
    const prevButton = document.getElementById('prevGuide');
    const nextButton = document.getElementById('nextGuide');
    
    if (!carousel || !track || !prevButton || !nextButton) return;

    let currentIndex = 0;
    const items = track.querySelectorAll('.guide-card');
    const totalItems = items.length;
    let itemWidth = items[0].offsetWidth + 32; 

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= totalItems - Math.floor(carousel.offsetWidth / itemWidth);
    }
    
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === carousel) {
                if (items.length > 0) {
                    itemWidth = items[0].offsetWidth + 32; 
                    updateCarousel();
                }
            }
        }
    });
    resizeObserver.observe(carousel);

    nextButton.addEventListener('click', () => {
        if (currentIndex < totalItems - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    updateCarousel();

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate__animated').forEach(element => {
        observer.observe(element);
    });

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        let i = 0;
        const speed = 50;

        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
    }
    
    function fetchReviews() {
        return new Promise(resolve => {
            setTimeout(() => {
                const reviews = [
                    { id: 1, user: 'spartan', text: 'blank', stars: 5, avatar: '#' },
                    { id: 2, user: 'spartan', text: "blank", stars: 5, avatar: '#' },
                    { id: 3, user: 'spartan', text: "blank", stars: 5, avatar: '#' },
                    { id: 4, user: 'spartan', text: "blank", stars: 5, avatar: '#' },
                    { id: 5, user: 'spartan', text: "blank", stars: 5, avatar: '#' },
                    { id: 6, user: 'spartan', text: "blank", stars: 5, avatar: '#' },
                    { id: 7, user: 'spartan', text: "blank", stars: 5, avatar: '#' },
                    { id: 8, user: 'spartan', text: "30 came wit a built in switch", stars: 5, avatar: '#' },
                ];
                resolve(reviews);
            }, 1500);
        });
    }

    const reviewsGrid = document.querySelector('.reviews-grid');
    if (reviewsGrid) {
        fetchReviews().then(reviews => {
            reviews.forEach(review => {

            });
        });
    }
});
