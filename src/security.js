export class SecurityManager {
  constructor(env) {
    this.env = env;
    this.rateLimits = new Map();
  }

  // Add security headers to response
  addSecurityHeaders(response) {
    const headers = new Headers(response.headers);
    
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  // Rate limiting implementation
  async checkRateLimit(clientId, endpoint, limit = 1000, window = 3600) {
    const key = `rate_limit:${clientId}:${endpoint}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % window);
    
    const rateLimitData = await this.env.APIPROXY_PROJECTS_KV.get(key);
    const currentCount = rateLimitData ? JSON.parse(rateLimitData) : { count: 0, window: windowStart };
    
    // Reset if we're in a new window
    if (currentCount.window !== windowStart) {
      currentCount.count = 0;
      currentCount.window = windowStart;
    }
    
    if (currentCount.count >= limit) {
      return false; // Rate limit exceeded
    }
    
    // Increment counter
    currentCount.count++;
    await this.env.APIPROXY_PROJECTS_KV.put(key, JSON.stringify(currentCount), { expirationTtl: window });
    
    return true;
  }

  // Get client identifier for rate limiting
  getClientId(request) {
    // Use CF-Connecting-IP or fallback to a combination of headers
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Add user agent for better uniqueness while preserving privacy
    const userAgent = request.headers.get('user-agent') || '';
    const hashedUA = this.simpleHash(userAgent);
    
    return `${ip}_${hashedUA}`;
  }

  // Simple hash function for privacy
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Validate request origin and method
  validateRequest(request) {
    const method = request.method;
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    
    if (!allowedMethods.includes(method)) {
      return false;
    }

    // Additional validations can be added here
    return true;
  }

  // Check for suspicious patterns
  async checkSuspiciousActivity(request) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();
    
    // Check for common attack patterns
    const suspiciousPatterns = [
      '/wp-admin', '/.env', '/config', '/admin',
      'sql', 'union', 'select', 'drop', 'insert',
      '<script', 'javascript:', 'onload=', 'onerror='
    ];
    
    const requestString = `${path} ${url.search}`.toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (requestString.includes(pattern)) {
        await this.logSuspiciousActivity(request, pattern);
        return true;
      }
    }
    
    return false;
  }

  // Log suspicious activity
  async logSuspiciousActivity(request, pattern) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: this.getClientId(request),
      method: request.method,
      url: request.url,
      pattern: pattern,
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    const logKey = `security_log:${Date.now()}`;
    await this.env.APIPROXY_PROJECTS_KV.put(logKey, JSON.stringify(logEntry), { expirationTtl: 604800 }); // 7 days
  }
}