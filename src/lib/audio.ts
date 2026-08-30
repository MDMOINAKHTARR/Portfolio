class AudioEngine {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private muted = false;

  // Decoded audio buffers
  private paperAudioBuffer: AudioBuffer | null = null;
  private clickAudioBuffer: AudioBuffer | null = null;

  // Active gain nodes — stop previous sound before playing new one to kill echo
  private activeClickGain: GainNode | null = null;
  private activePaperGain: GainNode | null = null;

  // Debounce timestamps — prevents double-firing from event bubbling or duplicate listeners
  private lastClickTime = 0;
  private lastPaperTime = 0;
  private readonly CLICK_DEBOUNCE_MS = 150;
  private readonly PAPER_DEBOUNCE_MS = 300;

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.initialized = true;

      // Decode click sound
      fetch(encodeURI('/onclick sound.mp3'))
        .then((res) => res.arrayBuffer())
        .then((buf) => this.ctx!.decodeAudioData(buf))
        .then((decoded) => { this.clickAudioBuffer = decoded; })
        .catch((err) => console.warn('Could not decode click audio', err));

      // Decode paper sound
      fetch(encodeURI('/paper turning sound.mp3'))
        .then((res) => res.arrayBuffer())
        .then((buf) => this.ctx!.decodeAudioData(buf))
        .then((decoded) => { this.paperAudioBuffer = decoded; })
        .catch((err) => console.warn('Could not decode paper audio', err));

    } catch (e) {
      console.error('AudioContext failed to initialize', e);
    }
  }

  public get isMuted() {
    return this.muted;
  }

  public toggleMute() {
    this.muted = !this.muted;
  }

  private resumeCtx() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play onclick sound — deduplicated, echo-free
  public playClick() {
    if (this.muted) return;

    // Debounce: drop duplicate calls within 150ms
    const now = performance.now();
    if (now - this.lastClickTime < this.CLICK_DEBOUNCE_MS) return;
    this.lastClickTime = now;

    if (!this.ctx || !this.clickAudioBuffer) {
      // Not yet decoded — silent fail (no fallback that could echo)
      return;
    }

    this.resumeCtx();

    // Stop any currently playing click sound to eliminate echo
    if (this.activeClickGain) {
      try {
        this.activeClickGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (_) { /* ignore */ }
      this.activeClickGain = null;
    }

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.clickAudioBuffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);

      this.activeClickGain = gain;
      source.onended = () => {
        if (this.activeClickGain === gain) this.activeClickGain = null;
      };
    } catch (err) {
      console.warn('Click playback error', err);
    }
  }

  // Aliases
  public playClack() { this.playClick(); }
  public playSwitch() { this.playClick(); }

  // Play paper turning sound — deduplicated, echo-free
  public playPaper() {
    if (this.muted) return;

    // Debounce: drop duplicate calls within 300ms
    const now = performance.now();
    if (now - this.lastPaperTime < this.PAPER_DEBOUNCE_MS) return;
    this.lastPaperTime = now;

    if (!this.ctx || !this.paperAudioBuffer) {
      return;
    }

    this.resumeCtx();

    // Stop any currently playing paper sound to eliminate echo
    if (this.activePaperGain) {
      try {
        this.activePaperGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (_) { /* ignore */ }
      this.activePaperGain = null;
    }

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.paperAudioBuffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);

      this.activePaperGain = gain;
      source.onended = () => {
        if (this.activePaperGain === gain) this.activePaperGain = null;
      };
    } catch (err) {
      console.warn('Paper playback error', err);
    }
  }

  public playDrawer() {
    if (!this.ctx || this.muted) return;
    this.resumeCtx();

    const t = this.ctx.currentTime;
    const duration = 0.4;

    // Metallic rumble
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(100, t + duration);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Heavy thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.linearRampToValueAtTime(0.8, t + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(t);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export const audioEngine = new AudioEngine();
