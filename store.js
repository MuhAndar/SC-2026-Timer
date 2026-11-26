/**
 * SPEED CODING TIMER & SCOREBOARD STORE
 * Real-time synchronization engine with LocalStorage + BroadcastChannel + Google Sheets Support
 */

const STORAGE_KEY = 'speed_coding_app_state_v2';
const SYNC_CHANNEL = 'speed_coding_sync_channel';

// Default 30 detected seats from floorplan.png
const DEFAULT_SEATS = [
  { id: "S01", label: "Posisi 01", x: 8.18, y: 16.84 },
  { id: "S02", label: "Posisi 02", x: 19.41, y: 11.52 },
  { id: "S03", label: "Posisi 03", x: 28.76, y: 22.35 },
  { id: "S04", label: "Posisi 04", x: 35.19, y: 11.33 },
  { id: "S05", label: "Posisi 05", x: 45.81, y: 22.35 },
  { id: "S06", label: "Posisi 06", x: 52.24, y: 11.33 },
  { id: "S07", label: "Posisi 07", x: 63.04, y: 22.35 },
  { id: "S08", label: "Posisi 08", x: 69.47, y: 11.34 },
  { id: "S09", label: "Posisi 09", x: 86.75, y: 11.52 },
  { id: "S10", label: "Posisi 10", x: 8.19, y: 35.08 },
  { id: "S11", label: "Posisi 11", x: 17.63, y: 27.58 },
  { id: "S12", label: "Posisi 12", x: 82.34, y: 35.46 },
  { id: "S13", label: "Posisi 13", x: 91.79, y: 27.97 },
  { id: "S14", label: "Posisi 14", x: 17.63, y: 46.23 },
  { id: "S15", label: "Posisi 15", x: 91.79, y: 46.23 },
  { id: "S16", label: "Posisi 16", x: 8.18, y: 53.73 },
  { id: "S17", label: "Posisi 17", x: 17.63, y: 64.50 },
  { id: "S18", label: "Posisi 18", x: 82.34, y: 53.73 },
  { id: "S19", label: "Posisi 19", x: 91.79, y: 64.88 },
  { id: "S20", label: "Posisi 20", x: 8.18, y: 72.00 },
  { id: "S21", label: "Posisi 21", x: 36.76, y: 77.70 },
  { id: "S22", label: "Posisi 22", x: 53.81, y: 77.51 },
  { id: "S23", label: "Posisi 23", x: 71.03, y: 77.70 },
  { id: "S24", label: "Posisi 24", x: 82.34, y: 72.38 },
  { id: "S25", label: "Posisi 25", x: 12.99, y: 88.72 },
  { id: "S26", label: "Posisi 26", x: 30.33, y: 88.72 },
  { id: "S27", label: "Posisi 27", x: 47.38, y: 88.52 },
  { id: "S28", label: "Posisi 28", x: 64.60, y: 88.72 },
  { id: "S29", label: "Posisi 29", x: 86.93, y: 88.43 }
];

