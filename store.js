/**
 * SPEED CODING TIMER & SCOREBOARD STORE
 * Real-time synchronization engine with LocalStorage + BroadcastChannel + Google Sheets Support
 */

const STORAGE_KEY = 'speed_coding_app_state_v1';
const SYNC_CHANNEL = 'speed_coding_sync_channel';

// Default 30 detected seats from floorplan.png
const DEFAULT_SEATS = [
  { id: "S01", label: "Meja 01", x: 10.41, y: 14.19 },
  { id: "S02", label: "Meja 02", x: 21.35, y: 8.88 },
  { id: "S03", label: "Meja 03", x: 37.09, y: 19.9 },
  { id: "S04", label: "Meja 04", x: 43.36, y: 8.89 },
  { id: "S05", label: "Meja 05", x: 58.8, y: 19.9 },
  { id: "S06", label: "Meja 06", x: 65.06, y: 8.88 },
  { id: "S07", label: "Meja 07", x: 87.02, y: 8.89 },
  { id: "S08", label: "Meja 08", x: 10.4, y: 33.81 },
  { id: "S09", label: "Meja 09", x: 19.62, y: 26.31 },
  { id: "S10", label: "Meja 10", x: 82.72, y: 34.19 },
  { id: "S11", label: "Meja 11", x: 91.93, y: 26.69 },
  { id: "S12", label: "Meja 12", x: 19.62, y: 46.33 },
  { id: "S13", label: "Meja 13", x: 47.19, y: 45.04 },
  { id: "S14", label: "Meja 14", x: 68.04, y: 45.04 },
  { id: "S15", label: "Meja 15", x: 91.93, y: 46.72 },
  { id: "S16", label: "Meja 16", x: 10.41, y: 53.83 },
  { id: "S17", label: "Meja 17", x: 19.62, y: 66.35 },
  { id: "S18", label: "Meja 18", x: 40.92, y: 56.09 },
  { id: "S19", label: "Meja 19", x: 61.76, y: 56.1 },
  { id: "S20", label: "Meja 20", x: 82.72, y: 54.24 },
  { id: "S21", label: "Meja 21", x: 91.93, y: 66.75 },
  { id: "S22", label: "Meja 22", x: 10.41, y: 73.87 },
  { id: "S23", label: "Meja 23", x: 43.35, y: 80.83 },
  { id: "S24", label: "Meja 24", x: 65.07, y: 80.84 },
  { id: "S25", label: "Meja 25", x: 82.72, y: 74.26 },
  { id: "S26", label: "Meja 26", x: 15.32, y: 91.3 },
  { id: "S27", label: "Meja 27", x: 37.09, y: 91.88 },
  { id: "S28", label: "Meja 28", x: 58.8, y: 91.88 },
  { id: "S29", label: "Meja 29", x: 80.98, y: 91.27 },
  { id: "S30", label: "Meja 30", x: 91.93, y: 85.97 }
];

// Initial demo participants for instant test
const INITIAL_PARTICIPANTS = [
  { id: 'P01', name: 'Arkananta Wijaya', category: 'SD', school: 'SD Bintang Kejora' },
  { id: 'P02', name: 'Nadia Putri Santoso', category: 'SMP', school: 'SMP N 1 Coding' },
  { id: 'P03', name: 'Kenzo Rafasya', category: 'SD', school: 'SD Al-Azhar 22' },
  { id: 'P04', name: 'Alya Zahra S.', category: 'SD', school: 'SD Labschool' },
  { id: 'P05', name: 'Fadhil Hakim Pratama', category: 'SMP', school: 'SMP Harapan Ibu' },
  { id: 'P06', name: 'Clarissa Chen', category: 'SMP', school: 'SMP Citra Kasih' },
  { id: 'P07', name: 'Bima Arya Pangestu', category: 'SD', school: 'SD Taruna Bangsa' },
  { id: 'P08', name: 'Kania Kirana', category: 'SD', school: 'SD Gemilang Kreatif' },
  { id: 'P09', name: 'Rayan Athar', category: 'SMP', school: 'SMP Prestasi Prima' },
  { id: 'P10', name: 'Zahra Amelia', category: 'SD', school: 'SD Mentari School' },
  { id: 'P11', name: 'Gavin Nicholas', category: 'SMP', school: 'SMP Pelita Hati' },
  { id: 'P12', name: 'Naura Aisha', category: 'SD', school: 'SD Tunas Melati' },
  { id: 'P13', name: 'Rafa Raditya', category: 'SD', school: 'SD Insan Cemerlang' },
  { id: 'P14', name: 'Siti Hanifah', category: 'SMP', school: 'SMP Al-Irsyad' },
  { id: 'P15', name: 'Keanu Alfarezel', category: 'SD', school: 'SD Semesta' },
  { id: 'P16', name: 'Mikayla Zivanna', category: 'SD', school: 'SDGlobal Mandiri' },
  { id: 'P17', name: 'Davin Pradipta', category: 'SMP', school: 'SMP BPK Penabur' },
  { id: 'P18', name: 'Alvaro Malik', category: 'SMP', school: 'SMP Dian Harapan' },
  { id: 'P19', name: 'Syifa Nuraini', category: 'SD', school: 'SD Cipta Karya' },
  { id: 'P20', name: 'Tristan Jonathan', category: 'SMP', school: 'SMP Stella Maris' }
];

