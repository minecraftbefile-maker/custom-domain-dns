const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Config
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    
    // Domains
    getDomains: (serverUrl) => ipcRenderer.invoke('get-domains', serverUrl),
    addDomain: (data) => ipcRenderer.invoke('add-domain', data),
    deleteDomain: (data) => ipcRenderer.invoke('delete-domain', data),
    updateDomain: (data) => ipcRenderer.invoke('update-domain', data),
    
    // Server
    checkServer: (serverUrl) => ipcRenderer.invoke('check-server', serverUrl),
    exportDomains: (data) => ipcRenderer.invoke('export-domains', data),
    importDomains: (data) => ipcRenderer.invoke('import-domains', data)
});
