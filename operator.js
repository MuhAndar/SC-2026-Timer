/**
 * SPEED CODING OPERATOR & FLOORPLAN CONTROLLER
 * Renders interactive pins directly on top of the floorplan image
 * Handles participant assignment, one-tap finish timing & real-time sync
 * Custom Scratch Popup Dialogs
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeSeatId = null;

  // DOM Elements
  const floorplanContainer = document.getElementById('floorplanContainer');
  const opTimerDisplay = document.getElementById('opTimerDisplay');
  const opElapsedDisplay = document.getElementById('opElapsedDisplay');
  const btnOpStart = document.getElementById('btnOpStart');
  const btnOpPause = document.getElementById('btnOpPause');
  const btnOpReset = document.getElementById('btnOpReset');
  const checkQuickTap = document.getElementById('checkQuickTap');

  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');

  // Modal Elements
  const seatModal = document.getElementById('seatModal');
  const btnCloseSeatModal = document.getElementById('btnCloseSeatModal');
  const modalSeatTitle = document.getElementById('modalSeatTitle');
  const selectParticipant = document.getElementById('selectParticipant');
  const inputSeatCategory = document.getElementById('inputSeatCategory');
  const inputSeatSchool = document.getElementById('inputSeatSchool');
  const seatStatusBadge = document.getElementById('seatStatusBadge');
  const liveCurrentElapsed = document.getElementById('liveCurrentElapsed');
  const btnRecordFinishNow = document.getElementById('btnRecordFinishNow');
  const inputCustomTime = document.getElementById('inputCustomTime');
  const btnApplyCustomTime = document.getElementById('btnApplyCustomTime');
  const btnResetFinish = document.getElementById('btnResetFinish');
  const btnUnassignSeat = document.getElementById('btnUnassignSeat');
  const btnSaveSeat = document.getElementById('btnSaveSeat');

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Shorten name helper
  function getShortName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  }

  // --- RENDER SEAT PINS ON FLOORPLAN ---
  function renderSeatPins(state) {
    const existingPins = floorplanContainer.querySelectorAll('.seat-pin');
    existingPins.forEach(p => p.remove());

    const seats = state.seats || [];
    seats.forEach(seat => {
      const pin = document.createElement('div');
      const isPosBottom = seat.y > 84;
      pin.className = `seat-pin ${seat.status || 'empty'} ${isPosBottom ? 'pos-bottom' : ''}`;
      pin.style.left = `${seat.x}%`;
      pin.style.top = `${seat.y}%`;
      pin.setAttribute('data-id', seat.id);

      const seatNum = seat.id.replace('S', '');
      pin.textContent = seatNum;

      // Permanent compact name badge without hovering
      if (seat.participantName && seat.participantName.trim().length > 0) {
        const badge = document.createElement('div');
        badge.className = 'seat-pin-name-badge';

        const shortName = getShortName(seat.participantName);
        let badgeHTML = `<span class="seat-name-label">${shortName}</span>`;

        if (seat.status === 'finished' && seat.finishTimeElapsed) {
          badgeHTML += `<span class="seat-time-label">${seat.finishTimeElapsed}</span>`;
        }

        badge.innerHTML = badgeHTML;
        pin.appendChild(badge);
      }

      pin.addEventListener('click', () => {
        handleSeatClick(seat);
      });

      floorplanContainer.appendChild(pin);
    });
  }

  function handleSeatClick(seat) {
    if (checkQuickTap.checked) {
      if (!seat.participantName) {
        openSeatModal(seat.id);
        return;
      }
      if (seat.status !== 'finished') {
        window.sfx.playFinishFanfare();
        const updated = window.store.recordSeatFinish(seat.id);
        showToast(`🏁 ${seat.label} (${seat.participantName}) SELESAI pada ${updated.finishTimeElapsed}!`);
      } else {
        openSeatModal(seat.id);
      }
      return;
    }

    openSeatModal(seat.id);
  }

  function openSeatModal(seatId) {
    activeSeatId = seatId;
    const state = window.store.state;
    const seat = state.seats.find(s => s.id === seatId);
    if (!seat) return;

    modalSeatTitle.textContent = `${seat.label || seat.id} - ${seat.participantName || 'Belum Ada Peserta'}`;

    const pool = state.participantsPool || [];
    const assignedIds = new Set(state.seats.filter(s => s.id !== seatId && s.participantId).map(s => s.participantId));

    selectParticipant.innerHTML = '<option value="">-- Pilih Peserta --</option>';
    pool.forEach(p => {
      const isTaken = assignedIds.has(p.id);
      const isSelected = p.id === seat.participantId;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.category} - ${p.school}) ${isTaken ? '⚠️ [Meja Lain]' : ''}`;
      if (isSelected) opt.selected = true;
      selectParticipant.appendChild(opt);
    });

    inputSeatCategory.value = seat.category || '';
    inputSeatSchool.value = seat.school || '';

    updateModalStatusView(seat, state.timer.elapsedSeconds);
    seatModal.classList.add('open');
  }

  function updateModalStatusView(seat, elapsedSec) {
    liveCurrentElapsed.textContent = formatTime(elapsedSec);

    if (seat.status === 'finished') {
      seatStatusBadge.className = 'category-tag sd';
      seatStatusBadge.textContent = `SELESAI (Waktu: ${seat.finishTimeElapsed})`;
      btnRecordFinishNow.innerHTML = `✅ TELAH SELESAI (${seat.finishTimeElapsed})`;
      btnRecordFinishNow.style.background = '#059669';
      inputCustomTime.value = seat.finishTimeElapsed || '';
    } else if (seat.status === 'coding') {
      seatStatusBadge.className = 'status-badge-coding';
      seatStatusBadge.textContent = 'SEDANG CODING';
      btnRecordFinishNow.innerHTML = `🏁 SELESAI SEKARANG! (Waktu: ${formatTime(elapsedSec)})`;
      btnRecordFinishNow.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      inputCustomTime.value = '';
    } else {
      seatStatusBadge.className = 'category-tag';
      seatStatusBadge.textContent = 'KOSONG';
      btnRecordFinishNow.innerHTML = `🏁 SELESAI SEKARANG! (Waktu: ${formatTime(elapsedSec)})`;
      inputCustomTime.value = '';
    }
  }

  // Dropdown selection change
  selectParticipant.addEventListener('change', () => {
    const selectedId = selectParticipant.value;
    const pool = window.store.state.participantsPool || [];
    const p = pool.find(item => item.id === selectedId);

    if (p) {
      inputSeatCategory.value = p.category;
      inputSeatSchool.value = p.school;
      window.store.assignParticipantToSeat(activeSeatId, p);
    } else {
      inputSeatCategory.value = '';
      inputSeatSchool.value = '';
      window.store.assignParticipantToSeat(activeSeatId, null);
    }
    const updatedSeat = window.store.state.seats.find(s => s.id === activeSeatId);
    updateModalStatusView(updatedSeat, window.store.state.timer.elapsedSeconds);
  });

  // Finish Now Button
  btnRecordFinishNow.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const seat = window.store.state.seats.find(s => s.id === activeSeatId);
    if (!seat || !seat.participantName) {
      await window.scratchDialog.alert({
        title: 'Pilih Peserta Dulu!',
        message: 'Silakan pilih nama peserta dari dropdown terlebih dahulu untuk meja ini sebelum mencatat waktu selesai.',
        type: 'warning',
        icon: '🐱'
      });
      return;
    }

    window.sfx.playFinishFanfare();
    const updated = window.store.recordSeatFinish(activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast(`🏁 ${updated.label} (${updated.participantName}) tercatat SELESAI: ${updated.finishTimeElapsed}!`);
  });

  // Manual custom time override
  btnApplyCustomTime.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const timeVal = inputCustomTime.value.trim();
    const parts = timeVal.split(':');
    if (parts.length !== 2) {
      await window.scratchDialog.alert({
        title: 'Format Waktu Keliru',
        message: 'Format waktu harus berupa <strong>MM:SS</strong> (contoh: <code>08:30</code>)!',
        type: 'warning',
        icon: '⏱️'
      });
      return;
    }
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return;

    const totalSecs = (mins * 60) + secs;
    const updated = window.store.recordSeatFinish(activeSeatId, totalSecs);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast(`Waktu selesai diubah menjadi ${updated.finishTimeElapsed}`);
  });

  // Reset Finish status back to coding
  btnResetFinish.addEventListener('click', () => {
    if (!activeSeatId) return;
    window.store.resetSeatFinish(activeSeatId);
    const updated = window.store.state.seats.find(s => s.id === activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast('Status peserta dikembalikan ke Sedang Coding.');
  });

  // Unassign Participant from Seat
  btnUnassignSeat.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const confirmed = await window.scratchDialog.confirm({
      title: 'Kosongkan Meja Ini?',
      message: 'Peserta akan dihapus dari penugasan meja ini. Apakah Anda yakin?',
      confirmText: 'Ya, Kosongkan',
      cancelText: 'Batal',
      type: 'warning',
      icon: '🗑'
    });

    if (confirmed) {
      window.store.assignParticipantToSeat(activeSeatId, null);
      seatModal.classList.remove('open');
      showToast('Meja telah dikosongkan.');
    }
  });

  btnCloseSeatModal.addEventListener('click', () => seatModal.classList.remove('open'));
  btnSaveSeat.addEventListener('click', () => seatModal.classList.remove('open'));

  // --- TIMER TOOLBAR CONTROLS ---
  function renderTimerToolbar(state) {
    const timer = state.timer;
    opTimerDisplay.textContent = formatTime(timer.remainingSeconds);
    opElapsedDisplay.textContent = formatTime(timer.elapsedSeconds);

    if (timer.status === 'running') {
      btnOpStart.style.display = 'none';
      btnOpPause.style.display = 'inline-flex';
    } else {
      btnOpStart.style.display = 'inline-flex';
      btnOpStart.textContent = timer.status === 'paused' ? '▶ Lanjutkan' : '▶ Start';
      btnOpPause.style.display = 'none';
    }

    if (activeSeatId && seatModal.classList.contains('open')) {
      const seat = state.seats.find(s => s.id === activeSeatId);
      if (seat && seat.status !== 'finished') {
        liveCurrentElapsed.textContent = formatTime(timer.elapsedSeconds);
      }
    }
  }

  btnOpStart.addEventListener('click', () => {
    window.sfx.playStartHorn();
    window.store.startTimer();
  });

  btnOpPause.addEventListener('click', () => {
    window.sfx.playPauseSound();
    window.store.pauseTimer();
  });

  btnOpReset.addEventListener('click', async () => {
    const confirmed = await window.scratchDialog.confirm({
      title: 'Reset Timer Lomba?',
      message: 'Apakah Anda yakin ingin mereset timer lomba kembali ke awal?<br>Waktu yang sedang berjalan akan dihentikan.',
      confirmText: 'Ya, Reset Timer',
      cancelText: 'Batal',
      type: 'warning',
      icon: '🔄'
    });

    if (confirmed) {
      window.store.resetTimer();
      showToast('Timer telah direset ke awal.');
    }
  });

  btnToggleSound.addEventListener('click', () => {
    window.sfx.enabled = !window.sfx.enabled;
    soundIcon.textContent = window.sfx.enabled ? '🔊' : '🔇';
    window.store.updateSettings({ sfxEnabled: window.sfx.enabled });
  });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'linear-gradient(135deg, var(--scratch-orange), #ea580c)';
    toast.style.color = '#fff';
    toast.style.fontWeight = '700';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
    toast.style.zIndex = '999';
    toast.style.fontSize = '0.9rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.innerHTML = `<span>🐱</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // --- STORE SUBSCRIPTION ---
  renderSeatPins(window.store.state);
  renderTimerToolbar(window.store.state);

  window.store.subscribe((state, source) => {
    if (source === 'ticker') {
      renderTimerToolbar(state);
    } else {
      renderSeatPins(state);
      renderTimerToolbar(state);
    }
  });
});
