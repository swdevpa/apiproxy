export class ProxyManager {
  constructor(env, projectManager, authManager) {
    this.env = env;
    this.projectManager = projectManager;
    this.authManager = authManager;
  }

  // Handle proxy requests
  async handleProxyRequest(request, projectId, targetPath) {
    // Verify project exists and is active
    const project = await this.projectManager.getProject(projectId);
    if (!project || !project.active) {
      return new Response('Project not found or inactive', { status: 404 });
    }

    // Get project secrets for authentication
    const secrets = await this.projectManager.getAllSecrets(projectId);
    
    // Extract target URL from request
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('target_url');
    
    if (!targetUrl) {
      return new Response('Missing target_url parameter', { status: 400 });
    }

    try {
      // Create new request with modified headers
      const proxyHeaders = new Headers(request.headers);
      
      // Remove proxy-specific headers
      proxyHeaders.delete('host');
      proxyHeaders.delete('cf-connecting-ip');
      proxyHeaders.delete('cf-ray');
      
      // Add API keys from project secrets
      for (const [key, secretData] of Object.entries(secrets)) {
        if (key.startsWith('header_')) {
          const headerName = key.replace('header_', '').replace(/_/g, '-');
          proxyHeaders.set(headerName, secretData.value);
        }
      }

      // Create proxy request
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
      });

      // Make the proxied request
      const response = await fetch(proxyRequest);
      
      // Create response with CORS headers
      const proxyResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: this.addCorsHeaders(response.headers)
      });

      // Log the request (for monitoring)
      await this.logRequest(projectId, request, response);

      return proxyResponse;
      
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response('Proxy request failed', { status: 500 });
    }
  }

  // Add CORS headers to response
  addCorsHeaders(originalHeaders) {
    const headers = new Headers(originalHeaders);
    
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    headers.set('Access-Control-Max-Age', '86400');
    
    return headers;
  }

  // Log requests for monitoring
  async logRequest(projectId, request, response) {
    const logEntry = {
      projectId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: new URL(request.url).pathname,
      status: response.status,
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Store in KV with TTL (30 days)
    const logKey = `log:${projectId}:${Date.now()}`;
    await this.env.PROJECTS_KV.put(logKey, JSON.stringify(logEntry), { expirationTtl: 2592000 });
  }

  // Get request logs for a project
  async getProjectLogs(projectId, limit = 100) {
    const { keys } = await this.env.PROJECTS_KV.list({ 
      prefix: `log:${projectId}:`,
      limit 
    });
    
    const logs = [];
    for (const key of keys) {
      const logData = await this.env.PROJECTS_KV.get(key.name);
      if (logData) {
        logs.push(JSON.parse(logData));
      }
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}