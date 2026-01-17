// API Service for EDU-MERIT System
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) || null;
        this.user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
    }

    // Set authentication token
    setToken(token, userData) {
        this.token = token;
        this.user = userData || {};
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData || {}));
    }

    // Clear token (logout)
    clearToken() {
        this.token = null;
        this.user = {};
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Generic request method
    async request(action, params = {}, method = 'GET') {
        const url = new URL(this.baseUrl);
        
        // Add action parameter
        url.searchParams.append('action', action);
        
        // Add token if available (except for login and health)
        if (this.token && action !== 'login' && action !== 'health') {
            url.searchParams.append('token', this.token);
        }
        
        // Add other parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        console.log(`API ${method}: ${url.toString()}`);
        
        try {
            const options = {
                method: method,
                headers: {
                    'Accept': 'application/json'
                },
                // Important for CORS with Google Apps Script
                mode: 'cors'
            };
            
            const response = await fetch(url, options);
            
            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Log for debugging
            console.log(`API Response (${action}):`, data);
            
            return data;
            
        } catch (error) {
            console.error(`API Request Failed (${action}):`, error);
            
            // Return a structured error response
            return {
                success: false,
                error: error.message,
                message: 'Failed to connect to server. Please check your connection.'
            };
        }
    }

    // === PUBLIC ENDPOINTS ===
    
    // Health check
    async healthCheck() {
        return await this.request('health');
    }

    // Login
    async login(icNumber, password) {
        const result = await this.request('login', {
            icNumber: icNumber,
            password: password
        });
        
        if (result.success && result.token) {
            this.setToken(result.token, result.user);
        }
        
        return result;
    }

    // === PROTECTED ENDPOINTS ===
    
    // Logout
    async logout() {
        try {
            if (this.token) {
                await this.request('logout');
            }
        } finally {
            this.clearToken();
            return { success: true, message: 'Logged out successfully' };
        }
    }

    // Scan student
    async scanStudent(studentId) {
        return await this.request('scanStudent', { studentId: studentId });
    }

    // Add points
    async addPoints(studentId, type, points, reason = '') {
        return await this.request('addPoints', {
            studentId: studentId,
            type: type,
            points: points.toString(),
            reason: reason
        });
    }

    // Get student history
    async getStudentHistory(studentId, limit = 10) {
        return await this.request('getStudentHistory', {
            studentId: studentId,
            limit: limit.toString()
        });
    }

    // Get system stats
    async getSystemStats() {
        return await this.request('getSystemStats');
    }

    // Get recent transactions
    async getRecentTransactions(limit = 10) {
        return await this.request('getRecentTransactions', {
            limit: limit.toString()
        });
    }

    // Generate QR code
    async generateQR(studentId) {
        return await this.request('generateQR', { studentId: studentId });
    }
}

// Create singleton instance
const apiService = new ApiService();
window.apiService = apiService;
