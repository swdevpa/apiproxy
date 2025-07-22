# API Proxy Manager

A secure, centralized API proxy management system hosted on Cloudflare Workers. Instead of creating separate proxy workers for each project, manage all your API secrets and proxies from one secure dashboard.

## Features

= **Security First**
- Encrypted secret storage with AES-GCM
- Personal authentication with secure tokens  
- Rate limiting and DDoS protection
- Security headers and suspicious activity detection

=ñ **Multi-Project Support**
- Manage APIs for web apps, iOS/Android apps, Expo projects
- Project isolation and separate secret management
- Request logging and monitoring per project

=€ **Easy Deployment**
- Single Cloudflare Worker deployment
- Web-based management interface
- RESTful API for automation

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd api-proxy
   npm install
   ```

2. **Configure Cloudflare**
   ```bash
   wrangler auth login
   npm run deploy
   ```

3. **Set Security Keys**
   - Generate admin token and encryption key
   - Set as Worker secrets
   - Access dashboard at your worker URL

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## Usage Example

```javascript
// In your React/Expo app
const response = await fetch(
  'https://your-worker.workers.dev/proxy/my-ios-app?target_url=https://api.example.com/users',
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
);
```

Your API secrets (API keys, tokens) are automatically injected by the proxy based on your project configuration.

## Architecture

- **Frontend**: Clean web dashboard for project management
- **Backend**: Cloudflare Worker with secure authentication
- **Storage**: Cloudflare KV for encrypted secrets and metadata
- **Security**: Multiple layers including rate limiting, encryption, monitoring

## Why This Approach?

Instead of:
- L Creating new Cloudflare Worker per project
- L Hardcoding API keys in mobile apps
- L Managing multiple proxy endpoints

You get:
-  One secure proxy for all projects
-  Centralized secret management  
-  Easy project onboarding
-  Built-in security and monitoring

Perfect for developers managing multiple web apps, mobile apps, or client projects that need API proxying.