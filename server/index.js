#!/usr/bin/env node

const dns = require('dns2');
const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const DomainManager = require('./domain-manager');
const DatabaseManager = require('./database/manager');
const ICannBlocker = require('./icann-blocker');
const Logger = require('./utils/logger');

const PORT_DNS = process.env.DNS_PORT || 53;
const PORT_API = process.env.API_PORT || 3000;
const PORT_PROXY = process.env.PROXY_PORT || 8080;

let dns_server = null;
let api_server = null;
let proxy_server = null;

class CustomDNSServer {
  constructor() {
    this.logger = new Logger('CustomDNSServer');
    this.db = new DatabaseManager();
    this.domainManager = new DomainManager(this.db);
    this.icannBlocker = new ICannBlocker();
  }

  async initialize() {
    this.logger.info('Initializing Custom Domain DNS Server...');
    
    try {
      await this.db.initialize();
      this.logger.info('✓ Database initialized');
      
      await this.icannBlocker.loadBlocklist();
      this.logger.info('✓ ICANN blocklist loaded');
      
      this.startDNSServer();
      this.logger.info('✓ DNS Server started');
      
      this.startAPIServer();
      this.logger.info('✓ API Server started');
      
      this.startProxyServer();
      this.logger.info('✓ Proxy Server started');
      
      this.logger.info(`\n🌍 Custom Domain DNS System Ready!`);
      this.logger.info(`   DNS Server: 0.0.0.0:${PORT_DNS}`);
      this.logger.info(`   API Server: http://localhost:${PORT_API}`);
      this.logger.info(`   Proxy Server: http://localhost:${PORT_PROXY}`);
    } catch (error) {
      this.logger.error('Failed to initialize server:', error);
      process.exit(1);
    }
  }

  startDNSServer() {
    const dnsServer = dns.createServer({ udp: true, tcp: true });
    
    dnsServer.on('request', async (request, send, rinfo) => {
      try {
        const response = dns.Packet.createResponseFromRequest(request);
        const queries = request.questions;

        for (const query of queries) {
          const domain = query.name;
          
          // Block ICANN domains
          if (this.icannBlocker.isBlocked(domain)) {
            this.logger.warn(`[DNS] Blocked ICANN domain: ${domain}`);
            // Send empty response
            response.answers = [];
            continue;
          }

          // Lookup custom domain
          const mapping = await this.domainManager.getDomainMapping(domain);
          
          if (mapping) {
            this.logger.info(`[DNS] Resolved ${domain} -> ${mapping.ip_address}`);
            response.answers.push({
              name: domain,
              type: dns.Packet.TYPE.A,
              class: dns.Packet.CLASS.IN,
              ttl: 60,
              address: mapping.ip_address
            });
          } else {
            this.logger.debug(`[DNS] No mapping for domain: ${domain}`);
            response.answers = [];
          }
        }

        send(response);
      } catch (error) {
        this.logger.error('DNS Query Error:', error);
      }
    });

    dnsServer.listen({
      udp: PORT_DNS,
      tcp: PORT_DNS
    }, () => {
      this.logger.info(`DNS Server listening on port ${PORT_DNS}`);
    });

    dns_server = dnsServer;
  }

  startAPIServer() {
    const app = express();
    
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    // Add domain mapping
    app.post('/api/domains', async (req, res) => {
      try {
        const { domain, ip_address } = req.body;
        
        if (!domain || !ip_address) {
          return res.status(400).json({ error: 'Domain and IP required' });
        }

        if (this.icannBlocker.isBlocked(domain)) {
          return res.status(403).json({ error: 'ICANN domains not allowed' });
        }

        const result = await this.domainManager.addDomain(domain, ip_address);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logger.error('Add domain error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get all domains
    app.get('/api/domains', async (req, res) => {
      try {
        const domains = await this.domainManager.getAllDomains();
        res.json({ success: true, data: domains });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get domain by name
    app.get('/api/domains/:domain', async (req, res) => {
      try {
        const mapping = await this.domainManager.getDomainMapping(req.params.domain);
        if (!mapping) {
          return res.status(404).json({ error: 'Domain not found' });
        }
        res.json({ success: true, data: mapping });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Update domain
    app.put('/api/domains/:domain', async (req, res) => {
      try {
        const { ip_address } = req.body;
        const result = await this.domainManager.updateDomain(req.params.domain, ip_address);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Delete domain
    app.delete('/api/domains/:domain', async (req, res) => {
      try {
        await this.domainManager.deleteDomain(req.params.domain);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    api_server = app.listen(PORT_API, () => {
      this.logger.info(`API Server listening on port ${PORT_API}`);
    });
  }

  startProxyServer() {
    const proxy = httpProxy.createProxyServer({});
    const app = express();

    proxy.on('error', (err, req, res) => {
      this.logger.error('Proxy error:', err);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway');
    });

    app.use((req, res) => {
      const host = req.headers.host || req.url;
      const mapping = this.domainManager.getCachedDomainMapping(host);

      if (mapping) {
        const targetUrl = `http://${mapping.ip_address}:${req.headers['x-target-port'] || 80}`;
        this.logger.info(`[PROXY] Forwarding ${host} to ${targetUrl}`);
        proxy.web(req, res, { target: targetUrl, changeOrigin: true });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Domain not found in custom mappings');
      }
    });

    proxy_server = app.listen(PORT_PROXY, () => {
      this.logger.info(`Proxy Server listening on port ${PORT_PROXY}`);
    });
  }

  shutdown() {
    this.logger.info('Shutting down servers...');
    if (dns_server) dns_server.close();
    if (api_server) api_server.close();
    if (proxy_server) proxy_server.close();
    process.exit(0);
  }
}

// Initialize server
const server = new CustomDNSServer();
server.initialize();

// Handle graceful shutdown
process.on('SIGINT', () => server.shutdown());
process.on('SIGTERM', () => server.shutdown());

module.exports = CustomDNSServer;
