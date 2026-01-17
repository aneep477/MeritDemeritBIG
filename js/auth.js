// Authentication Module
class AuthManager {
    constructor() {
        this.api = apiService;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkExistingSession();
        
        // Setup login form
        this.setupLoginForm();
        
        // Setup logout button
        this.setupLogoutButton();
        
        // Update system time
        this.updateSystemTime();
        setInterval(() => this.updateSystemTime(), 1000);
    }

    checkExistingSession() {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.showAppScreen();
                this.updateUserInfo();
                this.showNotification('Welcome back!', 'success');
                
                // Test API connection
                this.testAPIConnection();
                
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.showLoginScreen();
            }
        } else {
            this.showLoginScreen();
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const icNumber = document.getElementById('icNumber').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!icNumber || !password) {
                this.showNotification('Please enter IC Number and password', 'error');
                return;
            }

            // Show loading
            this.showLoading('Logging in...');
            
            try {
                const result = await this.api.login(icNumber, password);
                
                if (result.success) {
                    this.currentUser = result.user || {};
                    this.showAppScreen();
                    this.updateUserInfo();
                    this.showNotification('Login successful!', 'success');
                    
                    // Test API connection
                    await this.testAPIConnection();
                    
                } else {
                    this.showNotification(result.error || 'Login failed', 'error');
                }
                
            } catch (error) {
                this.showNotification('Connection error. Please try again.', 'error');
                console.error('Login error:', error);
                
            } finally {
                this.hideLoading();
            }
        });

        // Toggle password visibility
        const toggleBtn = document.getElementById('togglePassword');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleBtn.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
        }

        // Auto-fill demo credentials
        this.setupDemoCredentials();
    }

    setupDemoCredentials() {
        const demoSection = document.querySelector('.demo-credentials');
        if (!demoSection) return;

        CONFIG.DEMO_CREDENTIALS.forEach((cred, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-secondary btn-sm';
            btn.textContent = `Demo ${index + 1}`;
            btn.style.margin = '5px';
            
            btn.addEventListener('click', () => {
                document.getElementById('icNumber').value = cred.icNumber;
                document.getElementById('password').value = cred.password;
                this.showNotification(`Demo credentials loaded: ${cred.name}`, 'info');
            });
            
            demoSection.appendChild(btn);
        });
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) return;

        logoutBtn.addEventListener('click', async () => {
            await this.api.logout();
            this.currentUser = null;
            this.showLoginScreen();
            this.showNotification('Logged out successfully', 'success');
        });
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
        document.getElementById('userPanel').style.display = 'none';
        
        // Update API status
        this.updateAPIStatus();
    }

    showAppScreen() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
        document.getElementById('userPanel').style.display = 'flex';
    }

    updateUserInfo() {
        const userName = document.getElementById('currentUserName');
        const userDept = document.getElementById('currentUserDept');
        const userPanelName = document.getElementById('userName');
        
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.name || 'User';
        }
        
        if (userDept && this.currentUser) {
            userDept.textContent = this.currentUser.department || 'Department';
        }
        
        if (userPanelName && this.currentUser) {
            userPanelName.textContent = this.currentUser.name || 'User';
        }
    }

    async testAPIConnection() {
        try {
            const health = await this.api.healthCheck();
            
            const statusIndicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            const apiStatus = document.getElementById('apiStatus');
            
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator connected';
            }
            
            if (statusText) {
                statusText.textContent = 'SYSTEM CONNECTED';
            }
            
            if (apiStatus) {
                apiStatus.textContent = 'Connected';
                apiStatus.style.color = CONFIG.COLORS.success;
            }
            
            return true;
            
        } catch (error) {
            console.error('API connection test failed:', error);
            
            const statusIndicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            const apiStatus = document.getElementById('apiStatus');
            
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator';
            }
            
            if (statusText) {
                statusText.textContent = 'SYSTEM OFFLINE';
            }
            
            if (apiStatus) {
                apiStatus.textContent = 'Disconnected';
                apiStatus.style.color = CONFIG.COLORS.error;
            }
            
            return false;
        }
    }

    updateAPIStatus() {
        const apiStatus = document.getElementById('apiStatus');
        if (!apiStatus) return;

        // Simple ping to check API
        fetch(CONFIG.API_BASE_URL + '?action=health')
            .then(response => {
                if (response.ok) {
                    apiStatus.textContent = 'Connected';
                    apiStatus.style.color = CONFIG.COLORS.success;
                } else {
                    apiStatus.textContent = 'Error';
                    apiStatus.style.color = CONFIG.COLORS.error;
                }
            })
            .catch(() => {
                apiStatus.textContent = 'Offline';
                apiStatus.style.color = CONFIG.COLORS.error;
            });
    }

    updateSystemTime() {
        const timeDisplay = document.getElementById('systemTime');
        const currentDate = document.getElementById('currentDate');
        
        if (timeDisplay) {
            const now = new Date();
            timeDisplay.textContent = now.toLocaleTimeString('ms-MY');
        }
        
        if (currentDate) {
            const now = new Date();
            currentDate.textContent = now.toLocaleDateString('ms-MY', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
