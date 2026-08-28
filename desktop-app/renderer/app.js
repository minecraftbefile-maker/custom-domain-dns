class CustomDomainApp {
    constructor() {
        this.serverUrl = 'http://localhost:3000';
        this.domains = [];
        this.currentPage = 'dashboard';
        this.init();
    }

    async init() {
        // Load configuration
        const config = await window.api.getConfig();
        this.serverUrl = config.serverUrl || 'http://localhost:3000';

        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadDomains();
        this.checkServerStatus();
        
        // Setup auto-refresh
        setInterval(() => this.checkServerStatus(), 30000);
        setInterval(() => this.loadDomains(), 60000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
        });

        // Domain management
        document.getElementById('add-domain-btn').addEventListener('click', () => this.openAddDomainModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeAddDomainModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveNewDomain());
        document.querySelector('.close-btn').addEventListener('click', () => this.closeAddDomainModal());

        // Settings
        document.getElementById('test-server-btn').addEventListener('click', () => this.testServerConnection());
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());

        // Import/Export
        document.getElementById('export-btn').addEventListener('click', () => this.exportDomains());
        document.getElementById('import-btn').addEventListener('click', () => this.importDomains());

        // Search
        document.getElementById('search-input')?.addEventListener('input', (e) => this.searchDomains(e.target.value));
    }

    switchPage(pageName) {
        // Update active page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageName).classList.add('active');

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        this.currentPage = pageName;
        
        // Load page-specific data
        if (pageName === 'domains') {
            this.loadDomains();
        } else if (pageName === 'settings') {
            this.loadSettings();
        }
    }

    async loadDomains() {
        try {
            const result = await window.api.getDomains(this.serverUrl);
            if (result.success) {
                this.domains = result.data;
                this.renderDomainsTable(this.domains);
                this.updateDashboard();
            }
        } catch (error) {
            console.error('Error loading domains:', error);
        }
    }

    renderDomainsTable(domains) {
        const tbody = document.getElementById('domains-table-body');
        
        if (domains.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No domains added yet</td></tr>';
            return;
        }

        tbody.innerHTML = domains.map(d => `
            <tr>
                <td>${d.domain}</td>
                <td><code>${d.ip_address}</code></td>
                <td>${new Date(d.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary" onclick="app.editDomain('${d.domain}')">Edit</button>
                    <button class="btn btn-danger" onclick="app.deleteDomainConfirm('${d.domain}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    updateDashboard() {
        document.getElementById('domain-count').textContent = this.domains.length;
        const recentDomains = this.domains.slice(0, 5);
        const tbody = document.getElementById('recent-domains-table');
        
        if (recentDomains.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No domains added yet</td></tr>';
        } else {
            tbody.innerHTML = recentDomains.map(d => `
                <tr>
                    <td>${d.domain}</td>
                    <td>${d.ip_address}</td>
                    <td><span style="color: #51cf66;">●</span> Active</td>
                </tr>
            `).join('');
        }
    }

    openAddDomainModal() {
        document.getElementById('add-domain-modal').classList.remove('hidden');
        document.getElementById('modal-domain').focus();
    }

    closeAddDomainModal() {
        document.getElementById('add-domain-modal').classList.add('hidden');
        document.getElementById('add-domain-form').reset();
    }

    async saveNewDomain() {
        const domain = document.getElementById('modal-domain').value.trim();
        const ip = document.getElementById('modal-ip').value.trim();

        if (!domain || !ip) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const result = await window.api.addDomain({
                serverUrl: this.serverUrl,
                domain,
                ip_address: ip
            });
            
            if (result.success) {
                this.closeAddDomainModal();
                this.loadDomains();
                this.showNotification('Domain added successfully', 'success');
            } else {
                this.showNotification(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async deleteDomainConfirm(domain) {
        if (!confirm(`Delete domain "${domain}"?`)) return;
        
        try {
            const result = await window.api.deleteDomain({
                serverUrl: this.serverUrl,
                domain
            });
            
            if (result.success) {
                this.loadDomains();
                this.showNotification('Domain deleted', 'success');
            } else {
                this.showNotification(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    editDomain(domain) {
        alert('Edit feature coming soon');
    }

    searchDomains(query) {
        const filtered = this.domains.filter(d => 
            d.domain.toLowerCase().includes(query.toLowerCase()) ||
            d.ip_address.includes(query)
        );
        this.renderDomainsTable(filtered);
    }

    async checkServerStatus() {
        try {
            const result = await window.api.checkServer(this.serverUrl);
            const indicator = document.querySelector('.status-indicator');
            const statusText = document.querySelector('.status-text');
            const statusValue = document.getElementById('server-status-text');
            
            if (result.success) {
                indicator.classList.add('connected');
                indicator.classList.remove('disconnected');
                statusText.textContent = 'Connected';
                statusValue.textContent = '✓ Online';
            } else {
                indicator.classList.remove('connected');
                indicator.classList.add('disconnected');
                statusText.textContent = 'Disconnected';
                statusValue.textContent = '✗ Offline';
            }
        } catch (error) {
            console.error('Server check error:', error);
        }
    }

    async testServerConnection() {
        const url = document.getElementById('server-url').value;
        try {
            const result = await window.api.checkServer(url);
            if (result.success) {
                this.showNotification('✓ Server connection successful', 'success');
                this.serverUrl = url;
                this.loadDomains();
            } else {
                this.showNotification('✗ Server connection failed', 'error');
            }
        } catch (error) {
            this.showNotification(`✗ Error: ${error.message}`, 'error');
        }
    }

    async saveSettings() {
        const config = {
            serverUrl: document.getElementById('server-url').value,
            syncInterval: parseInt(document.getElementById('sync-interval').value),
            autoSync: document.getElementById('auto-sync').checked,
            trayEnabled: document.getElementById('tray-enabled').checked,
            startOnBoot: document.getElementById('start-on-boot').checked
        };

        try {
            await window.api.saveConfig(config);
            this.serverUrl = config.serverUrl;
            this.showNotification('Settings saved', 'success');
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async loadSettings() {
        const config = await window.api.getConfig();
        document.getElementById('server-url').value = config.serverUrl || 'http://localhost:3000';
        document.getElementById('sync-interval').value = config.syncInterval || 300;
        document.getElementById('auto-sync').checked = config.autoSync !== false;
        document.getElementById('tray-enabled').checked = config.trayEnabled !== false;
        document.getElementById('start-on-boot').checked = config.startOnBoot || false;
    }

    async exportDomains() {
        try {
            // This would open a file dialog in Electron
            const result = await window.api.exportDomains({
                serverUrl: this.serverUrl,
                filename: `domains-${Date.now()}.json`
            });
            
            if (result.success) {
                this.showNotification('Domains exported successfully', 'success');
            } else {
                this.showNotification(`Export error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async importDomains() {
        try {
            // This would open a file dialog in Electron
            const result = await window.api.importDomains({
                serverUrl: this.serverUrl,
                filename: '' // File dialog would set this
            });
            
            if (result.success) {
                this.showNotification(`Imported ${result.imported} domains`, 'success');
                this.loadDomains();
            } else {
                this.showNotification(`Import error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    showNotification(message, type) {
        // Implement notification system (toast/snackbar)
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Could add visual notification here
    }
}

// Initialize app
const app = new CustomDomainApp();
