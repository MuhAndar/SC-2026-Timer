/**
 * SPEED CODING UNIFIED APP
 * Supports:
 * 1. Dual View (Interactive Floorplan + Big Timer + Live Leaderboard in 1 Screen)
 * 2. TV Proyektor View (Pure Photo 1 Concept)
 * 3. Floorplan View (Pure Photo 2 Concept)
 * 4. Google Sheets CSV Sync & Local Realtime
 * 5. Scratch Custom Animated Popups (Zero Native Browser Alerts)
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentFilter = 'ALL';
  let activeSeatId = null;
  let lastUrgentBeepSecond = -1;

  // --- VIEW MODE ELEMENTS ---
  const btnModeDual = document.getElementById('btnModeDual');
  const btnModeTV = document.getElementById('btnModeTV');
  const btnModeFloor = document.getElementById('btnModeFloor');

  const viewDual = document.getElementById('viewDual');
  const viewTV = document.getElementById('viewTV');
  const viewFloor = document.getElementById('viewFloor');

  // Floor containers
  const floorContainerDual = document.getElementById('floorplanContainerDual');
  const floorContainerSolo = document.getElementById('floorplanContainerSolo');

  // Quick tap checkboxes
  const checkQuickTapDual = document.getElementById('checkQuickTapDual');
  const checkQuickTapSolo = document.getElementById('checkQuickTapSolo');

  // Round DOM Elements
  const headerEventTitle = document.getElementById('headerEventTitle');
  const headerEventSubtitle = document.getElementById('headerEventSubtitle');
  const headerRoundBadge = document.getElementById('headerRoundBadge');
  const headerRoundText = document.getElementById('headerRoundText');
  const btnGlobalCheer = document.getElementById('btnGlobalCheer');
  const selectRoundSetting = document.getElementById('selectRoundSetting');
  const btnAdvanceTop10 = document.getElementById('btnAdvanceTop10');
  const btnSyncFinalistsFromSheet = document.getElementById('btnSyncFinalistsFromSheet');
  const btnQuickSyncFinal = document.getElementById('btnQuickSyncFinal');

  const officeNameLabel = document.getElementById('officeNameLabel');
  const customSponsorImgDual = document.getElementById('customSponsorImgDual');
  const customLogoImgTV = document.getElementById('customLogoImgTV');
  const inputOfficeName = document.getElementById('inputOfficeName');

  // Dual View Timer DOM
  const timerDisplayDual = document.getElementById('timerDisplayDual');
  const timerStatusLabelDual = document.getElementById('timerStatusLabelDual');
  const timerDurationTextDual = document.getElementById('timerDurationTextDual');
  const elapsedDisplayDual = document.getElementById('elapsedDisplayDual');
  const timerProgressBarDual = document.getElementById('timerProgressBarDual');
  const timerPulseDotDual = document.getElementById('timerPulseDotDual');
  const btnStartDual = document.getElementById('btnStartDual');
  const btnPauseDual = document.getElementById('btnPauseDual');
  const btnResetDual = document.getElementById('btnResetDual');
  const leaderboardContainerDual = document.getElementById('leaderboardContainerDual');

  // TV View Timer DOM
  const timerDisplayTV = document.getElementById('timerDisplayTV');
  const timerStatusLabelTV = document.getElementById('timerStatusLabelTV');
  const timerDurationTextTV = document.getElementById('timerDurationTextTV');
  const elapsedDisplayTV = document.getElementById('elapsedDisplayTV');
  const timerProgressBarTV = document.getElementById('timerProgressBarTV');
  const timerPulseDotTV = document.getElementById('timerPulseDotTV');
  const btnStartTV = document.getElementById('btnStartTV');
  const btnPauseTV = document.getElementById('btnPauseTV');
  const btnResetTV = document.getElementById('btnResetTV');
  const leaderboardContainerTV = document.getElementById('leaderboardContainerTV');
  const statTotalSeatsTV = document.getElementById('statTotalSeatsTV');
  const statFinishedCountTV = document.getElementById('statFinishedCountTV');
  const statActiveCountTV = document.getElementById('statActiveCountTV');

  // Solo Floorplan Timer DOM
  const opTimerDisplaySolo = document.getElementById('opTimerDisplaySolo');
  const opElapsedDisplaySolo = document.getElementById('opElapsedDisplaySolo');
  const btnStartFloor = document.getElementById('btnStartFloor');
  const btnPauseFloor = document.getElementById('btnPauseFloor');
  const btnResetFloor = document.getElementById('btnResetFloor');

  // Nav Actions
  const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');

  // Seat Modal Elements
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

  // Settings Modal Elements
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const settingsModal = document.getElementById('settingsModal');
  const inputEventTitle = document.getElementById('inputEventTitle');
  const inputEventSubtitle = document.getElementById('inputEventSubtitle');
  const inputDurationMinutes = document.getElementById('inputDurationMinutes');
  const inputLogoUrl = document.getElementById('inputLogoUrl');
  const inputGoogleSheetUrl = document.getElementById('inputGoogleSheetUrl');
  const inputAppsScriptUrl = document.getElementById('inputAppsScriptUrl');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const btnSyncGoogleSheets = document.getElementById('btnSyncGoogleSheets');
  const btnSyncAllToSheets = document.getElementById('btnSyncAllToSheets');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnResetAllScores = document.getElementById('btnResetAllScores');
  const btnRandomizeSeatsDual = document.getElementById('btnRandomizeSeatsDual');

  let isDraggingPin = false;

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // --- 1. VIEW MODE SWITCHER ---
  function setViewMode(mode) {
    [btnModeDual, btnModeTV, btnModeFloor].forEach(b => b.classList.remove('active'));
    viewDual.style.display = 'none';
    viewTV.style.display = 'none';
    viewFloor.style.display = 'none';

    if (mode === 'dual') {
      btnModeDual.classList.add('active');
      viewDual.style.display = 'grid';
      renderFloorPins(floorContainerDual, window.store.state);
    } else if (mode === 'tv') {
      btnModeTV.classList.add('active');
      viewTV.style.display = 'grid';
    } else if (mode === 'floor') {
      btnModeFloor.classList.add('active');
      viewFloor.style.display = 'flex';
      renderFloorPins(floorContainerSolo, window.store.state);
    }
  }

  btnModeDual.addEventListener('click', () => setViewMode('dual'));
  btnModeTV.addEventListener('click', () => setViewMode('tv'));
  btnModeFloor.addEventListener('click', () => setViewMode('floor'));

  // Shorten name helper (e.g., "Arkananta Wijaya" -> "Arkananta W.")
  function getShortName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  }

  // 2-letter initials inside circle pin (e.g., "Raziq Khairi..." -> "RA")
  function getNameInitials(fullName) {
    if (!fullName || typeof fullName !== 'string') return '';
    const clean = fullName.trim().replace(/[^a-zA-Z]/g, '');
    if (!clean) return '';
    return clean.slice(0, 2).toUpperCase();
  }

  // --- 2. RENDER PINS ON FLOORPLAN ---
  function renderFloorPins(container, state) {
    if (!container) return;
    const existing = container.querySelectorAll('.seat-pin');
    existing.forEach(p => p.remove());

    const seats = state.seats || [];
    seats.forEach(seat => {
      const pin = document.createElement('div');
      const isPosBottom = seat.y > 84;
      pin.className = `seat-pin ${seat.status || 'empty'} ${isPosBottom ? 'pos-bottom' : ''}`;
      pin.style.left = `${seat.x}%`;
      pin.style.top = `${seat.y}%`;
      pin.setAttribute('data-id', seat.id);

      // 2-letter initials inside circular pin instead of table number
      pin.textContent = getNameInitials(seat.participantName);

      // Permanent compact name badge if assigned
      if (seat.participantName && seat.participantName.trim().length > 0) {
        const badge = document.createElement('div');
        badge.className = 'seat-pin-name-badge';

        const shortName = getShortName(seat.participantName);
        let badgeHTML = `<span class="seat-name-label">${shortName}</span>`;

        // If finished, show elapsed time only (no "sedang coding" text)
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
          // Defer store update slightly so dragend can finish cleanly before DOM re-render
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
          window._touchStartSeatId = seat.id;
        }
      }, { passive: true });

      pin.addEventListener('touchend', (e) => {
        if (!window._touchStartSeatId || window._touchStartSeatId === seat.id) {
          window._touchStartSeatId = null;
          return;
        }
        const touch = e.changedTouches[0];
        const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetPin = targetEl ? targetEl.closest('.seat-pin') : null;
        if (targetPin) {
          const targetSeatId = targetPin.getAttribute('data-id');
          if (targetSeatId && targetSeatId !== window._touchStartSeatId) {
            const src = window._touchStartSeatId;
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
        window._touchStartSeatId = null;
      });

      pin.addEventListener('click', () => {
        if (isDraggingPin) return;
        handleSeatClick(seat);
      });

      container.appendChild(pin);
    });
  }

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

  function handleSeatClick(seatOrId) {
    const seatId = typeof seatOrId === 'string' ? seatOrId : seatOrId.id;
    const seat = window.store.state.seats.find(s => s.id === seatId) || seatOrId;

    const isQuickTap = (checkQuickTapDual && checkQuickTapDual.checked) ||
      (checkQuickTapSolo && checkQuickTapSolo.checked);

    if (isQuickTap) {
      if (!seat.participantName) {
        openSeatModal(seat.id);
        return;
      }
      if (seat.status !== 'finished') {
        if (window.sfx && typeof window.sfx.playFinishFanfare === 'function') {
          try { window.sfx.playFinishFanfare(); } catch (e) { }
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

  // --- 3. MODAL ACTIONS WITH CUSTOM POPUPS ---
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
    const updated = window.store.state.seats.find(s => s.id === activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
  });

  btnRecordFinishNow.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const seat = window.store.state.seats.find(s => s.id === activeSeatId);
    if (!seat || !seat.participantName) {
      await window.scratchDialog.alert({
        title: 'Pilih Peserta Terlebih Dahulu',
        message: 'Silakan pilih nama peserta dari dropdown terlebih dahulu untuk posisi ini sebelum mencatat waktu selesai.',
        type: 'warning',
        icon: '🐱'
      });
      return;
    }

    if (window.sfx && typeof window.sfx.playFinishFanfare === 'function') {
      try { window.sfx.playFinishFanfare(); } catch (e) { }
    }
    const updated = window.store.recordSeatFinish(activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast(`🏁 ${updated.participantName} SELESAI: ${updated.finishTimeElapsed}!`);
    autoPushSeatToSpreadsheet(updated);
  });

  btnApplyCustomTime.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const timeVal = inputCustomTime.value.trim();
    const parts = timeVal.split(':');
    if (parts.length !== 2) {
      await window.scratchDialog.alert({
        title: 'Format Waktu Keliru',
        message: 'Format waktu harus berupa <strong>MM:SS</strong> (contoh: <code>08:30</code> untuk 8 menit 30 detik).',
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
    showToast(`Waktu selesai dikoreksi menjadi ${updated.finishTimeElapsed}`);
    autoPushSeatToSpreadsheet(updated);
  });

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

  // --- 4. RENDER TIMER & LEADERBOARD ---
  function renderAll(state, source) {
    renderBranding(state);
    renderTimerView(state);
    renderFloorPins(floorContainerDual, state);
    renderFloorPins(floorContainerSolo, state);
    renderLeaderboardView(state);
    renderStatsView(state);
  }

  function renderBranding(state) {
    const isQual = (state.currentRound || 'QUALIFICATION') === 'QUALIFICATION';

    if (isQual) {
      document.body.classList.remove('round-final');
    } else {
      document.body.classList.add('round-final');
    }

    if (headerEventTitle) headerEventTitle.textContent = state.eventTitle || 'SPEED CODING';
    if (headerEventSubtitle) {
      headerEventSubtitle.textContent = isQual ?
        'Babak Kualifikasi (30 Peserta -> 10 Lolos Final)' :
        'Babak Grand Final (10 Finalis -> Juara 1, 2, 3)';
    }

    if (headerRoundBadge && headerRoundText) {
      if (isQual) {
        headerRoundBadge.className = 'round-badge-pill qualification';
        headerRoundBadge.innerHTML = '<span>🟡</span> <span>BABAK KUALIFIKASI (TOP 10)</span>';
        if (btnQuickSyncFinal) btnQuickSyncFinal.style.display = 'none';
      } else {
        headerRoundBadge.className = 'round-badge-pill final';
        headerRoundBadge.innerHTML = '<span>👑</span> <span>BABAK GRAND FINAL (TOP 3)</span>';
        if (btnQuickSyncFinal) btnQuickSyncFinal.style.display = 'inline-flex';
      }
    }

    if (officeNameLabel) {
      officeNameLabel.textContent = state.officeName || 'Panitia Penyelenggara';
    }

    if (customSponsorImgDual) {
      if (state.logoUrl && state.logoUrl.trim()) {
        customSponsorImgDual.src = state.logoUrl.trim();
        customSponsorImgDual.style.display = 'block';
      } else {
        customSponsorImgDual.style.display = 'none';
      }
    }

    if (customLogoImgTV) {
      if (state.logoUrl && state.logoUrl.trim()) {
        customLogoImgTV.src = state.logoUrl.trim();
        customLogoImgTV.style.display = 'block';
      } else {
        customLogoImgTV.style.display = 'none';
      }
    }
  }

  function renderTimerView(state) {
    const timer = state.timer;
    const remaining = timer.remainingSeconds;
    const elapsed = timer.elapsedSeconds;
    const totalDuration = timer.durationMinutes * 60;
    const timeFormatted = formatTime(remaining);
    const elapsedFormatted = formatTime(elapsed);
    const durFormatted = `${timer.durationMinutes} Menit`;

    const pct = totalDuration > 0 ? Math.max(0, Math.min(100, (remaining / totalDuration) * 100)) : 0;

    if (timerDisplayDual) timerDisplayDual.textContent = timeFormatted;
    if (elapsedDisplayDual) elapsedDisplayDual.textContent = elapsedFormatted;
    if (timerDurationTextDual) timerDurationTextDual.textContent = durFormatted;
    if (timerProgressBarDual) timerProgressBarDual.style.width = `${pct}%`;

    if (timerDisplayTV) timerDisplayTV.textContent = timeFormatted;
    if (elapsedDisplayTV) elapsedDisplayTV.textContent = elapsedFormatted;
    if (timerDurationTextTV) timerDurationTextTV.textContent = durFormatted;
    if (timerProgressBarTV) timerProgressBarTV.style.width = `${pct}%`;

    if (opTimerDisplaySolo) opTimerDisplaySolo.textContent = timeFormatted;
    if (opElapsedDisplaySolo) opElapsedDisplaySolo.textContent = elapsedFormatted;

    const isRunning = timer.status === 'running';
    const isPaused = timer.status === 'paused';
    const isFinished = timer.status === 'finished';

    [btnStartDual, btnStartTV, btnStartFloor].forEach(b => {
      if (!b) return;
      b.style.display = isRunning ? 'none' : 'inline-flex';
      b.innerHTML = isPaused ? '▶ LANJUT' : '▶ MULAI';
    });

    [btnPauseDual, btnPauseTV, btnPauseFloor].forEach(b => {
      if (!b) return;
      b.style.display = isRunning ? 'inline-flex' : 'none';
    });

    const statusText = isRunning ? 'SISA WAKTU (BERJALAN)' : (isPaused ? 'TIMER DIJEDA' : (isFinished ? "WAKTU HABIS!" : 'SISA WAKTU'));
    const dotColor = isRunning ? 'var(--scratch-green)' : (isPaused ? '#f59e0b' : (isFinished ? 'var(--scratch-red)' : 'var(--scratch-orange)'));

    if (timerStatusLabelDual) timerStatusLabelDual.textContent = statusText;
    if (timerStatusLabelTV) timerStatusLabelTV.textContent = statusText;
    if (timerPulseDotDual) timerPulseDotDual.style.background = dotColor;
    if (timerPulseDotTV) timerPulseDotTV.style.background = dotColor;

    if (isRunning && remaining <= 180 && remaining > 0) {
      if (timerDisplayDual) timerDisplayDual.classList.add('urgent');
      if (timerDisplayTV) timerDisplayTV.classList.add('urgent');
      if (remaining <= 10 && remaining !== lastUrgentBeepSecond) {
        lastUrgentBeepSecond = remaining;
        window.sfx.playBeep(remaining <= 3 ? 880 : 600, 0.15);
      }
    } else {
      if (timerDisplayDual) timerDisplayDual.classList.remove('urgent');
      if (timerDisplayTV) timerDisplayTV.classList.remove('urgent');
    }

    if (activeSeatId && seatModal.classList.contains('open')) {
      const seat = state.seats.find(s => s.id === activeSeatId);
      if (seat && seat.status !== 'finished') {
        liveCurrentElapsed.textContent = elapsedFormatted;
      }
    }
  }

  function renderStatsView(state) {
    const seats = state.seats || [];
    const finishedSeats = seats.filter(s => s.status === 'finished');
    const activeSeats = seats.filter(s => s.status === 'coding');

    if (statTotalSeatsTV) statTotalSeatsTV.textContent = seats.length;
    if (statFinishedCountTV) statFinishedCountTV.textContent = finishedSeats.length;
    if (statActiveCountTV) statActiveCountTV.textContent = activeSeats.length;
  }

  function renderLeaderboardView(state) {
    const seats = state.seats || [];
    let list = seats.filter(s => s.participantName && s.participantName.trim().length > 0);

    // Sort: Finished first by fastest time, then coding
    list.sort((a, b) => {
      if (a.status === 'finished' && b.status === 'finished') {
        return (a.finishSeconds || 999999) - (b.finishSeconds || 999999);
      }
      if (a.status === 'finished' && b.status !== 'finished') return -1;
      if (a.status !== 'finished' && b.status === 'finished') return 1;
      return a.id.localeCompare(b.id);
    });

    const finishedCount = list.filter(s => s.status === 'finished').length;
    const countBadge = document.getElementById('scoreboardCountBadge');
    if (countBadge) {
      countBadge.textContent = `${list.length} Peserta (${finishedCount} Selesai)`;
    }

    const html = generateLeaderboardHTML(list);
    if (leaderboardContainerDual) leaderboardContainerDual.innerHTML = html;
    if (leaderboardContainerTV) leaderboardContainerTV.innerHTML = html;
  }

  function generateLeaderboardHTML(list) {
    if (list.length === 0) {
      const isFinal = (window.store.state.currentRound || 'QUALIFICATION') === 'FINAL';
      const emptyMsg = isFinal ?
        'Menunggu Pengumuman Finalis Resmi dari Dewan Juri<br><small style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">(Mengacu pada Sheet: "Rekapitulasi Final")</small>' :
        'Belum ada peserta terdaftar';
      return `
        <div class="empty-state-notice" style="grid-column: 1 / -1; padding: 36px 16px; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">⏳</div>
          <h4 style="color: #fff; font-size: 1.05rem; font-weight: 700; line-height: 1.5;">${emptyMsg}</h4>
        </div>
      `;
    }

    const isQual = (window.store.state.currentRound || 'QUALIFICATION') === 'QUALIFICATION';
    let html = '';

    list.forEach((item, index) => {
      const isFinished = item.status === 'finished';
      const rank = index + 1;
      const finishedClass = isFinished ? 'is-finished' : '';

      const timeContent = isFinished ?
        `<span class="compact-time-badge">${item.finishTimeElapsed || '00:00'}</span>` :
        `<span class="compact-coding-badge">CODING</span>`;

      const schoolText = item.school ? `<span class="compact-school">(${item.school})</span>` : '';

      html += `
        <div class="rank-row compact-row ${finishedClass}">
          <span class="compact-rank-num">#${rank}</span>
          <div class="compact-participant-name" title="${item.participantName} ${item.school ? '- ' + item.school : ''}">
            <span class="participant-name-text">${item.participantName}</span>
            <span class="category-pill ${item.category ? item.category.toLowerCase() : 'sd'}">${item.category || 'SD'}</span>
            ${schoolText}
          </div>
          ${timeContent}
        </div>
      `;
    });

    return html;
  }

  // --- 5. TIMER CONTROLS WITH CUSTOM SCRATCH POPUP ---
  const handleStart = () => {
    window.sfx.playStartHorn();
    window.store.startTimer();
  };

  const handlePause = () => {
    window.sfx.playPauseSound();
    window.store.pauseTimer();
  };

  const handleReset = async () => {
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
  };

  [btnStartDual, btnStartTV, btnStartFloor].forEach(b => b && b.addEventListener('click', handleStart));
  [btnPauseDual, btnPauseTV, btnPauseFloor].forEach(b => b && b.addEventListener('click', handlePause));
  [btnResetDual, btnResetTV, btnResetFloor].forEach(b => b && b.addEventListener('click', handleReset));

  // --- CHEER SELEBRASI BUTTON ---
  if (btnGlobalCheer) {
    btnGlobalCheer.addEventListener('click', () => {
      window.sfx.playCelebrationCheer();
      showToast('🎉 YAY! SELURUH PESERTA BERHASIL MENYELESAIKAN TANTANGAN!');
    });
  }

  // --- TRANSISI TOP 10 KE FINAL ---
  if (btnAdvanceTop10) {
    btnAdvanceTop10.addEventListener('click', async () => {
      const confirmed = await window.scratchDialog.confirm({
        title: 'Loloskan Top 10 ke Final?',
        message: 'Sistem akan secara otomatis mengambil <strong>10 peserta terbaik</strong> dari babak kualifikasi, menempatkannya ke 10 posisi Final, mengosongkan posisi lainnya, dan mengatur ronde ke <strong>Babak Final</strong>.<br><br>Lanjutkan?',
        confirmText: 'Ya, Masuk ke Babak Final! 🏆',
        cancelText: 'Batal',
        type: 'warning',
        icon: '👑'
      });

      if (confirmed) {
        window.store.advanceTop10ToFinal();
        settingsModal.classList.remove('open');
        showToast('🏆 Babak Final dimulai dengan 10 Finalis Terbaik!');
      }
    });
  }

  // --- TARIK FINALIS DARI SHEET "REKAPITULASI FINAL" ---
  async function fetchFinalistsFromSpreadsheet(isSilent = false) {
    const state = window.store.state;
    const appsScriptUrl = state.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbw1-xQQ_2jqLQ0PfDvaA6qWP__kxHt5_Di6Sd5Hy2RDbAUYJQSs3wjARtvJnV4bwXUA/exec';

    try {
      if (btnQuickSyncFinal) btnQuickSyncFinal.textContent = '⏳ Menarik...';

      let finalists = [];
      let sourceName = 'Rekapitulasi Final';
      let fetchedSuccess = false;

      // 1. CARA UTAMA: Lewat Google Apps Script Connector
      // Apps Script membuka langsung sheet "Rekapitulasi Final" secara real-time tanpa delay CDN cache
      if (appsScriptUrl && appsScriptUrl.includes('AKfycb')) {
        const fetchUrl = `${appsScriptUrl}${appsScriptUrl.includes('?') ? '&' : '?'}sheet=final&t=${Date.now()}`;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success') {
            fetchedSuccess = true;
            sourceName = json.sheet || 'Rekapitulasi Final';

            // Validasi Keamanan: Jika script masih mengembalikan sheet 'PESERTA', jangan masukkan 29 peserta ke final!
            if (sourceName.toUpperCase().indexOf('FINAL') === -1) {
              console.warn('Apps Script belum diperbarui untuk sheet Final. Sheet terbaca:', sourceName);
              if (!isSilent) {
                showToast(`⚠️ Sheet terbaca "${sourceName}". Mohon salin kode google_apps_script.js terbaru ke Apps Script lalu Deploy Versi Baru!`);
              }
              return;
            }

            if (Array.isArray(json.participants)) {
              json.participants.forEach((p, idx) => {
                if (p.name && p.name.trim().length >= 3) {
                  finalists.push({
                    id: `F${String(idx + 1).padStart(2, '0')}`,
                    name: p.name.trim(),
                    category: p.category || 'SD',
                    school: p.school || ''
                  });
                }
              });
            }
          }
        }
      }

      // 2. CARA CADANGAN: Jika ada GID khusus sheet Final yang dimasukkan di Google Sheet URL
      if (!fetchedSuccess && state.googleSheetFinalUrl) {
        const gidMatch = state.googleSheetFinalUrl.match(/[#&?]gid=([0-9]+)/);
        if (gidMatch && gidMatch[1] && gidMatch[1] !== '0') {
          const gid = gidMatch[1];
          const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTrV8pl3SH7VxXYS8pbg0HSUdUR_MdLMl7QSxa0n1pOHwy_uBr6o2E35P38haRn-iJVL2BKceEPRHyI/pub?output=csv&gid=${gid}&t=${Date.now()}`;
          const res = await fetch(csvUrl, { cache: 'no-cache' });
          if (res.ok) {
            const text = await res.text();
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            let headerIdx = -1;
            let nameCol = -1;
            let schoolCol = -1;
            for (let i = 0; i < Math.min(10, lines.length); i++) {
              const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, '').toLowerCase());
              for (let c = 0; c < parts.length; c++) {
                if (parts[c].includes('nama')) nameCol = c;
                if (parts[c].includes('sekolah') || parts[c].includes('kelas')) schoolCol = c;
              }
              if (nameCol !== -1) {
                headerIdx = i;
                break;
              }
            }
            if (headerIdx !== -1 && nameCol !== -1) {
              for (let i = headerIdx + 1; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
                const name = parts[nameCol];
                if (name && name.toLowerCase() !== 'nama peserta' && name.replace(/[^a-zA-Z]/g, '').length >= 3) {
                  const rawSchool = schoolCol !== -1 ? (parts[schoolCol] || '') : '';
                  const cat = rawSchool.toLowerCase().includes('smp') ? 'SMP' : (rawSchool.toLowerCase().includes('sd') ? 'SD' : 'SD');
                  finalists.push({
                    id: `F${String(finalists.length + 1).padStart(2, '0')}`,
                    name: name,
                    category: cat,
                    school: rawSchool
                  });
                }
              }
              fetchedSuccess = true;
            }
          }
        }
      }

      if (fetchedSuccess) {
        if (finalists.length > 0) {
          window.store.loadFinalists(finalists);
          if (!isSilent) showToast(`🏆 Berhasil memuat ${finalists.length} Finalis dari "${sourceName}"!`);
        } else {
          window.store.loadFinalists([]);
          if (!isSilent) showToast(`ℹ️ Sheet "${sourceName}" masih kosong. Denah dikosongkan menunggu input juri.`);
        }
      } else {
        if (!isSilent) {
          showToast('⚠️ Gagal memuat sheet Final. Pastikan Apps Script telah di-deploy dengan versi terbaru.');
        }
      }
    } catch (err) {
      console.warn('Error fetching Rekapitulasi Final:', err);
      if (!isSilent) showToast('Gagal memuat Rekapitulasi Final. Periksa koneksi.');
    } finally {
      if (btnQuickSyncFinal) btnQuickSyncFinal.textContent = '🔄 Tarik Finalis';
    }
  }

  if (btnSyncFinalistsFromSheet) {
    btnSyncFinalistsFromSheet.addEventListener('click', () => {
      fetchFinalistsFromSpreadsheet(false);
      settingsModal.classList.remove('open');
    });
  }

  if (btnQuickSyncFinal) {
    btnQuickSyncFinal.addEventListener('click', () => {
      fetchFinalistsFromSpreadsheet(false);
    });
  }

  if (headerRoundBadge) {
    headerRoundBadge.style.cursor = 'pointer';
    headerRoundBadge.addEventListener('click', () => {
      const current = window.store.state.currentRound || 'QUALIFICATION';
      const nextRound = current === 'QUALIFICATION' ? 'FINAL' : 'QUALIFICATION';
      window.store.setRound(nextRound);
      showToast(`🔄 Beralih ke ${nextRound === 'FINAL' ? 'Babak Grand Final' : 'Babak Kualifikasi'}`);
      if (nextRound === 'FINAL') {
        fetchFinalistsFromSpreadsheet(false);
      }
    });
  }

  // Background gentle auto-check every 25s when in Final Mode and timer is NOT running
  setInterval(() => {
    const state = window.store.state;
    if (state.currentRound === 'FINAL' && (!state.timer || state.timer.status !== 'running')) {
      fetchFinalistsFromSpreadsheet(true);
    }
  }, 25000);

  // --- 6. FULLSCREEN & SOUND ---
  document.addEventListener('fullscreenchange', () => {
    const isFull = !!document.fullscreenElement;
    document.body.classList.toggle('fullscreen-tv', isFull);
    btnToggleFullscreen.textContent = isFull ? '❌ Exit Fullscreen' : '⛶ Fullscreen';
  });

  btnToggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        document.body.classList.add('fullscreen-tv');
        btnToggleFullscreen.textContent = '❌ Exit Fullscreen';
      }).catch(() => {
        // Fallback if browser security denies requestFullscreen without click
        document.body.classList.toggle('fullscreen-tv');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          document.body.classList.remove('fullscreen-tv');
          btnToggleFullscreen.textContent = '⛶ Fullscreen';
        }).catch(() => { });
      }
    }
  });

  btnToggleSound.addEventListener('click', () => {
    window.sfx.enabled = !window.sfx.enabled;
    soundIcon.textContent = window.sfx.enabled ? '🔊' : '🔇';
    soundLabel.textContent = window.sfx.enabled ? 'Suara Aktif' : 'Suara Mati';
    if (window.sfx.enabled) window.sfx.playBeep(880, 0.1);
    window.store.updateSettings({ sfxEnabled: window.sfx.enabled });
  });

  // --- 7. SETTINGS MODAL ---
  btnOpenSettings.addEventListener('click', () => {
    const s = window.store.state;
    inputEventTitle.value = s.eventTitle || '';
    inputEventSubtitle.value = s.eventSubtitle || '';
    if (inputOfficeName) inputOfficeName.value = s.officeName || 'Panitia Penyelenggara';
    inputDurationMinutes.value = s.timer.durationMinutes || 60;
    inputLogoUrl.value = s.logoUrl || '';
    inputGoogleSheetUrl.value = s.googleSheetUrl || '';
    if (inputAppsScriptUrl) inputAppsScriptUrl.value = s.appsScriptUrl || '';
    if (selectRoundSetting) {
      selectRoundSetting.value = s.currentRound || 'QUALIFICATION';
    }
    settingsModal.classList.add('open');
  });

  btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('open'));
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('open');
  });
  seatModal.addEventListener('click', (e) => {
    if (e.target === seatModal) seatModal.classList.remove('open');
  });

  btnSaveSettings.addEventListener('click', () => {
    const newDur = parseInt(inputDurationMinutes.value) || 60;
    window.store.setTimerDuration(newDur);
    if (selectRoundSetting) {
      window.store.setRound(selectRoundSetting.value);
    }
    window.store.updateSettings({
      eventTitle: inputEventTitle.value.trim(),
      eventSubtitle: inputEventSubtitle.value.trim(),
      officeName: inputOfficeName ? inputOfficeName.value.trim() : 'Panitia Penyelenggara',
      logoUrl: inputLogoUrl.value.trim(),
      googleSheetUrl: inputGoogleSheetUrl.value.trim(),
      appsScriptUrl: inputAppsScriptUrl ? inputAppsScriptUrl.value.trim() : ''
    });
    settingsModal.classList.remove('open');
    showToast('Pengaturan berhasil disimpan!');
  });

  // Randomize Seats Button (Dual View)
  if (btnRandomizeSeatsDual) {
    btnRandomizeSeatsDual.addEventListener('click', async () => {
      const confirmed = await window.scratchDialog.confirm({
        title: 'Acak Posisi Peserta?',
        message: 'Apakah Anda ingin mengacak penempatan peserta ke seluruh posisi?',
        confirmText: '🎲 Ya, Acak Posisi',
        cancelText: 'Batal',
        type: 'warning',
        icon: '🎲'
      });
      if (confirmed) {
        window.store.randomizeSeats();
        showToast('🎲 Posisi peserta berhasil diacak!');
      }
    });
  }

  // Auto-sync single finished seat or deletion/reset to Google Apps Script
  // DIPUTUSKAN SESUAI INSTRUKSI: Panitia mengisi nilai & waktu secara manual di Spreadsheet agar tidak error/bentrok
  async function autoPushSeatToSpreadsheet(seat, action = 'record') {
    return;
  }

  // Push all finished seats to Apps Script (Disabled to protect manual spreadsheet entry)
  if (btnSyncAllToSheets) {
    btnSyncAllToSheets.addEventListener('click', async () => {
      await window.scratchDialog.alert({
        title: 'Input Manual Sedang Berjalan',
        message: 'Pengiriman ke Google Spreadsheet dinonaktifkan sesuai instruksi panitia. Seluruh nilai dan waktu selesai diisi secara manual langsung di Spreadsheet agar tidak terjadi bentrok/error.',
        type: 'info',
        icon: 'ℹ️'
      });
    });
  }

  btnResetAllScores.addEventListener('click', async () => {
    const confirmed = await window.scratchDialog.confirm({
      title: 'Reset Semua Nilai & Waktu?',
      message: '<strong>PERINGATAN:</strong> Tindakan ini akan mereset seluruh waktu selesai semua peserta dan mengembalikan status mereka ke Sedang Coding.<br><br>Apakah Anda yakin?',
      confirmText: 'Ya, Reset Semua',
      cancelText: 'Batal',
      type: 'danger',
      icon: '🛑'
    });

    if (confirmed) {
      window.store.resetAllScores();
      settingsModal.classList.remove('open');
      showToast('Seluruh waktu peserta telah direset.');
    }
  });

  // --- 8. GOOGLE SHEETS & LOCAL CSV SYNC / EXPORT ---
  function parseAndLoadCSVData(csvText) {
    const rawLines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length <= 1) throw new Error('File spreadsheet kosong atau hanya ada baris header.');

    // Find the true table header row (row containing 'nama' with other columns)
    let headerIdx = -1;
    let delimiter = ',';

    for (let i = 0; i < rawLines.length; i++) {
      const commas = (rawLines[i].match(/,/g) || []).length;
      const semicolons = (rawLines[i].match(/;/g) || []).length;
      const tabs = (rawLines[i].match(/\t/g) || []).length;
      let d = ',';
      if (semicolons > commas && semicolons > tabs) d = ';';
      else if (tabs > commas && tabs > semicolons) d = '\t';

      const parts = rawLines[i].split(d).map(p => p.trim().toLowerCase().replace(/^"|"$/g, ''));
      const hasName = parts.some(p => p.includes('nama'));
      const hasOther = parts.some(p => p === 'no.' || p === 'no' || p.includes('peserta') || p.includes('kecepatan') || p.includes('kategori') || p.includes('sekolah'));

      if (hasName && (hasOther || parts.filter(p => p.length > 0).length >= 2)) {
        headerIdx = i;
        delimiter = d;
        break;
      }
    }

    if (headerIdx === -1) {
      headerIdx = rawLines.findIndex(l => l.toLowerCase().includes('nama'));
      if (headerIdx === -1) headerIdx = 0;
    }

    const headerLine = rawLines[headerIdx];
    const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

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
      if (!name || name.trim().length === 0) continue;
      if (name.toLowerCase().includes('nama peserta') || name.toLowerCase().includes('peserta')) continue;

      counter++;
      const noVal = (noIdx !== -1 && cols[noIdx]) ? cols[noIdx] : String(counter);
      let school = (schoolIdx !== -1 && cols[schoolIdx]) ? cols[schoolIdx].trim() : 'Peserta Kualifikasi';
      let category = (catIdx !== -1 && cols[catIdx]) ? cols[catIdx].trim().toUpperCase() : '';

      // Format name nicely (Title Case)
      const cleanName = name.trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

      // If category not specified in a dedicated column, detect from school / class name
      if (!category) {
        if (/smp|mts|kelas\s*(7|8|9|vii|viii|ix)/i.test(school)) {
          category = 'SMP';
        } else {
          category = 'SD';
        }
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

    if (participants.length === 0) throw new Error('Tidak ada data peserta yang terbaca dari spreadsheet.');
    window.store.syncParticipants(participants);
    return participants.length;
  }

  btnSyncGoogleSheets.addEventListener('click', async () => {
    const url = inputGoogleSheetUrl.value.trim();
    if (!url) {
      await window.scratchDialog.alert({
        title: 'URL Spreadsheet Belum Diisi',
        message: 'Silakan masukkan tautan publik Google Sheet CSV terlebih dahulu pada kolom pengaturan.',
        type: 'info',
        icon: '📋'
      });
      return;
    }

    try {
      btnSyncGoogleSheets.disabled = true;
      btnSyncGoogleSheets.textContent = '⏳ Mengambil Data...';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets. Pastikan sheet di-publish ke Web sebagai CSV.');
      const csvText = await response.text();
      const count = parseAndLoadCSVData(csvText);

      settingsModal.classList.remove('open');

      await window.scratchDialog.alert({
        title: 'Sinkronisasi Berhasil!',
        message: `Berhasil mengimpor <strong>${count} peserta</strong> dari Spreadsheet ke dalam sistem perlombaan!`,
        type: 'success',
        icon: '🎉'
      });
    } catch (err) {
      await window.scratchDialog.alert({
        title: 'Gagal Sinkronisasi',
        message: `Terjadi kendala saat membaca Spreadsheet:<br><span style="color:#ef4444">${err.message}</span>`,
        type: 'danger',
        icon: '⚠️'
      });
    } finally {
      btnSyncGoogleSheets.disabled = false;
      btnSyncGoogleSheets.textContent = '📥 Tarik Google Sheet';
    }
  });

  const btnImportLocalCSV = document.getElementById('btnImportLocalCSV');
  const inputFileCSV = document.getElementById('inputFileCSV');

  if (btnImportLocalCSV && inputFileCSV) {
    btnImportLocalCSV.addEventListener('click', () => inputFileCSV.click());
    inputFileCSV.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const csvText = evt.target.result;
          const count = parseAndLoadCSVData(csvText);
          settingsModal.classList.remove('open');
          await window.scratchDialog.alert({
            title: 'Impor File Berhasil!',
            message: `Berhasil mengimpor <strong>${count} peserta</strong> dari file <code>${file.name}</code>!`,
            type: 'success',
            icon: '🎉'
          });
        } catch (err) {
          await window.scratchDialog.alert({
            title: 'Gagal Membaca File',
            message: `Terjadi kendala saat membaca file:<br><span style="color:#ef4444">${err.message}</span>`,
            type: 'danger',
            icon: '⚠️'
          });
        } finally {
          inputFileCSV.value = '';
        }
      };
      reader.onerror = () => {
        window.scratchDialog.alert({
          title: 'Gagal Membuka File',
          message: 'Browser tidak dapat membuka file tersebut.',
          type: 'danger',
          icon: '⚠️'
        });
      };
      reader.readAsText(file);
    });
  }

  btnExportCSV.addEventListener('click', () => {
    const seats = window.store.state.seats || [];
    let csv = 'Rank,Nama Peserta,Kategori,Sekolah,Status,Waktu Selesai (Elapsed),Waktu Jam Selesai\n';

    const finished = seats.filter(s => s.status === 'finished').sort((a, b) => (a.finishSeconds || 0) - (b.finishSeconds || 0));
    const coding = seats.filter(s => s.status === 'coding');
    const combined = [...finished, ...coding];

    combined.forEach((s, idx) => {
      const rank = s.status === 'finished' ? idx + 1 : '-';
      csv += `"${rank}","${s.participantName || '-'}","${s.category || '-'}","${s.school || '-'}","${s.status}","${s.finishTimeElapsed || '-'}","${s.finishTimestamp || '-'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_speed_coding_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File rekap CSV berhasil diunduh!');
  });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = 'linear-gradient(135deg, var(--scratch-orange), #ea580c)';
    toast.style.color = '#fff';
    toast.style.fontWeight = '700';
    toast.style.padding = '12px 22px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.9rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.innerHTML = `<span>🐱</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // --- CLOUD SEATS SYNC & SHARE LINK BUTTONS ---
  const btnSyncSeatsCloud = document.getElementById('btnSyncSeatsCloud');
  const btnCopyShareSeatsLink = document.getElementById('btnCopyShareSeatsLink');

  if (btnSyncSeatsCloud) {
    btnSyncSeatsCloud.addEventListener('click', async () => {
      btnSyncSeatsCloud.disabled = true;
      btnSyncSeatsCloud.textContent = '⏳ Sinkron...';
      const updated = await window.store.pullSeatsFromCloud(true);
      renderAll(window.store.state);
      btnSyncSeatsCloud.disabled = false;
      btnSyncSeatsCloud.textContent = '☁️ Sinkron Meja';
      if (updated) {
        showToast('✅ Posisi denah meja berhasil disinkronkan dari Cloud!');
      } else {
        showToast('ℹ️ Posisi denah sudah sesuai dengan versi Cloud terbaru.');
      }
    });
  }

  if (btnCopyShareSeatsLink) {
    btnCopyShareSeatsLink.addEventListener('click', async () => {
      const shareUrl = window.store.generateShareableSeatsUrl();
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('📋 Link posisi denah berhasil disalin! Buka link ini di TV panggung / komputer lain.');
      } catch (e) {
        prompt('Salin link posisi denah ini:', shareUrl);
      }
    });
  }

  // --- INIT ---
  setViewMode('dual');
  renderAll(window.store.state, 'init');

  // Automatic background pull from Google Sheets on page load
  async function autoSyncFromSpreadsheetOnStartup() {
    const url = window.store.state.googleSheetUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        parseAndLoadCSVData(text);
      }
    } catch (e) {
      console.warn('Auto-sync fallback to local initial participants:', e);
    }
  }
  autoSyncFromSpreadsheetOnStartup();

  // CRITICAL FLICKER-FREE SUBSCRIPTION:
  // When source is 'ticker', ONLY update timer numbers without re-creating floor pins or leaderboard rows!
  window.store.subscribe((state, source) => {
    if (source === 'ticker') {
      renderTimerView(state);
    } else {
      renderAll(state, source);
    }
  });
});
