# API Proxy Manager - Deployment Guide

## Prerequisites

1. Cloudflare account with Workers enabled
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated with Cloudflare: `wrangler auth login`

## Setup Steps

### 1. Create KV Namespaces

```bash
# Create production KV namespaces
wrangler kv:namespace create "PROJECTS_KV" --env production
wrangler kv:namespace create "SECRETS_KV" --env production
```

Copy the namespace IDs and update `wrangler.toml`:

```toml
[[env.production.kv_namespaces]]
binding = "PROJECTS_KV"
id = "your_projects_kv_id_here"

[[env.production.kv_namespaces]]
binding = "SECRETS_KV" 
id = "your_secrets_kv_id_here"
```

### 2. Generate Secure Keys

Generate admin token (keep this secret!):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate encryption key (32 bytes, base64 encoded):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Set Worker Secrets

```bash
# Set admin token (use the generated token from step 2)
wrangler secret put ADMIN_TOKEN --env production

# Set encryption key (use the generated key from step 2)  
wrangler secret put ENCRYPTION_KEY --env production
```

### 4. Deploy

```bash
# Deploy to production
npm run deploy:production
```

## Security Configuration

### Environment Variables
- `ADMIN_TOKEN`: Secure token for admin access (32+ char random string)
- `ENCRYPTION_KEY`: Base64-encoded 32-byte key for secret encryption

### Rate Limiting
- Default: 100 requests per hour per IP
- Configurable per endpoint
- Automatic suspicious activity detection

### Security Headers
- HSTS enabled
- XSS protection
- Content type sniffing prevention
- Frame options protection
- CSP headers

## Usage

### Web Interface
- Visit your worker URL for the management dashboard
- Login with your admin token
- Create projects and manage API secrets

### API Endpoints

#### Admin Endpoints (require Authorization header)
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/secrets/{projectId}` - Get project secrets
- `POST /api/secrets/{projectId}/{key}` - Set secret
- `DELETE /api/secrets/{projectId}/{key}` - Delete secret

#### Proxy Endpoint
- `GET|POST /proxy/{projectId}?target_url=API_URL` - Proxy request

### Example Usage in Your Apps

```javascript
// In your web/mobile app
const apiCall = async (endpoint, data) => {
  const proxyUrl = 'https://your-worker.your-subdomain.workers.dev/proxy/your-project-id';
  const targetUrl = `https://api.example.com${endpoint}`;
  
  const response = await fetch(`${proxyUrl}?target_url=${encodeURIComponent(targetUrl)}`, {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : null
  });
  
  return response.json();
};
```

## Security Best Practices

1. **Token Management**
   - Use strong, unique admin tokens
   - Rotate tokens regularly
   - Never commit tokens to version control

2. **Secret Storage**
   - All secrets are encrypted at rest
   - Use descriptive secret keys (e.g., `header_x-api-key`)
   - Prefix header secrets with `header_` for automatic injection

3. **Network Security**  
   - Worker runs on Cloudflare's edge network
   - Automatic DDoS protection
   - Built-in rate limiting

4. **Monitoring**
   - All requests are logged with timestamps
   - Suspicious activity detection and logging
   - Request metrics per project

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Verify admin token is set correctly
   - Check Authorization header format: `Bearer YOUR_TOKEN`

2. **KV namespace errors**
   - Ensure namespace IDs in wrangler.toml are correct
   - Verify namespaces exist in Cloudflare dashboard

3. **Encryption errors**
   - Verify ENCRYPTION_KEY is properly base64 encoded
   - Regenerate key if corrupted

### Debug Mode

Add debug logging by setting environment variable in wrangler.toml:
```toml
[env.production.vars]
DEBUG = "true"
```

## Updates and Maintenance

- Regularly update dependencies: `npm update`
- Monitor worker usage in Cloudflare dashboard  
- Review security logs for suspicious activity
- Backup project configurations periodically