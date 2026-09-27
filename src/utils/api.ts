import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { GameSession, Voter } from '../types';

const SESSIONS_COLLECTION = 'sessions';
const STORAGE_KEY = 'blackout404_game_sessions';
const DISCORD_USER_KEY = 'blackout404_my_discord_name';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

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

// Subscribe to real-time updates from Firestore
export function subscribeToGameSessions(callback: (sessions: GameSession[]) => void): () => void {
  try {
    const colRef = collection(db, SESSIONS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: GameSession[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            creatorDiscord: data.creatorDiscord || '',
            date: data.date || '',
            time: data.time || '',
            game: data.game || '',
            createdAt: data.createdAt || new Date().toISOString(),
            voters: Array.isArray(data.voters) ? data.voters : [],
          });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, SESSIONS_COLLECTION);
        // Fallback to local storage if network has issue
        callback(getCachedSessions());
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SESSIONS_COLLECTION);
    callback(getCachedSessions());
    return () => {};
  }
}

function getCachedSessions(): GameSession[] {
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

export async function fetchGameSessions(): Promise<GameSession[]> {
  try {
    const colRef = collection(db, SESSIONS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const items: GameSession[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        creatorDiscord: data.creatorDiscord || '',
        date: data.date || '',
        time: data.time || '',
        game: data.game || '',
        createdAt: data.createdAt || new Date().toISOString(),
        voters: Array.isArray(data.voters) ? data.voters : [],
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, SESSIONS_COLLECTION);
    return getCachedSessions();
  }
}

export async function createGameSession(
  newSession: Omit<GameSession, 'id' | 'createdAt' | 'voters'>
): Promise<GameSession> {
  const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const sessionObj: GameSession = {
    ...newSession,
    id: sessionId,
    createdAt: now,
    voters: [
      {
        id: 'vote-' + Date.now(),
        name: newSession.creatorDiscord.trim(),
        type: 'yes',
        votedAt: now,
      },
    ],
  };

  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await setDoc(docRef, {
      creatorDiscord: sessionObj.creatorDiscord,
      date: sessionObj.date,
      time: sessionObj.time,
      game: sessionObj.game,
      createdAt: sessionObj.createdAt,
      voters: sessionObj.voters,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${SESSIONS_COLLECTION}/${sessionId}`);
  }

  // Update local cache
  const cached = getCachedSessions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cached, sessionObj]));

  return sessionObj;
}

export async function voteOnSession(
  sessionId: string,
  voterName: string,
  voteType: 'yes' | 'maybe' | 'interested'
): Promise<GameSession | null> {
  const cleanName = voterName.trim();
  const cached = getCachedSessions();
  const idx = cached.findIndex((s) => s.id === sessionId);

  let updatedSession: GameSession;

  if (idx >= 0) {
    const session = { ...cached[idx], voters: [...cached[idx].voters] };
    const existingIdx = session.voters.findIndex(
      (v) => v.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingIdx >= 0) {
      if (session.voters[existingIdx].type === voteType) {
        session.voters.splice(existingIdx, 1);
      } else {
        session.voters[existingIdx] = {
          ...session.voters[existingIdx],
          type: voteType,
          votedAt: new Date().toISOString(),
        };
      }
    } else {
      session.voters.push({
        id: 'vote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: cleanName,
        type: voteType,
        votedAt: new Date().toISOString(),
      });
    }

    updatedSession = session;
    cached[idx] = updatedSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } else {
    return null;
  }

  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await setDoc(
      docRef,
      {
        creatorDiscord: updatedSession.creatorDiscord,
        date: updatedSession.date,
        time: updatedSession.time,
        game: updatedSession.game,
        createdAt: updatedSession.createdAt,
        voters: updatedSession.voters,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SESSIONS_COLLECTION}/${sessionId}`);
  }

  return updatedSession;
}

export async function deleteGameSession(sessionId: string): Promise<boolean> {
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${SESSIONS_COLLECTION}/${sessionId}`);
  }

  const cached = getCachedSessions().filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  return true;
}
