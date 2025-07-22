// Dashboard JavaScript functionality
export function getDashboardScript() {
  return `
const token = localStorage.getItem('adminToken');

// Check if user is authenticated
if (!token) {
  window.location.href = '/';
}

let currentProjectId = null;

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
`;
}