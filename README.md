# API Proxy Manager

A secure, centralized API proxy management system hosted on Cloudflare Workers with enterprise-grade security and modular architecture. Instead of creating separate proxy workers for each project, manage all your API secrets and proxies from one secure, scalable dashboard.

## Features

🔒 **Enterprise Security**
- AES-GCM encrypted secret storage with client-side encryption
- Token-based authentication with constant-time comparison
- Configurable rate limiting (200 req/hour default)
- Comprehensive security headers (HSTS, CSP, XSS protection)
- Suspicious activity detection and logging
- DDoS protection via Cloudflare Edge Network

📱 **Multi-Project Architecture**
- Support for Web Apps, iOS/Android apps, Expo projects
- Complete project isolation with encrypted secret management
- Automatic HTTP header injection (`header_` prefix convention)
- Real-time request logging and monitoring per project
- RESTful API for programmatic management

🏗️ **Modern Modular Architecture**
- Clean separation of concerns with ES6 modules
- Dedicated API handlers for projects, secrets, and proxy management
- Configurable templates and routing system
- Comprehensive error handling and logging
- Production-ready scalability

🚀 **Developer Experience**
- Single Cloudflare Worker deployment
- Intuitive web-based management interface
- Complete REST API with OpenAPI-compatible endpoints
- Detailed documentation and setup guides
- Zero-downtime deployments

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  API Proxy       │    │  Target APIs    │
│                 │    │  Manager         │    │                 │
│ • Web Apps      │────│                  │────│ • OpenAI        │
│ • iOS Apps      │    │ • Auth Layer     │    │ • Firebase      │
│ • Android Apps  │    │ • Secret Mgmt    │    │ • Custom APIs   │
│ • Expo Apps     │    │ • Rate Limiting  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

- **Router**: Clean request routing with middleware support
- **Security Manager**: Rate limiting, suspicious activity detection, security headers
- **Project Manager**: CRUD operations for projects with encrypted storage
- **Proxy Manager**: HTTP request proxying with automatic header injection
- **Auth Manager**: Token-based authentication with timing attack protection
- **Encryption Manager**: AES-GCM encryption for sensitive data

## Quick Start

### Prerequisites
- Node.js 18+ with npm
- Cloudflare account with Workers enabled
- Wrangler CLI 3.0+

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo>
   cd api-proxy
   npm install
   ```

2. **Configure Cloudflare Authentication**
   ```bash
   npx wrangler auth login
   ```

3. **Create KV Namespaces**
   ```bash
   npx wrangler kv namespace create "APIPROXY_PROJECTS_KV"
   npx wrangler kv namespace create "APIPROXY_SECRETS_KV"
   ```

4. **Update Configuration**
   Update `wrangler.toml` with your KV namespace IDs

5. **Set Security Secrets**
   ```bash
   # Generate and set admin token (keep secure!)
   npx wrangler secret put ADMIN_TOKEN
   
   # Generate and set encryption key (32-byte base64)
   npx wrangler secret put ENCRYPTION_KEY
   ```

6. **Deploy**
   ```bash
   npm run deploy
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions and [USER-GUIDE.md](USER-GUIDE.md) / [BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md) for usage documentation.

## API Usage Examples

### Basic Proxy Request

```javascript
// Your app makes requests through the proxy
const response = await fetch(
  'https://your-worker.workers.dev/proxy/my-project-id?target_url=https://api.openai.com/v1/chat/completions',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello!" }]
    })
  }
);

// API keys are automatically injected server-side
// Your OpenAI API key (stored as header_authorization) is added automatically
```

### iOS Swift Integration

```swift
class APIManager {
    private let proxyBaseURL = "https://your-worker.workers.dev/proxy/ios-app"
    
    func chatCompletion(message: String) async throws -> ChatResponse {
        let targetURL = "https://api.openai.com/v1/chat/completions"
        let proxyURL = "\(proxyBaseURL)?target_url=\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        
        var request = URLRequest(url: URL(string: proxyURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = ChatRequest(
            model: "gpt-3.5-turbo", 
            messages: [Message(role: "user", content: message)]
        )
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(ChatResponse.self, from: data)
    }
}
```

### React/Web Integration

