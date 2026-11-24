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
  const headerRoundBadge = document.getElementById('headerRoundBadge');
  const headerRoundText = document.getElementById('headerRoundText');
  const btnGlobalCheer = document.getElementById('btnGlobalCheer');
  const selectRoundSetting = document.getElementById('selectRoundSetting');
  const btnAdvanceTop10 = document.getElementById('btnAdvanceTop10');

  const officeNameLabel = document.getElementById('officeNameLabel');
  const customSponsorImgDual = document.getElementById('customSponsorImgDual');
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
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const btnSyncGoogleSheets = document.getElementById('btnSyncGoogleSheets');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnResetAllScores = document.getElementById('btnResetAllScores');

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

      // Seat number inside circular pin
      pin.textContent = seat.id.replace('S', '');

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

      pin.addEventListener('click', () => {
        handleSeatClick(seat);
      });

      container.appendChild(pin);
    });
  }

  function handleSeatClick(seat) {
    const isQuickTap = (checkQuickTapDual && checkQuickTapDual.checked) || 
                       (checkQuickTapSolo && checkQuickTapSolo.checked);

    if (isQuickTap) {
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

  // --- 3. MODAL ACTIONS WITH CUSTOM POPUPS ---
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
    const updated = window.store.state.seats.find(s => s.id === activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
  });

  btnRecordFinishNow.addEventListener('click', async () => {
    if (!activeSeatId) return;
    const seat = window.store.state.seats.find(s => s.id === activeSeatId);
    if (!seat || !seat.participantName) {
      await window.scratchDialog.alert({
        title: 'Pilih Peserta Terlebih Dahulu',
        message: 'Silakan pilih nama peserta dari dropdown terlebih dahulu untuk meja ini sebelum mencatat waktu selesai.',
        type: 'warning',
        icon: '🐱'
      });
      return;
    }

    window.sfx.playFinishFanfare();
    const updated = window.store.recordSeatFinish(activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast(`🏁 ${updated.label} (${updated.participantName}) SELESAI: ${updated.finishTimeElapsed}!`);
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
  });

  btnResetFinish.addEventListener('click', () => {
    if (!activeSeatId) return;
    window.store.resetSeatFinish(activeSeatId);
    const updated = window.store.state.seats.find(s => s.id === activeSeatId);
    updateModalStatusView(updated, window.store.state.timer.elapsedSeconds);
    showToast('Status peserta dikembalikan ke Sedang Coding.');
  });

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
      } else {
        headerRoundBadge.className = 'round-badge-pill final';
        headerRoundBadge.innerHTML = '<span>👑</span> <span>BABAK GRAND FINAL (TOP 3)</span>';
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
      return `
        <div class="empty-state-notice" style="grid-column: 1 / -1; padding: 20px;">
          <div style="font-size: 2rem; margin-bottom: 6px;">🎮</div>
          <h4>Belum ada peserta terdaftar</h4>
        </div>
      `;
    }

    const isQual = (window.store.state.currentRound || 'QUALIFICATION') === 'QUALIFICATION';
    let html = '';

    list.forEach((item, index) => {
      const isFinished = item.status === 'finished';
      const rank = index + 1;

      // Qualifier top 10 accent during qualification
      let qualifierClass = '';
      if (isQual && rank <= 10) {
        qualifierClass = 'qualifier-top10';
      }

      const finishedClass = isFinished ? 'is-finished' : '';

      const timeContent = isFinished ? 
        `<span class="compact-time-badge">${item.finishTimeElapsed || '00:00'}</span>` :
        `<span class="compact-coding-badge">CODING</span>`;

      const schoolText = item.school ? `<span class="compact-school">(${item.school})</span>` : '';

      html += `
        <div class="rank-row compact-row ${qualifierClass} ${finishedClass}">
          <span class="compact-rank-num">#${rank}</span>
          <div class="compact-participant-name" title="${item.participantName} ${item.school ? '- ' + item.school : ''}">
            ${item.participantName} ${schoolText}
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
        message: 'Sistem akan secara otomatis mengambil <strong>10 peserta terbaik</strong> dari babak kualifikasi, menempatkannya ke Meja 01–10, mengosongkan meja lainnya, dan mengatur ronde ke <strong>Babak Final</strong>.<br><br>Lanjutkan?',
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

  // --- 6. FULLSCREEN & SOUND ---
  btnToggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        document.body.classList.add('fullscreen-tv');
        btnToggleFullscreen.textContent = '❌ Exit Fullscreen';
      }).catch(err => alert(err.message));
    } else {
      document.exitFullscreen().then(() => {
        document.body.classList.remove('fullscreen-tv');
        btnToggleFullscreen.textContent = '⛶ Fullscreen';
      });
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
    if (selectRoundSetting) {
      selectRoundSetting.value = s.currentRound || 'QUALIFICATION';
    }
    settingsModal.classList.add('open');
  });

  btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('open'));

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
      googleSheetUrl: inputGoogleSheetUrl.value.trim()
    });
    settingsModal.classList.remove('open');
    showToast('Pengaturan berhasil disimpan!');
  });

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

  // --- 8. GOOGLE SHEETS SYNC & EXPORT WITH CUSTOM POPUP ---
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
      const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) throw new Error('File spreadsheet kosong atau hanya ada header.');

      const participants = [];
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'));
      const catIdx = headers.findIndex(h => h.includes('kategori') || h.includes('category') || h.includes('tingkat'));
      const schoolIdx = headers.findIndex(h => h.includes('sekolah') || h.includes('school'));

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const name = cols[nameIdx !== -1 ? nameIdx : 0] || `Peserta ${i}`;
        const category = cols[catIdx !== -1 ? catIdx : 1] || 'SD';
        const school = cols[schoolIdx !== -1 ? schoolIdx : 2] || 'Sekolah';

        participants.push({
          id: `P${String(i).padStart(2, '0')}`,
          name,
          category: category.toUpperCase().includes('SMP') ? 'SMP' : 'SD',
          school
        });
      }

      window.store.updateParticipantsPool(participants);
      settingsModal.classList.remove('open');

      await window.scratchDialog.alert({
        title: 'Sinkronisasi Berhasil!',
        message: `Berhasil mengimpor <strong>${participants.length} peserta</strong> dari Spreadsheet ke dalam sistem perlombaan!`,
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
      btnSyncGoogleSheets.textContent = '📥 Tarik Data Spreadsheet';
    }
  });

  btnExportCSV.addEventListener('click', () => {
    const seats = window.store.state.seats || [];
    let csv = 'Rank,No Meja,Nama Peserta,Kategori,Sekolah,Status,Waktu Selesai (Elapsed),Waktu Jam Selesai\n';

    const finished = seats.filter(s => s.status === 'finished').sort((a,b) => (a.finishSeconds || 0) - (b.finishSeconds || 0));
    const coding = seats.filter(s => s.status === 'coding');
    const combined = [...finished, ...coding];

    combined.forEach((s, idx) => {
      const rank = s.status === 'finished' ? idx + 1 : '-';
      csv += `"${rank}","${s.label || s.id}","${s.participantName}","${s.category}","${s.school}","${s.status}","${s.finishTimeElapsed || '-'}","${s.finishTimestamp || '-'}"\n`;
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

  // --- INIT ---
  setViewMode('dual');
  renderAll(window.store.state, 'init');

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
