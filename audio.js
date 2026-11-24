/**
 * Web Audio API Synthesizer for Speed Coding
 * Zero external audio files, 0KB network payload, works 100% offline!
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 600, duration = 0.15, type = 'sine') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playStartHorn() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C (Game start fanfare)
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.2, 'triangle');
      }, idx * 120);
    });
  }

  playPauseSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Soft double blip for pause
    this.playBeep(450, 0.08, 'sine');
    setTimeout(() => this.playBeep(350, 0.12, 'sine'), 90);
  }

  playCelebrationCheer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Victory fanfare chords + confetti whistle
    const chord1 = [523.25, 659.25, 783.99]; // C major
    const chord2 = [587.33, 739.99, 880.00]; // D major
    const chord3 = [659.25, 830.61, 987.77]; // E major
    const chord4 = [1046.50, 1318.51, 1567.98]; // High C major victory

    const playChord = (notes, timeOffset, dur) => {
      setTimeout(() => {
        notes.forEach(f => {
          this.playBeep(f, dur, 'triangle');
        });
      }, timeOffset);
    };

    playChord(chord1, 0, 0.2);
    playChord(chord2, 180, 0.2);
    playChord(chord3, 360, 0.25);
    playChord(chord4, 600, 0.7);

    // Whistle cheer pitch ramp
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
      } catch (e) {}
    }, 750);
  }

  playTimesUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // 3 loud warning pulses
    [0, 250, 500].forEach((delay) => {
      setTimeout(() => {
        this.playBeep(330, 0.2, 'sawtooth');
      }, delay);
    });
  }
}

window.sfx = new SoundEffects();