```javascript
class APIService {
  constructor(projectId) {
    this.proxyURL = `https://your-worker.workers.dev/proxy/${projectId}`;
  }

  async makeRequest(targetEndpoint, options = {}) {
    const targetURL = `https://api.example.com${targetEndpoint}`;
    
    const response = await fetch(
      `${this.proxyURL}?target_url=${encodeURIComponent(targetURL)}`,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : null
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}
```

## Project Structure

```
src/
├── index.js              # Main entry point (62 lines, clean!)
├── router.js             # Request routing and middleware
├── config.js             # Configuration constants and settings
├── api/                  # Modular API handlers
│   ├── projects.js       # Project CRUD operations
│   ├── secrets.js        # Secret management with encryption
│   └── proxy.js          # Proxy handling and request logging
├── templates/            # HTML templates and client-side code
│   ├── login.js          # Authentication interface
│   ├── dashboard.js      # Management dashboard HTML
│   └── dashboard-script.js # Client-side functionality
├── auth.js              # Token authentication with timing attack protection
├── security.js         # Rate limiting, security headers, activity detection
├── encryption.js        # AES-GCM encryption for sensitive data
├── project-manager.js   # Project lifecycle management
└── proxy.js            # HTTP proxy with header injection
```

## Security Architecture

### Authentication Flow
1. Admin authenticates via secure token (constant-time comparison)
2. Client-side session management with localStorage
3. API requests require Bearer token authorization
4. Automatic token validation and cleanup

### Secret Management
1. All API secrets encrypted with AES-GCM before storage
2. Encryption keys stored as Cloudflare Worker secrets
3. Automatic header injection using `header_` prefix convention
4. No client-side exposure of sensitive credentials

### Security Layers
- **Transport**: HTTPS only with HSTS headers
- **Application**: Rate limiting, suspicious activity detection
- **Data**: Encrypted storage with secure key management
- **Infrastructure**: Cloudflare's global security and DDoS protection

## REST API Reference

### Projects API

```bash
GET    /api/projects           # List all projects
POST   /api/projects           # Create project
GET    /api/projects/{id}      # Get project details
PUT    /api/projects/{id}      # Update project
DELETE /api/projects/{id}      # Delete project
```

### Secrets API

```bash
GET    /api/secrets/{project_id}           # List project secrets
POST   /api/secrets/{project_id}/{key}     # Set secret
GET    /api/secrets/{project_id}/{key}     # Get secret (decrypted)
DELETE /api/secrets/{project_id}/{key}     # Delete secret
```

### Proxy API

```bash
GET|POST /proxy/{project_id}?target_url=... # Proxy request with auto header injection
GET      /api/logs/{project_id}             # Get request logs
```

## Configuration

### Environment Variables
- `ADMIN_TOKEN`: Secure admin authentication token
- `ENCRYPTION_KEY`: 32-byte base64 encryption key for secrets

### Rate Limiting
- Default: 200 requests per hour per client IP
- Configurable per endpoint in `src/config.js`
- Automatic cleanup and sliding window implementation

### Supported Project Types
- Web Applications
- iOS Applications  
- Android Applications
- Expo/React Native Applications
- Custom/Other project types

## Monitoring and Logging

- **Request Logging**: All proxy requests logged with timestamps
- **Security Logging**: Suspicious activity detection and logging
- **Performance Monitoring**: Built-in Cloudflare Workers analytics
- **Error Tracking**: Comprehensive error handling and logging

## Why This Architecture?

**Instead of:**
- ❌ Creating new Cloudflare Worker per project
- ❌ Hardcoding API keys in client applications
- ❌ Managing multiple proxy endpoints and configurations
- ❌ Monolithic, unmaintainable code structures

**You get:**
- ✅ Single, secure proxy for unlimited projects
- ✅ Centralized secret management with encryption
- ✅ Zero-trust architecture (clients never see secrets)
- ✅ Enterprise-grade security and monitoring
- ✅ Modular, maintainable, testable codebase
- ✅ Automatic scaling via Cloudflare's edge network

## Production Considerations

- **Scaling**: Handles thousands of requests per second via Cloudflare's edge
- **Reliability**: Built-in redundancy and automatic failover
- **Security**: Regular security audits and best practices implementation
- **Monitoring**: Comprehensive logging and alerting capabilities
- **Maintenance**: Modular architecture enables easy updates and feature additions

Perfect for developers, startups, and enterprises managing multiple client applications that require secure API integration without exposing sensitive credentials.