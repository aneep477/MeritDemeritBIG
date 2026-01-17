// Configuration for EDU-MERIT System
const CONFIG = {
    // API Configuration - UPDATE WITH YOUR APPS SCRIPT URL
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbyGn6_4MvX7GtdW_1cvjb-1d9MZYQBVwCbzZyTUD2IIXzS0boFFWJuJdKX-fI0DvFW/exec',
    
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
        disableFlip: false
    },
    
    // UI Settings
    THEME: 'industrial',
    
    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'edu_merit_token',
        USER_DATA: 'edu_merit_user',
        LAST_STUDENT: 'edu_merit_last_student'
    },
    
    // Demo Credentials (for testing)
    DEMO_CREDENTIALS: [
        {
            icNumber: '750512086543',
            password: 'sarah',
            name: 'DR. SARAH BINTI HASSAN'
        },
        {
            icNumber: '820309126789',
            password: 'ahmad',
            name: 'PROF. MADYA DR. AHMAD BIN ISMAIL'
        }
    ],
    
    // Colors
    COLORS: {
        merit: '#27ae60',
        demerit: '#e74c3c',
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