class SpeedCodingStore {
  constructor() {
    this.broadcastChannel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
        this.broadcastChannel.onmessage = (event) => {
          this.handleRemoteUpdate(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.state = JSON.parse(e.newValue);
          this.notifyListeners('storage');
        } catch (err) {}
      }
    });

    this.listeners = new Set();
    this.state = this.loadState();

    // Start timer ticker
    this.startLocalTicker();
  }

  loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.currentRound) {
          parsed.currentRound = 'QUALIFICATION';
        }
        if (parsed.timer && parsed.timer.status === 'stopped' && parsed.timer.durationMinutes === 30) {
          parsed.timer.durationMinutes = 60;
          parsed.timer.remainingSeconds = 60 * 60;
        }

        // Auto-recalculate elapsed & remaining immediately on page load if timer is running
        if (parsed.timer && parsed.timer.status === 'running' && parsed.timer.startTimestamp) {
          const now = Date.now();
          const pausedMs = parsed.timer.totalPausedMs || 0;
          const currentElapsedSec = Math.floor((now - parsed.timer.startTimestamp - pausedMs) / 1000);
          const durationSec = parsed.timer.durationMinutes * 60;
          const remainingSec = Math.max(0, durationSec - currentElapsedSec);

          parsed.timer.elapsedSeconds = currentElapsedSec;
          parsed.timer.remainingSeconds = remainingSec;

          if (remainingSec <= 0) {
            parsed.timer.status = 'finished';
          }
        }
        if (!parsed.seats || parsed.seats.length === 0) {
          parsed.seats = DEFAULT_SEATS.map((s, idx) => ({
            ...s,
            participantId: INITIAL_PARTICIPANTS[idx]?.id || null,
            participantName: INITIAL_PARTICIPANTS[idx]?.name || '',
            category: INITIAL_PARTICIPANTS[idx]?.category || '',
            school: INITIAL_PARTICIPANTS[idx]?.school || '',
            status: INITIAL_PARTICIPANTS[idx] ? 'coding' : 'empty',
            finishSeconds: null,
            finishTimeElapsed: null,
            finishTimestamp: null
          }));
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse local storage state:', e);
      }
    }

    // Default Fresh State
    const defaultState = {
      eventTitle: 'SPEED CODING COMPETITION',
      eventSubtitle: 'Scratch Championship - Tingkat SD & SMP',
      officeName: 'Panitia Penyelenggara',
      logoUrl: '',
      currentRound: 'QUALIFICATION', // 'QUALIFICATION' (30 -> 10) or 'FINAL' (10 -> Top 3)
      timer: {
        durationMinutes: 60,
        status: 'stopped', // 'stopped', 'running', 'paused', 'finished'
        startTimestamp: null,
        pausedAt: null,
        totalPausedMs: 0,
        elapsedSeconds: 0,
        remainingSeconds: 60 * 60
      },
      seats: DEFAULT_SEATS.map((s, idx) => {
        const p = INITIAL_PARTICIPANTS[idx];
        return {
          ...s,
          participantId: p ? p.id : null,
          participantName: p ? p.name : '',
          category: p ? p.category : '',
          school: p ? p.school : '',
          status: p ? 'coding' : 'empty', // 'empty', 'coding', 'finished'
          finishSeconds: null,
          finishTimeElapsed: null,
          finishTimestamp: null
        };
      }),
      participantsPool: [...INITIAL_PARTICIPANTS],
      googleSheetUrl: '',
      sfxEnabled: true,
      lastUpdated: Date.now()
    };

    this.saveState(defaultState, false);
    return defaultState;
  }

  saveState(state, notify = true) {
    this.state = state;
    this.state.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));

    if (notify) {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'STATE_UPDATE', state: this.state });
      }
      this.notifyListeners('self');
    }
  }

  handleRemoteUpdate(data) {
    if (data && data.type === 'STATE_UPDATE' && data.state) {
      this.state = data.state;
      this.notifyListeners('remote');
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(source) {
    this.listeners.forEach((cb) => {
      try {
        cb(this.state, source);
      } catch (e) {
        console.error('Error in store listener:', e);
      }
    });
  }

  // Timer continuous local ticker
  startLocalTicker() {
    setInterval(() => {
      if (this.state.timer.status === 'running') {
        const now = Date.now();
        const start = this.state.timer.startTimestamp || now;
        const pausedMs = this.state.timer.totalPausedMs || 0;
        const currentElapsedSec = Math.floor((now - start - pausedMs) / 1000);
        const durationSec = this.state.timer.durationMinutes * 60;
        const remainingSec = Math.max(0, durationSec - currentElapsedSec);

        this.state.timer.elapsedSeconds = currentElapsedSec;
        this.state.timer.remainingSeconds = remainingSec;

        if (remainingSec <= 0 && this.state.timer.status === 'running') {
          this.state.timer.status = 'finished';
          this.saveState(this.state, true);
        } else {
          // Notify listeners without full storage re-write every millisecond
          this.notifyListeners('ticker');
        }
      }
    }, 250);
  }

  // --- TIMER ACTIONS ---
  startTimer() {
    const timer = this.state.timer;
    const now = Date.now();
    if (timer.status === 'paused') {
      const pauseDuration = now - (timer.pausedAt || now);
      timer.totalPausedMs = (timer.totalPausedMs || 0) + pauseDuration;
      timer.status = 'running';
      timer.pausedAt = null;
    } else if (timer.status === 'stopped' || timer.status === 'finished') {
      timer.startTimestamp = now;
      timer.totalPausedMs = 0;
      timer.pausedAt = null;
      timer.elapsedSeconds = 0;
      timer.remainingSeconds = timer.durationMinutes * 60;
      timer.status = 'running';
    }
    this.saveState(this.state, true);
  }

  pauseTimer() {
    if (this.state.timer.status === 'running') {
      this.state.timer.status = 'paused';
      this.state.timer.pausedAt = Date.now();
      this.saveState(this.state, true);
    }
  }

  resetTimer() {
    this.state.timer.status = 'stopped';
    this.state.timer.startTimestamp = null;
    this.state.timer.pausedAt = null;
    this.state.timer.totalPausedMs = 0;
    this.state.timer.elapsedSeconds = 0;
    this.state.timer.remainingSeconds = this.state.timer.durationMinutes * 60;
    this.saveState(this.state, true);
  }

  setTimerDuration(minutes) {
    this.state.timer.durationMinutes = Math.max(1, parseInt(minutes) || 30);
    if (this.state.timer.status === 'stopped') {
      this.state.timer.remainingSeconds = this.state.timer.durationMinutes * 60;
    }
    this.saveState(this.state, true);
  }

  adjustTimer(deltaSeconds) {
    if (this.state.timer.status === 'running' || this.state.timer.status === 'paused') {
      // Shifting startTimestamp adjusts elapsed & remaining
      this.state.timer.startTimestamp -= deltaSeconds * 1000;
      this.saveState(this.state, true);
    }
  }

  // --- PARTICIPANT & SEAT ACTIONS ---
  assignParticipantToSeat(seatId, participant) {
    const seat = this.state.seats.find((s) => s.id === seatId);
    if (!seat) return;

    if (participant) {
      seat.participantId = participant.id || `P_${Date.now()}`;
      seat.participantName = participant.name;
      seat.category = participant.category || '';
      seat.school = participant.school || '';
      // Retain finished status if already finished, otherwise coding
      if (seat.status !== 'finished') {
        seat.status = 'coding';
      }
    } else {
      // Unassign
      seat.participantId = null;
      seat.participantName = '';
      seat.category = '';
      seat.school = '';
      seat.status = 'empty';
      seat.finishSeconds = null;
      seat.finishTimeElapsed = null;
      seat.finishTimestamp = null;
    }
    this.saveState(this.state, true);
  }

  recordSeatFinish(seatId, customElapsedSec = null) {
    const seat = this.state.seats.find((s) => s.id === seatId);
    if (!seat) return;

    let elapsedSec = 0;
    if (customElapsedSec !== null) {
      elapsedSec = Math.max(0, parseInt(customElapsedSec));
    } else {
      // Calculate elapsed from start
      elapsedSec = this.state.timer.elapsedSeconds || 0;
    }

    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    seat.status = 'finished';
    seat.finishSeconds = elapsedSec;
    seat.finishTimeElapsed = formatted;
    seat.finishTimestamp = timeStr;

    this.saveState(this.state, true);
    return seat;
  }

  resetSeatFinish(seatId) {
    const seat = this.state.seats.find((s) => s.id === seatId);
    if (!seat) return;

    seat.status = seat.participantName ? 'coding' : 'empty';
    seat.finishSeconds = null;
    seat.finishTimeElapsed = null;
    seat.finishTimestamp = null;

    this.saveState(this.state, true);
  }

  // Update participant list from CSV or Google Sheet
  updateParticipantsPool(list) {
    this.state.participantsPool = list;
    this.saveState(this.state, true);
  }

  // Update Branding & Settings
  updateSettings({ eventTitle, eventSubtitle, officeName, logoUrl, googleSheetUrl, sfxEnabled }) {
    if (eventTitle !== undefined) this.state.eventTitle = eventTitle;
    if (eventSubtitle !== undefined) this.state.eventSubtitle = eventSubtitle;
    if (officeName !== undefined) this.state.officeName = officeName;
    if (logoUrl !== undefined) this.state.logoUrl = logoUrl;
    if (googleSheetUrl !== undefined) this.state.googleSheetUrl = googleSheetUrl;
    if (sfxEnabled !== undefined) this.state.sfxEnabled = sfxEnabled;
    this.saveState(this.state, true);
  }

  // Switch competition round
  setRound(round) {
    this.state.currentRound = round; // 'QUALIFICATION' or 'FINAL'
    this.saveState(this.state, true);
  }

  // Advance Top 10 to Final automatically
  advanceTop10ToFinal() {
    const seats = this.state.seats || [];
    // Sort finished first, then coding
    const sorted = [...seats].filter(s => s.participantName).sort((a, b) => {
      if (a.status === 'finished' && b.status === 'finished') {
        return (a.finishSeconds || 999999) - (b.finishSeconds || 999999);
      }
      if (a.status === 'finished' && b.status !== 'finished') return -1;
      if (a.status !== 'finished' && b.status === 'finished') return 1;
      return a.id.localeCompare(b.id);
    });

    const top10 = sorted.slice(0, 10);

    // Assign top 10 into first 10 seats (S01-S10) and reset scores for Final round
    this.state.seats.forEach((seat, idx) => {
      if (idx < top10.length) {
        const p = top10[idx];
        seat.participantId = p.participantId;
        seat.participantName = p.participantName;
        seat.category = p.category;
        seat.school = p.school;
        seat.status = 'coding';
        seat.finishSeconds = null;
        seat.finishTimeElapsed = null;
        seat.finishTimestamp = null;
      } else {
        // Seat 11-30 become empty in final round
        seat.participantId = null;
        seat.participantName = '';
        seat.category = '';
        seat.school = '';
        seat.status = 'empty';
        seat.finishSeconds = null;
        seat.finishTimeElapsed = null;
        seat.finishTimestamp = null;
      }
    });

    this.state.currentRound = 'FINAL';
    this.resetTimer();
    this.saveState(this.state, true);
  }

  // Reset entire race/scores (keep seat assignments or wipe)
  resetAllScores() {
    this.state.seats.forEach((seat) => {
      seat.status = seat.participantName ? 'coding' : 'empty';
      seat.finishSeconds = null;
      seat.finishTimeElapsed = null;
      seat.finishTimestamp = null;
    });
    this.resetTimer();
    this.saveState(this.state, true);
  }
}

// Global Store Instance
window.store = new SpeedCodingStore();
