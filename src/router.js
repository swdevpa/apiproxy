import { getLoginHTML } from './templates/login.js';
import { getDashboardHTML } from './templates/dashboard.js';
import { getDashboardScript } from './templates/dashboard-script.js';
import { getDocsHTML } from './templates/docs.js';
import { ProjectsAPI } from './api/projects.js';
import { SecretsAPI } from './api/secrets.js';
import { ProxyAPI, LogsAPI } from './api/proxy.js';

// Main router class
export class Router {
  constructor(env, authManager, projectManager, proxyManager, securityManager) {
    this.env = env;
    this.authManager = authManager;
    this.projectManager = projectManager;
    this.proxyManager = proxyManager;
    this.securityManager = securityManager;
    
    // Initialize API handlers
    this.projectsAPI = new ProjectsAPI(authManager, projectManager);
    this.secretsAPI = new SecretsAPI(authManager, projectManager);
    this.proxyAPI = new ProxyAPI(proxyManager);
    this.logsAPI = new LogsAPI(authManager, proxyManager);
  }

  async route(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return this.securityManager.addSecurityHeaders(
          new Response(null, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          })
        );
      }

      // Route handling
      if (path === '/') {
        return this.securityManager.addSecurityHeaders(this.handleRoot());
      }
      
      if (path === '/dashboard') {
        return this.securityManager.addSecurityHeaders(this.handleDashboard());
      }

      if (path === '/dashboard.js') {
        return this.securityManager.addSecurityHeaders(this.handleDashboardScript());
      }

      if (path === '/docs' || path === '/documentation') {
        return this.securityManager.addSecurityHeaders(this.handleDocs());
      }
      
      if (path.startsWith('/api/projects')) {
        return this.securityManager.addSecurityHeaders(await this.projectsAPI.handle(request, url));
      }
      
      if (path.startsWith('/api/secrets')) {
        return this.securityManager.addSecurityHeaders(await this.secretsAPI.handle(request, url));
      }
      
      if (path.startsWith('/api/logs')) {
        return this.securityManager.addSecurityHeaders(await this.logsAPI.handle(request, url));
      }
      
      if (path.startsWith('/proxy/')) {
        return this.securityManager.addSecurityHeaders(await this.proxyAPI.handle(request, url));
      }

      // 404 for unmatched routes
      return this.securityManager.addSecurityHeaders(
        new Response('Not Found', { status: 404 })
      );
      
    } catch (error) {
      console.error('Router error:', error);
      return this.securityManager.addSecurityHeaders(
        new Response('Internal Server Error', { status: 500 })
      );
    }
  }

  handleRoot() {
    return new Response(getLoginHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }

  handleDashboard() {
    return new Response(getDashboardHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }

  handleDashboardScript() {
    return new Response(getDashboardScript(), { 
      headers: { 
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache'
      }
    });
  }

  handleDocs() {
    return new Response(getDocsHTML(), { 
      headers: { 'Content-Type': 'text/html' }
    });
  }
}