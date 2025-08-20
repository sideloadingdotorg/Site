class RepositoryManager {
    constructor() {
        this.repositories = [];
        this.currentRepository = null;
        this.filteredRepositories = [];
        this.filteredApps = [];
        
        this.initializeElements();
        this.loadRepositories();
        this.setupEventListeners();
    }

    initializeElements() {
        this.repoGrid = document.getElementById('repoGrid');
        this.repoSearch = document.getElementById('repoSearch');
        this.repoSearchClear = document.getElementById('repoSearchClear');
        this.searchResultsInfo = document.getElementById('searchResultsInfo');
        this.searchResultsCount = document.getElementById('searchResultsCount');
        
        this.repoModal = document.getElementById('repoModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalClose = document.getElementById('modalClose');
        this.modalBody = document.getElementById('modalBody');

        

    }

    setupEventListeners() {
        let searchTimeout;
        this.repoSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleRepoSearch(e.target.value);
            }, 500);
        });
        this.repoSearchClear.addEventListener('click', () => this.clearRepoSearch());
        

        
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.repoModal.addEventListener('click', (e) => {
            if (e.target === this.repoModal) this.closeModal();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    async loadRepositories() {
        try {
            const response = await fetch('files/repo.json');
            if (!response.ok) throw new Error('Failed to load repositories');
            
            this.repositories = await response.json();
            this.filteredRepositories = [...this.repositories];
            this.renderRepositories();
        } catch (error) {
            console.error('Error loading repositories:', error);
            this.showError('Failed to load repositories. Please try again later.');
        }
    }

    renderRepositories() {
        if (this.filteredRepositories.length === 0) {
                    this.repoGrid.innerHTML = `
            <div class="error-container">
                <i class="fa-solid fa-circle-xmark"></i>
                <h3>No repositories found</h3>
                <p>No repositories match your search criteria.</p>
            </div>
        `;
            return;
        }

        this.repoGrid.innerHTML = this.filteredRepositories.map(repo => `
            <div class="repo-container" data-repo-name="${repo.name}">
                <div class="trace-border"></div>
                <div class="repo-header">
                    <div class="repo-icon">
                        <i class="fa-solid fa-folder"></i>
                    </div>
                    <div class="repo-info">
                        <h3 class="repo-name">${this.escapeHtml(repo.name)}</h3>
                        <p class="repo-url">${this.escapeHtml(repo.url)}</p>
                    </div>
                </div>
                <div class="repo-status">
                    <div class="repo-status-indicator"></div>
                    <span>Click to view apps</span>
                </div>
            </div>
        `).join('');

        this.repoGrid.querySelectorAll('.repo-container').forEach(card => {
            card.addEventListener('click', () => this.openRepository(card.dataset.repoName));
        });
    }

    async openRepository(repoName) {
        const repo = this.repositories.find(r => r.name === repoName);
        if (!repo) return;

        this.currentRepository = repo;
        this.modalTitle.textContent = `${repo.name} - Apps`;
        this.modalBody.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading apps from ${repo.name}...</p>
            </div>
        `;
        
        this.repoModal.classList.add('show');
        
        try {
            await this.loadRepositoryApps(repo);
        } catch (error) {
            console.error('Error loading repository apps:', error);
            this.modalBody.innerHTML = `
                <div class="error-container">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <h3>Failed to load apps</h3>
                    <p>Could not load apps from ${repo.name}. The repository might be unavailable or the format is not supported.</p>
                    <button class="retry-btn" onclick="repositoryManager.openRepository('${repoName}')">Try Again</button>
                </div>
            `;
        }
    }

    async loadRepositoryApps(repo) {
        try {
            const response = await fetch(repo.url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            let apps = [];
            
            if (Array.isArray(data)) {
                apps = data;
            } else if (data.apps && Array.isArray(data.apps)) {
                apps = data.apps;
            } else if (data.data && Array.isArray(data.data)) {
                apps = data.data;
            } else {
                throw new Error('Unsupported repository format');
            }

            this.currentRepository.apps = apps;
            this.filteredApps = apps;
            this.renderApps(apps);
        } catch (error) {
            throw new Error(`Failed to load apps: ${error.message}`);
        }
    }

    renderApps(apps) {
        if (apps.length === 0) {
            this.modalBody.innerHTML = `
                <div class="error-container">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <h3>No apps found</h3>
                    <p>This repository doesn't contain any apps or the format is not supported.</p>
                </div>
            `;
            return;
        }

        this.modalBody.innerHTML = `
            <div class="ipa-grid">
                ${apps.map(app => this.renderAppCard(app)).join('')}
            </div>
        `;
        
        this.modalBody.querySelectorAll('.app-icon').forEach(img => {
            img.addEventListener('error', function() {
                this.parentElement.innerHTML = '<i class="fa-solid fa-mobile-screen"></i>';
            });
        });
    }

    renderAppCard(app) {
        const name = app.name || app.title || 'Unknown App';
        const bundleId = app.bundleIdentifier || app.bundleID || 'Unknown Bundle ID';
        const version = app.version || 'Unknown Version';
        const size = app.size || 'Unknown Size';
        const icon = app.iconURL || app.icon || '';
        const downloadUrl = app.downloadURL || app.download || app.url || '#';
        
        const iconHtml = icon ? 
            `<img src="${icon}" alt="${this.escapeHtml(name)}" class="app-icon">` : 
            '<i class="fa-solid fa-mobile-screen"></i>';
        
        return `
            <div class="ipa-item">
                <div class="ipa-header">
                    <div class="ipa-icon">
                        ${iconHtml}
                    </div>
                    <div class="ipa-info">
                        <h3>${this.escapeHtml(name)}</h3>
                        <p><strong>Bundle ID:</strong> ${this.escapeHtml(bundleId)}</p>
                        <p><strong>Version:</strong> ${this.escapeHtml(version)}</p>
                        <small><strong>Size:</strong> ${this.escapeHtml(size)}</small>
                    </div>
                </div>
                <a href="install.html?url=${encodeURIComponent(downloadUrl)}&name=${encodeURIComponent(name)}&source=${encodeURIComponent(this.currentRepository.name)}" class="ipa-download-btn" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-download"></i>
                    Download IPA
                </a>
            </div>
        `;
    }

    async handleRepoSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredRepositories = [...this.repositories];
            this.searchResultsInfo.style.display = 'none';
            this.renderRepositories();
            return;
        }
        
        this.searchResultsInfo.style.display = 'block';
        this.searchResultsInfo.innerHTML = '<span><i class="fa-solid fa-spinner fa-spin"></i> Searching repositories...</span>';
        
        try {
            const matchingRepos = [];
            
            for (const repo of this.repositories) {
                if (repo.name.toLowerCase().includes(searchTerm) ||
                    repo.url.toLowerCase().includes(searchTerm)) {
                    matchingRepos.push(repo);
                    continue;
                }
                
            
                try {
                    const response = await fetch(repo.url);
                    if (response.ok) {
                        const data = await response.json();
                        let apps = [];
                        
                        if (Array.isArray(data)) {
                            apps = data;
                        } else if (data.apps && Array.isArray(data.apps)) {
                            apps = data.apps;
                        } else if (data.data && Array.isArray(data.data)) {
                            apps = data.data;
                        }
                        
                        const hasMatchingApp = apps.some(app => {
                            const appName = (app.name || app.title || '').toLowerCase();
                            const bundleId = (app.bundleIdentifier || app.bundleID || '').toLowerCase();
                            return appName.includes(searchTerm) || bundleId.includes(searchTerm);
                        });
                        
                        if (hasMatchingApp) {
                            matchingRepos.push(repo);
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to search repository ${repo.name}:`, error);
                }
            }
            
            this.filteredRepositories = matchingRepos;
            this.searchResultsCount.textContent = this.filteredRepositories.length;
            this.searchResultsInfo.innerHTML = `<span id="searchResultsCount">${this.filteredRepositories.length}</span> matches found.`;
            
        } catch (error) {
            console.error('Search error:', error);
            this.searchResultsInfo.innerHTML = '<span>Search failed. Please try again.</span>';
        }
        
        this.repoSearchClear.style.display = searchTerm ? 'block' : 'none';
        this.renderRepositories();
    }



    clearRepoSearch() {
        this.repoSearch.value = '';
        this.handleRepoSearch('');
    }



    closeModal() {
        this.repoModal.classList.remove('show');
        this.currentRepository = null;
        this.filteredApps = [];
    }

    showError(message) {
        this.repoGrid.innerHTML = `
            <div class="error-container">
                <i class="fa-solid fa-circle-xmark"></i>
                <h3>Error</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="retry-btn" onclick="repositoryManager.loadRepositories()">Retry</button>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.repositoryManager = new RepositoryManager();
});
