# 🌍 Global Custom Domain DNS - Installation & Deployment Guide

## Quick Start

### Linux (Systemd)

```bash
# Clone and setup
git clone https://github.com/minecraftbefile-maker/custom-domain-dns.git
cd custom-domain-dns/server
npm install

# Install as service (requires sudo)
sudo node ../scripts/install-linux-service.js

# Start service
sudo systemctl start custom-domain-dns
sudo systemctl enable custom-domain-dns  # Auto-start on boot

# View logs
sudo journalctl -u custom-domain-dns -f
```

### Windows (Service)

```bash
# Clone and setup
git clone https://github.com/minecraftbefile-maker/custom-domain-dns.git
cd custom-domain-dns/server
npm install

# Install NSSM (Non-Sucking Service Manager)
# Download from https://nssm.cc/download
# Add to PATH

# Install as service (requires Administrator)
node ../scripts/install-windows-service.js

# Start service
net start CustomDomainDNS

# Stop service
net stop CustomDomainDNS
```

### Docker

```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Or manually
docker build -t custom-domain-dns .
docker run -d \
  -p 53:53/udp \
  -p 53:53/tcp \
  -p 3000:3000 \
  -p 8080:8080 \
  -v domain-data:/app/data \
  custom-domain-dns
```

### Manual Run

```bash
cd server
npm install
npm start
```

## Configuration

Edit `server/.env`:

```env
# DNS Server
DNS_PORT=53

# API Server
API_PORT=3000

# Proxy Server
PROXY_PORT=8080

# Database
DB_PATH=./data/custom-domains.db

# Environment
NODE_ENV=production
```

## Browser Addon Installation

### Chrome/Edge

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-addon` folder

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `browser-addon/manifest.json`

## CLI Tool Usage

```bash
cd cli-tool
npm install
npm link  # Make it global

# Now you can use:
custom-domain-dns --server http://localhost:3000 add myapp.local 192.168.1.100
custom-domain-dns list
custom-domain-dns get myapp.local
custom-domain-dns delete myapp.local
```

## Desktop Application

```bash
cd desktop-app
npm install
npm start  # Development
npm run build  # Production
```

## Global Deployment

### AWS EC2

```bash
# Launch Ubuntu 20.04 LTS instance
# Connect via SSH

sudo apt update
sudo apt install -y nodejs npm
git clone https://github.com/minecraftbefile-maker/custom-domain-dns.git
cd custom-domain-dns/server
npm install
sudo node ../scripts/install-linux-service.js
```

### DigitalOcean Droplet

```bash
# Similar to AWS, just use DigitalOcean's Ubuntu image
# Then follow Linux installation steps
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml custom-domain-dns
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: custom-domain-dns
spec:
  replicas: 3
  selector:
    matchLabels:
      app: custom-domain-dns
  template:
    metadata:
      labels:
        app: custom-domain-dns
    spec:
      containers:
      - name: dns-server
        image: custom-domain-dns:latest
        ports:
        - containerPort: 53
          protocol: UDP
        - containerPort: 3000
        - containerPort: 8080
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: domain-data
```

## Firewall Configuration

### Linux (UFW)

```bash
sudo ufw allow 53/udp  # DNS
sudo ufw allow 53/tcp  # DNS
sudo ufw allow 3000/tcp  # API
sudo ufw allow 8080/tcp  # Proxy
```

### Windows (PowerShell as Admin)

```powershell
New-NetFirewallRule -DisplayName "Custom Domain DNS" -Direction Inbound -Protocol UDP -LocalPort 53 -Action Allow
New-NetFirewallRule -DisplayName "Custom Domain DNS" -Direction Inbound -Protocol TCP -LocalPort 53 -Action Allow
New-NetFirewallRule -DisplayName "Custom Domain API" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Custom Domain Proxy" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

## System Requirements

### Minimum
- 512 MB RAM
- 100 MB disk space
- Node.js 14+
- Linux (any distribution) or Windows 10/Server 2016+

### Recommended
- 2 GB RAM
- 1 GB disk space
- Node.js 18+
- Ubuntu 20.04 LTS or Windows Server 2019+

## Troubleshooting

### Port Already in Use

**Linux:**
```bash
sudo lsof -i :53
sudo lsof -i :3000
sudo lsof -i :8080
```

**Windows:**
```powershell
netstat -ano | findstr :53
netstat -ano | findstr :3000
netstat -ano | findstr :8080
```

### Service Won't Start

**Linux:**
```bash
sudo journalctl -u custom-domain-dns -n 50  # Last 50 lines
```

**Windows:**
```powershell
Get-EventLog -LogName Application | Where-Object {$_.Source -eq "CustomDomainDNS"}
```

### DNS Not Resolving

1. Test DNS resolution:
   ```bash
   nslookup myapp.local 127.0.0.1
   ```

2. Check domain is added:
   ```bash
   curl http://localhost:3000/api/domains
   ```

3. Check server is listening:
   ```bash
   sudo netstat -tulpn | grep :53
   ```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Database Backup

```bash
# Linux
cp /opt/custom-domain-dns/server/data/custom-domains.db ./backup.db

# Windows
copy C:\path\to\data\custom-domains.db backup.db
```

### Logs

**Linux:**
```bash
sudo tail -f /var/log/custom-domain-dns.log
```

**Windows:**
Check Event Viewer → Windows Logs → Application

## Updates

```bash
# Linux
sudo systemctl stop custom-domain-dns
cd /opt/custom-domain-dns/server
git pull origin main
npm install
sudo systemctl start custom-domain-dns

# Windows
net stop CustomDomainDNS
cd C:\path\to\server
git pull origin main
npm install
net start CustomDomainDNS
```

## Support

For issues and questions:
- Open GitHub Issues
- Check existing documentation
- Review logs for error messages
