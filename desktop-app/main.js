const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const axios = require('axios');

const store = new Store();
let mainWindow;
let isServiceRunning = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'assets/icon.png')
    });

    mainWindow.loadFile('renderer/index.html');
    mainWindow.webContents.openDevTools(); // Remove in production
    mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (mainWindow === null) createWindow();
});

// IPC Handlers

ipcMain.handle('get-config', () => {
    return store.store;
});

ipcMain.handle('save-config', (event, config) => {
    store.set(config);
    return { success: true };
});

ipcMain.handle('get-domains', async (event, serverUrl) => {
    try {
        const response = await axios.get(`${serverUrl}/api/domains`);
        return { success: true, data: response.data.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('add-domain', async (event, { serverUrl, domain, ip_address }) => {
    try {
        const response = await axios.post(`${serverUrl}/api/domains`, {
            domain,
            ip_address
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-domain', async (event, { serverUrl, domain }) => {
    try {
        await axios.delete(`${serverUrl}/api/domains/${domain}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('update-domain', async (event, { serverUrl, domain, ip_address }) => {
    try {
        const response = await axios.put(`${serverUrl}/api/domains/${domain}`, {
            ip_address
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('check-server', async (event, serverUrl) => {
    try {
        const response = await axios.get(`${serverUrl}/health`, { timeout: 5000 });
        return { success: true, status: response.data.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('export-domains', async (event, { serverUrl, filename }) => {
    try {
        const response = await axios.get(`${serverUrl}/api/domains`);
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(response.data.data, null, 2));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-domains', async (event, { serverUrl, filename }) => {
    try {
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        let imported = 0;
        
        for (const domain of data) {
            try {
                await axios.post(`${serverUrl}/api/domains`, {
                    domain: domain.domain,
                    ip_address: domain.ip_address
                });
                imported++;
            } catch (e) {
                // Skip duplicates
            }
        }
        
        return { success: true, imported };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Menu
const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Exit',
                accelerator: 'CmdOrCtrl+Q',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: () => {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'About Custom Domain Linker',
                        message: 'Custom Domain DNS System v1.0.0',
                        detail: 'Manage custom domains globally across all devices'
                    });
                }
            }
        ]
    }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
