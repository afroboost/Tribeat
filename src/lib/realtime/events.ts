/**
 * Événements Temps Réel - Définition des types
 * 
 * CHANNEL FORMAT: presence-session-{sessionId}
 * 
 * EVENTS:
 * - session:state       → État complet de la session (pour nouveaux arrivants)
 * - session:play        → Coach démarre lecture
 * - session:pause       → Coach met en pause
 * - session:seek        → Coach change le timecode
 * - session:volume      → Coach change le volume global
 * - session:end         → Coach termine la session
 * - participant:joined  → Nouveau participant
 * - participant:left    → Participant parti
 */

// ========================================
// TYPES D'ÉVÉNEMENTS
// ========================================

export const SESSION_EVENTS = {
  // État session
  STATE: 'session:state',
  PLAY: 'session:play',
  PAUSE: 'session:pause',
  SEEK: 'session:seek',
  VOLUME: 'session:volume',
  END: 'session:end',
  
  // Participants
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',
  PARTICIPANT_COUNT: 'participant:count',
} as const;

// ========================================
// PAYLOADS
// ========================================

export interface SessionState {
  sessionId: string;
  status: 'LIVE' | 'PAUSED' | 'ENDED';
  isPlaying: boolean;
  currentTime: number;      // En secondes
  volume: number;           // 0-100
  mediaUrl: string | null;
  coachId: string;
  timestamp: number;        // Pour sync précis
}

export interface PlayEvent {
  sessionId: string;
  currentTime: number;
  timestamp: number;
}

export interface PauseEvent {
  sessionId: string;
  currentTime: number;
  timestamp: number;
}

export interface SeekEvent {
  sessionId: string;
  currentTime: number;
  timestamp: number;
}

export interface VolumeEvent {
  sessionId: string;
  volume: number;
}

export interface ParticipantEvent {
  sessionId: string;
  userId: string;
  userName: string;
  count: number;
}

// ========================================
// CHANNEL HELPERS
// ========================================

/**
 * Génère le nom du channel Pusher pour une session
 * Format: presence-session-{id}
 * "presence-" permet de tracker les participants connectés
 */
export function getSessionChannelName(sessionId: string): string {
  return `presence-session-${sessionId}`;
}

/**
 * Extrait l'ID de session depuis le nom du channel
 */
export function getSessionIdFromChannel(channelName: string): string | null {
  const match = channelName.match(/^presence-session-(.+)$/);
  return match ? match[1] : null;
}
