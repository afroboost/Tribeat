/**
 * AudioEngine - Moteur Audio Web API
 * 
 * Gère la lecture audio synchronisée pour les sessions live.
 * Pilotable par événements temps réel.
 * 
 * Fonctionnalités:
 * - Lecture / Pause
 * - Seek (changement de position)
 * - Volume
 * - Synchronisation avec timecode serveur
 */

export interface AudioEngineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoaded: boolean;
  error: string | null;
}

export type AudioEngineCallback = (state: AudioEngineState) => void;

export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private callbacks: Set<AudioEngineCallback> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private _state: AudioEngineState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isLoaded: false,
    error: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupEventListeners();
    }
  }

  // ========================================
  // SETUP
  // ========================================

  private setupEventListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      this._state.duration = this.audio!.duration;
      this._state.isLoaded = true;
      this._state.error = null;
      this.notifyCallbacks();
    });

    this.audio.addEventListener('play', () => {
      this._state.isPlaying = true;
      this.startUpdateInterval();
      this.notifyCallbacks();
    });

    this.audio.addEventListener('pause', () => {
      this._state.isPlaying = false;
      this.stopUpdateInterval();
      this.notifyCallbacks();
    });

    this.audio.addEventListener('ended', () => {
      this._state.isPlaying = false;
      this._state.currentTime = this._state.duration;
      this.stopUpdateInterval();
      this.notifyCallbacks();
    });

    this.audio.addEventListener('error', (e) => {
      this._state.error = 'Erreur de chargement audio';
      this._state.isLoaded = false;
      console.error('[AudioEngine] Erreur:', e);
      this.notifyCallbacks();
    });

    this.audio.addEventListener('timeupdate', () => {
      this._state.currentTime = this.audio!.currentTime;
    });
  }

  private startUpdateInterval() {
    this.stopUpdateInterval();
    // Update UI toutes les 100ms pour une progression fluide
    this.updateInterval = setInterval(() => {
      if (this.audio) {
        this._state.currentTime = this.audio.currentTime;
        this.notifyCallbacks();
      }
    }, 100);
  }

  private stopUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // ========================================
  // PUBLIC API
  // ========================================

  /**
   * Charge une source audio
   */
  load(url: string): void {
    if (!this.audio) return;
    
    this._state.isLoaded = false;
    this._state.error = null;
    this._state.currentTime = 0;
    this._state.duration = 0;
    
    this.audio.src = url;
    this.audio.load();
    this.notifyCallbacks();
  }

  /**
   * Démarre la lecture
   */
  async play(): Promise<void> {
    if (!this.audio || !this._state.isLoaded) return;
    
    try {
      await this.audio.play();
    } catch (error) {
      console.error('[AudioEngine] Erreur play:', error);
      this._state.error = 'Impossible de démarrer la lecture';
      this.notifyCallbacks();
    }
  }

  /**
   * Met en pause
   */
  pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  /**
   * Change la position de lecture
   */
  seek(time: number): void {
    if (!this.audio || !this._state.isLoaded) return;
    
    const clampedTime = Math.max(0, Math.min(time, this._state.duration));
    this.audio.currentTime = clampedTime;
    this._state.currentTime = clampedTime;
    this.notifyCallbacks();
  }

  /**
   * Change le volume (0-100)
   */
  setVolume(volume: number): void {
    if (!this.audio) return;
    
    const clampedVolume = Math.max(0, Math.min(100, volume));
    this.audio.volume = clampedVolume / 100;
    this._state.volume = clampedVolume;
    this.notifyCallbacks();
  }

  /**
   * Synchronise avec un état distant (serveur/coach)
   * Utilisé pour les participants qui rejoignent en cours
   */
  syncWithRemote(remoteTime: number, isPlaying: boolean, serverTimestamp: number): void {
    if (!this.audio || !this._state.isLoaded) return;
    
    // Calcul du décalage réseau
    const now = Date.now();
    const latency = (now - serverTimestamp) / 1000; // En secondes
    
    // Position corrigée avec latence
    const correctedTime = isPlaying ? remoteTime + latency : remoteTime;
    
    // Ne sync que si la différence est significative (> 500ms)
    const timeDiff = Math.abs(this.audio.currentTime - correctedTime);
    if (timeDiff > 0.5) {
      this.seek(correctedTime);
    }
    
    // Sync état play/pause
    if (isPlaying && this.audio.paused) {
      this.play();
    } else if (!isPlaying && !this.audio.paused) {
      this.pause();
    }
  }

  /**
   * Retourne l'état actuel
   */
  get state(): AudioEngineState {
    return { ...this._state };
  }

  /**
   * S'abonne aux changements d'état
   */
  subscribe(callback: AudioEngineCallback): () => void {
    this.callbacks.add(callback);
    // Envoi immédiat de l'état actuel
    callback(this.state);
    
    // Retourne la fonction de désabonnement
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notifie tous les abonnés
   */
  private notifyCallbacks(): void {
    const state = this.state;
    this.callbacks.forEach(cb => cb(state));
  }

  /**
   * Nettoyage
   */
  destroy(): void {
    this.stopUpdateInterval();
    this.callbacks.clear();
    
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}

// Singleton pour l'application
let _audioEngine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (typeof window === 'undefined') {
    throw new Error('AudioEngine ne peut être utilisé que côté client');
  }
  
  if (!_audioEngine) {
    _audioEngine = new AudioEngine();
  }
  
  return _audioEngine;
}
