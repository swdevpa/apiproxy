import { getLoginHTML } from './templates/login.js';
import { getDashboardHTML } from './templates/dashboard.js';
import { getDashboardScript } from './templates/dashboard-script.js';
import { ProjectsAPI } from './api/projects.js';
import { SecretsAPI } from './api/secrets.js';
import { ProxyAPI, LogsAPI } from './api/proxy.js';

// Main router class
export class Router {
  constructor(env, authManager, projectManager, proxyManager, securityManager) {
    this.env = env;
    this.authManager = authManager;
    this.projectManager = projectManager;
    this.proxyManager = proxyManager;
    this.securityManager = securityManager;
    
    // Initialize API handlers
    this.projectsAPI = new ProjectsAPI(authManager, projectManager);
    this.secretsAPI = new SecretsAPI(authManager, projectManager);
    this.proxyAPI = new ProxyAPI(proxyManager);
    this.logsAPI = new LogsAPI(authManager, proxyManager);
  }

  async route(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return this.securityManager.addSecurityHeaders(
          new Response(null, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          })
        );
      }

      // Route handling
      if (path === '/') {
        return this.securityManager.addSecurityHeaders(this.handleRoot());
      }
      
      if (path === '/dashboard') {
        return this.securityManager.addSecurityHeaders(this.handleDashboard());
      }

      if (path === '/dashboard.js') {
        return this.securityManager.addSecurityHeaders(this.handleDashboardScript());
      }

      if (path === '/docs' || path === '/documentation') {
        return this.securityManager.addSecurityHeaders(this.handleDocs());
      }
      
      if (path.startsWith('/api/projects')) {
        return this.securityManager.addSecurityHeaders(await this.projectsAPI.handle(request, url));
      }
      
      if (path.startsWith('/api/secrets')) {
        return this.securityManager.addSecurityHeaders(await this.secretsAPI.handle(request, url));
      }
      
      if (path.startsWith('/api/logs')) {
        return this.securityManager.addSecurityHeaders(await this.logsAPI.handle(request, url));
      }
      
      if (path.startsWith('/proxy/')) {
        return this.securityManager.addSecurityHeaders(await this.proxyAPI.handle(request, url));
      }

      // 404 for unmatched routes
      return this.securityManager.addSecurityHeaders(
        new Response('Not Found', { status: 404 })
      );
      
    } catch (error) {
      console.error('Router error:', error);
      return this.securityManager.addSecurityHeaders(
        new Response('Internal Server Error', { status: 500 })
      );
    }
  }

  handleRoot() {
    return new Response(getLoginHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }

  handleDashboard() {
    return new Response(getDashboardHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }

  handleDashboardScript() {
    return new Response(getDashboardScript(), { 
      headers: { 
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache'
      }
    });
  }

  async handleModuleFile(filename) {
    try {
      let content = '';
      
      if (filename === 'modal-component.js') {
        content = `// Reusable Modal Component
export class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.options = {
      title: options.title || 'Modal',
      size: options.size || 'medium',
      closeOnEscape: options.closeOnEscape !== false,
      closeOnOverlayClick: options.closeOnOverlayClick !== false,
      ...options
    };
    this.isOpen = false;
    this.onClose = null;
    this.onOpen = null;
  }

  createModal() {
    const modalHTML = \\`
      <div id="\\${this.id}" class="modal-overlay">
        <div class="modal modal-\\${this.options.size}">
          <div class="modal-header">
            <h3 class="modal-title">\\${this.options.title}</h3>
            <button class="modal-close" type="button">&times;</button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      </div>
    \\`;

    if (!document.getElementById(this.id)) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    this.bindEvents();
    return this;
  }

  setContent(content) {
    const modalBody = document.querySelector(\\`#\\${this.id} .modal-body\\`);
    if (modalBody) modalBody.innerHTML = content;
    return this;
  }

  setFooter(buttons) {
    const modalFooter = document.querySelector(\\`#\\${this.id} .modal-footer\\`);
    if (modalFooter) modalFooter.innerHTML = buttons;
    return this;
  }

  open() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.add('active');
      this.isOpen = true;
      setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
      }, 100);
      if (this.onOpen) this.onOpen();
    }
    return this;
  }

  close() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.remove('active');
      this.isOpen = false;
      if (this.onClose) this.onClose();
    }
    return this;
  }

  bindEvents() {
    const modal = document.getElementById(this.id);
    if (!modal) return;

    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

    if (this.options.closeOnOverlayClick) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }

    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
    }
  }

  onOpenCallback(callback) { this.onOpen = callback; return this; }
  onCloseCallback(callback) { this.onClose = callback; return this; }
  
  destroy() {
    const modal = document.getElementById(this.id);
    if (modal) modal.remove();
  }
}`;
      } else if (filename === 'secret-manager.js') {
        content = `// Secret Management Module
