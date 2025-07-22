// Secure authentication system
export class AuthManager {
  constructor(env) {
    this.env = env;
    this.ADMIN_TOKEN = env.ADMIN_TOKEN; // Set this as a Cloudflare Worker secret
  }

  // Verify admin token from request
  async verifyAdminToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return false;
    
    const token = authHeader.replace('Bearer ', '');
    return this.constantTimeCompare(token, this.ADMIN_TOKEN);
  }

  // Constant time comparison to prevent timing attacks
  constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  // Generate secure API token for projects
  async generateProjectToken(projectId) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${projectId}-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0]}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify project token
  async verifyProjectToken(token, projectId) {
    try {
      const storedTokens = await this.env.APIPROXY_PROJECTS_KV.get(`tokens:${projectId}`);
      if (!storedTokens) return false;
      
      const tokens = JSON.parse(storedTokens);
      return tokens.includes(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
}