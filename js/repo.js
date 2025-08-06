document.addEventListener('DOMContentLoaded', function() {
    loadRepositories();
    initializeModal();
    initializeSearch();
});

let allRepositories = [];
let allApps = [];
let currentRepoName = '';

async function loadRepositories() {
    const repoGrid = document.getElementById('repoGrid');
    
    try {
        const response = await fetch('json stuff/repo.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repositories = await response.json();
        
        allRepositories = repositories;
        
        repoGrid.innerHTML = '';
        
        repositories.forEach(repo => {
            const repoContainer = createRepoContainer(repo);
            repoGrid.appendChild(repoContainer);
            
            checkRepoAvailability(repo, repoContainer);
        });
        
    } catch (error) {
        console.error('Error loading repositories:', error);
        showErrorState(repoGrid, error.message);
    }
}

function createRepoContainer(repo) {
    const container = document.createElement('div');
    container.className = 'repo-container';
    
    container.innerHTML = `
        <div class="repo-header">
            <div class="repo-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <div class="repo-info">
                <h3 class="repo-name">${repo.name}</h3>
                <p class="repo-url">${repo.url}</p>
            </div>
        </div>
        <div class="repo-status">
            <div class="repo-status-indicator"></div>
            <span>Available</span>
        </div>
    `;
    
    container.addEventListener('click', function() {
        openRepoModal(repo);
    });
    
    return container;
}

function initializeModal() {
    const modal = document.getElementById('repoModal');
    const modalClose = document.getElementById('modalClose');
    
    modalClose.addEventListener('click', function() {
        closeModal();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openRepoModal(repo) {
    const modal = document.getElementById('repoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalSearchContainer = document.getElementById('modalSearchContainer');
    
    modalTitle.textContent = `${repo.name} - Available Apps`;
    currentRepoName = repo.name;
    
    modalSearchContainer.style.display = 'none';
    
    modalBody.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading apps from ${repo.name}...</p>
        </div>
    `;
    
    modal.classList.add('active');
    
    fetchRepoData(repo);
}

function closeModal() {
    const modal = document.getElementById('repoModal');
    modal.classList.remove('active');
}

async function fetchRepoData(repo) {
    const modalBody = document.getElementById('modalBody');
    
    try {
        let repoData = null;
        
        try {
            const response = await fetch(repo.url, {
                method: 'GET',
                mode: 'no-cors'
            });
            
            if (response.type === 'opaque') {
                throw new Error('CORS blocked - trying alternative method');
            }
            
            repoData = await response.json();
        } catch (corsError) {
            console.log('CORS error, trying alternative methods:', corsError);
            
            const corsProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(repo.url)}`;
            
            try {
                const proxyResponse = await fetch(corsProxy);
                if (proxyResponse.ok) {
                    const proxyData = await proxyResponse.json();
                    if (proxyData.contents) {
                        repoData = JSON.parse(proxyData.contents);
                    }
                }
            } catch (proxyError) {
                console.log('Proxy failed, trying JSONP approach:', proxyError);
                
                if (repo.url.includes('githubusercontent.com') || repo.url.includes('raw.githubusercontent.com')) {
                    const githubProxy = `https://raw.githubusercontent.com/${repo.url.split('raw.githubusercontent.com/')[1]}`;
                    try {
                        const githubResponse = await fetch(githubProxy);
                        if (githubResponse.ok) {
                            repoData = await githubResponse.json();
                        }
                    } catch (githubError) {
                        console.log('GitHub proxy also failed:', githubError);
                    }
                }
            }
        }
        
        if (repoData) {
            displayRepoApps(repoData, repo.name);
        } else {
            throw new Error('All fetch methods failed');
        }
        
    } catch (error) {
        console.error('Error fetching repository data:', error);
        
        modalSearchContainer.style.display = 'none';
        modalBody.innerHTML = `
            <div class="error-container">
                <svg viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h3>CORS Restriction Detected</h3>
                <p>The repository ${repo.name} is blocked by browser security policies. Sorry about that!</p>
                <div class="modal-buttons-container" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <a href="${repo.url}" target="_blank" class="ipa-download-btn" style="display: inline-flex; text-decoration: none; justify-content: center; flex: 1;">
                        <svg viewBox="0 0 24 24">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 01 2-2h6"/>
                            <polyline points="15,3 21,3 21,9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        You give it a shot!
                    </a>
                    <button onclick="copyRepoUrl('${repo.url}')" class="ipa-download-btn" style="flex: 1;">
                        <svg viewBox="0 0 24 24">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                        Copy Repository URL
                    </button>
                </div>
            </div>
        `;
    }
}

function displayRepoApps(repoData, repoName) {
    const modalBody = document.getElementById('modalBody');
    const modalSearchContainer = document.getElementById('modalSearchContainer');
    
    let apps = [];
    
    if (repoData.apps) {
        apps = repoData.apps;
    } else if (Array.isArray(repoData)) {
        apps = repoData;
    } else if (repoData.name && repoData.url) {
        apps = [repoData];
    }
    
    allApps = apps;
    
    if (apps.length === 0) {
        modalBody.innerHTML = `
            <div class="error-container">
                <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <h3>No Apps Found</h3>
                <p>Seems like nothing is here...</p>
            </div>
        `;
        return;
    }
    
    modalSearchContainer.style.display = 'block';
    
    const appsGrid = document.createElement('div');
    appsGrid.className = 'ipa-grid';
    
    apps.forEach(app => {
        const appItem = createAppItem(app);
        appsGrid.appendChild(appItem);
    });
    
    modalBody.innerHTML = '';
    modalBody.appendChild(appsGrid);
}

function createAppItem(app) {
    const item = document.createElement('div');
    item.className = 'ipa-item';
    
    const appName = app.name || app.title || 'Unknown App';
    const appDescription = app.description || app.subtitle || 'No description available';
    const appIcon = app.iconURL || app.icon || app.image || '';
    const appUrl = app.url || app.downloadURL || app.download || '';
    const appVersion = app.version || '';
    const appSize = app.size || '';
    
    const fallbackIcon = `
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
        </svg>
    `;
    
    item.innerHTML = `
        <div class="ipa-header">
            <div class="ipa-icon">
                ${appIcon ? `<img src="${appIcon}" alt="${appName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                <div style="display: ${appIcon ? 'none' : 'block'};">
                    ${fallbackIcon}
                </div>
            </div>
            <div class="ipa-info">
                <h3>${appName}</h3>
                <p>${appDescription}</p>
                ${appVersion ? `<small style="color: var(--text-secondary);">v${appVersion}</small>` : ''}
                ${appSize ? `<small style="color: var(--text-secondary); display: block;">${appSize}</small>` : ''}
            </div>
        </div>
        ${appUrl ? `
            <button class="ipa-download-btn" onclick="downloadIPA('${appName}', '${appUrl}')">
                <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download IPA
            </button>
        ` : `
            <button class="ipa-download-btn" disabled style="opacity: 0.5; cursor: not-allowed;">
                <svg viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15,3 21,3 21,9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                No Download Link
            </button>
        `}
    `;
    
    return item;
}

function downloadIPA(appName, appUrl) {
    const button = event.target.closest('.ipa-download-btn');
    
    if (!button || button.disabled) return;
    
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Downloading...
    `;
    
    setTimeout(() => {
        try {
            const link = document.createElement('a');
            link.href = appUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification(`${appName} download initiated!`, 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            showNotification(`Failed to download ${appName}`, 'error');
        }
        
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download IPA
        `;
    }, 1500);
}

function showErrorState(container, errorMessage) {
    container.innerHTML = `
        <div class="error-container">
            <svg viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3>Failed to Load Repositories</h3>
            <p>${errorMessage}</p>
            <button class="retry-btn" onclick="loadRepositories()">Try Again</button>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg viewBox="0 0 24 24">
                    <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z"/>
                </svg>
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .notification-message {
                color: var(--text-primary);
                font-size: 0.9rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                background: var(--border-color);
                color: var(--text-primary);
            }
            
            .notification-close svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
            }
            
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function copyRepoUrl(url) {
    navigator.clipboard.writeText(url).then(function() {
        showNotification('Repository URL copied to clipboard!', 'success');
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        showNotification('Failed to copy URL', 'error');
    });
}

function initializeSearch() {
    const repoSearch = document.getElementById('repoSearch');
    const repoSearchClear = document.getElementById('repoSearchClear');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const searchResultsCount = document.getElementById('searchResultsCount');
    
    repoSearch.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query === '') {
            showAllRepositories();
            repoSearchClear.style.display = 'none';
            searchResultsInfo.style.display = 'none';
        } else {
            const filteredRepos = allRepositories.filter(repo => 
                repo.name.toLowerCase().includes(query) ||
                repo.url.toLowerCase().includes(query)
            );
            
            displayFilteredRepositories(filteredRepos);
            repoSearchClear.style.display = 'block';
            searchResultsInfo.style.display = 'block';
            searchResultsCount.textContent = filteredRepos.length;
        }
    });
    
    repoSearchClear.addEventListener('click', function() {
        repoSearch.value = '';
        showAllRepositories();
        this.style.display = 'none';
        searchResultsInfo.style.display = 'none';
        repoSearch.focus();
    });
    
    const modalAppSearch = document.getElementById('modalAppSearch');
    const modalAppSearchClear = document.getElementById('modalAppSearchClear');
    const modalSearchResultsInfo = document.getElementById('modalSearchResultsInfo');
    const modalSearchResultsCount = document.getElementById('modalSearchResultsCount');
    
    modalAppSearch.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query === '') {
            displayAllApps();
            modalAppSearchClear.style.display = 'none';
            modalSearchResultsInfo.style.display = 'none';
        } else {
            const filteredApps = allApps.filter(app => {
                const appName = (app.name || app.title || '').toLowerCase();
                const appDesc = (app.description || app.subtitle || '').toLowerCase();
                return appName.includes(query) || appDesc.includes(query);
            });
            
            displayFilteredApps(filteredApps);
            modalAppSearchClear.style.display = 'block';
            modalSearchResultsInfo.style.display = 'block';
            modalSearchResultsCount.textContent = filteredApps.length;
        }
    });
    
    modalAppSearchClear.addEventListener('click', function() {
        modalAppSearch.value = '';
        displayAllApps();
        this.style.display = 'none';
        modalSearchResultsInfo.style.display = 'none';
        modalAppSearch.focus();
    });
}

