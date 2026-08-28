const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Logger = require('./utils/logger');

class ICannBlocker {
  constructor() {
    this.logger = new Logger('ICannBlocker');
    this.blocklist = new Set();
    this.blocklistPath = path.join(__dirname, 'data', 'icann-domains.txt');
  }

  async loadBlocklist() {
    try {
      // Try to load from local file first
      if (fs.existsSync(this.blocklistPath)) {
        const data = fs.readFileSync(this.blocklistPath, 'utf-8');
        const domains = data.split('\n').filter(d => d.trim());
        domains.forEach(d => this.blocklist.add(d.toLowerCase()));
        this.logger.info(`Loaded ${domains.length} ICANN domains from local file`);
      } else {
        await this.downloadBlocklist();
      }
    } catch (error) {
      this.logger.error('Error loading blocklist:', error);
      // Use minimal blocklist as fallback
      this.loadDefaultBlocklist();
    }
  }

  async downloadBlocklist() {
    try {
      this.logger.info('Downloading ICANN domain blocklist...');
      // Download from public DNS blocklist sources
      const urls = [
        'https://publicsuffix.org/list/public_suffix_list.dat',
        'https://raw.githubusercontent.com/Th3M0rn1ng5t4r/Public-Suffix-List/master/public_suffix_list.dat'
      ];

      for (const url of urls) {
        try {
          const response = await axios.get(url, { timeout: 10000 });
          const domains = response.data
            .split('\n')
            .filter(line => line && !line.startsWith('//') && !line.includes('!'))
            .map(d => d.toLowerCase());
          
          domains.forEach(d => this.blocklist.add(d));
          this.logger.info(`Downloaded ${domains.length} ICANN domains from ${url}`);
          
          // Save locally
          this.ensureDataDir();
          fs.writeFileSync(this.blocklistPath, domains.join('\n'));
          break;
        } catch (error) {
          this.logger.warn(`Failed to download from ${url}:`, error.message);
        }
      }
    } catch (error) {
      this.logger.error('Error downloading blocklist:', error);
    }
  }

  loadDefaultBlocklist() {
    const defaults = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
      'co', 'uk', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch',
      'us', 'ca', 'mx', 'br', 'au', 'jp', 'cn', 'ru', 'in',
      'io', 'ai', 'app', 'dev', 'tech', 'online', 'site',
      'domain', 'website', 'store', 'shop', 'blog', 'news'
    ];
    defaults.forEach(d => this.blocklist.add(d));
    this.logger.warn('Loaded default ICANN blocklist');
  }

  isBlocked(domain) {
    if (!domain) return false;
    
    const parts = domain.toLowerCase().split('.');
    
    // Check each part and combination
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts.slice(i).join('.');
      if (this.blocklist.has(part)) {
        return true;
      }
    }
    
    return false;
  }

  addToDomainBlocklist(domain) {
    this.blocklist.add(domain.toLowerCase());
    this.logger.info(`Added to blocklist: ${domain}`);
    this.saveBlocklist();
  }

  removeFromBlocklist(domain) {
    this.blocklist.delete(domain.toLowerCase());
    this.logger.info(`Removed from blocklist: ${domain}`);
    this.saveBlocklist();
  }

  saveBlocklist() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(this.blocklistPath, Array.from(this.blocklist).join('\n'));
    } catch (error) {
      this.logger.error('Error saving blocklist:', error);
    }
  }

  ensureDataDir() {
    const dataDir = path.dirname(this.blocklistPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
}

module.exports = ICannBlocker;
