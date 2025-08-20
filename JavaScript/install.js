document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeInstallPage();
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

function initializeInstallPage() {
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
    
    if (fileSource && (fileSource.toLowerCase().includes('dns') || fileSource.toLowerCase().includes('nomad'))) {
        document.getElementById('fileSource').textContent = 'Source: sideloading.org';
    } else {
        document.getElementById('fileSource').textContent = `Source: ${fileSource}`;
    }
    
    updateHelpContent();
}

function setupEventListeners() {
    const confirmBtn = document.getElementById('confirmDownload');
    const copyUrlBtn = document.getElementById('copyUrl');
    const cancelBtn = document.getElementById('cancelDownload');
    
    confirmBtn.addEventListener('click', function() {
        startDownload();
    });
    
    copyUrlBtn.addEventListener('click', function() {
        copyDownloadUrl();
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
    const confirmBtn = document.getElementById('confirmDownload');
    
    if (!downloadUrl) {
        console.error('No download URL provided');
        return;
    }
    
    confirmBtn.disabled = false;
}

function startDownload() {
    try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed. Please try again.');
    }
}

function copyDownloadUrl() {
    if (navigator.clipboard && downloadUrl) {
        navigator.clipboard.writeText(downloadUrl).then(function() {
            const copyBtn = document.getElementById('copyUrl');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            copyBtn.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy URL: ', err);
            alert('Failed to copy URL to clipboard');
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = downloadUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('URL copied to clipboard!');
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            alert('Failed to copy URL');
        }
        document.body.removeChild(textArea);
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
