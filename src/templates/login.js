// Login page template
export function getLoginHTML() {
  return `<!DOCTYPE html>
    <html>
    <head><title>API Proxy Manager - Login</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px;">
      <h1>🔒 API Proxy Manager</h1>
      <p>Enter your admin token to access the dashboard.</p>
      <div id="login">
        <input type="password" id="token" placeholder="Admin Token" style="width: 100%; padding: 10px; margin: 10px 0;">
        <button onclick="login()" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px;">Login</button>
        <br><br>
        <a href="/dashboard" style="color: #007cba;">Direct Dashboard Link (for testing)</a>
      </div>
      <script>
        function login() {
          const token = document.getElementById('token').value;
          if (!token) {
            alert('Please enter a token');
            return;
          }
          
          localStorage.setItem('adminToken', token);
          
          // Validate token first before redirecting
          fetch('/api/projects', {
            headers: { 'Authorization': 'Bearer ' + token }
          }).then(r => {
            console.log('API response status:', r.status);
            if (r.ok) {
              console.log('Login successful, redirecting...');
              window.location.replace('/dashboard');
            } else {
              alert('Invalid token. Please try again.');
              localStorage.removeItem('adminToken');
            }
          }).catch(err => {
            alert('Login failed. Please try again.');
            localStorage.removeItem('adminToken');
            console.error('Login error:', err);
          });
        }
        
        // Check if we have a saved token and try auto-login ONCE
        const savedToken = localStorage.getItem('adminToken');
        if (savedToken && !sessionStorage.getItem('loginAttempted')) {
          sessionStorage.setItem('loginAttempted', 'true');
          fetch('/api/projects', {
            headers: { 'Authorization': 'Bearer ' + savedToken }
          }).then(r => {
            if (r.ok) {
              window.location.href = '/dashboard';
            } else {
              localStorage.removeItem('adminToken');
              sessionStorage.removeItem('loginAttempted');
            }
          }).catch(err => {
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('loginAttempted');
            console.error('Auto-login error:', err);
          });
        }
      </script>
    </body>
    </html>`;
}