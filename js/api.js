// API Service for EDU-MERIT System
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) || null;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    }

    // Remove token (logout)
    clearToken() {
        this.token = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    // Generic request method
    async request(endpoint, params = {}, method = 'GET') {
        const url = new URL(this.baseUrl);
        
        // Add action parameter
        url.searchParams.append('action', endpoint);
        
        // Add token if available
        if (this.token && endpoint !== 'login') {
            url.searchParams.append('token', this.token);
        }
        
        // Add other parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!data.success && data.error) {
                throw new Error(data.error);
            }
            
            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    // Health Check
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
            this.setToken(result.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(result.user));
        }
        
        return result;
    }

    // Logout
    async logout() {
        try {
            await this.request('logout');
        } finally {
            this.clearToken();
            localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
            return { success: true };
        }
    }

    // Scan Student
    async scanStudent(studentId) {
        return await this.request('scanStudent', { studentId });
    }

    // Add Points
    async addPoints(studentId, type, points, reason = '') {
        return await this.request('addPoints', {
            studentId: studentId,
            type: type,
            points: points,
            reason: reason
        });
    }

    // Get Student History
    async getStudentHistory(studentId, limit = 20) {
        return await this.request('getStudentHistory', {
            studentId: studentId,
            limit: limit
        });
    }

    // Get System Stats
    async getSystemStats() {
        return await this.request('getSystemStats');
    }

    // Generate QR Code
    async generateQR(studentId) {
        return await this.request('generateQR', { studentId });
    }

    // Get Recent Transactions
    async getRecentTransactions(limit = 10) {
        return await this.request('getRecentTransactions', { limit });
    }
}

// Create singleton instance
const apiService = new ApiService();
