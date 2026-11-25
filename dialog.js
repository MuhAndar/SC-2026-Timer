/**
 * SCRATCH THEMED CUSTOM DIALOG & MODAL SYSTEM
 * Replaces native browser alert() and confirm() with playful, animated Scratch UI
 */

class ScratchDialogSystem {
  constructor() {
    this.createDOM();
  }

  createDOM() {
    if (document.getElementById('scratchDialogBackdrop')) return;

    const html = `
      <div class="scratch-dialog-backdrop" id="scratchDialogBackdrop">
        <div class="scratch-dialog-card" id="scratchDialogCard">
          <div class="scratch-dialog-cat-ear left"></div>
          <div class="scratch-dialog-cat-ear right"></div>
          
          <div class="scratch-dialog-icon-bubble" id="dialogIconBubble">
            <span id="dialogIcon">⚠️</span>
          </div>

          <h3 class="scratch-dialog-title" id="dialogTitle">Konfirmasi Tindakan</h3>
          <p class="scratch-dialog-message" id="dialogMessage">Apakah Anda yakin ingin melanjutkan tindakan ini?</p>

          <div class="scratch-dialog-btn-group" id="dialogBtnGroup">
            <button type="button" class="scratch-dialog-btn cancel" id="dialogBtnCancel">Batal</button>
            <button type="button" class="scratch-dialog-btn confirm" id="dialogBtnConfirm">Ya, Lanjutkan</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    this.backdrop = document.getElementById('scratchDialogBackdrop');
    this.card = document.getElementById('scratchDialogCard');
    this.iconBubble = document.getElementById('dialogIconBubble');
    this.icon = document.getElementById('dialogIcon');
    this.title = document.getElementById('dialogTitle');
    this.message = document.getElementById('dialogMessage');
    this.btnCancel = document.getElementById('dialogBtnCancel');
    this.btnConfirm = document.getElementById('dialogBtnConfirm');
  }

  confirm({
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'warning', // 'warning', 'danger', 'info', 'success'
    icon = null
  } = {}) {
    this.createDOM();

    return new Promise((resolve) => {
      // Setup styling based on type
      this.card.className = `scratch-dialog-card type-${type}`;
      this.title.textContent = title;
      this.message.innerHTML = message;
      this.btnConfirm.textContent = confirmText;
      this.btnCancel.textContent = cancelText;
      this.btnCancel.style.display = 'inline-block';

      // Default icons
      let defaultIcon = '⚠️';
      if (type === 'danger') defaultIcon = '🛑';
      if (type === 'success') defaultIcon = '🎉';
      if (type === 'info') defaultIcon = '💡';
      this.icon.textContent = icon || defaultIcon;

      // Play soft sound if available
      if (window.sfx) {
        try {
          if (type === 'danger' || type === 'warning') window.sfx.playBeep(440, 0.15, 'sawtooth');
          else if (type === 'success' && typeof window.sfx.playFinishFanfare === 'function') window.sfx.playFinishFanfare();
          else window.sfx.playBeep(650, 0.1, 'sine');
        } catch (e) {}
      }

      this.backdrop.classList.add('active');

      const cleanup = () => {
        this.backdrop.classList.remove('active');
        this.btnConfirm.removeEventListener('click', onConfirm);
        this.btnCancel.removeEventListener('click', onCancel);
        this.backdrop.removeEventListener('click', onBackdropClick);
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onBackdropClick = (e) => {
        if (e.target === this.backdrop) {
          cleanup();
          resolve(false);
        }
      };

      this.btnConfirm.addEventListener('click', onConfirm);
      this.btnCancel.addEventListener('click', onCancel);
      this.backdrop.addEventListener('click', onBackdropClick);
    });
  }

  alert({
    title = 'Informasi',
    message = '',
    confirmText = 'Mengerti',
    type = 'info',
    icon = null
  } = {}) {
    this.createDOM();

    return new Promise((resolve) => {
      this.card.className = `scratch-dialog-card type-${type}`;
      this.title.textContent = title;
      this.message.innerHTML = message;
      this.btnConfirm.textContent = confirmText;
      this.btnCancel.style.display = 'none'; // No cancel button for alert

      let defaultIcon = '💡';
      if (type === 'success') defaultIcon = '🎉';
      if (type === 'warning') defaultIcon = '⚠️';
      if (type === 'danger') defaultIcon = '❌';
      this.icon.textContent = icon || defaultIcon;

      if (window.sfx) {
        try {
          if (type === 'success' && typeof window.sfx.playFinishFanfare === 'function') window.sfx.playFinishFanfare();
          else window.sfx.playBeep(700, 0.12, 'sine');
        } catch (e) {}
      }

      this.backdrop.classList.add('active');

      const cleanup = () => {
        this.backdrop.classList.remove('active');
        this.btnConfirm.removeEventListener('click', onConfirm);
        this.backdrop.removeEventListener('click', onBackdropClick);
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      const onBackdropClick = (e) => {
        if (e.target === this.backdrop) {
          cleanup();
          resolve(true);
        }
      };

      this.btnConfirm.addEventListener('click', onConfirm);
      this.backdrop.addEventListener('click', onBackdropClick);
    });
  }
}

// Global Dialog Instance
window.scratchDialog = new ScratchDialogSystem();
