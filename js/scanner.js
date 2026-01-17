// QR Code Scanner Module
class ScannerManager {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.currentStudent = null;
        this.init();
    }

    init() {
        // Setup scanner controls
        this.setupScannerControls();
        
        // Setup manual input
        this.setupManualInput();
        
        // Setup action buttons
        this.setupActionButtons();
    }

    setupScannerControls() {
        const startBtn = document.getElementById('startScannerBtn');
        const stopBtn = document.getElementById('stopScannerBtn');
        const cameraStatus = document.getElementById('cameraStatus');
        const cameraStatusText = document.getElementById('cameraStatusText');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startScanner());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopScanner());
        }

        // Update camera status display
        this.updateCameraStatus = () => {
            if (cameraStatus) {
                cameraStatus.className = 'status-dot ' + (this.isScanning ? 'active' : '');
            }
            if (cameraStatusText) {
                cameraStatusText.textContent = this.isScanning ? 'ACTIVE' : 'OFF';
            }
        };
    }

    async startScanner() {
        if (this.isScanning) return;

        try {
            // Check if Html5QrcodeScanner is available
            if (typeof Html5QrcodeScanner === 'undefined') {
                throw new Error('QR Scanner library not loaded');
            }

            // Check camera permissions
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length === 0) {
                throw new Error('No camera found');
            }

            // Create scanner instance
            this.scanner = new Html5QrcodeScanner(
                "qrReader",
                {
                    fps: CONFIG.SCANNER_CONFIG.fps,
                    qrbox: CONFIG.SCANNER_CONFIG.qrbox,
                    aspectRatio: CONFIG.SCANNER_CONFIG.aspectRatio
                },
                false
            );

            // Start scanning
            this.scanner.render(
                (decodedText) => this.handleScanResult(decodedText),
                (error) => this.handleScanError(error)
            );

            this.isScanning = true;
            this.updateCameraStatus();
            
            // Update button states
            document.getElementById('startScannerBtn').disabled = true;
            document.getElementById('stopScannerBtn').disabled = false;
            
            authManager.showNotification('Scanner started successfully', 'success');

        } catch (error) {
            console.error('Scanner error:', error);
            authManager.showNotification(`Scanner error: ${error.message}`, 'error');
            
            // Fallback: show manual input
            document.getElementById('manualStudentId').focus();
        }
    }

    stopScanner() {
        if (!this.isScanning || !this.scanner) return;

        try {
            this.scanner.clear();
            this.scanner = null;
            this.isScanning = false;
            this.updateCameraStatus();
            
            // Clear scanner display
            const qrReader = document.getElementById('qrReader');
            if (qrReader) {
                qrReader.innerHTML = '';
            }
            
            // Update button states
            document.getElementById('startScannerBtn').disabled = false;
            document.getElementById('stopScannerBtn').disabled = true;
            
            authManager.showNotification('Scanner stopped', 'info');
            
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    }

    handleScanResult(decodedText) {
        console.log('QR Code scanned:', decodedText);
        
        // Try to parse JSON if it's a structured QR code
        let studentId = decodedText;
        
        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.system === 'EDU-MERIT' && parsed.studentId) {
                studentId = parsed.studentId;
            }
        } catch (e) {
            // Not JSON, use raw text
            studentId = decodedText.trim();
        }
        
        // Validate student ID format
        if (!studentId || studentId.length < 3) {
            authManager.showNotification('Invalid QR code format', 'error');
            return;
        }
        
        // Process student
        this.processStudent(studentId);
        
        // Optional: stop scanner after successful scan
        // this.stopScanner();
    }

    handleScanError(error) {
        console.error('Scan error:', error);
        // Don't show error for normal operation
    }

    setupManualInput() {
        const searchBtn = document.getElementById('searchStudentBtn');
        const manualInput = document.getElementById('manualStudentId');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const studentId = manualInput.value.trim();
                if (studentId) {
                    this.processStudent(studentId);
                } else {
                    authManager.showNotification('Please enter Student ID', 'warning');
                }
            });
        }

        if (manualInput) {
            manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const studentId = manualInput.value.trim();
                    if (studentId) {
                        this.processStudent(studentId);
                    }
                }
            });
        }
    }

    async processStudent(studentId) {
        if (!studentId) return;

        authManager.showLoading('Loading student data...');

        try {
            const result = await apiService.scanStudent(studentId);
            
            if (result.success && result.student) {
                this.currentStudent = result.student;
                this.displayStudentInfo();
                authManager.showNotification(`Student found: ${result.student.name}`, 'success');
                
                // Save last student
                localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_STUDENT, studentId);
                
            } else {
                authManager.showNotification(result.error || 'Student not found', 'error');
                this.clearStudentInfo();
            }
            
        } catch (error) {
            console.error('Error processing student:', error);
            authManager.showNotification('Failed to load student data', 'error');
            
        } finally {
            authManager.hideLoading();
        }
    }

    displayStudentInfo() {
        if (!this.currentStudent) return;

        // Show student section
        document.getElementById('studentSection').style.display = 'block';
        
        // Update student info
        document.getElementById('displayStudentId').textContent = this.currentStudent.id;
        document.getElementById('studentName').textContent = this.currentStudent.name;
        document.getElementById('studentProgram').textContent = this.currentStudent.program || 'N/A';
        document.getElementById('studentSemester').textContent = this.currentStudent.semester || 'N/A';
        document.getElementById('studentStatus').textContent = this.currentStudent.status || 'Active';
        
        // Update points
        document.getElementById('meritValue').textContent = this.currentStudent.merit || 0;
        document.getElementById('demeritValue').textContent = this.currentStudent.demerit || 0;
        
        // Update progress bars
        const meritBar = document.getElementById('meritBar');
        const demeritBar = document.getElementById('demeritBar');
        
        if (meritBar) {
            const meritPercent = Math.min((this.currentStudent.merit || 0) / 100 * 100, 100);
            meritBar.style.width = `${meritPercent}%`;
        }
        
        if (demeritBar) {
            const demeritPercent = Math.min((this.currentStudent.demerit || 0) / 50 * 100, 100);
            demeritBar.style.width = `${demeritPercent}%`;
        }
        
        // Display QR code if available
        this.displayQRCode();
        
        // Load transaction history
        this.loadStudentHistory();
    }

    displayQRCode() {
        const qrContainer = document.getElementById('studentQrContainer');
        if (!qrContainer || !this.currentStudent) return;

        qrContainer.innerHTML = '';
        
        if (this.currentStudent.qrCode) {
            // Use existing QR code URL
            const img = document.createElement('img');
            img.src = this.currentStudent.qrCode;
            img.alt = `QR Code for ${this.currentStudent.id}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            qrContainer.appendChild(img);
            
        } else {
            // Generate QR code locally
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 120;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 120, 120);
            
            // Simple QR code pattern (for demo)
            ctx.fillStyle = 'black';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentStudent.id.substring(0, 8), 60, 60);
            
            qrContainer.appendChild(canvas);
        }
    }

    async loadStudentHistory() {
        if (!this.currentStudent) return;

        try {
            const result = await apiService.getStudentHistory(this.currentStudent.id, 5);
            
            if (result.success && result.transactions) {
                this.updateHistoryDisplay(result.transactions);
            }
            
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    updateHistoryDisplay(transactions) {
        const meritHistory = document.getElementById('meritHistory');
        const demeritHistory = document.getElementById('demeritHistory');
        
        if (!meritHistory || !demeritHistory) return;

        // Filter transactions by type
        const meritTransactions = transactions.filter(t => t.type === 'merit');
        const demeritTransactions = transactions.filter(t => t.type === 'demerit');
        
        // Update merit history
        if (meritTransactions.length > 0) {
            const latest = meritTransactions[0];
            meritHistory.innerHTML = `
                Last: +${latest.points} pts<br>
                <small>${latest.timestamp || 'Recently'}</small>
            `;
        } else {
            meritHistory.textContent = 'No merit history';
        }
        
        // Update demerit history
        if (demeritTransactions.length > 0) {
            const latest = demeritTransactions[0];
            demeritHistory.innerHTML = `
                Last: -${latest.points} pts<br>
                <small>${latest.timestamp || 'Recently'}</small>
            `;
        } else {
            demeritHistory.textContent = 'No demerit history';
        }
    }

    setupActionButtons() {
        // Quick action buttons
        document.querySelectorAll('.btn-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.points);
                const type = e.currentTarget.dataset.type;
                
                if (this.currentStudent) {
                    this.addPoints(points, type);
                } else {
                    authManager.showNotification('Please scan a student first', 'warning');
                }
            });
        });

        // Custom points form
        const customSubmit = document.getElementById('submitCustom');
        if (customSubmit) {
            customSubmit.addEventListener('click', () => {
                const points = parseInt(document.getElementById('customPoints').value);
                const type = document.getElementById('customType').value;
                const reason = document.getElementById('customReason').value;
                
                if (this.currentStudent && points > 0) {
                    this.addPoints(points, type, reason);
                } else {
                    authManager.showNotification('Please enter valid points', 'warning');
                }
            });
        }

        // Refresh student button
        const refreshBtn = document.getElementById('refreshStudentBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.currentStudent) {
                    this.processStudent(this.currentStudent.id);
                }
            });
        }
    }

    async addPoints(points, type, reason = '') {
        if (!this.currentStudent || !points || points <= 0) {
            authManager.showNotification('Invalid points value', 'error');
            return;
        }

        authManager.showLoading(`Adding ${points} ${type} points...`);

        try {
            const result = await apiService.addPoints(
                this.currentStudent.id,
                type,
                points,
                reason
            );

            if (result.success) {
                // Update local student data
                if (type === 'merit') {
                    this.currentStudent.merit = (this.currentStudent.merit || 0) + points;
                } else {
                    this.currentStudent.demerit = (this.currentStudent.demerit || 0) + points;
                }
                
                // Update display
                this.displayStudentInfo();
                
                // Show success message
                authManager.showNotification(
                    `Successfully added ${points} ${type} points to ${this.currentStudent.name}`,
                    'success'
                );
                
                // Clear custom reason field
                document.getElementById('customReason').value = '';
                
                // Load updated history
                this.loadStudentHistory();
                
            } else {
                authManager.showNotification(result.error || 'Failed to add points', 'error');
            }
            
        } catch (error) {
            console.error('Error adding points:', error);
            authManager.showNotification('Failed to add points', 'error');
            
        } finally {
            authManager.hideLoading();
        }
    }

    clearStudentInfo() {
        this.currentStudent = null;
        document.getElementById('studentSection').style.display = 'none';
    }
}

// Initialize scanner manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.scannerManager = new ScannerManager();
});
