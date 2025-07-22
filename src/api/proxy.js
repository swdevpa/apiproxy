// Proxy API handler
export class ProxyAPI {
  constructor(proxyManager) {
    this.proxyManager = proxyManager;
  }

  async handle(request, url) {
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[2];
    
    if (!projectId) {
      return new Response('Project ID required', { status: 400 });
    }

    try {
      return await this.proxyManager.handleProxyRequest(request, projectId);
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response('Proxy request failed', { status: 500 });
    }
  }
}

// Logs API handler
export class LogsAPI {
  constructor(authManager, proxyManager) {
    this.authManager = authManager;
    this.proxyManager = proxyManager;
  }

  async handle(request, url) {
    const isAdmin = await this.authManager.verifyAdminToken(request);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401 });
    }

    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3];
    
    if (!projectId) {
      return new Response('Project ID required', { status: 400 });
    }

    try {
      const logs = await this.proxyManager.getProjectLogs(projectId);
      return new Response(JSON.stringify(logs), { 
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Logs error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
}