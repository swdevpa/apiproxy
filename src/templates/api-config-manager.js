// API Configuration Management Module
export class ApiConfigManager {
  constructor(token, projectId) {
    this.token = token;
    this.projectId = projectId;
    this.apiBase = '/api/api-configs';
  }

  async getApiConfigs() {
    try {
      const response = await fetch(`${this.apiBase}/${this.projectId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!response.ok) throw new Error(`Failed to load API configs: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error loading API configs:', error);
      throw error;
    }
  }

  async saveApiConfig(domain, config) {
    if (!domain || !config) throw new Error('Domain and config are required');
    try {
      const response = await fetch(`${this.apiBase}/${this.projectId}/${domain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error(`Failed to save API config: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error saving API config:', error);
      throw error;
    }
  }

  async deleteApiConfig(domain) {
    if (!domain) throw new Error('Domain is required');
    try {
      const response = await fetch(`${this.apiBase}/${this.projectId}/${domain}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!response.ok) throw new Error(`Failed to delete API config: ${response.status}`);
      return true;
    } catch (error) {
      console.error('Error deleting API config:', error);
      throw error;
    }
  }

  static validateApiConfig(config) {
    if (!config.authType || !config.secretKey) {
      return { valid: false, message: 'Auth type and secret key are required' };
    }

    const validAuthTypes = ['header', 'query_param'];
    if (!validAuthTypes.includes(config.authType)) {
      return { valid: false, message: 'Auth type must be "header" or "query_param"' };
    }

    if (config.authType === 'header' && !config.header) {
      return { valid: false, message: 'Header name is required for header auth type' };
    }

    if (config.authType === 'query_param' && !config.param) {
      return { valid: false, message: 'Parameter name is required for query_param auth type' };
    }

    return { valid: true };
  }

  static getApiConfigFormHTML(domain = '', config = {}, isEdit = false) {
    // Ensure all elements are always present in DOM, controlled by JavaScript
    return `
      <div class="form-group">
        <label class="form-label">API Domain</label>
        <input type="text" id="api-domain-input" class="form-input" 
               value="${domain}" placeholder="api.example.com" ${isEdit ? 'readonly' : ''} required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Enter the API domain (e.g., api.example.com)
        </small>
      </div>
      
      <div class="form-group">
        <label class="form-label">Authentication Type</label>
        <select id="auth-type-select" class="form-input" required>
          <option value="query_param">Query Parameter</option>
          <option value="header">HTTP Header</option>
          <option value="oauth">OAuth 2.0</option>
        </select>
      </div>
      
      <div class="form-group" id="header-config" style="display: none;">
        <label class="form-label">Header Name</label>
        <input type="text" id="header-input" class="form-input" 
               value="${config.header || 'Authorization'}" placeholder="X-API-Key" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          HTTP header name for the API key
        </small>
      </div>
      
      <div class="form-group" id="header-format" style="display: none;">
        <label class="form-label">Header Format (Optional)</label>
        <input type="text" id="format-input" class="form-input" 
               value="${config.format || 'Bearer {key}'}" placeholder="Bearer {key}">
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Format template. Use {key} as placeholder (e.g., "Bearer {key}")
        </small>
      </div>
      
      <div class="form-group" id="param-config" style="display: block;">
        <label class="form-label">Parameter Name</label>
        <input type="text" id="param-input" class="form-input" 
               value="${config.param || ''}" placeholder="api_key" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Query parameter name for the API key
        </small>
      </div>
      
      <div class="form-group" id="oauth-config" style="display: none;">
        <h4 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">OAuth 2.0 Configuration</h4>
        
        <div class="form-group">
          <label class="form-label">Token URL</label>
          <input type="text" id="oauth-token-url" class="form-input" 
                 value="${config.oauthTokenUrl || ''}" placeholder="https://oauth.example.com/token" required>
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            OAuth token endpoint URL
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Client ID Secret Name</label>
          <input type="text" id="oauth-client-id-secret" class="form-input" 
                 value="${config.oauthClientIdSecret || ''}" placeholder="my_client_id" required>
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            Name of secret containing OAuth Client ID
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Client Secret Secret Name</label>
          <input type="text" id="oauth-client-secret-secret" class="form-input" 
                 value="${config.oauthClientSecretSecret || ''}" placeholder="my_client_secret" required>
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            Name of secret containing OAuth Client Secret
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Grant Type</label>
          <select id="oauth-grant-type" class="form-input" required>
            <option value="client_credentials">Client Credentials</option>
            <option value="authorization_code">Authorization Code</option>
          </select>
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            OAuth 2.0 grant type
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Scope (Optional)</label>
          <input type="text" id="oauth-scope" class="form-input" 
                 value="${config.oauthScope || ''}" placeholder="basic read write">
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            OAuth scopes (space-separated)
          </small>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Secret Key Name</label>
        <input type="text" id="secret-key-input" class="form-input" 
               value="${config.secretKey || ''}" placeholder="my_api_key" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Name of the secret that contains the API key for this API
        </small>
      </div>
      
    `;
  }

  static renderApiConfigsList(configs, onEdit, onDelete) {
    if (!configs || Object.keys(configs).length === 0) {
      return '<p class="text-secondary">No custom API configurations</p>';
    }
    
    return Object.entries(configs).map(([domain, config]) => `
      <div class="api-config-item" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--spacing-md); margin: var(--spacing-sm) 0; background: var(--bg-card);">
        <div style="display: flex; justify-content: between; align-items: start;">
          <div style="flex: 1;">
            <strong style="color: var(--primary-color);">${domain}</strong><br>
            <small style="color: var(--text-secondary);">
              ${config.authType === 'header' ? `Header: ${config.header}` : 
                config.authType === 'oauth' ? `OAuth 2.0: ${config.oauthTokenUrl}` : 
                `Query Param: ${config.param}`}
              ${config.format ? ` (${config.format})` : ''}
              ${config.authType === 'oauth' ? `<br>Grant: ${config.oauthGrantType || 'client_credentials'}` : ''}
              ${config.authType === 'oauth' && config.oauthScope ? `<br>Scope: ${config.oauthScope}` : ''}
              <br>Secret: ${config.secretKey}
            </small>
          </div>
          <div class="api-config-actions" style="display: flex; gap: var(--spacing-sm);">
            <button class="btn btn-primary btn-sm" onclick="${onEdit}('${domain}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="${onDelete}('${domain}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}