# Custom Domain DNS - Complete API Documentation

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently no authentication required. (Add in production!)

## Domains

### Create Domain

**POST** `/domains`

Add a new custom domain mapping.

**Request:**
```json
{
  "domain": "myapp.local",
  "ip_address": "192.168.1.100",
  "port": 8080
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "domain": "myapp.local",
    "ip_address": "192.168.1.100",
    "created_at": "2026-08-28T14:00:00Z",
    "updated_at": "2026-08-28T14:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid input
- `403` - ICANN domain blocked
- `500` - Server error

### List All Domains

**GET** `/domains`

Retrieve all custom domain mappings.

**Query Parameters:**
- `limit` (optional) - Max results (default: 100)
- `offset` (optional) - Pagination offset (default: 0)
- `sort` (optional) - Sort by field (created_at, domain)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "domain": "myapp.local",
      "ip_address": "192.168.1.100",
      "status": "active",
      "created_at": "2026-08-28T14:00:00Z",
      "updated_at": "2026-08-28T14:00:00Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

### Get Specific Domain

**GET** `/domains/:domain`

Get a specific domain mapping.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "domain": "myapp.local",
    "ip_address": "192.168.1.100",
    "created_at": "2026-08-28T14:00:00Z",
    "updated_at": "2026-08-28T14:00:00Z"
  }
}
```

### Update Domain

**PUT** `/domains/:domain`

Update a domain's IP address.

**Request:**
```json
{
  "ip_address": "192.168.1.101"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "domain": "myapp.local",
    "ip_address": "192.168.1.101",
    "updated_at": "2026-08-28T14:30:00Z"
  }
}
```

### Delete Domain

**DELETE** `/domains/:domain`

Delete a domain mapping.

**Response:**
```json
{
  "success": true,
  "message": "Domain deleted"
}
```

## System

### Health Check

**GET** `/health`

Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-28T14:00:00Z"
}
```

### Server Stats

**GET** `/stats`

Get server statistics.

**Response:**
```json
{
  "total_domains": 150,
  "dns_queries": 5420,
  "proxy_requests": 1230,
  "uptime_seconds": 86400,
  "database_size_mb": 2.5
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "timestamp": "2026-08-28T14:00:00Z"
}
```

### Common Error Codes

- `DOMAIN_NOT_FOUND` - Domain doesn't exist
- `DOMAIN_EXISTS` - Domain already exists
- `INVALID_INPUT` - Invalid request parameters
- `ICANN_BLOCKED` - ICANN domain not allowed
- `SERVER_ERROR` - Internal server error

## Rate Limiting

- API: 1000 requests per minute per IP
- DNS: 100 queries per second per IP

## CORS

CORS is enabled for all origins. Modify in production.

## Examples

### cURL

```bash
# Add domain
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -d '{"domain":"myapp.local","ip_address":"192.168.1.100"}'

# List all
curl http://localhost:3000/api/domains

# Get specific
curl http://localhost:3000/api/domains/myapp.local

# Update
curl -X PUT http://localhost:3000/api/domains/myapp.local \
  -H "Content-Type: application/json" \
  -d '{"ip_address":"192.168.1.101"}'

# Delete
curl -X DELETE http://localhost:3000/api/domains/myapp.local
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Add domain
await api.post('/domains', {
  domain: 'myapp.local',
  ip_address: '192.168.1.100'
});

// List domains
const { data } = await api.get('/domains');
console.log(data.data);

// Update domain
await api.put('/domains/myapp.local', {
  ip_address: '192.168.1.101'
});

// Delete domain
await api.delete('/domains/myapp.local');
```

### Python

```python
import requests

api_url = 'http://localhost:3000/api'

# Add domain
response = requests.post(f'{api_url}/domains', json={
    'domain': 'myapp.local',
    'ip_address': '192.168.1.100'
})
print(response.json())

# List domains
response = requests.get(f'{api_url}/domains')
print(response.json())

# Update domain
response = requests.put(f'{api_url}/domains/myapp.local', json={
    'ip_address': '192.168.1.101'
})
print(response.json())

# Delete domain
response = requests.delete(f'{api_url}/domains/myapp.local')
print(response.json())
```

## Webhooks (Planned)

Upcoming feature to trigger events on domain changes.
