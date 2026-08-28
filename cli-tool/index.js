#!/usr/bin/env node

const axios = require('axios');
const Table = require('cli-table3');
const chalk = require('chalk');
const program = require('commander');
const fs = require('fs');
const path = require('path');

const DEFAULT_SERVER = 'http://localhost:3000';
let serverUrl = process.env.DOMAIN_DNS_SERVER || DEFAULT_SERVER;

program.version('1.0.0').description('Custom Domain DNS CLI Tool');

// Global options
program.option('-s, --server <url>', 'DNS server URL', (url) => {
    serverUrl = url;
});

// Add domain command
program
    .command('add <domain> <ip>')
    .description('Add a custom domain mapping')
    .action(async (domain, ip) => {
        try {
            const response = await axios.post(`${serverUrl}/api/domains`, {
                domain,
                ip_address: ip
            });
            console.log(chalk.green('✓') + ` Domain "${domain}" added → ${ip}`);
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Error: ${error.response?.data?.error || error.message}`);
            process.exit(1);
        }
    });

// List domains command
program
    .command('list')
    .description('List all custom domains')
    .option('-f, --format <type>', 'Output format (table, json, csv)', 'table')
    .action(async (options) => {
        try {
            const response = await axios.get(`${serverUrl}/api/domains`);
            const domains = response.data.data;

            if (domains.length === 0) {
                console.log(chalk.yellow('No domains found'));
                process.exit(0);
            }

            if (options.format === 'json') {
                console.log(JSON.stringify(domains, null, 2));
            } else if (options.format === 'csv') {
                console.log('domain,ip_address,created_at');
                domains.forEach(d => {
                    console.log(`${d.domain},${d.ip_address},${d.created_at}`);
                });
            } else {
                const table = new Table({
                    head: ['Domain', 'IP Address', 'Created'],
                    style: { head: [], border: ['grey'] }
                });
                domains.forEach(d => {
                    table.push([d.domain, d.ip_address, new Date(d.created_at).toLocaleDateString()]);
                });
                console.log(table.toString());
            }
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Error: ${error.message}`);
            process.exit(1);
        }
    });

// Get domain command
program
    .command('get <domain>')
    .description('Get a specific domain mapping')
    .action(async (domain) => {
        try {
            const response = await axios.get(`${serverUrl}/api/domains/${domain}`);
            const d = response.data.data;
            console.log(chalk.blue.bold('Domain:') + ` ${d.domain}`);
            console.log(chalk.blue.bold('IP:') + ` ${d.ip_address}`);
            console.log(chalk.blue.bold('Created:') + ` ${new Date(d.created_at).toLocaleString()}`);
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Domain not found`);
            process.exit(1);
        }
    });

// Update domain command
program
    .command('update <domain> <newip>')
    .description('Update a domain\'s IP address')
    .action(async (domain, newip) => {
        try {
            await axios.put(`${serverUrl}/api/domains/${domain}`, {
                ip_address: newip
            });
            console.log(chalk.green('✓') + ` Domain "${domain}" updated → ${newip}`);
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Error: ${error.response?.data?.error || error.message}`);
            process.exit(1);
        }
    });

// Delete domain command
program
    .command('delete <domain>')
    .description('Delete a domain mapping')
    .option('-f, --force', 'Skip confirmation')
    .action(async (domain, options) => {
        try {
            if (!options.force) {
                const inquirer = require('inquirer');
                const answer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: `Delete domain "${domain}"?`,
                        default: false
                    }
                ]);
                if (!answer.confirm) {
                    console.log('Cancelled');
                    process.exit(0);
                }
            }
            
            await axios.delete(`${serverUrl}/api/domains/${domain}`);
            console.log(chalk.green('✓') + ` Domain "${domain}" deleted`);
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Error: ${error.message}`);
            process.exit(1);
        }
    });

// Import command
program
    .command('import <file>')
    .description('Import domains from JSON file')
    .action(async (file) => {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
            let imported = 0;
            
            for (const domain of data) {
                try {
                    await axios.post(`${serverUrl}/api/domains`, domain);
                    imported++;
                } catch (e) {
                    console.log(chalk.yellow('⚠') + ` Skipped ${domain.domain}: ${e.response?.data?.error}`);
                }
            }
            
            console.log(chalk.green('✓') + ` Imported ${imported}/${data.length} domains`);
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Error: ${error.message}`);
            process.exit(1);
        }
    });

// Export command
program
    .command('export [file]')
    .description('Export all domains to JSON file')
    .action(async (file) => {
        try {
            const response = await axios.get(`${serverUrl}/api/domains`);
            const filename = file || `domains-${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(response.data.data, null, 2));
            console.log(chalk.green('✓') + ` Exported ${response.data.data.length} domains to ${filename}`);
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('✗') + ` Error: ${error.message}`);
            process.exit(1);
        }
    });

// Server status command
program
    .command('status')
    .description('Check server status')
    .action(async () => {
        try {
            const response = await axios.get(`${serverUrl}/health`);
            console.log(chalk.green('✓') + ` Server is ${response.data.status}`);
            console.log(chalk.blue.bold('Server URL:') + ` ${serverUrl}`);
            process.exit(0);
        } catch (error) {
            console.log(chalk.red('✗') + ` Server is offline`);
            console.log(chalk.blue.bold('Server URL:') + ` ${serverUrl}`);
            process.exit(1);
        }
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
