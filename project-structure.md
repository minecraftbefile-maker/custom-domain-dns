# Custom Domain DNS System - Project Structure

## 🌍 Global Custom Domain & IP Management Platform

### Core Components

```
custom-domain-dns/
├── server/                    # Backend DNS/Proxy Server
│   ├── dns-server/           # DNS server (Linux/Windows)
│   ├── proxy-server/         # HTTP/HTTPS proxy
│   ├── domain-manager/       # Domain storage & routing
│   └── config/               # Server configuration
├── browser-addon/            # Cross-browser extension
│   ├── popup/               # UI for adding domains
│   ├── background/          # Background scripts
│   ├── content/             # Content injection
│   └── manifest.json        # Extension manifest
├── desktop-app/             # Desktop client (Electron)
│   ├── main/               # Main process
│   ├── renderer/           # UI renderer
│   └── preload/            # IPC bridge
├── cli-tool/               # Command-line interface
├── database/               # Domain & IP mappings
├── docs/                   # Documentation
└── tests/                  # Test suites
```

## ✨ Key Features

### 1. **Custom Domain Management**
- Add unlimited custom domains
- Map domains to IP addresses
- Persistent storage (database)
- Real-time domain resolution

### 2. **Browser Addon**
- Works on Chrome, Firefox, Edge, Safari
- Add/manage custom domains from popup
- Intercept DNS requests
- Keep custom domain in address bar
- Forward to different links without changing display

### 3. **Local DNS/Proxy Server**
- Listen on port 53 (DNS) and 8080/3128 (proxy)
- Handle custom domain routing
- Block all ICANN registered domains
- Support both Linux & Windows
- Global network accessibility

### 4. **IP Forwarding**
- Domain → IP resolution
- Support HTTPS/HTTP forwarding
- Allow redirects without changing domain name display
- Works for all protocols (not just websites)

### 5. **ICANN Domain Blocking**
- Maintain ICANN domain blacklist
- Reject standard domain resolutions
- Force use of custom domains only
- Prevent DNS leaks

### 6. **Cross-Platform Support**
- Windows (Service, GUI)
- Linux (Systemd, CLI)
- macOS support ready
- Docker containerization

## 🛠️ Tech Stack

### Backend
- **Node.js/Deno** - Server runtime
- **dns2** - DNS protocol handling
- **http-proxy** - Proxy server
- **SQLite/PostgreSQL** - Domain database
- **Express.js** - API server

### Browser Addon
- **JavaScript** - Core addon logic
- **WebExtensions API** - Cross-browser compatibility
- **IndexedDB** - Local domain storage

### Desktop App
- **Electron** - Cross-platform desktop
- **React** - UI framework
- **Node.js** - Backend processes

### System Integration
- **Systemd** - Linux service management
- **Windows Services** - Windows background service
- **Docker** - Container deployment

## 📋 Development Roadmap

### Phase 1: Core DNS Server
- [ ] DNS server implementation
- [ ] Domain database schema
- [ ] IP mapping engine
- [ ] ICANN domain blacklist

### Phase 2: Browser Addon
- [ ] Chrome extension
- [ ] Firefox addon
- [ ] Domain management popup
- [ ] Background DNS interception

### Phase 3: Proxy Server
- [ ] HTTP/HTTPS proxy
- [ ] Request interception
- [ ] Response forwarding
- [ ] SSL/TLS support

### Phase 4: Desktop Application
- [ ] Electron wrapper
- [ ] System tray integration
- [ ] Settings GUI
- [ ] Auto-startup

### Phase 5: Cross-Platform Packaging
- [ ] Windows MSI installer
- [ ] Linux DEB/RPM packages
- [ ] Docker image
- [ ] Global deployment

## 🔒 Security Considerations

- DNS over TLS (DoT) support
- DNSSEC validation
- SSL certificate pinning
- Domain ownership verification
- Rate limiting
- DDoS protection
- Access control lists

## 🌐 Global Deployment

- Multi-region DNS servers
- CDN integration
- Load balancing
- Monitoring & logging
- Analytics dashboard
