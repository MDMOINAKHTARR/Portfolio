export type MusicTheme = 'am-i-dreaming' | 'sunflower' | 'quicksilver' | 'starman';

export const MUSIC_THEME_ARTWORK: Record<MusicTheme, string> = {
  'am-i-dreaming': '/theme-am-i-dreaming-art.jpg',
  sunflower: '/theme-sunflower-art.jpg',
  quicksilver: '/theme-quicksilver-art.jpg',
  starman: '/theme-starman-art-v2.jpg',
};

export interface MusicVisual {
  src: string;
  type: 'image' | 'video';
  alt: string;
  objectPosition?: string;
  playCount?: 1 | 2;
  cycleDurationMs?: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  codename: string;
  src: string;
  theme?: MusicTheme;
  visual?: MusicVisual;
}

export interface PlaybackSnapshot {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trackIndex: number;
  volume: number;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'am-i-dreaming',
    title: 'Am I Dreaming',
    artist: 'Metro Boomin, A$AP Rocky & Roisee',
    codename: 'TAPE 01 // SPIDER-VERSE',
    src: '/Metro_Boomin_-_Am_I_Dreaming_Metro_Boomin_A_AP_Rocky_Roisee_(mp3.pm).mp3',
    theme: 'am-i-dreaming',
    visual: {
      src: '/am i dreaming gif.gif',
      type: 'image',
      alt: 'Spider-Verse animation for Am I Dreaming',
      playCount: 1,
      cycleDurationMs: 2640,
    },
  },
  {
    id: 'sunflower',
    title: 'Sunflower',
    artist: 'Post Malone & Swae Lee',
    codename: 'TAPE 02 // SUNFLOWER',
    src: '/Post_Malone_Swae_Lee_-_Sunflower_Spider-Man_Into_The_Spider-Verse_(mp3.pm).mp3',
    theme: 'sunflower',
    visual: {
      src: '/sunflower gif.mp4',
      type: 'video',
      alt: 'Spider-Verse animation for Sunflower',
      playCount: 1,
    },
  },
  {
    id: 'let-it-happen',
    title: 'The Less I Know The Better',
    artist: 'Tame Impala',
    codename: 'TAPE 03 // CURRENTS',
    src: '/let it happen song.mpeg',
  },
  {
    id: 'sweet-dreams',
    title: 'Sweet Dreams (Are Made of This)',
    artist: 'Eurythmics, Annie Lennox & Dave Stewart',
    codename: 'TAPE 04 // SWEET DREAMS',
    src: '/Z_Lala_-_Sweet_Dreams_Are_Made_Of_This_(mp3.pm).mp3',
    theme: 'quicksilver',
    visual: {
      src: '/quicksilver gif.mp4',
      type: 'video',
      alt: 'Quicksilver animation for Sweet Dreams',
      playCount: 1,
    },
  },
  {
    id: 'starman',
    title: 'Starman',
    artist: 'David Bowie',
    codename: 'TAPE 05 // SUPERMAN',
    src: '/starman song.mpeg',
    theme: 'starman',
    visual: {
      src: '/starman gif.mp4',
      type: 'video',
      alt: 'Superman animation for Starman',
      playCount: 2,
    },
  },
  {
    id: 'raindrops',
    title: "Raindrops Keep Fallin'",
    artist: 'B.J. Thomas',
    codename: 'TAPE 06 // SPIDEY-2',
    src: '/raindrops keep falling on my head.mp3',
    visual: {
      src: '/raindrops_opt.mp4',
      type: 'video',
      alt: "Spider-Man 2 Raindrops scene",
    },
  },
  {
    id: 'bully-maguire',
    title: 'People Get Up and Drive',
    artist: 'James Brown',
    codename: 'TAPE 07 // BULLY MAGUIRE',
    src: '/bully-maguire.mp3',
    visual: {
      src: '/bully maguire_opt.mp4',
      type: 'video',
      alt: 'Bully Maguire street walk',
    },
  },
  {
    id: 'come-and-get-your-love',
    title: 'Come and Get Your Love',
    artist: 'Redbone',
    codename: 'TAPE 08 // GUARDIANS',
    src: '/Come and get your love.mp3',
    visual: {
      src: '/come-get-love_opt.mp4',
      type: 'video',
      alt: 'Guardians of the Galaxy opening scene',
    },
  },
  {
    id: 'im-amazing',
    title: "I'm Amazing",
    artist: 'Spider-Man',
    codename: 'TAPE 09 // AMAZING',
    src: '/im-amazing.mp3',
    visual: {
      src: '/im-amazing_opt.mp4',
      type: 'video',
      alt: "I'm Amazing Spider-Man scene",
    },
  },
];

