// Reusable Modal Component
export class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.options = {
      title: options.title || 'Modal',
      size: options.size || 'medium', // small, medium, large
      closeOnEscape: options.closeOnEscape !== false,
      closeOnOverlayClick: options.closeOnOverlayClick !== false,
      ...options
    };
    this.isOpen = false;
    this.onClose = null;
    this.onOpen = null;
  }

  // Create modal HTML structure
  createModal() {
    const modalHTML = `
      <div id="${this.id}" class="modal-overlay">
        <div class="modal modal-${this.options.size}">
          <div class="modal-header">
            <h3 class="modal-title">${this.options.title}</h3>
            <button class="modal-close" type="button">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Content will be inserted here -->
          </div>
          <div class="modal-footer">
            <!-- Footer buttons will be inserted here -->
          </div>
        </div>
      </div>
    `;

    // Insert into DOM if not exists
    if (!document.getElementById(this.id)) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    this.bindEvents();
    return this;
  }

  // Set modal content
  setContent(content) {
    const modalBody = document.querySelector(`#${this.id} .modal-body`);
    if (modalBody) {
      modalBody.innerHTML = content;
    }
    return this;
  }

  // Set modal footer buttons
  setFooter(buttons) {
    const modalFooter = document.querySelector(`#${this.id} .modal-footer`);
    if (modalFooter) {
      modalFooter.innerHTML = buttons;
    }
    return this;
  }

  // Open modal
  open() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.add('active');
      this.isOpen = true;
      
      // Focus first input if exists
      setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);

      if (this.onOpen) {
        this.onOpen();
      }
    }
    return this;
  }

  // Close modal
  close() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.remove('active');
      this.isOpen = false;

      if (this.onClose) {
        this.onClose();
      }
    }
    return this;
  }

  // Bind event listeners
  bindEvents() {
    const modal = document.getElementById(this.id);
    if (!modal) return;

    const closeButton = modal.querySelector('.modal-close');
    const overlay = modal;

    // Close button click
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

    // Overlay click
    if (this.options.closeOnOverlayClick) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }

  // Set event handlers
  onOpenCallback(callback) {
    this.onOpen = callback;
    return this;
  }

  onCloseCallback(callback) {
    this.onClose = callback;
    return this;
  }

  // Destroy modal
  destroy() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.remove();
    }
  }
}

// Helper function to create quick modals
export function createModal(id, title, content, buttons = '') {
  return new Modal(id, { title })
    .createModal()
    .setContent(content)
    .setFooter(buttons);
}

// Helper function for confirmation dialogs
export function showConfirmDialog(message, onConfirm, onCancel = null) {
  const modalId = 'confirm-modal-' + Date.now();
  const content = `<p style="margin: 0; font-size: 1rem; color: var(--text-primary);">${message}</p>`;
  const buttons = `
    <button type="button" class="btn btn-secondary" onclick="document.getElementById('${modalId}').querySelector('.modal-close').click()">Cancel</button>
    <button type="button" class="btn btn-danger" id="confirm-btn-${modalId}">Confirm</button>
  `;

  const modal = createModal(modalId, 'Confirm Action', content, buttons);
  
  // Handle confirm button
  setTimeout(() => {
    const confirmBtn = document.getElementById(`confirm-btn-${modalId}`);
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        modal.close();
        if (onConfirm) onConfirm();
        setTimeout(() => modal.destroy(), 300);
      });
    }
  }, 100);

  // Handle modal close
  modal.onCloseCallback(() => {
    if (onCancel) onCancel();
    setTimeout(() => modal.destroy(), 300);
  });

  modal.open();
  return modal;
}