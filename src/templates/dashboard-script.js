// Dashboard JavaScript functionality - Modularized
export function getDashboardScript() {
  return `
import { Modal } from './modal-component.js';
import { SecretManager } from './secret-manager.js';
import { ApiConfigManager } from './api-config-manager.js';

const token = localStorage.getItem('adminToken');
let secretManager = null;
let apiConfigManager = null;
let addSecretModal = null;
let editSecretModal = null;
let addApiConfigModal = null;
let editApiConfigModal = null;

// Check if user is authenticated
if (!token) {
  window.location.href = '/';
}

let currentProjectId = null;

// Initialize modular components
function initializeModules() {
  if (currentProjectId && token) {
    secretManager = new SecretManager(token, currentProjectId);
    apiConfigManager = new ApiConfigManager(token, currentProjectId);
    
    // Initialize modals
    addSecretModal = new Modal('add-secret-modal', { title: 'Add New Secret' });
    editSecretModal = new Modal('edit-secret-modal', { title: 'Edit Secret' });
    addApiConfigModal = new Modal('add-api-config-modal', { title: 'Add API Configuration' });
    editApiConfigModal = new Modal('edit-api-config-modal', { title: 'Edit API Configuration' });
    
    addSecretModal.createModal();
    editSecretModal.createModal();
    addApiConfigModal.createModal();
    editApiConfigModal.createModal();
  }
}

// Export functions to global scope for onclick handlers
window.showTab = showTab;
window.manageProject = manageProject;
window.deleteProject = deleteProject;
window.openAddSecretModal = openAddSecretModal;
window.saveNewSecret = saveNewSecret;
window.openEditSecretModal = openEditSecretModal;
window.saveEditedSecret = saveEditedSecret;
window.confirmDeleteSecret = confirmDeleteSecret;
window.deleteSecret = deleteSecret;

function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  // Show manage tab when needed
  if (tabName === 'manage-project') {
    document.getElementById('manage-tab').style.display = 'block';
    document.getElementById('manage-tab').classList.add('active');
  } else {
    document.getElementById('manage-tab').style.display = 'none';
    if (event && event.target) {
      event.target.classList.add('active');
    } else {
      // Fallback for programmatic calls
      const targetTab = Array.from(document.querySelectorAll('.tab')).find(t => 
        t.textContent.toLowerCase().includes(tabName.replace('-', ' '))
      );
      if (targetTab) targetTab.classList.add('active');
    }
  }
  
  document.getElementById(tabName).classList.add('active');
}

async function loadProjects() {
  try {
    const response = await fetch('/api/projects', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const projects = await response.json();
    displayProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

function displayProjects(projects) {
  const html = projects.map(project => \`
    <div class="project-item">
      <div class="project-header">
        <div>
          <div class="project-name">\${project.name}</div>
          <span class="project-type">\${project.type}</span>
        </div>
        <div>
          <button class="btn btn-primary" onclick="manageProject('\${project.id}')">Manage</button>
          <button class="btn btn-danger" onclick="deleteProject('\${project.id}')">Delete</button>
        </div>
      </div>
      <p>\${project.description || 'No description'}</p>
      <div class="proxy-url">
        Proxy URL: \${window.location.origin}/proxy/\${project.id}?target_url=YOUR_API_URL
      </div>
      <small>Created: \${new Date(project.created).toLocaleDateString()}</small>
    </div>
  \`).join('');
  document.getElementById('projects-list').innerHTML = html || '<p>No projects yet. Create your first project!</p>';
}

// Project form handler
document.getElementById('new-project-form').onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const projectData = Object.fromEntries(formData);
  
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(projectData)
    });
    e.target.reset();
    showTab('projects');
    loadProjects();
  } catch (error) {
    console.error('Error creating project:', error);
  }
};

async function deleteProject(id) {
  if (confirm('Are you sure you want to delete this project?')) {
    await fetch('/api/projects/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    loadProjects();
  }
}

function manageProject(id) {
  currentProjectId = id;
  showTab('manage-project');
  loadProjectDetails(id);
  loadSecrets(id);
  loadApiConfigs(id);
  initializeModules();
}

async function loadProjectDetails(projectId) {
  try {
    const response = await fetch('/api/projects/' + projectId, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const project = await response.json();
    document.getElementById('project-details').innerHTML = \`
      <h3>\${project.name}</h3>
      <p><strong>Type:</strong> \${project.type}</p>
      <p><strong>Description:</strong> \${project.description || 'No description'}</p>
      <p><strong>Created:</strong> \${new Date(project.created).toLocaleDateString()}</p>
      <div class="proxy-url">
        <strong>Proxy URL:</strong><br>
        <code>\${window.location.origin}/proxy/\${project.id}?target_url=YOUR_API_URL</code>
      </div>
    \`;
  } catch (error) {
    console.error('Error loading project details:', error);
  }
}

async function loadSecrets(projectId) {
  try {
    if (!secretManager) {
      initializeModules();
    }
    
    const secrets = await secretManager.getSecrets();
    const html = SecretManager.renderSecretsList(secrets, 'openEditSecretModal', 'confirmDeleteSecret');
    document.getElementById('secrets-list').innerHTML = html;
  } catch (error) {
    console.error('Error loading secrets:', error);
    document.getElementById('secrets-list').innerHTML = '<p class="text-danger">Error loading secrets</p>';
  }
}

// Open add secret modal
function openAddSecretModal() {
  if (!addSecretModal) {
    initializeModules();
  }
  
  const content = SecretManager.getSecretFormHTML('', '', false);
  const footer = \`
    <button type="button" class="btn btn-secondary" onclick="addSecretModal.close()">Cancel</button>
    <button type="button" class="btn btn-success" onclick="saveNewSecret()" id="save-new-secret-btn">Add Secret</button>
  \`;
  
  addSecretModal.setContent(content).setFooter(footer).open();
}

// Save new secret
async function saveNewSecret() {
  const key = document.getElementById('secret-key-input').value.trim();
  const value = document.getElementById('secret-value-input').value.trim();
  const saveBtn = document.getElementById('save-new-secret-btn');
  
  if (!key || !value) {
    alert('Please enter both key and value');
    return;
  }
  
  // Validate key format
  const validation = SecretManager.validateSecretKey(key);
  if (!validation.valid) {
    alert(validation.message);
    return;
  }
  
  saveBtn.textContent = 'Adding...';
  saveBtn.disabled = true;
  
  try {
    await secretManager.saveSecret(key, value);
    addSecretModal.close();
    loadSecrets(currentProjectId);
  } catch (error) {
    console.error('Error adding secret:', error);
    alert('Error adding secret: ' + error.message);
  } finally {
    saveBtn.textContent = 'Add Secret';
    saveBtn.disabled = false;
  }
}

let currentEditingSecretKey = null;

// Open edit secret modal
function openEditSecretModal(key) {
  if (!editSecretModal) {
    initializeModules();
  }
  
  currentEditingSecretKey = key;
  
  const content = SecretManager.getSecretFormHTML(key, '', true);
  const footer = \`
    <button type="button" class="btn btn-secondary" onclick="editSecretModal.close()">Cancel</button>
    <button type="button" class="btn btn-primary" onclick="saveEditedSecret()" id="save-edited-secret-btn">Save Changes</button>
  \`;
  
  editSecretModal.setContent(content).setFooter(footer).open();
}

// Save edited secret
async function saveEditedSecret() {
  const newKey = document.getElementById('secret-key-input').value.trim();
  const newValue = document.getElementById('secret-value-input').value.trim();
  const saveBtn = document.getElementById('save-edited-secret-btn');
  
  if (!newKey) {
    alert('Please enter a secret key');
    return;
  }
  
  if (!newValue) {
    alert('Please enter a secret value');
    return;
  }
  
  // Validate key format
  const validation = SecretManager.validateSecretKey(newKey);
  if (!validation.valid) {
    alert(validation.message);
    return;
  }
  
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;
  
  try {
    await secretManager.updateSecretKey(currentEditingSecretKey, newKey, newValue);
    editSecretModal.close();
    loadSecrets(currentProjectId);
    currentEditingSecretKey = null;
  } catch (error) {
    console.error('Error saving secret:', error);
    alert('Error saving secret: ' + error.message);
  } finally {
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
  }
}

// Confirm and delete secret
function confirmDeleteSecret(key) {
  if (confirm(\`Are you sure you want to delete the secret "\${key}"?\`)) {
    deleteSecret(key);
  }
}

// Delete secret
async function deleteSecret(key) {
  try {
    await secretManager.deleteSecret(key);
    loadSecrets(currentProjectId);
  } catch (error) {
    console.error('Error deleting secret:', error);
    alert('Error deleting secret: ' + error.message);
  }
}

// ===== API CONFIG MANAGEMENT =====

// Load API configurations
async function loadApiConfigs(projectId) {
  if (!apiConfigManager) return;
  
  try {
    const configs = await apiConfigManager.getApiConfigs();
    const list = document.getElementById('api-configs-list');
    if (list) {
      list.innerHTML = ApiConfigManager.renderApiConfigsList(
        configs,
        'openEditApiConfigModal',
        'confirmDeleteApiConfig'
      );
    }
  } catch (error) {
    console.error('Error loading API configs:', error);
    const list = document.getElementById('api-configs-list');
    if (list) {
      list.innerHTML = '<p class="text-error">Error loading API configurations</p>';
    }
  }
}

// Open add API config modal
function openAddApiConfigModal() {
  if (!addApiConfigModal) {
    initializeModules();
  }
  
  const content = ApiConfigManager.getApiConfigFormHTML();
  console.log('ApiConfigManager HTML:', content);
  console.log('Header format element present:', content.includes('id="header-format"'));
  console.log('OAuth option present:', content.includes('value="oauth"'));
  console.log('OAuth config section present:', content.includes('id="oauth-config"'));
  
  const footer = \`
    <button type="button" class="btn btn-secondary" onclick="addApiConfigModal.close()">Cancel</button>
    <button type="button" class="btn btn-primary" id="save-new-api-config-btn" onclick="saveNewApiConfig()">Add Configuration</button>
  \`;
  
  // Check if template is missing OAuth support or header-format
  const hasOAuth = content.includes('value="oauth"') && content.includes('id="oauth-config"');
  const hasHeaderFormat = content.includes('id="header-format"');
  
  if (!hasOAuth || !hasHeaderFormat) {
    console.error('Template missing OAuth or header-format support, using fallback');
    // Use complete fallback template with full OAuth support
    const fallbackContent = \`
      <div class="form-group">
        <label class="form-label">API Domain</label>
        <input type="text" id="api-domain-input" class="form-input" 
               placeholder="platform.fatsecret.com" required>
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
               value="Authorization" placeholder="X-API-Key" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          HTTP header name for the API key
        </small>
      </div>
      
      <div class="form-group" id="header-format" style="display: none;">
        <label class="form-label">Header Format (Optional)</label>
        <input type="text" id="format-input" class="form-input" 
               value="Bearer {key}" placeholder="Bearer {key}">
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Format template. Use {key} as placeholder (e.g., "Bearer {key}")
        </small>
      </div>
      
      <div class="form-group" id="param-config" style="display: block;">
        <label class="form-label">Parameter Name</label>
        <input type="text" id="param-input" class="form-input" 
               placeholder="api_key" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Query parameter name for the API key
        </small>
      </div>
      
      <div class="form-group" id="oauth-config" style="display: none;">
        <h4 style="margin-bottom: var(--spacing-md); color: var(--text-primary);">OAuth 2.0 Configuration</h4>
        
        <div class="form-group">
          <label class="form-label">Token URL</label>
          <input type="text" id="oauth-token-url" class="form-input" 
                 placeholder="https://oauth.fatsecret.com/connect/token" required>
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            OAuth token endpoint URL
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Client ID Secret Name</label>
          <input type="text" id="oauth-client-id-secret" class="form-input" 
                 placeholder="fatsecret_client_id" required>
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            Name of secret containing OAuth Client ID
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Client Secret Secret Name</label>
          <input type="text" id="oauth-client-secret-secret" class="form-input" 
                 placeholder="fatsecret_client_secret" required>
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
                 placeholder="basic read write">
          <small style="color: var(--text-secondary); font-size: 0.75rem;">
            OAuth scopes (space-separated)
          </small>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Secret Key Name</label>
        <input type="text" id="secret-key-input" class="form-input" 
               placeholder="fatsecret_access_token" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Name of the secret that contains the API key for this API
        </small>
      </div>
    \`;
    addApiConfigModal.setContent(fallbackContent).setFooter(footer).open();
  } else {
    addApiConfigModal.setContent(content).setFooter(footer).open();
  }
  
  // Add auth type change handler and force initial state
  setTimeout(() => {
    const authTypeSelect = document.getElementById('auth-type-select');
    if (authTypeSelect) {
      authTypeSelect.addEventListener('change', toggleApiConfigFields);
      // Force initial state
      toggleApiConfigFields();
    }
  }, 100);
}

// Toggle form fields based on auth type
function toggleApiConfigFields() {
  console.log('toggleApiConfigFields called');
  
  const authTypeSelect = document.getElementById('auth-type-select');
  if (!authTypeSelect) {
    console.error('auth-type-select not found');
    return;
  }
  
  const authType = authTypeSelect.value;
  console.log('Auth type:', authType);
  
  const headerConfig = document.getElementById('header-config');
  const headerFormat = document.getElementById('header-format');
  const paramConfig = document.getElementById('param-config');
  const oauthConfig = document.getElementById('oauth-config');
  
  console.log('Elements found:', {
    headerConfig: !!headerConfig,
    headerFormat: !!headerFormat,
    paramConfig: !!paramConfig,
    oauthConfig: !!oauthConfig
  });
  
  // Hide all config sections first
  if (headerConfig) headerConfig.style.display = 'none';
  if (headerFormat) headerFormat.style.display = 'none';
  if (paramConfig) paramConfig.style.display = 'none';
  if (oauthConfig) oauthConfig.style.display = 'none';
  
  // Show relevant sections based on auth type
  if (authType === 'header') {
    if (headerConfig) {
      headerConfig.style.display = 'block';
      console.log('Showing headerConfig');
    }
    if (headerFormat) {
      headerFormat.style.display = 'block';
      console.log('Showing headerFormat');
    }
  } else if (authType === 'query_param') {
    if (paramConfig) {
      paramConfig.style.display = 'block';
      console.log('Showing paramConfig');
    }
  } else if (authType === 'oauth') {
    if (oauthConfig) {
      oauthConfig.style.display = 'block';
      console.log('Showing oauthConfig');
    }
  }
}

// Save new API config
async function saveNewApiConfig() {
  const domain = document.getElementById('api-domain-input').value.trim();
  const authType = document.getElementById('auth-type-select').value;
  const secretKey = document.getElementById('secret-key-input').value.trim();
  const saveBtn = document.getElementById('save-new-api-config-btn');
  
  if (!domain || !secretKey) {
    alert('Please enter domain and secret key');
    return;
  }
  
  const config = {
    authType: authType,
    secretKey: secretKey
  };
  
  if (authType === 'header') {
    const headerInput = document.getElementById('header-input');
    const formatInput = document.getElementById('format-input');
    
    if (!headerInput) {
      alert('Header input field not found. Please make sure you selected "HTTP Header" as authentication type.');
      return;
    }
    
    const header = headerInput.value.trim();
    const format = formatInput ? formatInput.value.trim() : '';
    
    if (!header) {
      alert('Please enter header name');
      return;
    }
    config.header = header;
    if (format) config.format = format;
  } else if (authType === 'query_param') {
    const paramInput = document.getElementById('param-input');
    
    if (!paramInput) {
      alert('Parameter input field not found. Please make sure you selected "Query Parameter" as authentication type.');
      return;
    }
    
    const param = paramInput.value.trim();
    if (!param) {
      alert('Please enter parameter name');
      return;
    }
    config.param = param;
  } else if (authType === 'oauth') {
    const tokenUrlInput = document.getElementById('oauth-token-url');
    const clientIdSecretInput = document.getElementById('oauth-client-id-secret');
    const clientSecretSecretInput = document.getElementById('oauth-client-secret-secret');
    const grantTypeInput = document.getElementById('oauth-grant-type');
    const scopeInput = document.getElementById('oauth-scope');
    
    if (!tokenUrlInput || !clientIdSecretInput || !clientSecretSecretInput || !grantTypeInput) {
      alert('OAuth configuration fields not found. Please make sure you selected "OAuth 2.0" as authentication type.');
      return;
    }
    
    const tokenUrl = tokenUrlInput.value.trim();
    const clientIdSecret = clientIdSecretInput.value.trim();
    const clientSecretSecret = clientSecretSecretInput.value.trim();
    const grantType = grantTypeInput.value;
    const scope = scopeInput ? scopeInput.value.trim() : '';
    
    if (!tokenUrl || !clientIdSecret || !clientSecretSecret) {
      alert('Please fill in all required OAuth fields');
      return;
    }
    
    config.oauthTokenUrl = tokenUrl;
    config.oauthClientIdSecret = clientIdSecret;
    config.oauthClientSecretSecret = clientSecretSecret;
    config.oauthGrantType = grantType;
    if (scope) config.oauthScope = scope;
  }
  
  saveBtn.textContent = 'Adding...';
  saveBtn.disabled = true;
  
  try {
    await apiConfigManager.saveApiConfig(domain, config);
    addApiConfigModal.close();
    loadApiConfigs(currentProjectId);
  } catch (error) {
    console.error('Error adding API config:', error);
    alert('Error adding API configuration: ' + error.message);
  } finally {
    saveBtn.textContent = 'Add Configuration';
    saveBtn.disabled = false;
  }
}

let currentEditingApiConfigDomain = null;

// Open edit API config modal
function openEditApiConfigModal(domain) {
  if (!editApiConfigModal) {
    initializeModules();
  }
  
  currentEditingApiConfigDomain = domain;
  
  // Get current config for editing
  apiConfigManager.getApiConfigs().then(configs => {
    const config = configs[domain] || {};
    const content = ApiConfigManager.getApiConfigFormHTML(domain, config, true);
    const footer = \`
      <button type="button" class="btn btn-secondary" onclick="editApiConfigModal.close()">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-api-config-btn" onclick="saveApiConfig()">Save Changes</button>
    \`;
    
    editApiConfigModal.setContent(content).setFooter(footer).open();
    
    // Add auth type change handler
    setTimeout(() => {
      const authTypeSelect = document.getElementById('auth-type-select');
      if (authTypeSelect) {
        authTypeSelect.addEventListener('change', toggleApiConfigFields);
      }
    }, 100);
  });
}

// Save API config changes
async function saveApiConfig() {
  const domain = currentEditingApiConfigDomain;
  const authType = document.getElementById('auth-type-select').value;
  const secretKey = document.getElementById('secret-key-input').value.trim();
  const saveBtn = document.getElementById('save-api-config-btn');
  
  if (!secretKey) {
    alert('Please enter secret key');
    return;
  }
  
  const config = {
    authType: authType,
    secretKey: secretKey
  };
  
  if (authType === 'header') {
    const header = document.getElementById('header-input').value.trim();
    const format = document.getElementById('format-input').value.trim();
    if (!header) {
      alert('Please enter header name');
      return;
    }
    config.header = header;
    if (format) config.format = format;
  } else {
    const param = document.getElementById('param-input').value.trim();
    if (!param) {
      alert('Please enter parameter name');
      return;
    }
    config.param = param;
  }
  
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;
  
  try {
    await apiConfigManager.saveApiConfig(domain, config);
    editApiConfigModal.close();
    loadApiConfigs(currentProjectId);
    currentEditingApiConfigDomain = null;
  } catch (error) {
    console.error('Error saving API config:', error);
    alert('Error saving API configuration: ' + error.message);
  } finally {
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
  }
}

// Confirm and delete API config
function confirmDeleteApiConfig(domain) {
  if (confirm(\`Are you sure you want to delete the API configuration for "\${domain}"?\`)) {
    deleteApiConfig(domain);
  }
}

// Delete API config
async function deleteApiConfig(domain) {
  try {
    await apiConfigManager.deleteApiConfig(domain);
    loadApiConfigs(currentProjectId);
  } catch (error) {
    console.error('Error deleting API config:', error);
    alert('Error deleting API configuration: ' + error.message);
  }
}

// Export functions to global scope for onclick handlers
window.openAddApiConfigModal = openAddApiConfigModal;
window.openEditApiConfigModal = openEditApiConfigModal;
window.confirmDeleteApiConfig = confirmDeleteApiConfig;
window.saveNewApiConfig = saveNewApiConfig;
window.saveApiConfig = saveApiConfig;
window.toggleApiConfigFields = toggleApiConfigFields;

// Load projects on page load
loadProjects();
`;
}