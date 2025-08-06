document.addEventListener('DOMContentLoaded', function() {
    initializeDownloads();
});

function initializeDownloads() {
    console.log('Downloads page initialized');
}

function downloadDNS(type) {
    const button = event.target.closest('.dns-download-btn');
    
    if (!button) return;
    
    button.classList.add('loading');
    button.disabled = true;
    
    setTimeout(() => {
        const dnsConfigs = {
            adguard: {
                name: 'AdGuard DNS',
                servers: ['176.103.130.130', '176.103.130.131'],
                description: 'AdGuard DNS configuration profile'
            },
            cloudflare: {
                name: 'Cloudflare DNS',
                servers: ['1.1.1.1', '1.0.0.1'],
                description: 'Cloudflare DNS configuration profile'
            },
            quad9: {
                name: 'Quad9 DNS',
                servers: ['9.9.9.9', '149.112.112.112'],
                description: 'Quad9 DNS configuration profile'
            }
        };
        
        const config = dnsConfigs[type];
        if (config) {
            const dnsContent = createDNSProfile(config);
            
            const blob = new Blob([dnsContent], { type: 'application/x-apple-aspen-config' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${config.name.replace(/\s+/g, '_')}_DNS.mobileconfig`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification(`${config.name} DNS profile downloaded successfully!`, 'success');
        }
        
        button.classList.remove('loading');
        button.disabled = false;
    }, 1000);
}

function createDNSProfile(config) {
    const profile = {
        PayloadContent: [{
            PayloadType: 'com.apple.dnsProxy.managed',
            PayloadIdentifier: `com.sideloading.dns.${config.name.toLowerCase().replace(/\s+/g, '')}`,
            PayloadUUID: generateUUID(),
            PayloadVersion: 1,
            PayloadDisplayName: config.name,
            PayloadDescription: config.description,
            DNSSettings: {
                DNSProtocol: 'HTTPS',
                ServerAddresses: config.servers
            }
        }],
        PayloadRemovalDisallowed: false,
        PayloadType: 'Configuration',
        PayloadVersion: 1,
        PayloadIdentifier: `com.sideloading.dns.${config.name.toLowerCase().replace(/\s+/g, '')}`,
        PayloadUUID: generateUUID(),
        PayloadDisplayName: `${config.name} DNS Configuration`,
        PayloadDescription: config.description,
        PayloadOrganization: 'SideLoading.org'
    };
    
    return JSON.stringify(profile, null, 2);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
    
    const style = document.createElement('style');
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
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const downloadLinks = document.querySelectorAll('.download-link');
    
    downloadLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
}); 
