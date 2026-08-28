const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const Logger = require('../utils/logger');

class DatabaseManager {
  constructor() {
    this.logger = new Logger('DatabaseManager');
    this.dbPath = path.join(process.cwd(), 'data', 'custom-domains.db');
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          this.logger.error('Database connection error:', err);
          reject(err);
        } else {
          this.logger.info(`Database connected: ${this.dbPath}`);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Domains table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS domains (
            id TEXT PRIMARY KEY,
            domain TEXT UNIQUE NOT NULL,
            ip_address TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP,
            updated_at TIMESTAMP
          )
        `, (err) => {
          if (err) {
            this.logger.error('Error creating domains table:', err);
            reject(err);
          } else {
            this.logger.info('Domains table created/verified');
          }
        });

        // Domain history table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS domain_history (
            id TEXT PRIMARY KEY,
            domain_id TEXT NOT NULL,
            old_ip TEXT,
            new_ip TEXT,
            action TEXT,
            timestamp TIMESTAMP,
            FOREIGN KEY (domain_id) REFERENCES domains(id)
          )
        `, (err) => {
          if (err) {
            this.logger.error('Error creating domain_history table:', err);
            reject(err);
          } else {
            this.logger.info('Domain history table created/verified');
          }
        });

        // Access logs table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS access_logs (
            id TEXT PRIMARY KEY,
            domain TEXT NOT NULL,
            ip_requested TEXT,
            timestamp TIMESTAMP,
            status TEXT
          )
        `, (err) => {
          if (err) {
            this.logger.error('Error creating access_logs table:', err);
            reject(err);
          } else {
            this.logger.info('Access logs table created/verified');
            resolve();
          }
        });
      });
    });
  }

  run(sql, params, callback) {
    this.db.run(sql, params, callback);
  }

  get(sql, params, callback) {
    this.db.get(sql, params, callback);
  }

  all(sql, params, callback) {
    this.db.all(sql, params, callback);
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = DatabaseManager;
