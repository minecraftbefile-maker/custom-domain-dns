# Frequently Asked Questions

## Installation & Setup

### Q: Can I run this on macOS?
A: Yes! Follow the Linux installation guide. macOS support is coming soon with native installer.

### Q: Do I need root/admin privileges?
A: Yes, because DNS uses port 53 which requires elevated privileges.

### Q: Can I use a different port instead of 53?
A: Yes, modify `DNS_PORT` in `.env`. However, port 53 is standard for DNS.

### Q: How do I update the server?
A: Pull latest code and restart service:
```bash
git pull
npm install
sudo systemctl restart custom-domain-dns  # Linux
net stop CustomDomainDNS && net start CustomDomainDNS  # Windows
```

## Usage

### Q: How do I add a domain?
A: Via browser addon, CLI tool, or API:
```bash
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -d '{"domain":"myapp.local","ip_address":"192.168.1.100"}'
```

### Q: Can I map multiple domains to same IP?
A: Yes! Each domain is independent.

### Q: What formats work for domains?
A: Any non-ICANN domain: `.local`, `.dev`, `.internal`, `.test`, `.localhost`, custom TLDs

### Q: Can I use IPv6 addresses?
A: Currently IPv4 only. IPv6 support coming in v1.1.

### Q: How do I browse to the custom domain?
A: Just visit `http://mydomain.local` in your browser once it's added.

## Addon/Browser Issues

### Q: Addon not working in Firefox?
A: Make sure you load it as a temporary add-on and it hasn't expired.

### Q: Custom domain not resolving?
A: Check:
1. Domain is added via API
2. Server is running: `curl http://localhost:3000/health`
3. DNS is set to 127.0.0.1
4. Browser cache is cleared

### Q: How do I set custom DNS in my OS?

**Windows:**
- Settings → Network & Internet → Change adapter options
- Right-click network → Properties
- Select IPv4 → Properties
- Set DNS to 127.0.0.1

**Linux (Ubuntu):**
```bash
sudo nano /etc/netplan/00-installer-config.yaml
# Add: nameservers:
#        addresses: [127.0.0.1]
sudo netplan apply
```

**macOS:**
- System Preferences → Network
- DNS tab
- Add 127.0.0.1

## Performance & Limits

### Q: How many domains can I add?
A: Theoretically unlimited. Database performance may vary after 100,000+ domains.

### Q: What's the latency?
A: DNS queries typically <5ms. Proxy requests depend on target speed.

### Q: Can I handle high traffic?
A: Yes, but may need optimization. Consider:
- PostgreSQL instead of SQLite
- Redis caching
- Load balancing
- Multiple server instances

### Q: How much disk space do I need?
A: ~1MB per 10,000 domain mappings + logs.

## Security

### Q: Is this production-ready?
A: For internal/development use, yes. For production, add:
- HTTPS/TLS
- Authentication
- Rate limiting
- Monitoring
- Backup strategy

### Q: Can I restrict access to API?
A: Yes, add API key authentication or IP whitelisting.

### Q: Are domains encrypted at rest?
A: SQLite provides basic isolation. For sensitive data, add encryption.

### Q: Can I block certain domains?
A: Yes, ICANN domains are blocked. Add custom blocklist in settings.

## Troubleshooting

### Q: Port 53 already in use
A: Find and kill process:
```bash
sudo lsof -i :53
sudo kill -9 <PID>
```

### Q: DNS server not responding
A: Check:
1. Process is running: `ps aux | grep node`
2. Port is listening: `sudo netstat -tulpn | grep :53`
3. Firewall allows port 53
4. Check logs for errors

### Q: Domains not syncing between devices
A: Server sync is one-way. Each client:
- Connects to same server
- Fetches domains periodically
- Caches locally

### Q: High CPU/Memory usage
A: Consider:
- Fewer domains
- Increase cache TTL
- Use PostgreSQL
- Add indexing
- Monitor query patterns

## Development

### Q: How do I contribute?
A: See CONTRIBUTING.md

### Q: Where can I report bugs?
A: GitHub Issues with:
- Reproduction steps
- Error logs
- Environment details

### Q: Can I modify the code?
A: Yes! It's MIT licensed. Fork, modify, improve.

### Q: How do I run tests?
A: `npm test` (tests coming in v1.1)

## Pricing

### Q: Is this free?
A: Yes! MIT licensed, completely free.

### Q: Can I use commercially?
A: Yes, but add proper authentication and security for production.

### Q: Is there a hosted version?
A: Not yet. Self-host or deploy to cloud provider.

## Support

### Q: Where do I get help?
A: 
- GitHub Issues
- GitHub Discussions
- Documentation
- Community forums (coming soon)

### Q: Is there professional support?
A: Not yet. Community-driven for now.

### Q: Can I hire you to customize?
A: Contact via GitHub for custom development inquiries.
