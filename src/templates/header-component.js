// Shared Header/Navigation Component
export function getHeaderComponent(currentPage = 'dashboard', showAuth = true) {
  const pages = {
    'login': { title: 'Login', url: '/', icon: '🔐' },
    'dashboard': { title: 'Dashboard', url: '/dashboard', icon: '📊' },
    'docs': { title: 'Documentation', url: '/docs', icon: '📖' }
  };

  const navItems = Object.entries(pages)
    .filter(([key]) => key !== 'login') // Don't show login in nav when authenticated
    .map(([key, page]) => {
      const isActive = key === currentPage ? 'active' : '';
      return `<a href="${page.url}" class="${isActive}">${page.icon} ${page.title}</a>`;
    })
    .join('');

  const authSection = showAuth ? `
    <div class="header-auth">
      <span class="auth-status" id="auth-status">🟢 Authenticated</span>
      <button class="btn btn-sm btn-secondary" onclick="logout()">Logout</button>
    </div>
  ` : '';

  return `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a href="/dashboard" class="header-logo">
            🔗 API Proxy Manager
          </a>
          
          <nav class="header-nav">
            ${navItems}
          </nav>
          
          ${authSection}
        </div>
      </div>
    </header>
  `;
}

export function getHeaderScript() {
  return `
    <script>
      // Header authentication and navigation scripts - Global scope
      function logout() {
        if (confirm('Are you sure you want to logout?')) {
          localStorage.removeItem('adminToken');
          sessionStorage.clear();
          window.location.href = '/';
        }
      }
      
      // Export to global scope
      window.logout = logout;
      
      // Check authentication status
      function checkAuthStatus() {
        const token = localStorage.getItem('adminToken');
        const authStatus = document.getElementById('auth-status');
        
        if (authStatus) {
          if (token) {
            authStatus.innerHTML = '🟢 Authenticated';
            authStatus.style.color = 'var(--success-color)';
          } else {
            authStatus.innerHTML = '🔴 Not Authenticated';
            authStatus.style.color = 'var(--danger-color)';
          }
        }
      }
      
      // Initialize on load
      document.addEventListener('DOMContentLoaded', function() {
        checkAuthStatus();
        
        // Add smooth transitions to all links
        document.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', function(e) {
            if (this.href && this.href.includes(window.location.origin)) {
              this.style.opacity = '0.7';
            }
          });
        });
      });
      
      // Page visibility change handler
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
          checkAuthStatus();
        }
      });
    </script>
  `;
}