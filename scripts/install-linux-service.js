#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

if (process.platform !== 'linux') {
    console.error('This script is for Linux systems only');
    process.exit(1);
}

if (process.getuid && process.getuid() !== 0) {
    console.error('This script must be run with sudo');
    process.exit(1);
}

const serviceDir = '/opt/custom-domain-dns';
const unitFile = '/etc/systemd/system/custom-domain-dns.service';
const serverPath = path.join(__dirname, '../server');

console.log('Installing Custom Domain DNS as systemd service...');

// Create service directory
if (!fs.existsSync(serviceDir)) {
    fs.mkdirSync(serviceDir, { recursive: true });
    console.log('✓ Created service directory');
}

// Copy server files
fs.cpSync(serverPath, path.join(serviceDir, 'server'), { recursive: true });
console.log('✓ Copied server files');

// Create systemd unit file
const unitContent = `[Unit]
Description=Custom Domain DNS Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${serviceDir}/server
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;

fs.writeFileSync(unitFile, unitContent);
console.log('✓ Created systemd unit file');

// Reload systemd and enable service
require('child_process').execSync('systemctl daemon-reload');
require('child_process').execSync('systemctl enable custom-domain-dns');
console.log('✓ Enabled service');

console.log('\n✓ Installation complete!');
console.log('\nStart service with: sudo systemctl start custom-domain-dns');
console.log('View logs with: sudo journalctl -u custom-domain-dns -f');
