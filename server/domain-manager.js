const { v4: uuidv4 } = require('uuid');
const Logger = require('./utils/logger');

class DomainManager {
  constructor(db) {
    this.db = db;
    this.logger = new Logger('DomainManager');
    this.cache = new Map();
    this.cacheExpiry = 300000; // 5 minutes
  }

  async addDomain(domain, ip_address) {
    const id = uuidv4();
    const created_at = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO domains (id, domain, ip_address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, domain, ip_address, created_at, created_at],
        function(err) {
          if (err) {
            this.logger.error('Error adding domain:', err);
            reject(err);
          } else {
            this.logger.info(`Domain added: ${domain} -> ${ip_address}`);
            this.invalidateCache(domain);
            resolve({ id, domain, ip_address, created_at });
          }
        }.bind(this)
      );
    });
  }

  async getDomainMapping(domain) {
    // Check cache first
    if (this.cache.has(domain)) {
      const cached = this.cache.get(domain);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        this.logger.debug(`Cache hit for domain: ${domain}`);
        return cached.data;
      }
    }

    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM domains WHERE domain = ?`,
        [domain],
        (err, row) => {
          if (err) {
            this.logger.error('Error querying domain:', err);
            reject(err);
          } else {
            // Cache the result
            if (row) {
              this.cache.set(domain, { data: row, timestamp: Date.now() });
            }
            resolve(row || null);
          }
        }
      );
    });
  }

  getCachedDomainMapping(domain) {
    if (this.cache.has(domain)) {
      const cached = this.cache.get(domain);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }
    return null;
  }

  async getAllDomains() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM domains ORDER BY created_at DESC`,
        (err, rows) => {
          if (err) {
            this.logger.error('Error fetching domains:', err);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async updateDomain(domain, ip_address) {
    const updated_at = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE domains SET ip_address = ?, updated_at = ? WHERE domain = ?`,
        [ip_address, updated_at, domain],
        function(err) {
          if (err) {
            this.logger.error('Error updating domain:', err);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Domain not found'));
          } else {
            this.logger.info(`Domain updated: ${domain} -> ${ip_address}`);
            this.invalidateCache(domain);
            resolve({ domain, ip_address, updated_at });
          }
        }.bind(this)
      );
    });
  }

  async deleteDomain(domain) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM domains WHERE domain = ?`,
        [domain],
        function(err) {
          if (err) {
            this.logger.error('Error deleting domain:', err);
            reject(err);
          } else {
            this.logger.info(`Domain deleted: ${domain}`);
            this.invalidateCache(domain);
            resolve();
          }
        }.bind(this)
      );
    });
  }

  invalidateCache(domain) {
    this.cache.delete(domain);
    this.logger.debug(`Cache invalidated for domain: ${domain}`);
  }

  clearCache() {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }
}

module.exports = DomainManager;
