const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.fa-cloud-sun');
const moonIcon = document.querySelector('.fa-cloud-moon');

const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

const hamburgerMenu = document.getElementById('hamburgerMenu');
const slideNavbar = document.getElementById('slideNavbar');
const navbarOverlay = document.getElementById('navbarOverlay');
const navbarClose = document.getElementById('navbarClose');

if (hamburgerMenu && slideNavbar && navbarOverlay && navbarClose) {
    hamburgerMenu.addEventListener('click', () => {
        slideNavbar.classList.add('active');
        navbarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeNavbar = () => {
        slideNavbar.classList.remove('active');
        navbarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    navbarClose.addEventListener('click', closeNavbar);
    navbarOverlay.addEventListener('click', closeNavbar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && slideNavbar.classList.contains('active')) {
            closeNavbar();
        }
    });
}

