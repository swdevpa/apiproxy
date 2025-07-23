// Dashboard JavaScript functionality - Modularized
export function getDashboardScript() {
  return `
import { Modal } from './modal-component.js';
import { SecretManager } from './secret-manager.js';

const token = localStorage.getItem('adminToken');
let secretManager = null;
let addSecretModal = null;
let editSecretModal = null;

// Check if user is authenticated
if (!token) {
  window.location.href = '/';
}

let currentProjectId = null;

// Initialize modular components
function initializeModules() {
  if (currentProjectId && token) {
    secretManager = new SecretManager(token, currentProjectId);
    
    // Initialize modals
    addSecretModal = new Modal('add-secret-modal', { title: 'Add New Secret' });
    editSecretModal = new Modal('edit-secret-modal', { title: 'Edit Secret' });
    
    addSecretModal.createModal();
    editSecretModal.createModal();
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

// Load projects on page load
loadProjects();
`;
}