// Official 29 Participants extracted directly from Google Spreadsheet PESERTA sheet
const INITIAL_PARTICIPANTS = [
  { id: 'P01', no: '1', name: 'Raziq Khairi Rafif', category: 'SD', school: 'SD Telkom Makassar (Kelas 5)' },
  { id: 'P02', no: '2', name: 'Adam Mahsyar As Sidqi', category: 'SMP', school: 'SMP Ranu Harapan Islamic School (Kelas 8)' },
  { id: 'P03', no: '3', name: 'Andi Alisha Hasya Putri', category: 'SMP', school: 'SMP Negeri 12 Makassar (Kelas IX)' },
  { id: 'P04', no: '4', name: 'Andi Hasan Hasyim', category: 'SD', school: 'SDIT Takwa Cendekia Makassar (Kelas 5)' },
  { id: 'P05', no: '5', name: 'Ghifari Ar Rafiu', category: 'SD', school: 'MI Al Abrar Makassar (Kelas 5)' },
  { id: 'P06', no: '6', name: 'Avicenna Fadil Anri', category: 'SMP', school: 'SMP Islam Athirah Bukit Baruga (Kelas 8)' },
  { id: 'P07', no: '7', name: 'Athifa Urelya Arie', category: 'SMP', school: 'SMPIT Al-Hikmah Amanah Ummah (Kelas VIII)' },
  { id: 'P08', no: '8', name: 'Muhammad Athaya Nabil Mataena Asrul', category: 'SMP', school: 'SMP Kartika XX-I Makassar (Kelas 9)' },
  { id: 'P09', no: '9', name: 'Ahmad Athallah Zaidan SB', category: 'SD', school: 'SDIT Ibnul Qayyim Makassar (Kelas 6)' },
  { id: 'P10', no: '10', name: 'Syarifa Syirena Abdullah', category: 'SMP', school: 'SMP IT Mukhlisiin (Kelas IX)' },
  { id: 'P11', no: '11', name: 'Siti Aisyah Qur\'anita', category: 'SMP', school: 'SMPIT Makassar Islamic School (Kelas VIII)' },
  { id: 'P12', no: '12', name: 'Adrian Luke Synarso', category: 'SD', school: 'SD Pundarika Makassar (Kelas 5)' },
  { id: 'P13', no: '13', name: 'Leonardo Skylar Synarso', category: 'SMP', school: 'SMP Pundarika Makassar (Kelas 8)' },
  { id: 'P14', no: '14', name: 'Zain Maulana Al Fatih', category: 'SD', school: 'SDIA 68 Summarecon Mutiara Makassar (Kelas 5)' },
  { id: 'P15', no: '15', name: 'Muhammad Aidil', category: 'SMP', school: 'SMP Negeri 1 Galesong Utara (Kelas 7)' },
  { id: 'P16', no: '16', name: 'Muhammad Rumi Alfarizi Alfian', category: 'SD', school: 'SD Islam Athirah Makassar (Kelas 6)' },
  { id: 'P17', no: '17', name: 'Priscilla Lorelle Sentosa', category: 'SD', school: 'Sekolah Dian Harapan Makassar (Kelas 5)' },
  { id: 'P18', no: '18', name: 'Muhammad Atlan Satria Putra Priandy', category: 'SMP', school: 'SMP Telkom Makassar (Kelas 9)' },
  { id: 'P19', no: '19', name: 'Muh. Zaidan Rafhi Putra', category: 'SMP', school: 'MTsN 1 Kota Makassar (Kelas 8)' },
  { id: 'P20', no: '20', name: 'Gevariel Benaya Putra Nugraha', category: 'SD', school: 'SDK Hati Kudus Rajawali (Kelas 6)' },
  { id: 'P21', no: '21', name: 'Zakwan Fazian', category: 'SMP', school: 'SMPIT Darul Fikri Makassar (Kelas 8)' },
  { id: 'P22', no: '22', name: 'Saffanah Kayyisah Akmar', category: 'SMP', school: 'SMPIT Al-Fityan School Gowa (Kelas 9)' },
  { id: 'P23', no: '23', name: 'Akhdan Arief Athaya', category: 'SMP', school: 'SMP Islam Athirah Bone (Kelas 8)' },
  { id: 'P24', no: '24', name: 'Eve Angeline Purwanto', category: 'SMP', school: 'SMP Tunas Bangsa (Kelas 9)' },
  { id: 'P25', no: '25', name: 'As-Habul Kahfi', category: 'SMP', school: 'SMP Negeri 7 Makassar (Kelas 8)' },
  { id: 'P26', no: '26', name: 'Elang Alam Penguasa', category: 'SMP', school: 'UPTD SPF SMP Negeri 30 Makassar (Kelas 9)' },
  { id: 'P27', no: '27', name: 'Muhammad Budiman Andika', category: 'SMP', school: 'UPTD SPF SMPN 49 Makassar (Kelas 7)' },
  { id: 'P28', no: '28', name: 'Abu Bakar Samad Putra F.Z.', category: 'SMP', school: 'UPTD SPF SMPN 6 Makassar (Kelas 9)' },
  { id: 'P29', no: '29', name: 'Alghani Ilmi Razak', category: 'SMP', school: 'SMPIT Plus Baitul Ma\'Arif (Kelas 9)' }
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

    // Cloud seats sync across devices (initial pull and background interval)
    setTimeout(() => {
      this.pullSeatsFromCloud(false);
    }, 350);

    setInterval(() => {
      if (this.state && this.state.timer && this.state.timer.status !== 'running') {
        this.pullSeatsFromCloud(false);
      }
    }, 25000);
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
        if (!parsed.seats || parsed.seats.length === 0 || parsed.layoutVersion !== '2.2') {
          parsed.layoutVersion = '2.2';
          const oldSeats = parsed.seats || [];
          parsed.seats = DEFAULT_SEATS.map((defSeat, idx) => {
            const existing = oldSeats.find(s => s.id === defSeat.id) || oldSeats[idx] || {};
            return {
              ...defSeat,
              participantId: existing.participantId || INITIAL_PARTICIPANTS[idx]?.id || null,
              participantName: existing.participantName || INITIAL_PARTICIPANTS[idx]?.name || '',
              category: existing.category || INITIAL_PARTICIPANTS[idx]?.category || '',
              school: existing.school || INITIAL_PARTICIPANTS[idx]?.school || '',
              status: existing.status || (INITIAL_PARTICIPANTS[idx] ? 'coding' : 'empty'),
              finishSeconds: existing.finishSeconds || null,
              finishTimeElapsed: existing.finishTimeElapsed || null,
              finishTimestamp: existing.finishTimestamp || null
            };
          });
        }

        // Always strictly align seat coordinates to current layout definition
        const defMap = new Map(DEFAULT_SEATS.map(s => [s.id, s]));
        parsed.seats.forEach(seat => {
          const def = defMap.get(seat.id);
          if (def) {
            seat.x = def.x;
            seat.y = def.y;
          }
        });

        // Auto-migrate stale placeholder schools to official PESERTA sheet data
        const pMapById = new Map(INITIAL_PARTICIPANTS.map(p => [p.id, p]));
        const pMapByName = new Map(INITIAL_PARTICIPANTS.map(p => [p.name.toLowerCase().trim(), p]));

        parsed.seats.forEach((seat, idx) => {
          const matched = (seat.participantId && pMapById.get(seat.participantId)) ||
                          (seat.participantName && pMapByName.get(seat.participantName.toLowerCase().trim())) ||
                          (INITIAL_PARTICIPANTS[idx]);

          // If seat had placeholder school or missing school, update from official data
          if (matched && (!seat.school || seat.school.startsWith('Peserta ') || seat.school === 'Peserta Kualifikasi')) {
            seat.participantId = matched.id;
            seat.participantName = matched.name;
            seat.category = matched.category;
            seat.school = matched.school;
            if (seat.status === 'empty' && matched.name) {
              seat.status = 'coding';
            }
          }
        });

        // Update pool if it was placeholder
        if (!parsed.participantsPool || parsed.participantsPool.length === 0 || parsed.participantsPool[0]?.school?.startsWith('Peserta ')) {
          parsed.participantsPool = [...INITIAL_PARTICIPANTS];
        }

        // Ensure googleSheetUrl targets the PESERTA sheet
        if (!parsed.googleSheetUrl || parsed.googleSheetUrl.indexOf('sheet=') === -1) {
          parsed.googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrV8pl3SH7VxXYS8pbg0HSUdUR_MdLMl7QSxa0n1pOHwy_uBr6o2E35P38haRn-iJVL2BKceEPRHyI/pub?output=csv&sheet=PESERTA';
        }

        // Official Google Apps Script Web App URL
        if (!parsed.appsScriptUrl || parsed.appsScriptUrl.indexOf('AKfycb') === -1) {
          parsed.appsScriptUrl = 'https://script.google.com/macros/s/AKfycbw1-xQQ_2jqLQ0PfDvaA6qWP__kxHt5_Di6Sd5Hy2RDbAUYJQSs3wjARtvJnV4bwXUA/exec';
        }

        // Apply shared seats from URL parameter if opened via shareable link (?seats=...)
        if (typeof window !== 'undefined' && window.location && window.location.search) {
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedSeats = urlParams.get('seats');
            if (encodedSeats) {
              const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedSeats))));
              if (Array.isArray(decoded) && decoded.length > 0) {
                const sMap = new Map(decoded.map(s => [s.id, s]));
                parsed.seats.forEach(seat => {
                  const cs = sMap.get(seat.id);
                  if (cs) {
                    seat.participantId = cs.pId || cs.participantId || null;
                    seat.participantName = cs.name || cs.participantName || '';
                    seat.category = cs.cat || cs.category || '';
                    seat.school = cs.sch || cs.school || '';
                    seat.status = cs.st || cs.status || 'empty';
                    seat.finishSeconds = cs.fs || cs.finishSeconds || null;
                    seat.finishTimeElapsed = cs.fe || cs.finishTimeElapsed || null;
                  }
                });
              }
            }
          } catch (err) {
            console.warn('Failed to parse seats from URL parameter:', err);
          }
        }

        return parsed;
      } catch (e) {
        console.error('Failed to parse local storage state:', e);
      }
    }

    // Default Fresh State (Meja 01 - 29 assigned sequentially to 29 participants, Meja 30 empty)
    const defaultState = {
      eventTitle: 'SPEED CODING COMPETITION',
      eventSubtitle: 'Competition - Tingkat SD & SMP',
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
      googleSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrV8pl3SH7VxXYS8pbg0HSUdUR_MdLMl7QSxa0n1pOHwy_uBr6o2E35P38haRn-iJVL2BKceEPRHyI/pub?output=csv&sheet=PESERTA',
      appsScriptUrl: 'https://script.google.com/macros/s/AKfycbw1-xQQ_2jqLQ0PfDvaA6qWP__kxHt5_Di6Sd5Hy2RDbAUYJQSs3wjARtvJnV4bwXUA/exec',
      autoSyncSpreadsheet: true,
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
    if (!seat) return null;

    let oldSeat = null;

    if (participant) {
      const pId = participant.id;
      const pName = (participant.name || '').trim().toLowerCase();

      // 1. CARI JIKA PESERTA SUDAH DUDUK DI KURSI LAIN
      oldSeat = this.state.seats.find(s => s.id !== seatId && (
        (pId && s.participantId === pId) ||
        (pName && s.participantName && s.participantName.trim().toLowerCase() === pName)
      ));

      if (oldSeat) {
        // Pindahkan data status selesai jika peserta sudah selesai di kursi lama
        if (oldSeat.status === 'finished') {
          seat.status = 'finished';
          seat.finishSeconds = oldSeat.finishSeconds;
          seat.finishTimeElapsed = oldSeat.finishTimeElapsed;
          seat.finishTimestamp = oldSeat.finishTimestamp;
        }

        // KOSONGKAN KURSI LAMA (ORANG PINDAH KE KURSI BARU, KURSI LAMA TERHAPUS)
        oldSeat.participantId = null;
        oldSeat.participantName = '';
        oldSeat.category = '';
        oldSeat.school = '';
        oldSeat.status = 'empty';
        oldSeat.finishSeconds = null;
        oldSeat.finishTimeElapsed = null;
        oldSeat.finishTimestamp = null;
      }

      // 2. PASANG PESERTA KE KURSI BARU
      seat.participantId = participant.id || `P_${Date.now()}`;
      seat.participantName = participant.name;
      seat.category = participant.category || '';
      seat.school = participant.school || '';

      if (seat.status !== 'finished') {
        seat.status = 'coding';
      }
    } else {
      // Unassign / Mengosongkan kursi
      seat.participantId = null;
      seat.participantName = '';
      seat.category = '';
      seat.school = '';
      seat.status = 'empty';
      seat.finishSeconds = null;
      seat.finishTimeElapsed = null;
      seat.finishTimestamp = null;
    }

    // 3. PEMBERSIHAN EXTRA: CEK DAN HAPUS SETIAP POTENSI DUPLIKAT NAMA DI SEMUA KURSI LAIN
    if (participant && participant.name) {
      const targetName = participant.name.trim().toLowerCase();
      this.state.seats.forEach(s => {
        if (s.id !== seatId && s.participantName && s.participantName.trim().toLowerCase() === targetName) {
          s.participantId = null;
          s.participantName = '';
          s.category = '';
          s.school = '';
          s.status = 'empty';
          s.finishSeconds = null;
          s.finishTimeElapsed = null;
          s.finishTimestamp = null;
        }
      });
    }

    this.saveState(this.state, true);
    this.pushSeatsToCloud();
    return { seat, oldSeat };
  }

  swapSeats(seatIdA, seatIdB) {
    if (seatIdA === seatIdB) return null;
    const seatA = this.state.seats.find((s) => s.id === seatIdA);
    const seatB = this.state.seats.find((s) => s.id === seatIdB);
    if (!seatA || !seatB) return null;

    const fields = [
      'participantId',
      'participantName',
      'category',
      'school',
      'status',
      'finishSeconds',
      'finishTimeElapsed',
      'finishTimestamp'
    ];

    const temp = {};
    fields.forEach(f => temp[f] = seatA[f]);
    fields.forEach(f => seatA[f] = seatB[f]);
    fields.forEach(f => seatB[f] = temp[f]);

    this.saveState(this.state, true);
    this.pushSeatsToCloud();
    return { seatA, seatB };
  }

  randomizeSeats(customParticipants = null) {
    const pool = customParticipants || this.state.participantsPool || [];
    if (pool.length === 0) return this.state.seats;

    // Fisher-Yates shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.state.seats.forEach((seat, idx) => {
      if (idx < shuffled.length) {
        const p = shuffled[idx];
        seat.participantId = p.id || `P${String(idx + 1).padStart(2, '0')}`;
        seat.participantName = p.name;
        seat.category = p.category || 'SD';
        seat.school = p.school || '';
        seat.status = 'coding';
        seat.finishSeconds = null;
        seat.finishTimeElapsed = null;
        seat.finishTimestamp = null;
      } else {
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

    this.saveState(this.state, true);
    return this.state.seats;
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

  // Synchronize participant list into pool AND seats & scoreboard
  syncParticipants(list) {
    if (!list || list.length === 0) return;
    this.state.participantsPool = list;

    const byId = new Map(list.map(p => [p.id, p]));
    const byName = new Map(list.map(p => [p.name.toLowerCase().trim(), p]));

    this.state.seats.forEach((seat, idx) => {
      let matched = (seat.participantId && byId.get(seat.participantId)) ||
                    (seat.participantName && byName.get(seat.participantName.toLowerCase().trim()));

      if (!matched && idx < list.length && (!seat.participantName || seat.school?.startsWith('Peserta '))) {
        matched = list[idx];
      }

      if (matched) {
        seat.participantId = matched.id;
        seat.participantName = matched.name;
        seat.category = matched.category || 'SD';
        seat.school = matched.school || '';
        if (seat.status === 'empty' && matched.name) {
          seat.status = 'coding';
        }
      }
    });

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

  // Restore Qualification participants
  restoreQualification() {
    const pool = (this.state.participantsPool && this.state.participantsPool.length > 0)
      ? this.state.participantsPool
      : INITIAL_PARTICIPANTS;

    this.state.seats.forEach((seat, idx) => {
      if (idx < pool.length) {
        const p = pool[idx];
        seat.participantId = p.id || `P${String(idx + 1).padStart(2, '0')}`;
        seat.participantName = p.name;
        seat.category = p.category || 'SD';
        seat.school = p.school || '';
        seat.status = 'coding';
        seat.finishSeconds = null;
        seat.finishTimeElapsed = null;
        seat.finishTimestamp = null;
      } else {
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
    this.saveState(this.state, true);
  }

  // Switch competition round
  setRound(round) {
    this.state.currentRound = round; // 'QUALIFICATION' or 'FINAL'
    if (round === 'QUALIFICATION') {
      this.restoreQualification();
    } else if (round === 'FINAL' && this.state.finalistsPool && this.state.finalistsPool.length > 0) {
      this.loadFinalists(this.state.finalistsPool);
    }
    this.saveState(this.state, true);
  }

  // Load finalists from Rekapitulasi Final sheet
  loadFinalists(finalistsList) {
    const list = finalistsList || [];
    this.state.currentRound = 'FINAL';
    this.state.finalistsPool = list;

    this.state.seats.forEach((seat, idx) => {
      if (idx < list.length) {
        const p = list[idx];
        seat.participantId = p.id || `F${idx + 1}`;
        seat.participantName = p.name;
        seat.category = p.category || '';
        seat.school = p.school || '';
        seat.status = 'coding';
        seat.finishSeconds = null;
        seat.finishTimeElapsed = null;
        seat.finishTimestamp = null;
      } else {
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
    this.pushSeatsToCloud();
  }

  // =========================================================================
  // CLOUD SEAT SYNCHRONIZATION (ACROSS COMPUTERS & TV SCREENS)
  // =========================================================================

  // Push seats to cloud (debounced)
  pushSeatsToCloud() {
    if (this._cloudPushTimeout) clearTimeout(this._cloudPushTimeout);
    this._cloudPushTimeout = setTimeout(async () => {
      const url = this.state.appsScriptUrl;
      if (!url) return;
      try {
        const minimalSeats = this.state.seats.map(s => ({
          id: s.id,
          label: s.label,
          x: s.x,
          y: s.y,
          participantId: s.participantId || null,
          participantName: s.participantName || '',
          category: s.category || '',
          school: s.school || '',
          status: s.status || 'empty',
          finishSeconds: s.finishSeconds || null,
          finishTimeElapsed: s.finishTimeElapsed || null,
          finishTimestamp: s.finishTimestamp || null
        }));

        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'sync_seats',
            type: 'seats',
            round: this.state.currentRound || 'QUALIFICATION',
            seats: minimalSeats,
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        console.warn('Cloud seats push error:', err);
      }
    }, 700);
  }

  // Pull seats from cloud to synchronize other devices
  async pullSeatsFromCloud(isManual = false) {
    const url = this.state.appsScriptUrl;
    if (!url) return false;
    try {
      const res = await fetch(`${url}?action=get_seats&t=${Date.now()}`);
      if (!res.ok) return false;
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.seats) && json.seats.length > 0) {
        const cloudMap = new Map(json.seats.map(s => [s.id, s]));
        let hasChanges = false;

        this.state.seats.forEach(seat => {
          const cs = cloudMap.get(seat.id);
          if (cs) {
            if (seat.participantName !== cs.participantName || 
                seat.participantId !== cs.participantId || 
                seat.status !== cs.status ||
                seat.school !== cs.school ||
                seat.category !== cs.category ||
                seat.finishTimeElapsed !== cs.finishTimeElapsed ||
                (cs.x !== undefined && (seat.x !== cs.x || seat.y !== cs.y))) {
              hasChanges = true;
            }
            seat.participantId = cs.participantId || null;
            seat.participantName = cs.participantName || '';
            seat.category = cs.category || '';
            seat.school = cs.school || '';
            seat.status = cs.status || 'empty';
            seat.finishSeconds = cs.finishSeconds || null;
            seat.finishTimeElapsed = cs.finishTimeElapsed || null;
            seat.finishTimestamp = cs.finishTimestamp || null;
            if (cs.x !== undefined && cs.y !== undefined) {
              seat.x = cs.x;
              seat.y = cs.y;
            }
          }
        });

        if (hasChanges || isManual) {
          this.saveState(this.state, true);
          return true;
        }
      }
    } catch (err) {
      console.warn('Cloud seats pull error:', err);
    }
    return false;
  }

  // Generate shareable link to open identical seats on any computer/projector
  generateShareableSeatsUrl() {
    try {
      const minimal = this.state.seats.map(s => ({
        id: s.id,
        pId: s.participantId || null,
        name: s.participantName || '',
        cat: s.category || '',
        sch: s.school || '',
        st: s.status || 'empty',
        fs: s.finishSeconds || null,
        fe: s.finishTimeElapsed || null
      }));
      const str = JSON.stringify(minimal);
      const b64 = btoa(unescape(encodeURIComponent(str)));
      const base = window.location.origin + window.location.pathname;
      return `${base}?seats=${b64}`;
    } catch (err) {
      return window.location.href;
    }
  }
}

// Global Store Instance
window.store = new SpeedCodingStore();
