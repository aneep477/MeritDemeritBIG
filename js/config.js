// Configuration for EDU-MERIT System
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbyGn6_4MvX7GtdW_1cvjb-1d9MZYQBVwCbzZyTUD2IIzXzS0boFFWJuJdKX-fI0DvFW/exec',
    
    // System Settings
    SYSTEM_NAME: 'EDU-MERIT',
    VERSION: '2.4.1',
    
    // Scanner Settings
    SCANNER_CONFIG: {
        fps: 10,
        qrbox: {
            width: 250,
            height: 250
        },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true
    },
    
    // UI Settings
    THEME: 'industrial',
    ANIMATION_SPEED: 300,
    
    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'edu_merit_token',
        USER_DATA: 'edu_merit_user',
        LAST_SCAN: 'edu_merit_last_scan',
        SETTINGS: 'edu_merit_settings'
    },
    
    // Point Values
    POINT_VALUES: {
        MERIT: [1, 2, 3, 5, 10],
        DEMERIT: [1, 2, 3, 5, 10]
    },
    
    // Colors
    COLORS: {
        merit: '#27ae60',
        demerit: '#e74c3c',
        primary: '#3498db',
        warning: '#f39c12',
        dark: '#2c3e50'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
