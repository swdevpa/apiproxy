import { AuthManager } from './auth.js';
import { ProjectManager } from './project-manager.js';
import { ProxyManager } from './proxy.js';
import { SecurityManager } from './security.js';

export default {
  async fetch(request, env, ctx) {
    // Initialize managers
    const authManager = new AuthManager(env);
    const projectManager = new ProjectManager(env);
    const proxyManager = new ProxyManager(env, projectManager, authManager);
    const securityManager = new SecurityManager(env);

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Basic security checks
      if (!securityManager.validateRequest(request)) {
        return new Response('Invalid request method', { status: 405 });
      }

      // Check for suspicious activity
      if (await securityManager.checkSuspiciousActivity(request)) {
        return new Response('Forbidden', { status: 403 });
      }

      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return securityManager.addSecurityHeaders(
          new Response(null, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          })
        );
      }

      // Rate limiting for all endpoints
      const clientId = securityManager.getClientId(request);
      if (!await securityManager.checkRateLimit(clientId, path, 200)) {
        return securityManager.addSecurityHeaders(
          new Response('Rate limit exceeded', { status: 429 })
        );
      }

      // Route handling
      if (path === '/' || path === '/dashboard') {
        return securityManager.addSecurityHeaders(await handleDashboard(request, env, authManager, projectManager));
      }
      
      if (path.startsWith('/api/')) {
        return securityManager.addSecurityHeaders(await handleAPI(request, url, env, authManager, projectManager, proxyManager));
      }
      
      if (path.startsWith('/proxy/')) {
        return await handleProxyRequest(request, url, proxyManager, securityManager);
      }

      return securityManager.addSecurityHeaders(new Response('Not Found', { status: 404 }));
      
    } catch (error) {
      console.error('Application error:', error);
      return securityManager.addSecurityHeaders(new Response('Internal Server Error', { status: 500 }));
    }
  }
};

