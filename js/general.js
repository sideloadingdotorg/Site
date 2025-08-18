document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainHeader = document.getElementById('mainHeader');
    const mainContent = document.querySelector('main.main-content');
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-nav-link');
    const sections = document.querySelectorAll('section');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    let isSidebarOpen = false;
    let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcons(theme);
    }

    function updateThemeIcons(theme) {
        const lightIcon = themeToggle.querySelector('.light-icon');
        const darkIcon = themeToggle.querySelector('.dark-icon');
        if (lightIcon && darkIcon) {
            if (theme === 'light') {
                lightIcon.style.display = 'inline-block';
                darkIcon.style.display = 'none';
            } else {
                lightIcon.style.display = 'none';
                darkIcon.style.display = 'inline-block';
            }
        }
    }

    // Initialize theme
    setTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(currentTheme);
        });
    }

    function toggleSidebar(action) {
        if (action === 'open' && !isSidebarOpen) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            mainHeader.classList.add('blurred');
            mainContent.classList.add('blurred');
            hamburgerMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            isSidebarOpen = true;
        } else if (action === 'close' && isSidebarOpen) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            mainHeader.classList.remove('blurred');
            mainContent.classList.remove('blurred');
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = '';
            isSidebarOpen = false;
        }
    }

    if (hamburgerMenu && sidebar && sidebarClose && sidebarOverlay) {
        hamburgerMenu.addEventListener('click', () => toggleSidebar('open'));
        sidebarClose.addEventListener('click', () => toggleSidebar('close'));
        sidebarOverlay.addEventListener('click', () => toggleSidebar('close'));
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isSidebarOpen) {
                toggleSidebar('close');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            toggleSidebar('close');
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - mainHeader.offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - mainHeader.offsetHeight - 50) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
