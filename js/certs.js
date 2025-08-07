document.addEventListener('DOMContentLoaded', function() {
    loadCertificates();
    setupSearch();
});

let allCertificates = [];

async function loadCertificates() {
    const certsGrid = document.getElementById('certsGrid');
    
    try {
        const response = await fetch('json stuff/certs.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allCertificates = await response.json();
        
        displayCertificates(allCertificates);
        
    } catch (error) {
        console.error('Error loading certificates:', error);
        showErrorState(certsGrid, error.message);
    }
}

function displayCertificates(certificates) {
    const certsGrid = document.getElementById('certsGrid');
    
    certsGrid.innerHTML = '';
    
    if (certificates.length === 0) {
        certsGrid.innerHTML = `
            <div class="no-results">
                <svg viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <h3>No certificates found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }
    
    certificates.forEach(cert => {
        const certContainer = createCertContainer(cert);
        certsGrid.appendChild(certContainer);
    });
}

function createCertContainer(cert) {
    const container = document.createElement('div');
    container.className = 'cert-container';
    
    const zipIcon = `
        <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <polyline points="14,2 14,8 20,8"/>
            <path d="M10 12H8v2h2v-2z"/>
            <path d="M12 12h2v2h-2v-2z"/>
            <path d="M14 12h2v2h-2v-2z"/>
            <path d="M8 16h2v2H8v-2z"/>
            <path d="M10 16h2v2h-2v-2z"/>
            <path d="M12 16h2v2h-2v-2z"/>
            <path d="M14 16h2v2h-2v-2z"/>
        </svg>
    `;
    
    container.innerHTML = `
        <div class="cert-header">
            <div class="cert-icon">
                <div style="display: flex; align-items: center; justify-content: center;">
                    ${zipIcon}
                </div>
            </div>
            <div class="cert-info">
                <h3 class="cert-name">${cert.name.replace(/\.zip$/i, '')}</h3>
            </div>
        </div>
        <button class="cert-download-btn" onclick="downloadCertificate('${cert.name}', '${cert.download_url}')">
            <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Certificate
        </button>
    `;
    
    container.addEventListener('click', function(e) {
        if (!e.target.closest('.cert-download-btn')) {
            downloadCertificate(cert.name, cert.download_url);
        }
    });
    
    return container;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const resultsCount = document.getElementById('resultsCount');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query === '') {
            displayCertificates(allCertificates);
            clearSearchBtn.style.display = 'none';
            searchResultsInfo.style.display = 'none';
            return;
        }
        
        const filteredCertificates = allCertificates.filter(cert => 
            cert.name.toLowerCase().includes(query)
        );
        
        displayCertificates(filteredCertificates);
        
        clearSearchBtn.style.display = 'block';
        searchResultsInfo.style.display = 'block';
        resultsCount.textContent = filteredCertificates.length;
    });
    
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        displayCertificates(allCertificates);
        this.style.display = 'none';
        searchResultsInfo.style.display = 'none';
        searchInput.focus();
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            displayCertificates(allCertificates);
            clearSearchBtn.style.display = 'none';
            searchResultsInfo.style.display = 'none';
        }
    });
}

function downloadCertificate(certName, downloadUrl) {
    const button = event.target.closest('.cert-download-btn');
    
    if (!button) return;
    
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
            link.href = downloadUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification(`${certName} download initiated!`, 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            showNotification(`Failed to download ${certName}`, 'error');
        }
        
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Certificate
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
            <h3>Failed to Load Certificates</h3>
            <p>${errorMessage}</p>
            <button class="retry-btn" onclick="loadCertificates()">Try Again</button>
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

document.addEventListener('DOMContentLoaded', function() {
    const certContainers = document.querySelectorAll('.cert-container');
    
    certContainers.forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        container.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}); 
