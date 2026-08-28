# 🌍 Custom Domain DNS System

A global, cross-platform solution to create unlimited custom domains, map them to IP addresses, and use them via a browser addon, DNS server, and proxy system.

## ✨ Features

✅ **Unlimited Custom Domains** - Add as many custom domains as you want  
✅ **Domain to IP Mapping** - Map any domain to any IP address  
✅ **Browser Addon** - Seamless integration with Chrome, Firefox, Edge, Safari  
✅ **Local DNS Server** - Custom DNS resolution on port 53  
✅ **HTTP/HTTPS Proxy** - Transparent request forwarding  
✅ **ICANN Domain Blocking** - Only custom domains are allowed  
✅ **Cross-Platform** - Works on Windows, Linux, and macOS  
✅ **Global Deployment** - Deploy anywhere and access worldwide  
✅ **No Domain Change Display** - Keep custom domain in browser address bar while forwarding  
✅ **Database Persistence** - SQLite for local storage  

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0
- npm or yarn
- Administrator/root access (for DNS port 53)

### Installation

```bash
# Clone repository
git clone https://github.com/minecraftbefile-maker/custom-domain-dns.git
cd custom-domain-dns

# Install server dependencies
cd server
npm install

# Create .env file
cp .env.example .env

# Start server
npm start
```

### Linux Setup (systemd)

```bash
# Install as system service
sudo npm run install-service-linux

# Start service
sudo systemctl start custom-domain-dns

# Enable on boot
sudo systemctl enable custom-domain-dns

# View logs
sudo journalctl -u custom-domain-dns -f
```

### Windows Setup

```bash
# Install as Windows Service (requires Administrator)
node scripts/install-windows-service.js

# Start service
net start CustomDomainDNS

# Stop service
net stop CustomDomainDNS
```

## 📖 Usage

### API Endpoints

#### Add Custom Domain
```bash
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "myapp.local",
    "ip_address": "192.168.1.100"
  }'
```

#### List All Domains
```bash
curl http://localhost:3000/api/domains
```

#### Get Specific Domain
```bash
curl http://localhost:3000/api/domains/myapp.local
```

#### Update Domain IP
```bash
curl -X PUT http://localhost:3000/api/domains/myapp.local \
  -H "Content-Type: application/json" \
  -d '{"ip_address": "192.168.1.101"}'
```

#### Delete Domain
```bash
curl -X DELETE http://localhost:3000/api/domains/myapp.local
```

## 🔌 Browser Addon

### Installation

1. **Chrome/Edge:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `browser-addon` folder

2. **Firefox:**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `browser-addon/manifest.json`

### Usage
1. Click addon icon
2. Enter custom domain (e.g., `myapp.local`)
3. Enter IP address (e.g., `192.168.1.100`)
4. Click "Add Domain"
5. Visit `http://myapp.local` in browser

## 🖥️ Desktop Application

Electron-based GUI for managing domains:

```bash
cd desktop-app
npm install
npm start
```

## 📋 Configuration

### DNS Server
- **Port:** 53 (UDP/TCP)
- **Protocol:** Standard DNS
- **Blocking:** ICANN domains blocked

### API Server
- **Port:** 3000
- **Protocol:** HTTP/REST
- **Auth:** None (add your own)

### Proxy Server
- **Port:** 8080
- **Protocol:** HTTP
- **Mode:** Transparent forwarding

## 🗄️ Database

SQLite database at `data/custom-domains.db` with tables:
- `domains` - Domain to IP mappings
- `domain_history` - Audit trail
- `access_logs` - Request logs

## 🌐 Global Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/ .
RUN npm install --production
EXPOSE 53/udp 53/tcp 3000 8080
CMD ["npm", "start"]
```

### Cloud Deployment
- AWS EC2 with security groups (DNS, API, Proxy)
- DigitalOcean Droplet
- Google Cloud Platform
- Azure Virtual Machines
- Any VPS with root access

## 🔒 Security

- ICANN domain blocking prevents DNS hijacking
- Local database isolation
- CORS protected API
- Helmet.js security headers
- Rate limiting (planned)
- SSL/TLS support (planned)

## 📝 Project Structure

```
custom-domain-dns/
├── server/           # Backend DNS/Proxy server
├── browser-addon/    # Cross-browser extension
├── desktop-app/      # Electron desktop client
├── cli-tool/         # Command-line interface
└── docs/             # Documentation
```

## 🐛 Troubleshooting

### DNS Not Resolving
1. Check if server is running: `ps aux | grep node`
2. Verify port 53: `sudo lsof -i :53`
3. Check firewall rules
4. Ensure domain is added via API

### Port Already in Use
- Change ports in `.env`
- Or kill process: `sudo lsof -i :53 | kill -9 <PID>`

### ICANN Domain Error
- Only custom domains allowed
- Use format: `customname.local` or `myapp.dev`
- Avoid standard TLDs (.com, .org, etc.)

## 📚 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Development mode with auto-reload
npm run dev

# Build for production
npm run build
```

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Open GitHub Issue
- Check existing documentation
- Review project structure

## 🗓️ Roadmap

- [x] Core DNS server
- [x] API server
- [x] Proxy server
- [ ] Browser addon completion
- [ ] Desktop GUI app
- [ ] CLI tool
- [ ] SSL/TLS support
- [ ] Rate limiting
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-region deployment

---

**Made with ❤️ for custom domain management**
