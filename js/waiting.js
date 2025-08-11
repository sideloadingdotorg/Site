document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeWaitingPage();
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }
}

let downloadUrl = '';
let fileName = '';
let fileSource = '';

function initializeWaitingPage() {
    const urlParams = new URLSearchParams(window.location.search);
    downloadUrl = urlParams.get('url') || '';
    fileName = urlParams.get('name') || 'Unknown File';
    fileSource = urlParams.get('source') || 'Unknown Source';
    
    updateFileInfo();
    
    setupEventListeners();
    
    prepareDownload();
}

function updateFileInfo() {
    document.getElementById('fileName').textContent = fileName;
    
    // Set the source text - show sideloading.org for DNS, otherwise use the fileSource
    if (fileSource && (fileSource.toLowerCase().includes('dns') || fileSource.toLowerCase().includes('nomad'))) {
        document.getElementById('fileSource').textContent = 'Source: sideloading.org';
    } else {
        document.getElementById('fileSource').textContent = `Source: ${fileSource}`;
    }
    
    updateHelpContent();
}

function setupEventListeners() {
    const confirmBtn = document.getElementById('confirmDownload');
    const cancelBtn = document.getElementById('cancelDownload');
    
    confirmBtn.addEventListener('click', function() {
        startDownload();
    });
    
    cancelBtn.addEventListener('click', function() {
        window.close();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.close();
        }
    });
}

async function prepareDownload() {
    const statusText = document.getElementById('statusText');
    const confirmBtn = document.getElementById('confirmDownload');
    
    if (!downloadUrl) {
        statusText.textContent = 'Error: No download URL provided';
        return;
    }
    
    // Only check file availability for certificates
    if (fileSource && (fileSource.toLowerCase().includes('cert') || fileSource.toLowerCase().includes('certificate'))) {
        try {
            statusText.textContent = 'Checking file availability...';
            
            const response = await fetch(downloadUrl, { method: 'HEAD' });
            
            if (response.ok) {
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                    const fileSize = formatFileSize(parseInt(contentLength));
                    document.getElementById('fileSize').style.display = 'block';
                    document.getElementById('sizeValue').textContent = fileSize;
                }
                
                statusText.textContent = 'File ready for download';
                confirmBtn.disabled = false;
                
                const statusIndicator = document.getElementById('statusIndicator');
                statusIndicator.innerHTML = '<div class="success-icon" style="width: 40px; height: 40px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;"><svg width="24" height="24" fill="none" stroke="var(--bg-primary)" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
                
            } else {
                statusText.textContent = 'Error: File not available';
                throw new Error('File not available');
            }
        } catch (error) {
            console.error('Error checking file availability:', error);
            statusText.textContent = 'Error: File not available';
            confirmBtn.disabled = false;
        }
    } else {
        // For non-certificate files, skip the check and enable download immediately
        statusText.textContent = 'File ready for download';
        confirmBtn.disabled = false;
        
        const statusIndicator = document.getElementById('statusIndicator');
        statusIndicator.innerHTML = '<div class="success-icon" style="width: 40px; height: 40px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;"><svg width="24" height="24" fill="none" stroke="var(--bg-primary)" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>';
    }
}

function startDownload() {
    const downloadProgress = document.getElementById('downloadProgress');
    const actionButtons = document.querySelector('.action-buttons');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusText = document.getElementById('statusText');
    
    actionButtons.style.display = 'none';
    downloadProgress.style.display = 'block';
    
    statusText.textContent = 'Starting download...';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        if (progress >= 90) {
            clearInterval(progressInterval);
        }
    }, 200);
    
    try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            const mainContent = document.querySelector('.desktop-layout');
            mainContent.style.display = 'none';
            
            const downloadProgress = document.getElementById('downloadProgress');
            downloadProgress.style.display = 'none';
            
            const downloadComplete = document.getElementById('downloadComplete');
            downloadComplete.style.display = 'block';
        }, 1500);
        
    } catch (error) {
        console.error('Download error:', error);
        statusText.textContent = 'Download failed. Please try again.';
        
        actionButtons.style.display = 'flex';
        downloadProgress.style.display = 'none';
    }
}

