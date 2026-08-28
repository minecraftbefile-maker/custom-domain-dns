# Security Policy

## Reporting Security Issues

**Do not** open GitHub issues for security vulnerabilities.

Email: security@customdomaindns.dev

## Security Best Practices

### 1. Network Security

- Use firewall rules to restrict access
- Only expose necessary ports (53, 3000, 8080)
- Use VPN/SSH tunneling for remote access
- Enable encryption in transit (HTTPS/DNS-over-TLS planned)

### 2. Authentication (Implement in Production)

```javascript
// Example: Add API key authentication
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !validateApiKey(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 3. Database Security

- Use strong database passwords
- Enable SQLite encryption (SEE extension)
- Regular backups
- Restrict file permissions: `chmod 600 custom-domains.db`

### 4. DNS Security

- Implement DNSSEC validation
- Use DNS-over-TLS (DoT) for queries
- Implement rate limiting
- Monitor for DNS poisoning

### 5. Input Validation

Always validate domain names and IP addresses:

```javascript
const isValidDomain = (domain) => {
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
  return domainRegex.test(domain);
};

const isValidIP = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Regex.test(ip) && ip.split('.').every(n => n < 256);
};
```

### 6. Logging and Monitoring

- Log all DNS queries
- Monitor for unusual patterns
- Set up alerts for failures
- Regular security audits

### 7. CORS Configuration (Production)

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
```

### 8. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Deployment Security Checklist

- [ ] Change default ports (53, 3000, 8080)
- [ ] Enable HTTPS/TLS
- [ ] Implement authentication
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Regular security updates
- [ ] Database backups
- [ ] Incident response plan

## Known Limitations

1. **No built-in authentication** - Add your own
2. **HTTP-only by default** - Use reverse proxy for HTTPS
3. **SQLite single-file** - Use PostgreSQL for production
4. **No rate limiting** - Implement externally
5. **CORS enabled for all** - Restrict in production

## Vulnerability Disclosure

We appreciate responsible disclosure. Please allow 90 days for fixes before public disclosure.
