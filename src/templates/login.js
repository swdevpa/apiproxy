// Login page template
import { getSharedStyles } from './shared-styles.js';
import { getHeaderComponent, getHeaderScript } from './header-component.js';

export function getLoginHTML() {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Proxy Manager - Login</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      ${getSharedStyles()}
    </head>
    <body>
      ${getHeaderComponent('login', false)}
      
      <div class="container-sm">
        <div class="card" style="margin-top: 4rem; text-align: center;">
          <div class="card-header">
            <h1 class="card-title">🔐 Secure Access</h1>
            <p class="card-subtitle">Enter your admin token to access the dashboard</p>
          </div>
          
          <div id="login-form">
            <div class="form-group">
              <label class="form-label" for="token">Admin Token</label>
              <input type="password" id="token" class="form-input" placeholder="Enter your secure admin token" required>
            </div>
            
            <button onclick="login()" class="btn btn-primary btn-lg" id="login-btn" style="width: 100%;">
              <span id="login-text">🚀 Login</span>
              <div id="login-spinner" class="loading" style="display: none;"></div>
            </button>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
              <p class="text-sm text-secondary">
                Need help? Check the <a href="/docs" style="color: var(--primary-color);">documentation</a>
              </p>
            </div>
          </div>
          
          <div id="login-error" style="display: none; margin-top: 1rem; padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); color: #dc2626;">
            <strong>⚠️ Authentication Failed</strong><br>
            <span id="error-message">Invalid token. Please try again.</span>
          </div>
        </div>
      </div>
      <script>
        // Enhanced login functionality with UI feedback
        function login() {
          const token = document.getElementById('token').value;
          const loginBtn = document.getElementById('login-btn');
          const loginText = document.getElementById('login-text');
          const loginSpinner = document.getElementById('login-spinner');
          const errorDiv = document.getElementById('login-error');
          const errorMessage = document.getElementById('error-message');
          
          if (!token) {
            showError('Please enter your admin token');
            return;
          }
          
          // Show loading state
          loginBtn.disabled = true;
          loginText.style.display = 'none';
          loginSpinner.style.display = 'inline-block';
          hideError();
          
          localStorage.setItem('adminToken', token);
          
          // Validate token first before redirecting
          fetch('/api/projects', {
            headers: { 'Authorization': 'Bearer ' + token }
          }).then(r => {
            console.log('API response status:', r.status);
            if (r.ok) {
              console.log('Login successful, redirecting...');
              loginText.textContent = '✅ Success! Redirecting...';
              loginText.style.display = 'inline';
              loginSpinner.style.display = 'none';
              
              setTimeout(() => {
                window.location.replace('/dashboard');
              }, 500);
            } else {
              showError('Invalid admin token. Please check and try again.');
              localStorage.removeItem('adminToken');
              resetLoginButton();
            }
          }).catch(err => {
            showError('Connection failed. Please check your internet connection and try again.');
            localStorage.removeItem('adminToken');
            console.error('Login error:', err);
            resetLoginButton();
          });
        }
        
        function showError(message) {
          const errorDiv = document.getElementById('login-error');
          const errorMessage = document.getElementById('error-message');
          errorMessage.textContent = message;
          errorDiv.style.display = 'block';
          errorDiv.classList.add('fade-in');
        }
        
        function hideError() {
          const errorDiv = document.getElementById('login-error');
          errorDiv.style.display = 'none';
        }
        
        function resetLoginButton() {
          const loginBtn = document.getElementById('login-btn');
          const loginText = document.getElementById('login-text');
          const loginSpinner = document.getElementById('login-spinner');
          
          loginBtn.disabled = false;
          loginText.textContent = '🚀 Login';
          loginText.style.display = 'inline';
          loginSpinner.style.display = 'none';
        }
        
        // Handle Enter key in password field
        document.getElementById('token').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            login();
          }
        });
        
        // Check if we have a saved token and try auto-login ONCE
        document.addEventListener('DOMContentLoaded', function() {
          const savedToken = localStorage.getItem('adminToken');
          if (savedToken && !sessionStorage.getItem('loginAttempted')) {
            sessionStorage.setItem('loginAttempted', 'true');
            
            // Show auto-login message
            const loginText = document.getElementById('login-text');
            loginText.textContent = '🔄 Checking saved session...';
            
            fetch('/api/projects', {
              headers: { 'Authorization': 'Bearer ' + savedToken }
            }).then(r => {
              if (r.ok) {
                loginText.textContent = '✅ Session valid! Redirecting...';
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1000);
              } else {
                localStorage.removeItem('adminToken');
                sessionStorage.removeItem('loginAttempted');
                resetLoginButton();
              }
            }).catch(err => {
              localStorage.removeItem('adminToken');
              sessionStorage.removeItem('loginAttempted');
              console.error('Auto-login error:', err);
              resetLoginButton();
            });
          }
        });
      </script>
      ${getHeaderScript()}
    </body>
    </html>`;
}