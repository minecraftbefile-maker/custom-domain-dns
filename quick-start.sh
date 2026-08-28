#!/bin/bash
# Custom Domain DNS - Quick Start Script

set -e

echo "🚀 Custom Domain DNS - Quick Start"
echo "================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 14+"
    exit 1
fi
echo "✓ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi
echo "✓ npm $(npm --version) found"

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]]; then
    OS="windows"
else
    OS="unknown"
fi
echo "✓ Detected OS: $OS"

echo ""
echo "📦 Installing dependencies..."
cd server
npm install
cd ..
echo "✓ Dependencies installed"

echo ""
echo "⚙️  Configuration"
echo "-----------------"

if [ ! -f "server/.env" ]; then
    echo "Creating .env file from template..."
    cp server/.env.example server/.env
    echo "✓ .env created. Edit server/.env to customize ports if needed."
else
    echo "✓ .env already exists"
fi

echo ""
echo "📝 Summary"
echo "-----------"
echo "Installation complete! Next steps:"
echo ""
echo "1. Start the server:"
echo "   cd server && npm start"
echo ""
echo "2. In another terminal, install browser addon:"
echo "   - Chrome/Edge: Go to chrome://extensions/"
echo "   - Firefox: Go to about:debugging"
echo "   - Load unpacked: Select browser-addon folder"
echo ""
echo "3. Add a test domain:"
echo "   curl -X POST http://localhost:3000/api/domains \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"domain\":\"test.local\",\"ip_address\":\"192.168.1.1\"}'"
echo ""
echo "4. Test DNS:"
echo "   nslookup test.local 127.0.0.1"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Overview and features"
echo "   - INSTALLATION.md - Detailed setup instructions"
echo "   - API.md - API documentation"
echo "   - FAQ.md - Common questions"
echo ""
echo "🌐 Access URLs:"
echo "   - API: http://localhost:3000"
echo "   - Health: http://localhost:3000/health"
echo ""
