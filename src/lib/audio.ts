class AudioEngine {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private muted = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.error("Audio Context failed to initialize", e);
    }
  }

  public get isMuted() {
      return this.muted;
  }

  public toggleMute() {
     this.muted = !this.muted;
  }

  public playClack() {
    if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }
    
    const t = this.ctx.currentTime;
    
    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 3000;
    
    const noiseGain = this.ctx.createGain();
    const noiseVol = 0.05 + Math.random() * 0.02;
    noiseGain.gain.setValueAtTime(noiseVol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    // Mechanical click/thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.03);
    
    const oscVol = 0.1 + Math.random() * 0.05;
    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.linearRampToValueAtTime(oscVol, t + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    noise.start(t);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playPaper() {
     if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }
    
    const t = this.ctx.currentTime;
    const duration = 0.2 + Math.random() * 0.1;
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate pink-ish noise
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // compensation
        b6 = white * 0.115926;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000 + Math.random() * 500, t);
    filter.frequency.linearRampToValueAtTime(300, t + duration);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + duration);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noise.start(t);
  }

  public playDrawer() {
    if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }
    
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

  public playSwitch() {
    if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }
    
    const t = this.ctx.currentTime;
    
    // High pitched transient click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, t);
    osc1.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.5, t + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    
    // Low frequency "chunk"
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(200, t);
    osc2.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.4, t + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    
    osc1.start(t);
    osc1.stop(t + 0.05);
    osc2.start(t);
    osc2.stop(t + 0.05);
  }
}

export const audioEngine = new AudioEngine();
