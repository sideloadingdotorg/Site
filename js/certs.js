document.addEventListener('DOMContentLoaded', function() {
    loadCertificates();
});

async function loadCertificates() {
    const certsGrid = document.getElementById('certsGrid');
    
    try {
        const response = await fetch('json stuff/certs.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const certificates = await response.json();
        
        certsGrid.innerHTML = '';
        
        certificates.forEach(cert => {
            const certContainer = createCertContainer(cert);
            certsGrid.appendChild(certContainer);
        });
        
    } catch (error) {
        console.error('Error loading certificates:', error);
        showErrorState(certsGrid, error.message);
    }
}

function createCertContainer(cert) {
    const container = document.createElement('div');
    container.className = 'cert-container';
    
    const iconHTML = cert.icon ? 
        `<img src="${cert.icon}" alt="${cert.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
        '';
    
    const fallbackIcon = `
        <svg viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
    `;
    
    container.innerHTML = `
        <div class="cert-header">
            <div class="cert-icon">
                ${iconHTML}
                <div style="display: ${cert.icon ? 'none' : 'flex'}; align-items: center; justify-content: center;">
                    ${fallbackIcon}
                </div>
            </div>
            <div class="cert-info">
                <h3 class="cert-name">${cert.name}</h3>
                <p class="cert-description">${cert.description}</p>
            </div>
        </div>
        <div class="cert-details">
            <span class="cert-type">${cert.type}</span>
            <span class="cert-validity">${cert.validity}</span>
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
