# Custom Domain DNS System - Complete Project Structure Overview

## Repository Structure

```
custom-domain-dns/
├── 📄 README.md                    # Main project overview
├── 📄 INSTALLATION.md              # Detailed setup guide
├── 📄 API.md                       # Complete API documentation
├── 📄 SECURITY.md                  # Security best practices
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 FAQ.md                       # Frequently asked questions
├── 📄 CHANGELOG.md                 # Version history
├── 📄 ROADMAP.md                   # Future development plans
├── 📄 LICENSE                      # MIT License
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Root dependencies
│
├── server/                         # Backend DNS/Proxy Server
│   ├── package.json               # Node dependencies
│   ├── index.js                   # Main server entry point
│   ├── domain-manager.js          # Domain management logic
│   ├── icann-blocker.js           # ICANN domain blocking
│   ├── .env.example               # Environment template
│   ├── database/
│   │   └── manager.js             # SQLite database management
│   ├── utils/
│   │   └── logger.js              # Winston logging
│   └── data/
│       ├── custom-domains.db      # SQLite database (auto-created)
│       └── icann-domains.txt      # ICANN blocklist
│
├── browser-addon/                 # Cross-Browser Extension
│   ├── manifest.json              # Extension configuration
│   ├── README.md                  # Addon documentation
│   ├── popup/
│   │   ├── popup.html             # Main UI popup
│   │   ├── popup.css              # Popup styling
│   │   └── popup.js               # Popup logic
│   ├── background/
│   │   └── service-worker.js      # Background processing
│   ├── content/
│   │   └── content.js             # Page script injection
│   └── images/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
│
├── desktop-app/                   # Electron Desktop Application
│   ├── package.json               # Electron dependencies
│   ├── main.js                    # Electron main process
│   ├── preload.js                 # IPC bridge
│   ├── renderer/
│   │   ├── index.html             # Main UI
│   │   ├── styles.css             # UI styling
│   │   └── app.js                 # UI logic
│   └── assets/
│       ├── icon.png
│       ├── icon.ico
│       └── icon.icns
│
├── cli-tool/                      # Command Line Interface
│   ├── package.json               # CLI dependencies
│   └── index.js                   # CLI main entry point
│
├── scripts/                       # Installation & Setup Scripts
│   ├── install-linux-service.js   # Linux systemd installation
│   └── install-windows-service.js # Windows service installation
│
├── 🐳 Dockerfile                   # Docker container definition
├── docker-compose.yml             # Docker Compose orchestration
│
├── quick-start.sh                 # Quick setup script
├── uninstall.sh                   # Uninstall script
└── project-structure.md           # This file
```

## File Descriptions

### Core Server (server/)

| File | Purpose |
|------|----------|
| `index.js` | Main DNS, API, and Proxy server |
| `domain-manager.js` | CRUD operations for domains |
| `icann-blocker.js` | ICANN domain detection and blocking |
| `database/manager.js` | SQLite database initialization |
| `utils/logger.js` | Logging with Winston |
| `.env.example` | Default environment variables |
| `.env` | Actual environment config (gitignored) |

### Browser Addon (browser-addon/)

| File | Purpose |
|------|----------|
| `manifest.json` | Extension metadata and permissions |
| `popup/popup.html` | User interface UI |
| `popup/popup.js` | Domain management logic |
| `background/service-worker.js` | Domain sync and API integration |
| `content/content.js` | Page script injection and interception |

### Desktop App (desktop-app/)

| File | Purpose |
|------|----------|
| `main.js` | Electron main process and IPC |
| `preload.js` | IPC API bridge |
| `renderer/index.html` | Desktop UI |
| `renderer/app.js` | Desktop application logic |

### CLI Tool (cli-tool/)

| File | Purpose |
|------|----------|
| `index.js` | Command line interface |

### Documentation

