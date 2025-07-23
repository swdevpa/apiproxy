// Shared CSS Design System for API Proxy Manager
export function getSharedStyles() {
  return `
    <style>
      /* === DESIGN SYSTEM VARIABLES === */
      :root {
        /* Colors - Professional Blue/Grey Palette */
        --primary-color: #2563eb;
        --primary-hover: #1d4ed8;
        --primary-light: #eff6ff;
        --secondary-color: #64748b;
        --success-color: #10b981;
        --warning-color: #f59e0b;
        --danger-color: #ef4444;
        --dark-color: #1e293b;
        --light-color: #f8fafc;
        
        /* Background Colors */
        --bg-primary: #ffffff;
        --bg-secondary: #f1f5f9;
        --bg-dark: #0f172a;
        --bg-card: #ffffff;
        
        /* Text Colors */
        --text-primary: #1e293b;
        --text-secondary: #64748b;
        --text-light: #94a3b8;
        --text-white: #ffffff;
        
        /* Spacing */
        --spacing-xs: 0.25rem;
        --spacing-sm: 0.5rem;
        --spacing-md: 1rem;
        --spacing-lg: 1.5rem;
        --spacing-xl: 2rem;
        --spacing-2xl: 3rem;
        
        /* Border Radius */
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;
        
        /* Shadows */
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
        --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
        
        /* Typography */
        --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        --font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
      }

      /* === RESET & BASE === */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: var(--font-sans);
        background: var(--bg-secondary);
        color: var(--text-primary);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* === LAYOUT COMPONENTS === */
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-lg);
      }

      .container-sm {
        max-width: 600px;
        margin: 0 auto;
        padding: 0 var(--spacing-lg);
      }

      /* === HEADER === */
      .header {
        background: var(--bg-card);
        border-bottom: 1px solid #e2e8f0;
        box-shadow: var(--shadow-sm);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg) 0;
      }

      .header-logo {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        text-decoration: none;
      }

      .header-nav {
        display: flex;
        gap: var(--spacing-lg);
        align-items: center;
      }

      .header-nav a {
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        transition: all 0.2s ease;
      }

      .header-nav a:hover,
      .header-nav a.active {
        color: var(--primary-color);
        background: var(--primary-light);
      }

      /* === CARDS === */
      .card {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        margin: var(--spacing-lg) 0;
        box-shadow: var(--shadow-md);
        border: 1px solid #e2e8f0;
      }

      .card-sm {
        padding: var(--spacing-lg);
      }

      .card-header {
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid #e2e8f0;
      }

      .card-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .card-subtitle {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      /* === BUTTONS === */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-lg);
        border: none;
        border-radius: var(--radius-md);
        font-family: inherit;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
        white-space: nowrap;
        justify-content: center;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-primary {
        background: var(--primary-color);
        color: var(--text-white);
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-lg);
      }

      .btn-secondary {
        background: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid #e2e8f0;
      }

      .btn-secondary:hover:not(:disabled) {
        background: var(--bg-secondary);
        border-color: var(--primary-color);
      }

      .btn-success {
        background: var(--success-color);
        color: var(--text-white);
      }

      .btn-success:hover:not(:disabled) {
        background: #059669;
      }

      .btn-danger {
        background: var(--danger-color);
        color: var(--text-white);
      }

      .btn-danger:hover:not(:disabled) {
        background: #dc2626;
      }

      .btn-sm {
        padding: var(--spacing-xs) var(--spacing-md);
        font-size: 0.75rem;
      }

      .btn-lg {
        padding: var(--spacing-md) var(--spacing-xl);
        font-size: 1rem;
      }

      /* === FORMS === */
      .form-group {
        margin-bottom: var(--spacing-lg);
      }

      .form-label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: var(--text-primary);
        font-size: 0.875rem;
      }

      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        padding: var(--spacing-md);
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-md);
        font-family: inherit;
        font-size: 0.875rem;
        background: var(--bg-card);
        transition: all 0.2s ease;
      }

      .form-input:focus,
      .form-select:focus,
      .form-textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .form-input::placeholder {
        color: var(--text-light);
      }

      /* === TABS === */
      .tabs {
        display: flex;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: var(--spacing-xl);
        background: var(--bg-card);
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        padding: 0 var(--spacing-lg);
      }

      .tab {
        padding: var(--spacing-lg) var(--spacing-xl);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: var(--text-secondary);
        font-weight: 500;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .tab:hover {
        color: var(--primary-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        background: linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.05));
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      /* === UTILITIES === */
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-sm { font-size: 0.875rem; }
      .text-lg { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .font-bold { font-weight: 700; }

      .text-primary { color: var(--text-primary); }
      .text-secondary { color: var(--text-secondary); }
      .text-success { color: var(--success-color); }
      .text-danger { color: var(--danger-color); }

      .mb-0 { margin-bottom: 0; }
      .mb-1 { margin-bottom: var(--spacing-sm); }
      .mb-2 { margin-bottom: var(--spacing-md); }
      .mb-3 { margin-bottom: var(--spacing-lg); }
      .mb-4 { margin-bottom: var(--spacing-xl); }

      .mt-0 { margin-top: 0; }
      .mt-1 { margin-top: var(--spacing-sm); }
      .mt-2 { margin-top: var(--spacing-md); }
      .mt-3 { margin-top: var(--spacing-lg); }
      .mt-4 { margin-top: var(--spacing-xl); }

      .flex { display: flex; }
      .items-center { align-items: center; }
      .justify-between { justify-content: space-between; }
      .gap-2 { gap: var(--spacing-md); }
      .gap-3 { gap: var(--spacing-lg); }

      /* === RESPONSIVE === */
      @media (max-width: 768px) {
        .container {
          padding: 0 var(--spacing-md);
        }

        .header-content {
          flex-direction: column;
          gap: var(--spacing-md);
          padding: var(--spacing-md) 0;
        }

        .header-nav {
          flex-wrap: wrap;
          justify-content: center;
        }

        .tabs {
          flex-wrap: wrap;
          padding: 0;
        }

        .tab {
          padding: var(--spacing-md);
        }

        .card {
          padding: var(--spacing-lg);
          margin: var(--spacing-md) 0;
        }

        .btn {
          width: 100%;
          justify-content: center;
        }
      }

      /* === MODAL/DIALOG STYLES === */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .modal {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
      }

      .modal-overlay.active .modal {
        transform: scale(1) translateY(0);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary);
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all 0.2s ease;
      }

      .modal-close:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
      }

      .modal-body {
        margin-bottom: var(--spacing-lg);
      }

      .modal-footer {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        padding-top: var(--spacing-lg);
        border-top: 1px solid #e2e8f0;
      }

      /* === ANIMATIONS === */
      .fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* === LOADING STATES === */
      .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}