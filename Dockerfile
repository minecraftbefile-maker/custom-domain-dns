FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/ ./server/
WORKDIR /app/server

# Install dependencies
RUN npm ci --production

# Create data directory
RUN mkdir -p /app/data /app/logs

# Expose ports
EXPOSE 53/udp 53/tcp 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start server
CMD ["node", "index.js"]
