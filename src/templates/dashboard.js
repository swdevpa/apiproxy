import { CONFIG } from '../config.js';

// Dashboard template
export function getDashboardHTML() {
  const projectTypeOptions = CONFIG.PROJECT_TYPES
    .map(type => `<option value="${type.value}">${type.label}</option>`)
    .join('');

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Proxy Manager</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
      .header { background: #2c3e50; color: white; padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
      .card { background: white; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
      .btn-primary { background: #3498db; color: white; }
      .btn-success { background: #27ae60; color: white; }
      .btn-danger { background: #e74c3c; color: white; }
      .btn:hover { opacity: 0.8; }
      .form-group { margin: 1rem 0; }
      .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
      .form-group input, .form-group select, .form-group textarea { 
        width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; 
      }
      .project-item { border: 1px solid #eee; border-radius: 4px; padding: 1rem; margin: 0.5rem 0; }
      .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
      .project-name { font-size: 1.2rem; font-weight: 600; color: #2c3e50; }
      .project-type { background: #ecf0f1; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
      .proxy-url { background: #ecf0f1; padding: 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem; word-break: break-all; }
      .tabs { display: flex; border-bottom: 1px solid #ddd; margin-bottom: 1rem; }
      .tab { padding: 1rem; cursor: pointer; border-bottom: 2px solid transparent; }
      .tab.active { border-bottom-color: #3498db; color: #3498db; }
      .tab-content { display: none; }
      .tab-content.active { display: block; }
      .secret-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border: 1px solid #eee; border-radius: 4px; margin: 0.5rem 0; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="container">
        <h1>🔗 API Proxy Manager</h1>
        <p>Secure API proxy management for all your projects</p>
      </div>
    </div>

    <div class="container">
      <div class="tabs">
        <div class="tab active" onclick="showTab('projects')">Projects</div>
        <div class="tab" onclick="showTab('new-project')">New Project</div>
        <div class="tab" id="manage-tab" onclick="showTab('manage-project')" style="display: none;">Manage Project</div>
      </div>

      <div id="projects" class="tab-content active">
        <div class="card">
          <h2>Your Projects</h2>
          <div id="projects-list">Loading...</div>
        </div>
      </div>

      <div id="new-project" class="tab-content">
        <div class="card">
          <h2>Create New Project</h2>
          <form id="new-project-form">
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" name="name" required placeholder="My iOS App">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Optional description"></textarea>
            </div>
            <div class="form-group">
              <label>Project Type</label>
              <select name="type" required>
                ${projectTypeOptions}
              </select>
            </div>
            <button type="submit" class="btn btn-success">Create Project</button>
          </form>
        </div>
      </div>

      <div id="manage-project" class="tab-content">
        <div class="card">
          <h2>Manage Project</h2>
          <div id="project-details"></div>
        </div>
        
        <div class="card">
          <h2>API Secrets</h2>
          <p>Add API keys and tokens. Use prefix <code>header_</code> for automatic header injection.</p>
          
          <div class="form-group">
            <label>Secret Key</label>
            <input type="text" id="secret-key" placeholder="header_x-api-key">
          </div>
          <div class="form-group">
            <label>Secret Value</label>
            <input type="password" id="secret-value" placeholder="your-api-key-here">
          </div>
          <button onclick="addSecret()" class="btn btn-success">Add Secret</button>
          
          <h3>Current Secrets</h3>
          <div id="secrets-list">Loading...</div>
        </div>
      </div>
    </div>

    <script src="/dashboard.js"></script>
  </body>
  </html>`;
}