// Dashboard handler
async function handleDashboard(request, env, authManager, projectManager) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // For /dashboard route, show dashboard with client-side auth check
  if (path === '/dashboard') {
    // Return dashboard - authentication will be handled client-side
    return new Response(getDashboardHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // For / route (root), always show login page - no auth check here
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head><title>API Proxy Manager - Login</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px;">
      <h1>🔒 API Proxy Manager</h1>
      <p>Enter your admin token to access the dashboard.</p>
      <div id="login">
        <input type="password" id="token" placeholder="Admin Token" style="width: 100%; padding: 10px; margin: 10px 0;">
        <button onclick="login()" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px;">Login</button>
        <br><br>
        <a href="/dashboard" style="color: #007cba;">Direct Dashboard Link (for testing)</a>
      </div>
      <script>
        function login() {
          const token = document.getElementById('token').value;
          if (!token) {
            alert('Please enter a token');
            return;
          }
          
          localStorage.setItem('adminToken', token);
          
          // Validate token first before redirecting
          fetch('/api/projects', {
            headers: { 'Authorization': 'Bearer ' + token }
          }).then(r => {
            console.log('API response status:', r.status);
            if (r.ok) {
              console.log('Login successful, redirecting...');
              window.location.replace('/dashboard');
            } else {
              alert('Invalid token. Please try again.');
              localStorage.removeItem('adminToken');
            }
          }).catch(err => {
            alert('Login failed. Please try again.');
            localStorage.removeItem('adminToken');
            console.error('Login error:', err);
          });
        }
        
        // Check if we have a saved token and try auto-login ONCE
        const savedToken = localStorage.getItem('adminToken');
        if (savedToken && !sessionStorage.getItem('loginAttempted')) {
          sessionStorage.setItem('loginAttempted', 'true');
          fetch('/api/projects', {
            headers: { 'Authorization': 'Bearer ' + savedToken }
          }).then(r => {
            if (r.ok) {
              window.location.href = '/dashboard';
            } else {
              localStorage.removeItem('adminToken');
              sessionStorage.removeItem('loginAttempted');
            }
          }).catch(err => {
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('loginAttempted');
            console.error('Auto-login error:', err);
          });
        }
      </script>
    </body>
    </html>`, 
    { 
      headers: { 'Content-Type': 'text/html' }
    }
  );
}

// API handler
async function handleAPI(request, url, env, authManager, projectManager, proxyManager) {
  const isAdmin = await authManager.verifyAdminToken(request);
  
  if (!isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }

  const pathParts = url.pathname.split('/');
  const endpoint = pathParts[2];
  
  switch (endpoint) {
    case 'projects':
      return await handleProjectsAPI(request, projectManager, pathParts);
    case 'secrets':
      return await handleSecretsAPI(request, projectManager, pathParts);
    case 'logs':
      return await handleLogsAPI(request, proxyManager, pathParts);
    default:
      return new Response('API endpoint not found', { status: 404 });
  }
}

// Projects API handler
async function handleProjectsAPI(request, projectManager, pathParts) {
  const method = request.method;
  const projectId = pathParts[3];

  switch (method) {
    case 'GET':
      if (projectId) {
        const project = await projectManager.getProject(projectId);
        return new Response(JSON.stringify(project), { 
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        const projects = await projectManager.getAllProjects();
        return new Response(JSON.stringify(projects), { 
          headers: { 'Content-Type': 'application/json' }
        });
      }
    
    case 'POST':
      const projectData = await request.json();
      const newProject = await projectManager.createProject(projectData);
      return new Response(JSON.stringify(newProject), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    
    case 'PUT':
      if (!projectId) return new Response('Project ID required', { status: 400 });
      const updateData = await request.json();
      const updatedProject = await projectManager.updateProject(projectId, updateData);
      return new Response(JSON.stringify(updatedProject), { 
        headers: { 'Content-Type': 'application/json' }
      });
    
    case 'DELETE':
      if (!projectId) return new Response('Project ID required', { status: 400 });
      await projectManager.deleteProject(projectId);
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    
    default:
      return new Response('Method not allowed', { status: 405 });
  }
}

// Secrets API handler  
async function handleSecretsAPI(request, projectManager, pathParts) {
  const method = request.method;
  const projectId = pathParts[3];
  const secretKey = pathParts[4];

  if (!projectId) {
    return new Response('Project ID required', { status: 400 });
  }

  switch (method) {
    case 'GET':
      if (secretKey) {
        const secret = await projectManager.getSecret(projectId, secretKey);
        return new Response(JSON.stringify({ value: secret }), { 
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        const secrets = await projectManager.getAllSecrets(projectId);
        return new Response(JSON.stringify(secrets), { 
          headers: { 'Content-Type': 'application/json' }
        });
      }
    
    case 'POST':
    case 'PUT':
      if (!secretKey) return new Response('Secret key required', { status: 400 });
      const { value } = await request.json();
      await projectManager.setSecret(projectId, secretKey, value);
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    
    case 'DELETE':
      if (!secretKey) return new Response('Secret key required', { status: 400 });
      await projectManager.deleteSecret(projectId, secretKey);
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    
    default:
      return new Response('Method not allowed', { status: 405 });
  }
}

// Logs API handler
async function handleLogsAPI(request, proxyManager, pathParts) {
  const projectId = pathParts[3];
  
  if (!projectId) {
    return new Response('Project ID required', { status: 400 });
  }

  const logs = await proxyManager.getProjectLogs(projectId);
  return new Response(JSON.stringify(logs), { 
    headers: { 'Content-Type': 'application/json' }
  });
}

// Proxy request handler
async function handleProxyRequest(request, url, proxyManager, securityManager) {
  const pathParts = url.pathname.split('/');
  const projectId = pathParts[2];
  
  if (!projectId) {
    return securityManager.addSecurityHeaders(
      new Response('Project ID required', { status: 400 })
    );
  }

  const response = await proxyManager.handleProxyRequest(request, projectId);
  return securityManager.addSecurityHeaders(response);
}

// Dashboard HTML
function getDashboardHTML() {
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
      .project-header { display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem; }
      .project-name { font-size: 1.2rem; font-weight: 600; color: #2c3e50; }
      .project-type { background: #ecf0f1; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
      .proxy-url { background: #ecf0f1; padding: 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem; word-break: break-all; }
      .tabs { display: flex; border-bottom: 1px solid #ddd; margin-bottom: 1rem; }
      .tab { padding: 1rem; cursor: pointer; border-bottom: 2px solid transparent; }
      .tab.active { border-bottom-color: #3498db; color: #3498db; }
      .tab-content { display: none; }
      .tab-content.active { display: block; }
      .secret-item { display: flex; justify-content: between; align-items: center; padding: 0.5rem; border: 1px solid #eee; border-radius: 4px; margin: 0.5rem 0; }
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
                <option value="web">Web App</option>
                <option value="ios">iOS App</option>
                <option value="android">Android App</option>
                <option value="expo">Expo App</option>
                <option value="other">Other</option>
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

    <script>
      const token = localStorage.getItem('adminToken');
      
      // Check if user is authenticated
      if (!token) {
        window.location.href = '/';
      }
      
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
      }
      
      let currentProjectId = null;
      
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
          const response = await fetch('/api/secrets/' + projectId, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const secrets = await response.json();
          
          const html = Object.entries(secrets).map(([key, data]) => \`
            <div class="secret-item">
              <div>
                <strong>\${key}</strong><br>
                <small>Updated: \${new Date(data.updated).toLocaleDateString()}</small>
              </div>
              <div>
                <button class="btn btn-danger" onclick="deleteSecret('\${key}')">Delete</button>
              </div>
            </div>
          \`).join('');
          
          document.getElementById('secrets-list').innerHTML = html || '<p>No secrets configured</p>';
        } catch (error) {
          console.error('Error loading secrets:', error);
        }
      }
      
      async function addSecret() {
        const key = document.getElementById('secret-key').value;
        const value = document.getElementById('secret-value').value;
        
        if (!key || !value) {
          alert('Please enter both key and value');
          return;
        }
        
        try {
          await fetch('/api/secrets/' + currentProjectId + '/' + key, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ value })
          });
          
          document.getElementById('secret-key').value = '';
          document.getElementById('secret-value').value = '';
          loadSecrets(currentProjectId);
        } catch (error) {
          console.error('Error adding secret:', error);
        }
      }
      
      async function deleteSecret(key) {
        if (confirm('Delete secret "' + key + '"?')) {
          try {
            await fetch('/api/secrets/' + currentProjectId + '/' + key, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            loadSecrets(currentProjectId);
          } catch (error) {
            console.error('Error deleting secret:', error);
          }
        }
      }

      // Load projects on page load
      loadProjects();
    </script>
  </body>
  </html>`;
}