class MusicEngine {
  private audio: HTMLAudioElement | null = null;
  private trackIndex = 0;
  private volume = 0.5;
  private listeners = new Set<(snapshot: PlaybackSnapshot) => void>();

  public subscribe(listener: (snapshot: PlaybackSnapshot) => void) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public select(trackIndex: number) {
    const audio = this.initialize();
    if (!audio) return;

    const normalizedIndex = this.normalizeIndex(trackIndex);
    if (normalizedIndex === this.trackIndex && audio.src) return;

    this.trackIndex = normalizedIndex;
    audio.pause();
    audio.src = encodeURI(MUSIC_TRACKS[normalizedIndex].src);
    audio.load();
    this.notify();
  }

  public async play(trackIndex = this.trackIndex) {
    const audio = this.initialize();
    if (!audio) return false;

    const normalizedIndex = this.normalizeIndex(trackIndex);
    const nextSource = encodeURI(MUSIC_TRACKS[normalizedIndex].src);

    if (normalizedIndex !== this.trackIndex || !audio.src) {
      this.trackIndex = normalizedIndex;
      audio.src = nextSource;
      audio.load();
    }

    try {
      await audio.play();
      this.notify();
      return true;
    } catch (error) {
      console.error('Music playback could not start', error);
      this.notify();
      return false;
    }
  }

  public pause() {
    this.audio?.pause();
    this.notify();
  }

  public async toggle(trackIndex = this.trackIndex) {
    const audio = this.initialize();
    if (!audio) return false;

    if (!audio.paused && !audio.ended) {
      audio.pause();
      this.notify();
      return false;
    }

    return this.play(trackIndex);
  }

  public setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.audio) this.audio.volume = this.volume;
    this.notify();
  }

  public getCurrentTime() {
    return this.audio?.currentTime || 0;
  }

  public seek(time: number) {
    if (!this.audio || !Number.isFinite(this.audio.duration)) return;
    this.audio.currentTime = Math.min(this.audio.duration, Math.max(0, time));
    this.notify();
  }

  public destroy() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.audio = null;
    this.listeners.clear();
  }

  private initialize() {
    if (typeof window === 'undefined') return null;
    if (this.audio) return this.audio;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = this.volume;
    audio.addEventListener('play', this.notify);
    audio.addEventListener('pause', this.notify);
    audio.addEventListener('timeupdate', this.notify);
    audio.addEventListener('loadedmetadata', this.notify);
    audio.addEventListener('durationchange', this.notify);
    audio.addEventListener('ended', this.handleEnded);
    audio.addEventListener('error', this.notify);
    this.audio = audio;
    return audio;
  }

  private handleEnded = () => {
    const nextIndex = this.normalizeIndex(this.trackIndex + 1);
    void this.play(nextIndex);
  };

  private notify = () => {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  };

  private getSnapshot(): PlaybackSnapshot {
    return {
      isPlaying: this.audio ? !this.audio.paused : false,
      currentTime: this.audio?.currentTime || 0,
      duration: Number.isFinite(this.audio?.duration) ? this.audio?.duration || 0 : 0,
      trackIndex: this.trackIndex,
      volume: this.volume,
    };
  }

  private normalizeIndex(trackIndex: number) {
    return (trackIndex + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  }
}

export const musicEngine = new MusicEngine();
