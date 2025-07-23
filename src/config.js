// Configuration and constants
export const CONFIG = {
  // Rate limiting
  DEFAULT_RATE_LIMIT: 200,
  RATE_LIMIT_WINDOW: 3600, // 1 hour
  
  // Security
  SUSPICIOUS_PATTERNS: [
    '/wp-admin', '/.env', '/config', '/admin',
    'sql', 'union', 'select', 'drop', 'insert',
    '<script', 'javascript:', 'onload=', 'onerror='
  ],
  
  // Logging
  REQUEST_LOG_TTL: 2592000, // 30 days
  SECURITY_LOG_TTL: 604800, // 7 days
  
  // Supported project types
  PROJECT_TYPES: [
    { value: 'web', label: 'Web App' },
    { value: 'ios', label: 'iOS App' },
    { value: 'android', label: 'Android App' },
    { value: 'expo', label: 'Expo App' },
    { value: 'other', label: 'Other' }
  ]
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// CORS headers configuration
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};