// API configurations management
export class ApiConfigsHandler {
  constructor(proxyManager, authManager) {
    this.proxyManager = proxyManager;
    this.authManager = authManager;
  }

  async handleRequest(request, path) {
    const url = new URL(request.url);
    const pathParts = path.split('/').filter(p => p);
    
    // Authenticate request
    if (!await this.authManager.verifyAdminToken(request)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Debug logging
    console.log('API Configs Handler - Path:', path);
    console.log('API Configs Handler - PathParts:', pathParts);

    if (pathParts.length < 3) {
      return new Response('Invalid path - expected at least /api/api-configs/{projectId}', { status: 400 });
    }

    const projectId = pathParts[2]; // pathParts = ['api', 'api-configs', 'projectId', ...]

    switch (request.method) {
      case 'GET':
        if (pathParts.length === 3) {
          // GET /api/api-configs/{projectId} - List all API configs for project
          return this.listApiConfigs(projectId);
        } else if (pathParts.length === 4) {
          // GET /api/api-configs/{projectId}/{domain} - Get specific API config
          const domain = pathParts[3];
          return this.getApiConfig(projectId, domain);
        }
        break;
        
      case 'POST':
        if (pathParts.length === 4) {
          // POST /api/api-configs/{projectId}/{domain} - Create/update API config
          const domain = pathParts[3];
          return this.saveApiConfig(request, projectId, domain);
        }
        break;
        
      case 'DELETE':
        if (pathParts.length === 4) {
          // DELETE /api/api-configs/{projectId}/{domain} - Delete API config
          const domain = pathParts[3];
          return this.deleteApiConfig(projectId, domain);
        }
        break;
    }

    return new Response('Not Found', { status: 404 });
  }

  async listApiConfigs(projectId) {
    try {
      console.log('API Configs Handler - Listing configs for project:', projectId);
      const configs = await this.proxyManager.getProjectApiConfigs(projectId);
      console.log('API Configs Handler - Retrieved configs:', configs);
      
      return new Response(JSON.stringify(configs), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error in listApiConfigs handler:', error.message, error.stack);
      return new Response(JSON.stringify({ 
        error: 'Failed to load API configurations',
        details: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async getApiConfig(projectId, domain) {
    try {
      const config = await this.proxyManager.getCustomApiConfig(projectId, domain);
      if (!config) {
        return new Response(JSON.stringify({ error: 'API config not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify(config), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error getting API config:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async saveApiConfig(request, projectId, domain) {
    try {
      console.log('API Configs Handler - Saving config for project:', projectId, 'domain:', domain);
      
      const config = await request.json();
      console.log('API Configs Handler - Config data:', config);
      
      // Validate configuration
      if (!this.validateApiConfig(config)) {
        console.log('API Configs Handler - Validation failed');
        return new Response(JSON.stringify({ error: 'Invalid API configuration' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('API Configs Handler - Calling saveCustomApiConfig');
      const success = await this.proxyManager.saveCustomApiConfig(projectId, domain, config);
      console.log('API Configs Handler - Save result:', success);
      
      if (success) {
        return new Response(JSON.stringify({ 
          message: 'API configuration saved successfully',
          domain: domain,
          config: config
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Failed to save API configuration' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Error in saveApiConfig handler:', error.message, error.stack);
      return new Response(JSON.stringify({ 
        error: 'Failed to save API configuration',
        details: error.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async deleteApiConfig(projectId, domain) {
    try {
      const configKey = `api_config:${projectId}:${domain}`;
      await this.proxyManager.env.APIPROXY_PROJECTS_KV.delete(configKey);
      
      return new Response(JSON.stringify({ 
        message: 'API configuration deleted successfully',
        domain: domain
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error deleting API config:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  validateApiConfig(config) {
    // Required fields
    if (!config.authType || !config.secretKey) {
      return false;
    }

    // Valid auth types
    const validAuthTypes = ['header', 'query_param', 'oauth'];
    if (!validAuthTypes.includes(config.authType)) {
      return false;
    }

    // Header-specific validation
    if (config.authType === 'header') {
      if (!config.header) {
        return false;
      }
    }

    // Query param-specific validation
    if (config.authType === 'query_param') {
      if (!config.param) {
        return false;
      }
    }

    // OAuth-specific validation
    if (config.authType === 'oauth') {
      if (!config.oauthTokenUrl || !config.oauthClientIdSecret || !config.oauthClientSecretSecret) {
        return false;
      }
      // Grant type is optional, defaults to 'client_credentials'
      if (config.oauthGrantType && !['client_credentials', 'authorization_code'].includes(config.oauthGrantType)) {
        return false;
      }
    }

    return true;
  }
}