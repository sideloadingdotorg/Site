document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backButton');
    const projectEmbed = document.getElementById('projectEmbed');
    const prevButton = document.getElementById('prevProject');
    const nextButton = document.getElementById('nextProject');
    const projectSlides = document.querySelectorAll('.project-slide');
    const fullscreenButton = document.getElementById('fullscreenButton');
    
    let currentIndex = 0;
    const totalProjects = projectSlides.length;

    const projectSlider = document.querySelector('.project-slider');
    const slideWidth = 100 / totalProjects;
    
    projectSlider.style.width = `${totalProjects * 100}%`;
    projectSlides.forEach(slide => {
        slide.style.flex = `0 0 ${slideWidth}%`;
    });

    backButton.addEventListener('click', function() {
        window.close();
    });

    fullscreenButton.addEventListener('click', function() {
        const currentSlide = projectSlides[currentIndex];
        const projectUrl = currentSlide.getAttribute('data-url');
        window.open(projectUrl, '_blank');
    });

    function goToProject(index) {
        if (index < 0 || index >= totalProjects) return;
        
        const projectSlider = document.querySelector('.project-slider');
        const slideWidth = 100 / totalProjects;
        const translateX = -(index * slideWidth);
        projectSlider.style.transform = `translateX(${translateX}%)`;

        projectSlides.forEach(slide => slide.classList.remove('active'));
        projectSlides[index].classList.add('active');
        
        const activeSlide = projectSlides[index];
        const projectUrl = activeSlide.getAttribute('data-url');
        const projectName = activeSlide.getAttribute('data-project');
        
        projectEmbed.src = projectUrl;
        
        document.title = projectName.charAt(0).toUpperCase() + projectName.slice(1);
        
        const metaDescription = document.querySelector('meta[property="og:description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', `Visit ${projectName} for iOS sideloading tools and resources`);
        }
        
        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) {
            metaTitle.setAttribute('content', projectName.charAt(0).toUpperCase() + projectName.slice(1));
        }
        
        prevButton.disabled = index === 0;
        nextButton.disabled = index === totalProjects - 1;
        
        currentIndex = index;
    }

    prevButton.addEventListener('click', function() {
        if (currentIndex > 0) {
            goToProject(currentIndex - 1);
        }
    });

    nextButton.addEventListener('click', function() {
        if (currentIndex < totalProjects - 1) {
            goToProject(currentIndex + 1);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            goToProject(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < totalProjects - 1) {
            goToProject(currentIndex + 1);
        }
    });

    prevButton.disabled = true;
    goToProject(0);
});
