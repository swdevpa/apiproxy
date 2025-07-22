// API Proxy Manager - Main Entry Point
import { AuthManager } from './auth.js';
import { ProjectManager } from './project-manager.js';
import { ProxyManager } from './proxy.js';
import { SecurityManager } from './security.js';
import { Router } from './router.js';
import { CONFIG } from './config.js';

/**
 * Main Cloudflare Worker handler
 * Clean, modular architecture for maintainability
 */
export default {
  async fetch(request, env, ctx) {
    // Initialize core managers
    const authManager = new AuthManager(env);
    const projectManager = new ProjectManager(env);
    const proxyManager = new ProxyManager(env, projectManager, authManager);
    const securityManager = new SecurityManager(env);
    
    // Initialize router
    const router = new Router(
      env, 
      authManager, 
      projectManager, 
      proxyManager, 
      securityManager
    );

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Basic security validation
      if (!securityManager.validateRequest(request)) {
        return new Response('Invalid request method', { status: 405 });
      }

      // Check for suspicious activity
      if (await securityManager.checkSuspiciousActivity(request)) {
        return new Response('Forbidden', { status: 403 });
      }

      // Rate limiting
      const clientId = securityManager.getClientId(request);
      if (!await securityManager.checkRateLimit(clientId, path, CONFIG.DEFAULT_RATE_LIMIT)) {
        return securityManager.addSecurityHeaders(
          new Response('Rate limit exceeded', { status: 429 })
        );
      }

      // Route the request
      return await router.route(request);
      
    } catch (error) {
      console.error('Application error:', error);
      return securityManager.addSecurityHeaders(
        new Response('Internal Server Error', { status: 500 })
      );
    }
  }
};