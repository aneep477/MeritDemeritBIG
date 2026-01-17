// UI Management Module
class UIManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMenuToggle();
        this.setupRefreshButtons();
        this.setupSystemStats();
        this.updateSystemMetrics();
        
        // Initial UI updates
        setTimeout(() => {
            this.updateStats();
            this.loadRecentTransactions();
        }, 1000);
    }

    setupMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                menuToggle.querySelector('i').classList.toggle('fa-bars');
                menuToggle.querySelector('i').classList.toggle('fa-times');
            });
        }
    }

    setupRefreshButtons() {
        const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
        if (refreshHistoryBtn) {
            refreshHistoryBtn.addEventListener('click', () => {
                this.loadRecentTransactions();
            });
        }
    }

    async setupSystemStats() {
        try {
            const result = await apiService.getSystemStats();
            
            if (result.success && result.stats) {
                this.updateSystemStats(result.stats);
            }
        } catch (error) {
            console.error('Error loading system stats:', error);
        }
    }

    updateSystemStats(stats) {
        const statStudents = document.getElementById('statStudents');
        const statMerit = document.getElementById('statMerit');
        const statDemerit = document.getElementById('statDemerit');
        
        if (statStudents) {
            statStudents.textContent = stats.totalStudents || 0;
        }
        
        if (statMerit) {
            statMerit.textContent = stats.totalMerit || 0;
        }
        
        if (statDemerit) {
            statDemerit.textContent = stats.totalDemerit || 0;
        }
        
        // Update today's transactions (placeholder)
        const statToday = document.getElementById('statToday');
        if (statToday) {
            const today = new Date().toLocaleDateString('ms-MY');
            statToday.textContent = '0'; // Will be updated from API
        }
    }

    async loadRecentTransactions() {
        try {
            const result = await apiService.getRecentTransactions(10);
            this.updateTransactionsTable(result);
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showEmptyTransactionTable();
        }
    }

    updateTransactionsTable(data) {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (!data.success || !data.transactions || data.transactions.length === 0) {
            this.showEmptyTransactionTable();
            return;
        }

        data.transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Format timestamp
            let timestamp = transaction.timestamp;
            if (timestamp) {
                try {
                    const date = new Date(timestamp);
                    timestamp = date.toLocaleTimeString('ms-MY', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    // Keep original timestamp if parsing fails
                }
            }
            
            // Create badge based on type
            const badgeClass = transaction.type === 'merit' ? 'merit-badge' : 'demerit-badge';
            const badgeText = transaction.type === 'merit' ? 'MERIT' : 'DEMERIT';
            const pointsSign = transaction.type === 'merit' ? '+' : '-';
            
            row.innerHTML = `
                <td>${timestamp || 'N/A'}</td>
                <td>${transaction.studentId || 'N/A'}</td>
                <td><span class="${badgeClass}">${badgeText}</span></td>
                <td>${pointsSign}${transaction.points || 0}</td>
                <td>${transaction.reason || '-'}</td>
                <td>${transaction.pensyarahId || 'System'}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    showEmptyTransactionTable() {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-history"></i>
                    <div>No transactions found</div>
                </td>
            </tr>
        `;
    }

    updateSystemMetrics() {
        // Update total students metric
        const updateMetric = async () => {
            try {
                const stats = await apiService.getSystemStats();
                if (stats.success) {
                    const totalStudents = document.getElementById('totalStudents');
                    const totalTransactions = document.getElementById('totalTransactions');
                    
                    if (totalStudents && stats.stats) {
                        totalStudents.textContent = stats.stats.totalStudents || 0;
                    }
                    
                    if (totalTransactions && stats.stats) {
                        totalTransactions.textContent = stats.stats.totalTransactions || 0;
                    }
                }
            } catch (error) {
                console.error('Error updating metrics:', error);
            }
        };
        
        // Initial update
        updateMetric();
        
        // Update every 30 seconds
        setInterval(updateMetric, 30000);
    }

    async updateStats() {
        try {
            const result = await apiService.getSystemStats();
            if (result.success) {
                this.updateSystemStats(result.stats);
                
                // Update main metrics
                const totalStudents = document.getElementById('totalStudents');
                const totalTransactions = document.getElementById('totalTransactions');
                
                if (totalStudents) {
                    totalStudents.textContent = result.stats.totalStudents || 0;
                }
                
                if (totalTransactions) {
                    totalTransactions.textContent = result.stats.totalTransactions || 0;
                }
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
}

// Initialize UI manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
