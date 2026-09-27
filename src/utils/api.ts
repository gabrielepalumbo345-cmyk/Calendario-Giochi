import { GameSession } from '../types';

const STORAGE_KEY = 'blackout404_game_sessions';
const DISCORD_USER_KEY = 'blackout404_my_discord_name';

export function getSavedDiscordName(): string {
  try {
    return localStorage.getItem(DISCORD_USER_KEY) || '';
  } catch {
    return '';
  }
}

export function saveDiscordName(name: string): void {
  try {
    localStorage.setItem(DISCORD_USER_KEY, name.trim());
  } catch {
    // ignore
  }
}

export async function fetchGameSessions(): Promise<GameSession[]> {
  try {
    const res = await fetch('/api/sessions');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.sessions));
        return data.sessions;
      }
    }
  } catch (err) {
    console.warn('Backend fetch failed, using local storage cache:', err);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }

  return [];
}

export async function createGameSession(newSession: Omit<GameSession, 'id' | 'createdAt' | 'voters'>): Promise<GameSession> {
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.session) {
        return data.session;
      }
    }
  } catch (err) {
    console.warn('Backend create failed, fallback to local storage:', err);
  }

  // Client-side fallback creation
  const created: GameSession = {
    ...newSession,
    id: 'local-' + Date.now(),
    createdAt: new Date().toISOString(),
    voters: [
      {
        id: 'vote-' + Date.now(),
        name: newSession.creatorDiscord,
        type: 'yes',
        votedAt: new Date().toISOString(),
      },
    ],
  };

  const stored = await fetchGameSessions();
  const updated = [...stored, created];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return created;
}

export async function voteOnSession(
  sessionId: string,
  voterName: string,
  voteType: 'yes' | 'maybe' | 'interested'
): Promise<GameSession | null> {
  try {
    const res = await fetch(`/api/sessions/${sessionId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterName, voteType }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.session) {
        return data.session;
      }
    }
  } catch (err) {
    console.warn('Backend vote failed, fallback to local storage:', err);
  }

  // Client-side fallback
  const sessions = await fetchGameSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return null;

  const session = { ...sessions[idx], voters: [...sessions[idx].voters] };
  const existingVoteIdx = session.voters.findIndex(
    (v) => v.name.toLowerCase() === voterName.trim().toLowerCase()
  );

  if (existingVoteIdx >= 0) {
    if (session.voters[existingVoteIdx].type === voteType) {
      session.voters.splice(existingVoteIdx, 1);
    } else {
      session.voters[existingVoteIdx] = {
        ...session.voters[existingVoteIdx],
        type: voteType,
        votedAt: new Date().toISOString(),
      };
    }
  } else {
    session.voters.push({
      id: 'vote-' + Date.now(),
      name: voterName.trim(),
      type: voteType,
      votedAt: new Date().toISOString(),
    });
  }

  sessions[idx] = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return session;
}

export async function deleteGameSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Backend delete failed, fallback to local storage:', err);
  }

  const sessions = await fetchGameSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
