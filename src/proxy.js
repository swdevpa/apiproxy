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
    let targetUrl = url.searchParams.get('target_url');
    
    if (!targetUrl) {
      return new Response('Missing target_url parameter', { status: 400 });
    }
    
    // Modify target URL to add query parameters if needed
    targetUrl = await this.modifyTargetUrl(targetUrl, secrets, projectId);

    try {
      // Create new request with modified headers
      const proxyHeaders = new Headers(request.headers);
      
      // Remove proxy-specific headers
      proxyHeaders.delete('host');
      proxyHeaders.delete('cf-connecting-ip');
      proxyHeaders.delete('cf-ray');
      
      // Add API-specific authentication
      await this.injectApiAuthentication(proxyHeaders, secrets, targetUrl, projectId);

      // Create proxy request
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
      });

      // Make the proxied request
      let response = await fetch(proxyRequest);
      
      // Check if we got a 401 Unauthorized and have OAuth config for auto-refresh
      if (response.status === 401) {
        const urlObj = new URL(targetUrl);
        const domain = urlObj.hostname;
        const customConfig = await this.getCustomApiConfig(projectId, domain);
        
        if (customConfig && customConfig.authType === 'oauth') {
          console.log('Got 401, attempting OAuth token refresh for', domain);
          
          const refreshResult = await this.refreshOAuthToken(customConfig, secrets, projectId);
          if (refreshResult.success) {
            console.log('Token refresh successful, retrying request');
            
            // Update headers with new token
            const newProxyHeaders = new Headers(request.headers);
            newProxyHeaders.delete('host');
            newProxyHeaders.delete('cf-connecting-ip');
            newProxyHeaders.delete('cf-ray');
            
            // Re-inject authentication with refreshed token
            const refreshedSecrets = await this.projectManager.getAllSecrets(projectId);
            await this.injectApiAuthentication(newProxyHeaders, refreshedSecrets, targetUrl, projectId);
            
            // Retry the request
            const retryRequest = new Request(targetUrl, {
              method: request.method,
              headers: newProxyHeaders,
              body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
            });
            
            response = await fetch(retryRequest);
          } else {
            console.error('Token refresh failed:', refreshResult.error);
          }
        }
      }
      
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
    await this.env.APIPROXY_PROJECTS_KV.put(logKey, JSON.stringify(logEntry), { expirationTtl: 2592000 });
  }

  // Inject API-specific authentication based on target URL
  async injectApiAuthentication(headers, secrets, targetUrl, projectId) {
    const urlObj = new URL(targetUrl);
    const domain = urlObj.hostname;
    
    // Built-in API configurations
    const builtInConfigs = {
      'api.nal.usda.gov': {
        authType: 'query_param',
        param: 'api_key',
        secretKey: 'usda_api_key'
      },
      'api.openweathermap.org': {
        authType: 'query_param', 
        param: 'appid',
        secretKey: 'openweather_api_key'
      },
      'api.stripe.com': {
        authType: 'header',
        header: 'Authorization',
        format: 'Bearer {key}',
        secretKey: 'stripe_api_key'
      },
      'api.github.com': {
        authType: 'header',
        header: 'Authorization',
        format: 'token {key}',
        secretKey: 'github_api_key'
      },
      'maps.googleapis.com': {
        authType: 'query_param',
        param: 'key',
        secretKey: 'google_maps_api_key'
      },
      'generativelanguage.googleapis.com': {
        authType: 'query_param',
        param: 'key',
        secretKey: 'google_gemini_api_key'
      }
    };
    
    // Check for custom API configurations first
    const customConfig = await this.getCustomApiConfig(projectId, domain);
    const config = customConfig || builtInConfigs[domain];
    
    if (config && secrets[config.secretKey]) {
      const apiKey = secrets[config.secretKey].value;
      
      if (config.authType === 'header') {
        const authValue = config.format ? config.format.replace('{key}', apiKey) : apiKey;
        headers.set(config.header, authValue);
      } else if (config.authType === 'oauth') {
        // For OAuth, treat it like a header with Bearer token format
        const authValue = config.format ? config.format.replace('{key}', apiKey) : `Bearer ${apiKey}`;
        headers.set(config.header || 'Authorization', authValue);
      }
      // Query param injection is handled in the URL modification step
      
      return;
    }
    
    // Fallback to legacy header_ prefix system for backward compatibility
    for (const [key, secretData] of Object.entries(secrets)) {
      if (key.startsWith('header_')) {
        const headerName = key.replace('header_', '').replace(/_/g, '-');
        headers.set(headerName, secretData.value);
      }
    }
  }
  
  // Modify target URL to add query parameters if needed
  async modifyTargetUrl(targetUrl, secrets, projectId) {
    const urlObj = new URL(targetUrl);
    const domain = urlObj.hostname;
    
    // Built-in API configurations (same as above)
    const builtInConfigs = {
      'api.nal.usda.gov': {
        authType: 'query_param',
        param: 'api_key',
        secretKey: 'usda_api_key'
      },
      'api.openweathermap.org': {
        authType: 'query_param',
        param: 'appid', 
        secretKey: 'openweather_api_key'
      },
      'maps.googleapis.com': {
        authType: 'query_param',
        param: 'key',
        secretKey: 'google_maps_api_key'
      },
      'generativelanguage.googleapis.com': {
        authType: 'query_param',
        param: 'key',
        secretKey: 'google_gemini_api_key'
      }
    };
    
    // Check for custom API configurations first
    const customConfig = await this.getCustomApiConfig(projectId, domain);
    const config = customConfig || builtInConfigs[domain];
    
    if (config && config.authType === 'query_param' && secrets[config.secretKey]) {
      urlObj.searchParams.set(config.param, secrets[config.secretKey].value);
      return urlObj.toString();
    }
    
    return targetUrl;
  }

  // Get custom API configuration for a project and domain
  async getCustomApiConfig(projectId, domain) {
    try {
      const configKey = `api_config:${projectId}:${domain}`;
      const configData = await this.env.APIPROXY_PROJECTS_KV.get(configKey);
      return configData ? JSON.parse(configData) : null;
    } catch (error) {
      console.error('Error loading custom API config:', error);
      return null;
    }
  }

  // Save custom API configuration
  async saveCustomApiConfig(projectId, domain, config) {
    try {
      console.log('ProxyManager - Saving API config for project:', projectId, 'domain:', domain);
      
      // Check if KV namespace is available
      if (!this.env.APIPROXY_PROJECTS_KV) {
        console.error('KV namespace APIPROXY_PROJECTS_KV is not available');
        return false;
      }
      
      const configKey = `api_config:${projectId}:${domain}`;
      console.log('ProxyManager - Using config key:', configKey);
      
      await this.env.APIPROXY_PROJECTS_KV.put(configKey, JSON.stringify(config));
      console.log('ProxyManager - Successfully saved API config');
      
      return true;
    } catch (error) {
      console.error('Error saving custom API config:', error.message, error.stack);
      
      // Handle specific error types
      if (error.message?.includes('binding')) {
        console.error('KV binding error - check wrangler.toml configuration');
      }
      if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
        console.error('Authentication error - check worker permissions');
      }
      
      return false;
    }
  }

  // List all custom API configurations for a project
  async getProjectApiConfigs(projectId) {
    try {
      console.log('Loading API configs for project:', projectId);
      
      // Check if KV namespace is available
      if (!this.env.APIPROXY_PROJECTS_KV) {
        console.error('KV namespace APIPROXY_PROJECTS_KV is not available');
        return {};
      }
      
      const { keys } = await this.env.APIPROXY_PROJECTS_KV.list({ 
        prefix: `api_config:${projectId}:` 
      });
      
      console.log('Found API config keys:', keys.length);
      const configs = {};
      for (const key of keys) {
        try {
          const configData = await this.env.APIPROXY_PROJECTS_KV.get(key.name);
          if (configData) {
            const domain = key.name.split(':')[2];
            configs[domain] = JSON.parse(configData);
            console.log('Loaded config for domain:', domain);
          }
        } catch (parseError) {
          console.error('Error parsing config for key:', key.name, parseError);
        }
      }
      
      console.log('Final configs:', configs);
      return configs;
    } catch (error) {
      console.error('Error loading project API configs:', error.message, error.stack);
      
      // Handle specific error types
      if (error.message?.includes('binding')) {
        console.error('KV binding error - check wrangler.toml configuration');
      }
      if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
        console.error('Authentication error - check worker permissions');
      }
      
      return {}; // Return empty object on error to prevent 500s
    }
  }

  // Get request logs for a project
  async getProjectLogs(projectId, limit = 100) {
    const { keys } = await this.env.APIPROXY_PROJECTS_KV.list({ 
      prefix: `log:${projectId}:`,
      limit 
    });
    
    const logs = [];
    for (const key of keys) {
      const logData = await this.env.APIPROXY_PROJECTS_KV.get(key.name);
      if (logData) {
        logs.push(JSON.parse(logData));
      }
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Refresh OAuth token when it expires
  async refreshOAuthToken(config, secrets, projectId) {
    try {
      console.log('Starting OAuth token refresh...');
      
      // Get OAuth credentials from secrets
      const clientId = secrets[config.oauthClientIdSecret]?.value;
      const clientSecret = secrets[config.oauthClientSecretSecret]?.value;
      
      if (!clientId || !clientSecret) {
        return {
          success: false,
          error: 'OAuth credentials not found in secrets'
        };
      }
      
      // Prepare token request body
      const tokenBody = new URLSearchParams();
      tokenBody.append('grant_type', config.oauthGrantType || 'client_credentials');
      tokenBody.append('client_id', clientId);
      tokenBody.append('client_secret', clientSecret);
      
      if (config.oauthScope) {
        tokenBody.append('scope', config.oauthScope);
      }
      
      console.log('Making OAuth token request to:', config.oauthTokenUrl);
      
      // Make token request
      const tokenResponse = await fetch(config.oauthTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: tokenBody.toString()
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('OAuth token request failed:', tokenResponse.status, errorText);
        return {
          success: false,
          error: `Token request failed: ${tokenResponse.status} ${errorText}`
        };
      }
      
      const tokenData = await tokenResponse.json();
      console.log('OAuth token response received');
      
      if (!tokenData.access_token) {
        return {
          success: false,
          error: 'No access_token in response'
        };
      }
      
      // Update the secret with new token
      const secretName = config.secretKey;
      const secretValue = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 3600; // Default 1 hour
      
      console.log(`Updating secret '${secretName}' with new token (expires in ${expiresIn}s)`);
      
      const updateResult = await this.projectManager.updateSecret(projectId, secretName, secretValue);
      
      if (!updateResult) {
        return {
          success: false,
          error: 'Failed to update secret with new token'
        };
      }
      
      // Store token expiration time for future reference
      const expirationTime = Date.now() + (expiresIn * 1000);
      const tokenMetaKey = `oauth_token_meta:${projectId}:${secretName}`;
      await this.env.APIPROXY_PROJECTS_KV.put(tokenMetaKey, JSON.stringify({
        expiresAt: expirationTime,
        refreshedAt: Date.now()
      }), { expirationTtl: expiresIn + 300 }); // Add 5 minutes buffer
      
      console.log('OAuth token refresh completed successfully');
      
      return {
        success: true,
        accessToken: secretValue,
        expiresIn: expiresIn
      };
      
    } catch (error) {
      console.error('OAuth token refresh error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}