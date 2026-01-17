// Main Application Controller
class AppController {
    constructor() {
        this.init();
    }

    init() {
        console.log('EDU-MERIT System Initializing...');
        
        // Check if all required components are loaded
        this.checkDependencies();
        
        // Initialize modules
        this.initializeModules();
        
        // Setup event listeners
        this.setupGlobalEvents();
        
        // Start system checks
        this.startSystemChecks();
        
        console.log('EDU-MERIT System Ready');
    }

    checkDependencies() {
        const required = [
            'CONFIG',
            'apiService',
            'authManager',
            'scannerManager',
            'uiManager'
        ];
        
        let allLoaded = true;
        
        required.forEach(dep => {
            if (!window[dep]) {
                console.error(`Missing dependency: ${dep}`);
                allLoaded = false;
            }
        });
        
        if (!allLoaded) {
            console.warn('Some dependencies missing, system may not function correctly');
        }
        
        return allLoaded;
    }

    initializeModules() {
        // Modules are already initialized by their own classes
        // This is a placeholder for any cross-module initialization
        
        // Check API connection on startup
        setTimeout(() => {
            this.checkAPIConnection();
        }, 2000);
    }

    setupGlobalEvents() {
        // Handle offline/online events
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', (e) => {
            // Cleanup if needed
            if (window.scannerManager && window.scannerManager.isScanning) {
                window.scannerManager.stopScanner();
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    async checkAPIConnection() {
        try {
            const health = await apiService.healthCheck();
            
            if (health && health.status === 'healthy') {
                this.showSystemStatus('connected', 'System Online');
                
                // Update version info if available
                if (health.version) {
                    const versionElements = document.querySelectorAll('.version-info span');
                    versionElements.forEach(el => {
                        if (el.textContent.includes('v2.4.1')) {
                            el.textContent = `v${health.version}`;
                        }
                    });
                }
                
            } else {
                this.showSystemStatus('error', 'API Error');
            }
            
        } catch (error) {
            console.error('API health check failed:', error);
            this.showSystemStatus('error', 'Connection Failed');
        }
    }

    showSystemStatus(status, message) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            
            if (status === 'connected') {
                statusIndicator.classList.add('connected');
            } else if (status === 'error') {
                statusIndicator.style.background = CONFIG.COLORS.error;
            }
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }

    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            authManager.showNotification('Connection restored', 'success');
            this.checkAPIConnection();
        } else {
            authManager.showNotification('You are offline', 'warning');
            this.showSystemStatus('error', 'Offline Mode');
        }
    }

    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + S: Start scanner
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (window.scannerManager && !window.scannerManager.isScanning) {
                window.scannerManager.startScanner();
            }
        }
        
        // Ctrl/Cmd + Q: Stop scanner
        if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
            e.preventDefault();
            if (window.scannerManager && window.scannerManager.isScanning) {
                window.scannerManager.stopScanner();
            }
        }
        
        // Escape: Clear student selection
        if (e.key === 'Escape') {
            if (window.scannerManager && window.scannerManager.currentStudent) {
                window.scannerManager.clearStudentInfo();
                authManager.showNotification('Student selection cleared', 'info');
            }
        }
    }

    startSystemChecks() {
        // Periodic API health checks
        setInterval(() => {
            this.checkAPIConnection();
        }, 60000); // Every minute
        
        // Update stats periodically
        setInterval(() => {
            if (window.uiManager) {
                window.uiManager.updateStats();
            }
        }, 30000); // Every 30 seconds
    }
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're in a supported browser
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.enumerateDevices) {
        alert('Your browser does not support camera access. Please use Chrome, Firefox, or Edge.');
    }
    
    // Initialize the main app controller
    window.appController = new AppController();
    
    // Remove loading class from body
    document.body.classList.remove('loading');
});
