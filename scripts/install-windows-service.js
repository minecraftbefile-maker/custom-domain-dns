#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.platform !== 'win32') {
    console.error('This script is for Windows systems only');
    process.exit(1);
}

// Check for admin privileges
const isAdmin = () => {
    try {
        execSync('net session', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
};

if (!isAdmin()) {
    console.error('This script must be run as Administrator');
    process.exit(1);
}

const serverPath = path.join(__dirname, '../server');
const serviceName = 'CustomDomainDNS';
const displayName = 'Custom Domain DNS Server';
const description = 'Global custom domain and IP management system';

console.log('Installing Custom Domain DNS as Windows Service...');

try {
    // Use nssm (Non-Sucking Service Manager) to create Windows service
    // Requires nssm to be installed: https://nssm.cc/
    
    const nssm = 'nssm';
    const nodePath = process.execPath;
    const appPath = path.join(serverPath, 'index.js');
    
    // Try to find nssm in PATH
    try {
        execSync(`${nssm} --version`, { stdio: 'ignore' });
    } catch (e) {
        console.error('NSSM not found. Please install NSSM from https://nssm.cc/');
        console.error('Then run this script again');
        process.exit(1);
    }
    
    // Remove existing service if it exists
    try {
        execSync(`${nssm} remove ${serviceName} confirm`);
    } catch (e) {
        // Service doesn't exist, that's fine
    }
    
    // Install new service
    execSync(`${nssm} install ${serviceName} ${nodePath} ${appPath}`);
    execSync(`${nssm} set ${serviceName} AppDirectory ${serverPath}`);
    execSync(`${nssm} set ${serviceName} AppStdout C:\\ProgramData\\CustomDomainDNS\\logs\\output.log`);
    execSync(`${nssm} set ${serviceName} AppStderr C:\\ProgramData\\CustomDomainDNS\\logs\\error.log`);
    
    console.log('✓ Service installed successfully');
    console.log('\nStart service with: net start CustomDomainDNS');
    console.log('Stop service with: net stop CustomDomainDNS');
    console.log('Remove service with: nssm remove CustomDomainDNS confirm');
    
} catch (error) {
    console.error('Error installing service:', error.message);
    process.exit(1);
}
