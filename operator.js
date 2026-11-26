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
  const btnRandomizeSeatsOp = document.getElementById('btnRandomizeSeatsOp');

  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');

  let isDraggingPin = false;

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
  const detectedTimeHint = document.getElementById('detectedTimeHint');
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

  function getNameInitials(fullName) {
    if (!fullName) return '';
    const clean = fullName.trim().replace(/[^a-zA-Z]/g, '');
    if (clean.length === 0) return '';
    return clean.slice(0, 2).toUpperCase();
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

      pin.textContent = getNameInitials(seat.participantName);

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

      // DRAG AND DROP SWAP
      pin.setAttribute('draggable', 'true');

      pin.addEventListener('dragstart', (e) => {
        isDraggingPin = true;
        pin.classList.add('is-dragging');
        e.dataTransfer.setData('text/plain', seat.id);
        e.dataTransfer.effectAllowed = 'move';
      });

      pin.addEventListener('dragend', () => {
        pin.classList.remove('is-dragging');
        document.querySelectorAll('.seat-pin').forEach(el => el.classList.remove('drag-hover'));
        setTimeout(() => { isDraggingPin = false; }, 80);
      });

      pin.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!pin.classList.contains('drag-hover')) {
          pin.classList.add('drag-hover');
        }
      });

      pin.addEventListener('dragleave', () => {
        pin.classList.remove('drag-hover');
      });

      pin.addEventListener('drop', (e) => {
        e.preventDefault();
        pin.classList.remove('drag-hover');
        const sourceSeatId = e.dataTransfer.getData('text/plain');
        if (sourceSeatId && sourceSeatId !== seat.id) {
          setTimeout(() => {
            const res = window.store.swapSeats(sourceSeatId, seat.id);
            if (res) {
              const nameA = res.seatA.participantName ? getShortName(res.seatA.participantName) : 'Kosong';
              const nameB = res.seatB.participantName ? getShortName(res.seatB.participantName) : 'Kosong';
              showToast(`🔄 ${nameA} ⇄ ${nameB} berhasil ditukar!`);
              highlightSwappedPins([res.seatA.id, res.seatB.id]);
            }
          }, 40);
        }
      });

      // TOUCH DRAG-AND-DROP SWAP FOR TABLETS / TOUCHSCREENS
      pin.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          window._touchStartSeatIdOp = seat.id;
        }
      }, { passive: true });

      pin.addEventListener('touchend', (e) => {
        if (!window._touchStartSeatIdOp || window._touchStartSeatIdOp === seat.id) {
          window._touchStartSeatIdOp = null;
          return;
        }
        const touch = e.changedTouches[0];
        const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetPin = targetEl ? targetEl.closest('.seat-pin') : null;
        if (targetPin) {
          const targetSeatId = targetPin.getAttribute('data-id');
          if (targetSeatId && targetSeatId !== window._touchStartSeatIdOp) {
            const src = window._touchStartSeatIdOp;
            setTimeout(() => {
              const res = window.store.swapSeats(src, targetSeatId);
              if (res) {
                const nameA = res.seatA.participantName ? getShortName(res.seatA.participantName) : 'Kosong';
                const nameB = res.seatB.participantName ? getShortName(res.seatB.participantName) : 'Kosong';
                showToast(`🔄 ${nameA} ⇄ ${nameB} berhasil ditukar!`);
                highlightSwappedPins([res.seatA.id, res.seatB.id]);
              }
            }, 40);
          }
        }
        window._touchStartSeatIdOp = null;
      });

      pin.addEventListener('click', () => {
        if (isDraggingPin) return;
        handleSeatClick(seat);
      });

      floorplanContainer.appendChild(pin);
    });
  }

  function handleSeatClick(seatOrId) {
    const seatId = typeof seatOrId === 'string' ? seatOrId : seatOrId.id;
    const seat = window.store.state.seats.find(s => s.id === seatId) || seatOrId;

    if (checkQuickTap && checkQuickTap.checked) {
      if (!seat.participantName) {
        openSeatModal(seat.id);
        return;
      }
      if (seat.status !== 'finished') {
        if (window.sfx && typeof window.sfx.playFinishFanfare === 'function') {
          try { window.sfx.playFinishFanfare(); } catch (e) {}
        }
        const updated = window.store.recordSeatFinish(seat.id);
        const finishTime = updated ? updated.finishTimeElapsed : '';
        showToast(`🏁 ${seat.participantName} SELESAI pada ${finishTime}!`);
        autoPushSeatToSpreadsheet(updated);
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

    modalSeatTitle.textContent = seat.participantName ? `Posisi: ${seat.participantName}` : 'Pilih Peserta Untuk Posisi Ini';

    const pool = state.participantsPool || [];
    const assignedIds = new Set(state.seats.filter(s => s.id !== seatId && s.participantId).map(s => s.participantId));

    selectParticipant.innerHTML = '<option value="">-- Pilih Peserta --</option>';
    pool.forEach(p => {
      const isTaken = assignedIds.has(p.id);
      const isSelected = p.id === seat.participantId;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.category} - ${p.school}) ${isTaken ? '⚠️ [Pindah dari Meja Lain]' : ''}`;
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
      if (detectedTimeHint) {
        detectedTimeHint.textContent = `(Waktu Terdeteksi: ${seat.finishTimeElapsed || '-'})`;
        detectedTimeHint.style.color = '#38bdf8';
      }
    } else if (seat.status === 'coding') {
      seatStatusBadge.className = 'status-badge-coding';
      seatStatusBadge.textContent = 'SEDANG CODING';
      btnRecordFinishNow.innerHTML = `🏁 SELESAI SEKARANG! (Waktu: ${formatTime(elapsedSec)})`;
      btnRecordFinishNow.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      inputCustomTime.value = '';
      inputCustomTime.placeholder = formatTime(elapsedSec);
      if (detectedTimeHint) {
        detectedTimeHint.textContent = `(Waktu Berjalan: ${formatTime(elapsedSec)})`;
        detectedTimeHint.style.color = '#94a3b8';
      }
    } else {
      seatStatusBadge.className = 'category-tag';
      seatStatusBadge.textContent = 'KOSONG';
      btnRecordFinishNow.innerHTML = `🏁 SELESAI SEKARANG! (Waktu: ${formatTime(elapsedSec)})`;
      inputCustomTime.value = '';
      inputCustomTime.placeholder = 'MM:SS';
      if (detectedTimeHint) {
        detectedTimeHint.textContent = `(Waktu Terdeteksi: -)`;
        detectedTimeHint.style.color = '#94a3b8';
      }
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
      const res = window.store.assignParticipantToSeat(activeSeatId, p);
      if (res && res.oldSeat) {
        showToast(`🪑 ${p.name} dipindahkan ke posisi ini (posisi lama otomatis dikosongkan).`);
        if (typeof highlightSwappedPins === 'function') {
          highlightSwappedPins([activeSeatId, res.oldSeat.id]);
        }
      }
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
        message: 'Silakan pilih nama peserta dari dropdown terlebih dahulu untuk posisi ini sebelum mencatat waktu selesai.',
        type: 'warning',
        icon: '🐱'
      });
      return;
    }

    if (window.sfx && typeof window.sfx.playFinishFanfare === 'function') {
      try { window.sfx.playFinishFanfare(); } catch (e) {}
    }
    const updated = window.store.recordSeatFinish(activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast(`🏁 ${updated.participantName} tercatat SELESAI: ${updated.finishTimeElapsed}!`);
    autoPushSeatToSpreadsheet(updated);
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
    autoPushSeatToSpreadsheet(updated);
  });

  // Reset Finish status back to coding
  btnResetFinish.addEventListener('click', () => {
    if (!activeSeatId) return;
    const seatBefore = window.store.state.seats.find(s => s.id === activeSeatId);
    window.store.resetSeatFinish(activeSeatId);
    const updated = window.store.state.seats.find(s => s.id === activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast('Status peserta dikembalikan ke Sedang Coding.');
    if (seatBefore && seatBefore.participantName) {
      autoPushSeatToSpreadsheet(seatBefore, 'clear');
    }
  });

  // Unassign Participant from Seat
  btnUnassignSeat.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const confirmed = await window.scratchDialog.confirm({
      title: 'Kosongkan Posisi Ini?',
      message: 'Peserta akan dihapus dari penugasan posisi ini. Apakah Anda yakin?',
      confirmText: 'Ya, Kosongkan',
      cancelText: 'Batal',
      type: 'warning',
      icon: '🗑'
    });

    if (confirmed) {
      const seatBefore = window.store.state.seats.find(s => s.id === activeSeatId);
      window.store.assignParticipantToSeat(activeSeatId, null);
      seatModal.classList.remove('open');
      showToast('Posisi peserta telah dikosongkan.');
      if (seatBefore && seatBefore.participantName) {
        autoPushSeatToSpreadsheet(seatBefore, 'clear');
      }
    }
  });

  btnCloseSeatModal.addEventListener('click', () => seatModal.classList.remove('open'));
  btnSaveSeat.addEventListener('click', () => seatModal.classList.remove('open'));
  seatModal.addEventListener('click', (e) => {
    if (e.target === seatModal) seatModal.classList.remove('open');
  });

  function highlightSwappedPins(seatIds) {
    setTimeout(() => {
      seatIds.forEach(id => {
        const pins = document.querySelectorAll(`.seat-pin[data-id="${id}"]`);
        pins.forEach(p => {
          p.classList.add('seat-pin-swapped');
          setTimeout(() => p.classList.remove('seat-pin-swapped'), 800);
        });
      });
    }, 60);
  }

  // Auto-sync single finished seat to Google Apps Script
  // DIPUTUSKAN SESUAI INSTRUKSI: Panitia mengisi nilai & waktu secara manual di Spreadsheet agar tidak error/bentrok
  async function autoPushSeatToSpreadsheet(seat, action = 'record') {
    return;
  }

  // --- TIMER TOOLBAR CONTROLS ---
  function renderTimerToolbar(state) {
    if (state.currentRound === 'FINAL') {
      document.body.classList.add('round-final');
    } else {
      document.body.classList.remove('round-final');
    }

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

  // Background auto-sync from Google Sheets on page load
  async function autoSyncSpreadsheetOperator() {
    const url = window.store.state.googleSheetUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const csvText = await response.text();
        const rawLines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (rawLines.length <= 1) return;

        let headerIdx = -1;
        let delimiter = ',';
        for (let i = 0; i < rawLines.length; i++) {
          const commas = (rawLines[i].match(/,/g) || []).length;
          const semicolons = (rawLines[i].match(/;/g) || []).length;
          let d = semicolons > commas ? ';' : ',';
          const parts = rawLines[i].split(d).map(p => p.trim().toLowerCase().replace(/^"|"$/g, ''));
          if (parts.some(p => p.includes('nama'))) {
            headerIdx = i;
            delimiter = d;
            break;
          }
        }
        if (headerIdx === -1) headerIdx = 0;

        const headers = rawLines[headerIdx].split(delimiter).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
        const nameIdx = headers.findIndex(h => h.includes('nama'));
        const catIdx = headers.findIndex(h => h.includes('kategori') || h.includes('category') || h.includes('tingkat'));
        const schoolIdx = headers.findIndex(h => h.includes('sekolah') || h.includes('school') || h.includes('asal'));
        const noIdx = headers.findIndex(h => h === 'no.' || h === 'no' || h.includes('nomor'));

        const participants = [];
        let counter = 0;
        for (let i = headerIdx + 1; i < rawLines.length; i++) {
          const cols = rawLines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length === 0 || cols.every(c => c === '')) continue;
          const name = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx] : '';
          if (!name || name.toLowerCase().includes('nama peserta') || name.toLowerCase().includes('peserta')) continue;
          counter++;
          const noVal = (noIdx !== -1 && cols[noIdx]) ? cols[noIdx] : String(counter);
          let school = (schoolIdx !== -1 && cols[schoolIdx]) ? cols[schoolIdx].trim() : 'Peserta Kualifikasi';
          let category = (catIdx !== -1 && cols[catIdx]) ? cols[catIdx].trim().toUpperCase() : '';
          const cleanName = name.trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
          if (!category) {
            category = /smp|mts|kelas\s*(7|8|9|vii|viii|ix)/i.test(school) ? 'SMP' : 'SD';
          } else {
            category = category.includes('SMP') ? 'SMP' : 'SD';
          }
          participants.push({
            id: `P${String(counter).padStart(2, '0')}`,
            no: noVal,
            name: cleanName,
            category: category,
            school: school
          });
        }
        if (participants.length > 0) {
          window.store.syncParticipants(participants);
        }
      }
    } catch (e) {
      console.warn('Operator auto-sync fallback:', e);
    }
  }
  autoSyncSpreadsheetOperator();

  // --- CLOUD SEATS SYNC & SHARE LINK BUTTONS ---
  const btnSyncSeatsCloudOp = document.getElementById('btnSyncSeatsCloudOp');
  const btnCopyShareSeatsLinkOp = document.getElementById('btnCopyShareSeatsLinkOp');

  if (btnSyncSeatsCloudOp) {
    btnSyncSeatsCloudOp.addEventListener('click', async () => {
      btnSyncSeatsCloudOp.disabled = true;
      btnSyncSeatsCloudOp.textContent = '⏳ Sinkron...';
      const updated = await window.store.pullSeatsFromCloud(true);
      renderSeatPins(window.store.state);
      btnSyncSeatsCloudOp.disabled = false;
      btnSyncSeatsCloudOp.textContent = '☁️ Sinkron Meja Cloud';
      if (updated) {
        showToast('✅ Posisi denah meja berhasil disinkronkan dari Cloud!');
      } else {
        showToast('ℹ️ Posisi denah sudah sesuai dengan versi Cloud terbaru.');
      }
    });
  }

  if (btnCopyShareSeatsLinkOp) {
    btnCopyShareSeatsLinkOp.addEventListener('click', async () => {
      const shareUrl = window.store.generateShareableSeatsUrl();
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('📋 Link posisi denah disalin! Buka link ini di TV panggung atau laptop lain.');
      } catch (e) {
        prompt('Salin link posisi denah ini:', shareUrl);
      }
    });
  }

  window.store.subscribe((state, source) => {
    if (source === 'ticker') {
      renderTimerToolbar(state);
    } else {
      renderSeatPins(state);
      renderTimerToolbar(state);
    }
  });
});
