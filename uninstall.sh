#!/bin/bash
# Custom Domain DNS - Uninstall Script

set -e

echo "🗑️  Custom Domain DNS - Uninstall"
echo "================================="
echo ""

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Uninstalling from Linux..."
    
    if [ -f "/etc/systemd/system/custom-domain-dns.service" ]; then
        echo "Stopping service..."
        sudo systemctl stop custom-domain-dns 2>/dev/null || true
        sudo systemctl disable custom-domain-dns 2>/dev/null || true
        
        echo "Removing service..."
        sudo rm /etc/systemd/system/custom-domain-dns.service
        sudo systemctl daemon-reload
    fi
    
    if [ -d "/opt/custom-domain-dns" ]; then
        echo "Removing installation directory..."
        sudo rm -rf /opt/custom-domain-dns
    fi
    
    echo "✓ Uninstalled from Linux"
    
elif [[ "$OSTYPE" == "msys" ]]; then
    echo "Uninstalling from Windows..."
    echo "Run this as Administrator:"
    echo ""
    echo "net stop CustomDomainDNS"
    echo "nssm remove CustomDomainDNS confirm"
    echo "rmdir C:\path\to\custom-domain-dns /s"
    echo ""
    echo "✓ Instructions provided"
else
    echo "❌ Unsupported OS"
    exit 1
fi

echo ""
echo "✓ Uninstall complete"