export class SecretManager {
  constructor(token, projectId) {
    this.token = token;
    this.projectId = projectId;
    this.apiBase = '/api/secrets';
  }

  async getSecrets() {
    try {
      const response = await fetch(\\`\\${this.apiBase}/\\${this.projectId}\\`, {
        headers: { 'Authorization': \\`Bearer \\${this.token}\\` }
      });
      if (!response.ok) throw new Error(\\`Failed to load secrets: \\${response.status}\\`);
      return await response.json();
    } catch (error) {
      console.error('Error loading secrets:', error);
      throw error;
    }
  }

  async saveSecret(key, value) {
    if (!key || !value) throw new Error('Both key and value are required');
    try {
      const response = await fetch(\\`\\${this.apiBase}/\\${this.projectId}/\\${key}\\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \\`Bearer \\${this.token}\\`
        },
        body: JSON.stringify({ value })
      });
      if (!response.ok) throw new Error(\\`Failed to save secret: \\${response.status}\\`);
      return await response.json();
    } catch (error) {
      console.error('Error saving secret:', error);
      throw error;
    }
  }

  async deleteSecret(key) {
    if (!key) throw new Error('Secret key is required');
    try {
      const response = await fetch(\\`\\${this.apiBase}/\\${this.projectId}/\\${key}\\`, {
        method: 'DELETE',
        headers: { 'Authorization': \\`Bearer \\${this.token}\\` }
      });
      if (!response.ok) throw new Error(\\`Failed to delete secret: \\${response.status}\\`);
      return true;
    } catch (error) {
      console.error('Error deleting secret:', error);
      throw error;
    }
  }

  async updateSecretKey(oldKey, newKey, value) {
    if (!oldKey || !newKey) throw new Error('Both old and new keys are required');
    try {
      if (oldKey !== newKey) await this.deleteSecret(oldKey);
      return await this.saveSecret(newKey, value);
    } catch (error) {
      console.error('Error updating secret key:', error);
      throw error;
    }
  }

  static validateSecretKey(key) {
    if (!key || typeof key !== 'string') return { valid: false, message: 'Secret key is required' };
    if (key.length < 1) return { valid: false, message: 'Secret key cannot be empty' };
    if (key.includes(' ')) return { valid: false, message: 'Secret key cannot contain spaces' };
    return { valid: true };
  }

  static getSecretFormHTML(keyValue = '', valueValue = '', isEdit = false) {
    const keyPlaceholder = isEdit ? keyValue : 'header_x-api-key';
    const valuePlaceholder = isEdit ? 'Enter new value' : 'your-api-key-here';
    
    return \\`
      <div class="form-group">
        <label class="form-label">Secret Key</label>
        <input type="text" id="secret-key-input" class="form-input" 
               value="\\${keyValue}" placeholder="\\${keyPlaceholder}" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Use <code>header_</code> prefix for automatic header injection
        </small>
      </div>
      <div class="form-group">
        <label class="form-label">Secret Value</label>
        <input type="password" id="secret-value-input" class="form-input" 
               value="\\${valueValue}" placeholder="\\${valuePlaceholder}" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          This value will be encrypted and stored securely
        </small>
      </div>
    \\`;
  }

  static renderSecretsList(secrets, onEdit, onDelete) {
    if (!secrets || Object.keys(secrets).length === 0) {
      return '<p class="text-secondary">No secrets configured</p>';
    }
    return Object.entries(secrets).map(([key, data]) => \\`
      <div class="secret-item">
        <div>
          <strong>\\${key}</strong><br>
          <small>Updated: \\${new Date(data.updated).toLocaleDateString()}</small>
        </div>
        <div class="secret-actions">
          <button class="btn btn-primary btn-sm" onclick="\\${onEdit}('\\${key}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="\\${onDelete}('\\${key}')">Delete</button>
        </div>
      </div>
    \\`).join('');
  }
}`;
      }
      
      return new Response(content, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      console.error('Error serving module file:', error);
      return new Response('Module not found', { status: 404 });
    }
  }

  handleDocs() {
    return new Response(getDocsHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }

  handleDocsOld() {
    const docsHTML = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Integration Guide</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 0; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem 0; text-align: center; }
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .card { background: white; border-radius: 12px; padding: 2rem; margin: 2rem 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .code-block { 
          background: #1e1e1e; 
          color: #d4d4d4; 
          padding: 1.5rem; 
          border-radius: 8px; 
          overflow-x: auto; 
          font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; 
          font-size: 13px; 
          line-height: 1.5;
          border: 1px solid #333;
          position: relative;
        }
        .code-block::before {
          content: attr(data-lang);
          position: absolute;
          top: 0;
          right: 0;
          background: #007acc;
          color: white;
          padding: 0.25rem 0.75rem;
          font-size: 11px;
          border-radius: 0 8px 0 4px;
          font-weight: 500;
        }
        .code-block .keyword { color: #569cd6; }
        .code-block .string { color: #ce9178; }
        .code-block .comment { color: #6a9955; }
        .code-block .function { color: #dcdcaa; }
        .code-block .type { color: #4ec9b0; }
        .api-config { background: #e8f5e8; border: 2px solid #27ae60; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
        .warning { background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        h2 { color: #2c3e50; margin: 2rem 0 1rem 0; font-size: 1.8rem; }
        h3 { color: #34495e; margin: 1.5rem 0 1rem 0; font-size: 1.3rem; }
        .highlight { background: #fff3cd; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔗 API Integration Guide</h1>
        <p>Secure API proxy integration for your applications</p>
      </div>

      <div class="container">
        <div class="card">
          <h2>🚀 Quick Setup</h2>
          <p>Integrate any API securely without exposing API keys in your client code.</p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 1rem; margin: 1rem 0;">
            <strong>How it works:</strong> Your App → Secure Proxy → Target API<br>
            API keys are added server-side automatically.
          </div>
        </div>

        <div class="card">
          <h2>⚙️ Configuration Guide</h2>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Always use the <code>header_</code> prefix for automatic header injection!
          </div>

          <table>
            <thead>
              <tr>
                <th>API Service</th>
                <th>Secret Key</th>
                <th>Secret Value Format</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Google Gemini</strong></td>
                <td><code>header_x-goog-api-key</code></td>
                <td><code>YOUR_GEMINI_API_KEY</code></td>
              </tr>
              <tr>
                <td><strong>OpenAI</strong></td>
                <td><code>header_authorization</code></td>
                <td><code>Bearer sk-proj-your-key...</code></td>
              </tr>
              <tr>
                <td><strong>Custom API Key</strong></td>
                <td><code>header_x-api-key</code></td>
                <td><code>your-custom-key</code></td>
              </tr>
              <tr>
                <td><strong>Firebase</strong></td>
                <td><code>header_authorization</code></td>
                <td><code>Bearer your-id-token</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>🤖 Google Gemini Integration</h2>
          
          <div class="api-config">
            <strong>Dashboard Configuration:</strong><br>
            Secret Key: <code class="highlight">header_x-goog-api-key</code><br>
            Secret Value: <code class="highlight">YOUR_GEMINI_API_KEY</code>
          </div>

          <h3>📱 iOS (Swift)</h3>
          <div class="code-block" data-lang="Swift">
<span class="keyword">class</span> <span class="type">GeminiAPI</span> {
    <span class="keyword">private let</span> proxyURL = <span class="string">"https://your-worker.workers.dev/proxy/YOUR_PROJECT_ID"</span>
    
    <span class="keyword">func</span> <span class="function">generateText</span>(prompt: <span class="type">String</span>) <span class="keyword">async throws</span> -> <span class="type">String</span> {
        <span class="keyword">let</span> targetURL = <span class="string">"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"</span>
        <span class="keyword">let</span> fullURL = <span class="string">"\\(proxyURL)?target_url=\\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)"</span>
        
        <span class="keyword">var</span> request = <span class="type">URLRequest</span>(url: <span class="type">URL</span>(string: fullURL)!)
        request.httpMethod = <span class="string">"POST"</span>
        request.<span class="function">setValue</span>(<span class="string">"application/json"</span>, forHTTPHeaderField: <span class="string">"Content-Type"</span>)
        
        <span class="keyword">let</span> requestBody = [
            <span class="string">"contents"</span>: [
                [<span class="string">"parts"</span>: [[<span class="string">"text"</span>: prompt]]]
            ]
        ]
        request.httpBody = <span class="keyword">try</span> <span class="type">JSONSerialization</span>.<span class="function">data</span>(withJSONObject: requestBody)
        
        <span class="keyword">let</span> (data, _) = <span class="keyword">try await</span> <span class="type">URLSession</span>.shared.<span class="function">data</span>(for: request)
        <span class="keyword">let</span> json = <span class="keyword">try</span> <span class="type">JSONSerialization</span>.<span class="function">jsonObject</span>(with: data) <span class="keyword">as?</span> [<span class="type">String</span>: <span class="type">Any</span>]
        
        <span class="comment">// Parse Gemini response</span>
        <span class="keyword">if let</span> candidates = json?[<span class="string">"candidates"</span>] <span class="keyword">as?</span> [[<span class="type">String</span>: <span class="type">Any</span>]],
           <span class="keyword">let</span> content = candidates.first?[<span class="string">"content"</span>] <span class="keyword">as?</span> [<span class="type">String</span>: <span class="type">Any</span>],
           <span class="keyword">let</span> parts = content[<span class="string">"parts"</span>] <span class="keyword">as?</span> [[<span class="type">String</span>: <span class="type">Any</span>]],
           <span class="keyword">let</span> text = parts.first?[<span class="string">"text"</span>] <span class="keyword">as?</span> <span class="type">String</span> {
            <span class="keyword">return</span> text
        }
        
        <span class="keyword">throw</span> <span class="type">APIError</span>.invalidResponse
    }
}
          </div>

          <h3>🌐 JavaScript/React</h3>
          <div class="code-block" data-lang="JavaScript">
<span class="keyword">class</span> <span class="type">GeminiAPI</span> {
  <span class="function">constructor</span>(projectId) {
    <span class="keyword">this</span>.proxyURL = <span class="string">\`https://your-worker.workers.dev/proxy/\${projectId}\`</span>;
  }

  <span class="keyword">async</span> <span class="function">generateText</span>(prompt) {
    <span class="keyword">const</span> targetURL = <span class="string">'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'</span>;
    
    <span class="keyword">const</span> response = <span class="keyword">await</span> <span class="function">fetch</span>(<span class="string">\`\${this.proxyURL}?target_url=\${encodeURIComponent(targetURL)}\`</span>, {
      method: <span class="string">'POST'</span>,
      headers: { <span class="string">'Content-Type'</span>: <span class="string">'application/json'</span> },
      body: <span class="type">JSON</span>.<span class="function">stringify</span>({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    <span class="keyword">if</span> (!response.ok) {
      <span class="keyword">throw new</span> <span class="type">Error</span>(<span class="string">\`Gemini API error: \${response.status}\`</span>);
    }

    <span class="keyword">const</span> data = <span class="keyword">await</span> response.<span class="function">json</span>();
    <span class="keyword">return</span> data.candidates[<span class="string">0</span>].content.parts[<span class="string">0</span>].text;
  }
}

<span class="comment">// Usage in React</span>
<span class="keyword">const</span> <span class="function">handleGenerate</span> = <span class="keyword">async</span> () => {
  <span class="keyword">const</span> api = <span class="keyword">new</span> <span class="type">GeminiAPI</span>(<span class="string">'YOUR_PROJECT_ID'</span>);
  <span class="keyword">try</span> {
    <span class="keyword">const</span> text = <span class="keyword">await</span> api.<span class="function">generateText</span>(<span class="string">'Write a short story about AI'</span>);
    <span class="function">setResult</span>(text);
  } <span class="keyword">catch</span> (error) {
    console.<span class="function">error</span>(<span class="string">'Error:'</span>, error);
  }
};
          </div>
        </div>

        <div class="card">
          <h2>🔧 Other APIs</h2>

          <h3>🧠 OpenAI ChatGPT</h3>
          <div class="api-config">
            Secret Key: <code class="highlight">header_authorization</code><br>
            Secret Value: <code class="highlight">Bearer sk-proj-your-openai-key...</code><br>
            Target URL: <code>https://api.openai.com/v1/chat/completions</code>
          </div>

          <h3>🔥 Firebase REST API</h3>
          <div class="api-config">
            Secret Key: <code class="highlight">header_authorization</code><br>
            Secret Value: <code class="highlight">Bearer your-firebase-id-token</code><br>
            Target URL: <code>https://your-project.firebaseio.com/path.json</code>
          </div>

          <h3>🌐 Custom APIs</h3>
          <div class="api-config">
            Secret Key: <code class="highlight">header_x-api-key</code><br>
            Secret Value: <code class="highlight">your-custom-api-key</code><br>
            Target URL: <code>https://your-api.com/endpoint</code>
          </div>
        </div>

        <div class="card">
          <h2>🎯 Usage Pattern</h2>
          <div class="code-block" data-lang="JavaScript">
<span class="comment">// Replace these values:</span>
<span class="keyword">const</span> PROXY_URL = <span class="string">"https://your-worker.workers.dev/proxy/YOUR_PROJECT_ID"</span>;
<span class="keyword">const</span> TARGET_URL = <span class="string">"https://api.service.com/endpoint"</span>;

<span class="comment">// Make request:</span>
<span class="keyword">const</span> response = <span class="keyword">await</span> <span class="function">fetch</span>(<span class="string">\`\${PROXY_URL}?target_url=\${encodeURIComponent(TARGET_URL)}\`</span>, {
  method: <span class="string">'POST'</span>,
  headers: { <span class="string">'Content-Type'</span>: <span class="string">'application/json'</span> },
  body: <span class="type">JSON</span>.<span class="function">stringify</span>(yourData)
});
          </div>
        </div>

        <div class="card">
          <h2>🔍 Troubleshooting</h2>
          <div class="warning">
            <strong>❌ Common Issues:</strong><br>
            • Secret name must start with <code>header_</code><br>
            • Verify API key is correct and active<br>
            • Ensure <code>target_url</code> is URL-encoded<br>
            • Check project ID in proxy URL
          </div>
        </div>
      </div>
    </body>
    </html>`;

    return new Response(docsHTML, { 
      headers: { 'Content-Type': 'text/html' }
    });
  }
}