function showAllRepositories() {
    const repoGrid = document.getElementById('repoGrid');
    repoGrid.innerHTML = '';
    
    allRepositories.forEach(repo => {
        const repoContainer = createRepoContainer(repo);
        repoGrid.appendChild(repoContainer);
    });
}

function displayFilteredRepositories(filteredRepos) {
    const repoGrid = document.getElementById('repoGrid');
    repoGrid.innerHTML = '';
    
    if (filteredRepos.length === 0) {
        repoGrid.innerHTML = `
            <div class="error-container" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <h3>No Repositories Found</h3>
                <p>Try adjusting your search terms.</p>
            </div>
        `;
        return;
    }
    
    filteredRepos.forEach(repo => {
        const repoContainer = createRepoContainer(repo);
        repoGrid.appendChild(repoContainer);
    });
}

function displayAllApps() {
    const modalBody = document.getElementById('modalBody');
    const appsGrid = document.createElement('div');
    appsGrid.className = 'ipa-grid';
    
    allApps.forEach(app => {
        const appItem = createAppItem(app);
        appsGrid.appendChild(appItem);
    });
    
    modalBody.innerHTML = '';
    modalBody.appendChild(appsGrid);
}

function displayFilteredApps(filteredApps) {
    const modalBody = document.getElementById('modalBody');
    
    if (filteredApps.length === 0) {
        modalBody.innerHTML = `
            <div class="error-container">
                <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <h3>No Apps Found</h3>
                <p>Try adjusting your search terms.</p>
            </div>
        `;
        return;
    }
    
    const appsGrid = document.createElement('div');
    appsGrid.className = 'ipa-grid';
    
    filteredApps.forEach(app => {
        const appItem = createAppItem(app);
        appsGrid.appendChild(appItem);
    });
    
    modalBody.innerHTML = '';
    modalBody.appendChild(appsGrid);
}

async function checkRepoAvailability(repo, container) {
    const statusIndicator = container.querySelector('.repo-status-indicator');
    const statusText = container.querySelector('.repo-status span');
    
    try {
        const response = await fetch(repo.url, {
            method: 'GET',
            mode: 'no-cors'
        });
        
        if (response.type === 'opaque') {
            throw new Error('CORS blocked');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        statusIndicator.style.background = '#10b981'; // Green
        statusText.textContent = 'Available';
        
    } catch (error) {
        console.log(`Repository ${repo.name} availability check failed:`, error);
        
        try {
            const corsProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(repo.url)}`;
            const proxyResponse = await fetch(corsProxy);
            
            if (proxyResponse.ok) {
                const proxyData = await proxyResponse.json();
                        if (proxyData.contents) {
            statusIndicator.style.background = '#10b981'; // Green
            statusText.textContent = 'Available';
            return;
        }
            }
        } catch (proxyError) {
            console.log('Proxy check also failed:', proxyError);
        }
        
        statusIndicator.style.background = '#ef4444'; // Red
        statusText.textContent = 'Unavailable';
        statusIndicator.style.animation = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const repoContainers = document.querySelectorAll('.repo-container');
    
    repoContainers.forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        container.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}); 
