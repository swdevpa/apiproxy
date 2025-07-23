import { CONFIG } from '../config.js';
import { getSharedStyles } from './shared-styles.js';
import { getHeaderComponent, getHeaderScript } from './header-component.js';

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
    <title>API Proxy Manager - Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    ${getSharedStyles()}
    <style>
      /* Dashboard-specific styles */
      .project-item {
        background: var(--bg-card);
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin: var(--spacing-md) 0;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .project-item:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-lg);
        transform: translateY(-1px);
      }
      
      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);
      }
      
      .project-info h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
      }
      
      .project-meta {
        display: flex;
        gap: var(--spacing-md);
        align-items: center;
        margin-bottom: var(--spacing-sm);
      }
      
      .project-type {
        background: var(--primary-light);
        color: var(--primary-color);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }
      
      .project-id {
        font-family: var(--font-mono);
        background: var(--bg-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
      
      .proxy-url {
        background: var(--bg-secondary);
        border: 1px solid #e2e8f0;
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        font-size: 0.875rem;
        word-break: break-all;
        color: var(--text-primary);
        margin: var(--spacing-md) 0;
        position: relative;
      }
      
      .copy-url-btn {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.75rem;
      }
      
      .secret-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-md);
        margin: var(--spacing-sm) 0;
        background: var(--bg-card);
      }
      
      .secret-key {
        font-family: var(--font-mono);
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .secret-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        margin: var(--spacing-lg) 0;
      }
      
      .stat-card {
        text-align: center;
        padding: var(--spacing-lg);
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        color: var(--text-white);
        border-radius: var(--radius-lg);
      }
      
      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
      }
      
      .stat-label {
        font-size: 0.875rem;
        opacity: 0.9;
      }
      
      .empty-state {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--text-secondary);
      }
      
      .empty-state-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-lg);
      }
    </style>
  </head>
  <body>
    ${getHeaderComponent('dashboard', true)}

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
          <button onclick="addSecret()" class="btn btn-success" id="add-secret-btn">Add Secret</button>
          
          <h3>Current Secrets</h3>
          <div id="secrets-list">Loading...</div>
        </div>
      </div>
    </div>

    <script src="/dashboard.js"></script>
  </body>
  </html>`;
}