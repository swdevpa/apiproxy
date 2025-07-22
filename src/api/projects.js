// Projects API handler
export class ProjectsAPI {
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
    const method = request.method;

    switch (method) {
      case 'GET':
        return await this.handleGet(projectId);
      
      case 'POST':
        return await this.handlePost(request);
      
      case 'PUT':
        return await this.handlePut(request, projectId);
      
      case 'DELETE':
        return await this.handleDelete(projectId);
      
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }

  async handleGet(projectId) {
    try {
      if (projectId) {
        const project = await this.projectManager.getProject(projectId);
        return new Response(JSON.stringify(project), { 
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        const projects = await this.projectManager.getAllProjects();
        return new Response(JSON.stringify(projects), { 
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Projects GET error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  async handlePost(request) {
    try {
      const projectData = await request.json();
      const newProject = await this.projectManager.createProject(projectData);
      return new Response(JSON.stringify(newProject), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Projects POST error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  async handlePut(request, projectId) {
    try {
      if (!projectId) {
        return new Response('Project ID required', { status: 400 });
      }
      
      const updateData = await request.json();
      const updatedProject = await this.projectManager.updateProject(projectId, updateData);
      
      if (!updatedProject) {
        return new Response('Project not found', { status: 404 });
      }
      
      return new Response(JSON.stringify(updatedProject), { 
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Projects PUT error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }

  async handleDelete(projectId) {
    try {
      if (!projectId) {
        return new Response('Project ID required', { status: 400 });
      }
      
      await this.projectManager.deleteProject(projectId);
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Projects DELETE error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
}