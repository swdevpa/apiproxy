// Secrets API handler
export class SecretsAPI {
  constructor(authManager, projectManager) {
    this.authManager = authManager;
    this.projectManager = projectManager;
  }

  async handle(request, url) {
    const isAdmin = await this.authManager.verifyAdminToken(request);
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401 });
    }

    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3];
    const secretKey = pathParts[4];
    const method = request.method;

    if (!projectId) {
      return new Response('Project ID required', { status: 400 });
    }

    switch (method) {
      case 'GET':
        return await this.handleGet(projectId, secretKey);
      
      case 'POST':
      case 'PUT':
        return await this.handleSet(request, projectId, secretKey);
      
      case 'DELETE':
        return await this.handleDelete(projectId, secretKey);
      
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }

  async handleGet(projectId, secretKey) {
    try {
      if (secretKey) {
        const secret = await this.projectManager.getSecret(projectId, secretKey);
        return new Response(JSON.stringify({ value: secret }), { 
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        const secrets = await this.projectManager.getAllSecrets(projectId);
        return new Response(JSON.stringify(secrets), { 
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Secrets GET error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  async handleSet(request, projectId, secretKey) {
    try {
      if (!secretKey) {
        return new Response('Secret key required', { status: 400 });
      }
      
      const { value } = await request.json();
      if (!value) {
        return new Response('Secret value required', { status: 400 });
      }
      
      await this.projectManager.setSecret(projectId, secretKey, value);
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Secrets SET error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  async handleDelete(projectId, secretKey) {
    try {
      if (!secretKey) {
        return new Response('Secret key required', { status: 400 });
      }
      
      const success = await this.projectManager.deleteSecret(projectId, secretKey);
      return new Response(JSON.stringify({ success }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Secrets DELETE error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
}