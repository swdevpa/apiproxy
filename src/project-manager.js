import { EncryptionManager } from './encryption.js';

export class ProjectManager {
  constructor(env) {
    this.env = env;
    this.encryption = new EncryptionManager(env);
  }

  // Create a new project
  async createProject(projectData) {
    const projectId = this.generateProjectId(projectData.name);
    const project = {
      id: projectId,
      name: projectData.name,
      description: projectData.description || '',
      type: projectData.type || 'web', // web, ios, android, expo
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      active: true
    };

    await this.env.APIPROXY_PROJECTS_KV.put(`project:${projectId}`, JSON.stringify(project));
    
    // Initialize empty secrets for this project
    await this.env.APIPROXY_SECRETS_KV.put(`secrets:${projectId}`, JSON.stringify({}));
    
    return project;
  }

  // Get all projects
  async getAllProjects() {
    const { keys } = await this.env.APIPROXY_PROJECTS_KV.list({ prefix: 'project:' });
    const projects = [];
    
    for (const key of keys) {
      const projectData = await this.env.APIPROXY_PROJECTS_KV.get(key.name);
      if (projectData) {
        projects.push(JSON.parse(projectData));
      }
    }
    
    return projects.sort((a, b) => new Date(b.updated) - new Date(a.updated));
  }

  // Get single project
  async getProject(projectId) {
    const projectData = await this.env.APIPROXY_PROJECTS_KV.get(`project:${projectId}`);
    return projectData ? JSON.parse(projectData) : null;
  }

  // Update project
  async updateProject(projectId, updates) {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const updatedProject = {
      ...project,
      ...updates,
      updated: new Date().toISOString()
    };

    await this.env.APIPROXY_PROJECTS_KV.put(`project:${projectId}`, JSON.stringify(updatedProject));
    return updatedProject;
  }

  // Delete project
  async deleteProject(projectId) {
    await this.env.APIPROXY_PROJECTS_KV.delete(`project:${projectId}`);
    await this.env.APIPROXY_SECRETS_KV.delete(`secrets:${projectId}`);
    await this.env.APIPROXY_PROJECTS_KV.delete(`tokens:${projectId}`);
    return true;
  }

  // Manage project secrets
  async setSecret(projectId, key, value) {
    const encryptedValue = await this.encryption.encrypt(value);
    const secretsData = await this.env.APIPROXY_SECRETS_KV.get(`secrets:${projectId}`);
    const secrets = secretsData ? JSON.parse(secretsData) : {};
    
    secrets[key] = {
      value: encryptedValue,
      updated: new Date().toISOString()
    };

    await this.env.APIPROXY_SECRETS_KV.put(`secrets:${projectId}`, JSON.stringify(secrets));
    await this.updateProject(projectId, {}); // Update timestamp
    return true;
  }

  async getSecret(projectId, key) {
    const secretsData = await this.env.APIPROXY_SECRETS_KV.get(`secrets:${projectId}`);
    if (!secretsData) return null;
    
    const secrets = JSON.parse(secretsData);
    if (!secrets[key]) return null;
    
    return await this.encryption.decrypt(secrets[key].value);
  }

  async getAllSecrets(projectId) {
    const secretsData = await this.env.APIPROXY_SECRETS_KV.get(`secrets:${projectId}`);
    if (!secretsData) return {};
    
    const secrets = JSON.parse(secretsData);
    const decryptedSecrets = {};
    
    for (const [key, data] of Object.entries(secrets)) {
      decryptedSecrets[key] = {
        value: await this.encryption.decrypt(data.value),
        updated: data.updated
      };
    }
    
    return decryptedSecrets;
  }

  async deleteSecret(projectId, key) {
    const secretsData = await this.env.APIPROXY_SECRETS_KV.get(`secrets:${projectId}`);
    if (!secretsData) return false;
    
    const secrets = JSON.parse(secretsData);
    delete secrets[key];
    
    await this.env.APIPROXY_SECRETS_KV.put(`secrets:${projectId}`, JSON.stringify(secrets));
    return true;
  }

  // Generate project ID from name
  generateProjectId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  }
}