| File | Purpose |
|------|----------|
| `README.md` | Project overview and features |
| `INSTALLATION.md` | Setup instructions |
| `API.md` | REST API documentation |
| `SECURITY.md` | Security guidelines |
| `CONTRIBUTING.md` | How to contribute |
| `FAQ.md` | Common questions |
| `CHANGELOG.md` | Version history |
| `ROADMAP.md` | Future plans |

## Key Features by Component

### Server
- ✅ DNS Resolution (UDP/TCP)
- ✅ REST API (CRUD operations)
- ✅ HTTP/HTTPS Proxy
- ✅ SQLite Database
- ✅ ICANN Domain Blocking
- ✅ Caching System
- ✅ Health Checks
- ✅ Logging

### Browser Addon
- ✅ Cross-browser support (Chrome, Firefox, Edge, Safari)
- ✅ Domain management UI
- ✅ Real-time synchronization
- ✅ Import/Export functionality
- ✅ Settings persistence
- ✅ Auto-forwarding

### Desktop App
- ✅ Windows/Linux native integration
- ✅ Dashboard with statistics
- ✅ Domain management
- ✅ Settings configuration
- ✅ Import/Export
- ✅ Server status monitoring

### CLI Tool
- ✅ Domain CRUD operations
- ✅ Bulk import/export
- ✅ Server status checks
- ✅ Multiple output formats

## Technology Stack

### Backend
- **Runtime**: Node.js 14+
- **DNS**: dns2 library
- **Server**: Express.js
- **Proxy**: http-proxy
- **Database**: SQLite3
- **Logging**: Winston
- **CLI**: Commander.js

### Frontend
- **Browser Addon**: WebExtensions API
- **Desktop**: Electron + React
- **Styling**: CSS3
- **Package Manager**: npm

### DevOps
- **Container**: Docker & Docker Compose
- **Services**: systemd (Linux), NSSM (Windows)
- **Scripting**: Bash, Node.js

## Getting Started

### Quickest Start
```bash
bash quick-start.sh
```

### Manual Setup
```bash
cd server
npm install
npm start
```

### Docker
```bash
docker-compose up -d
```

## Database Schema

### domains table
```sql
CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  ip_address TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### domain_history table
```sql
CREATE TABLE domain_history (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL,
  old_ip TEXT,
  new_ip TEXT,
  action TEXT,
  timestamp TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);
```

### access_logs table
```sql
CREATE TABLE access_logs (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  ip_requested TEXT,
  timestamp TIMESTAMP,
  status TEXT
);
```

## Environment Variables

```env
# DNS Server Configuration
DNS_PORT=53

# API Server Configuration
API_PORT=3000

# Proxy Server Configuration
PROXY_PORT=8080

# Database Configuration
DB_PATH=./data/custom-domains.db

# Environment
NODE_ENV=production

# ICANN Blocklist Update Interval
BLOCKLIST_UPDATE_INTERVAL=24
```

## API Overview

### Core Endpoints
- `POST /api/domains` - Add domain
- `GET /api/domains` - List all
- `GET /api/domains/:domain` - Get specific
- `PUT /api/domains/:domain` - Update
- `DELETE /api/domains/:domain` - Delete
- `GET /health` - Health check

## Deployment Checklist

- [ ] Clone repository
- [ ] Install Node.js
- [ ] Install dependencies
- [ ] Configure `.env` file
- [ ] Setup DNS/Proxy ports
- [ ] Configure firewall
- [ ] Install service (Windows/Linux)
- [ ] Verify server running
- [ ] Install browser addon
- [ ] Test domain resolution
- [ ] Add to monitoring
- [ ] Setup backups

## Support & Resources

- 📖 [README.md](README.md) - Overview
- 📚 [INSTALLATION.md](INSTALLATION.md) - Setup guide
- 🔌 [API.md](API.md) - API reference
- ❓ [FAQ.md](FAQ.md) - Q&A
- 🗺️ [ROADMAP.md](ROADMAP.md) - Future plans
- 🔐 [SECURITY.md](SECURITY.md) - Security guide

## License

MIT License - See [LICENSE](LICENSE) file

---

**Last Updated**: 2026-08-28
**Version**: 1.0.0