function completeDownload() {
    const downloadProgress = document.getElementById('downloadProgress');
    const downloadComplete = document.getElementById('downloadComplete');
    const statusText = document.getElementById('statusText');
    
    downloadProgress.style.display = 'none';
    downloadComplete.style.display = 'block';
    statusText.textContent = 'Download completed successfully!';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateHelpContent() {
    const helpContent = document.getElementById('helpContent');
    
    // Normalize the source name for better matching
    const normalizedSource = fileSource.toLowerCase().trim();
    
    if (normalizedSource.includes('cert') || normalizedSource.includes('certificate')) {
        helpContent.innerHTML = `
            <h4>Certificate Installation Guide</h4>
            <p>This file contains a certificate that needs to be installed on your device. Follow these steps:</p>
            
            <div class="platform-tips">
                <div>
                    <h4>For iOS Devices:</h4>
                    <ul>
                        <li>Download the certificate file</li>
                        <li>Go to <strong>Settings > General > VPN & Device Management</strong></li>
                        <li>Tap on the downloaded profile</li>
                        <li>Tap <strong>Install</strong> and follow the prompts</li>
                        <li>Enter your device passcode when prompted</li>
                    </ul>
                </div>
                
                <div>
                    <h4>For macOS:</h4>
                    <ul>
                        <li>Double-click the downloaded certificate file</li>
                        <li>Add it to your <strong>Keychain Access</strong></li>
                        <li>Set the trust level to <strong>Always Trust</strong></li>
                    </ul>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> Only install certificates from trusted sources. This certificate has been vetted by sideloading.org.
            </div>
        `;
    } else if (normalizedSource.includes('dns') || normalizedSource.includes('nomad')) {
        helpContent.innerHTML = `
            <h4>DNS Configuration Profile</h4>
            <p>This file contains a DNS configuration profile for enhanced privacy and ad blocking.</p>
            
            <div class="platform-tips">
                <div>
                    <h4>Installation Steps:</h4>
                    <ul>
                        <li>Download the configuration profile</li>
                        <li>Go to <strong>Settings > General > VPN & Device Management</strong></li>
                        <li>Tap on the downloaded profile</li>
                        <li>Tap <strong>Install</strong> and follow the prompts</li>
                        <li>Enter your device passcode when prompted</li>
                    </ul>
                </div>
                
                <div>
                    <h4>What This Does:</h4>
                    <ul>
                        <li>Routes your DNS queries through privacy-focused servers</li>
                        <li>Blocks ppq.apple.com (stops you from downlading things on full protection mode)</li>
                        <li>Blocks known ad and tracking domains</li>
                        <li>Improves browsing speed and security</li>
                    </ul>
                </div>
            </div>
            
            <div class="info">
                <strong>ℹ️ Note:</strong> This DNS profile will help block ads and improve privacy. You can remove it anytime from Settings.
            </div>
        `;
    } else if (normalizedSource.includes('repo') || normalizedSource.includes('ipa') || normalizedSource.includes('repository')) {
        helpContent.innerHTML = `
            <h4>IPA File Installation</h4>
            <p>This is an iOS application package (IPA) file that can be installed on your device.</p>
            
            <div class="platform-tips">
                <div>
                    <h4>Method 1: AltStore (Recommended)</h4>
                    <ul>
                        <li>Install AltStore on your computer</li>
                        <li>Connect your iOS device via USB</li>
                        <li>Drag and drop the IPA file to AltStore</li>
                        <li>The app will install on your device</li>
                    </ul>
                </div>
                
                <div>
                    <h4>Method 2: Sideloading (hey thats us!)</h4>
                    <ul>
                        <li>Download the ipa</li>
                        <li>Grab a certificate</li>
                        <li>Head on over to a signer</li>
                        <li>Follow the installation prompts</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        helpContent.innerHTML = `
            <p>Select your download source to see specific help and instructions.</p>
            <p>Available sources include:</p>
            <ul>
                <li><strong>Certificates:</strong> For installing security certificates</li>
                <li><strong>DNS Profiles:</strong> For DNS configuration profiles</li>
                <li><strong>IPA Files:</strong> For iOS application packages</li>
            </ul>
        `;
    }
}



window.addEventListener('focus', function() {
    if (downloadUrl) {
        prepareDownload();
    }
});

function autoCloseAfterDelay() {
    setTimeout(() => {
        if (document.getElementById('downloadComplete').style.display !== 'none') {
            window.close();
        }
    }, 5000);
}
