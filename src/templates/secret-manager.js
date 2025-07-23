// Secret Management Module
export class SecretManager {
  constructor(token, projectId) {
    this.token = token;
    this.projectId = projectId;
    this.apiBase = '/api/secrets';
  }

  // Get all secrets for current project
  async getSecrets() {
    try {
      const response = await fetch(`${this.apiBase}/${this.projectId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load secrets: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading secrets:', error);
      throw error;
    }
  }

  // Add or update a secret
  async saveSecret(key, value) {
    if (!key || !value) {
      throw new Error('Both key and value are required');
    }

    try {
      const response = await fetch(`${this.apiBase}/${this.projectId}/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ value })
      });

      if (!response.ok) {
        throw new Error(`Failed to save secret: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving secret:', error);
      throw error;
    }
  }

  // Delete a secret
  async deleteSecret(key) {
    if (!key) {
      throw new Error('Secret key is required');
    }

    try {
      const response = await fetch(`${this.apiBase}/${this.projectId}/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete secret: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting secret:', error);
      throw error;
    }
  }

  // Update secret key (rename)
  async updateSecretKey(oldKey, newKey, value) {
    if (!oldKey || !newKey) {
      throw new Error('Both old and new keys are required');
    }

    try {
      // If key changed, delete old key first
      if (oldKey !== newKey) {
        await this.deleteSecret(oldKey);
      }
      
      // Save with new key
      return await this.saveSecret(newKey, value);
    } catch (error) {
      console.error('Error updating secret key:', error);
      throw error;
    }
  }

  // Validate secret key format
  static validateSecretKey(key) {
    if (!key || typeof key !== 'string') {
      return { valid: false, message: 'Secret key is required' };
    }

    if (key.length < 1) {
      return { valid: false, message: 'Secret key cannot be empty' };
    }

    if (key.includes(' ')) {
      return { valid: false, message: 'Secret key cannot contain spaces' };
    }

    // Recommend header_ prefix for automatic injection
    if (!key.startsWith('header_')) {
      return { 
        valid: true, 
        warning: 'Consider using "header_" prefix for automatic header injection' 
      };
    }

    return { valid: true };
  }

  // Format secret key for display
  static formatSecretKey(key) {
    if (!key) return '';
    
    // Remove header_ prefix for display
    if (key.startsWith('header_')) {
      return key.substring(7).replace(/_/g, '-');
    }
    
    return key;
  }

  // Generate secret form HTML
  static getSecretFormHTML(keyValue = '', valueValue = '', isEdit = false) {
    const keyPlaceholder = isEdit ? keyValue : 'header_x-api-key';
    const valuePlaceholder = isEdit ? 'Enter new value (leave empty to keep current)' : 'your-api-key-here';
    
    return `
      <div class="form-group">
        <label class="form-label">Secret Key</label>
        <input type="text" id="secret-key-input" class="form-input" 
               value="${keyValue}" placeholder="${keyPlaceholder}" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          Use <code>header_</code> prefix for automatic header injection
        </small>
      </div>
      <div class="form-group">
        <label class="form-label">Secret Value</label>
        <input type="password" id="secret-value-input" class="form-input" 
               value="${valueValue}" placeholder="${valuePlaceholder}" required>
        <small style="color: var(--text-secondary); font-size: 0.75rem;">
          ${isEdit ? 'Leave empty to keep current value unchanged' : 'This value will be encrypted and stored securely'}
        </small>
      </div>
    `;
  }

  // Render secrets list
  static renderSecretsList(secrets, onEdit, onDelete) {
    if (!secrets || Object.keys(secrets).length === 0) {
      return '<p class="text-secondary">No secrets configured</p>';
    }

    return Object.entries(secrets).map(([key, data]) => `
      <div class="secret-item">
        <div>
          <strong>${key}</strong><br>
          <small>Updated: ${new Date(data.updated).toLocaleDateString()}</small>
        </div>
        <div class="secret-actions">
          <button class="btn btn-primary btn-sm" onclick="${onEdit}('${key}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="${onDelete}('${key}')">Delete</button>
        </div>
      </div>
    `).join('');
  }
}