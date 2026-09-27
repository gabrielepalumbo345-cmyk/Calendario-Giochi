import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

export interface Voter {
  id: string;
  name: string;
  type: 'yes' | 'maybe' | 'interested';
  votedAt: string;
}

export interface GameSession {
  id: string;
  creatorDiscord: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "21:30"
  game: string;
  createdAt: string;
  voters: Voter[];
}

const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readSessions(): GameSession[] {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      const initial: GameSession[] = [];
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data) as GameSession[];
  } catch (err) {
    console.error('Error reading sessions file:', err);
    return [];
  }
}

function writeSessions(sessions: GameSession[]): void {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing sessions file:', err);
  }
}

// API Routes
app.get('/api/sessions', (_req: Request, res: Response) => {
  const sessions = readSessions();
  res.json({ success: true, sessions });
});

app.post('/api/sessions', (req: Request, res: Response) => {
  const { creatorDiscord, date, time, game } = req.body;

  if (!creatorDiscord || !date || !time || !game) {
    return res.status(400).json({
      success: false,
      error: 'Campi obbligatori mancanti: Nome Discord, data, orario e gioco.',
    });
  }

  const sessions = readSessions();
  const cleanCreator = creatorDiscord.trim();
  const cleanGame = game.trim();

  const newSession: GameSession = {
    id: 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    creatorDiscord: cleanCreator,
    date,
    time: time.trim(),
    game: cleanGame,
    createdAt: new Date().toISOString(),
    voters: [
      {
        id: 'vote-' + Date.now(),
        name: cleanCreator,
        type: 'yes',
        votedAt: new Date().toISOString(),
      },
    ],
  };

  sessions.push(newSession);
  writeSessions(sessions);

  res.status(201).json({ success: true, session: newSession });
});

app.post('/api/sessions/:id/vote', (req: Request, res: Response) => {
  const { id } = req.params;
  const { voterName, voteType } = req.body;

  if (!voterName || !voterName.trim()) {
    return res.status(400).json({ success: false, error: 'Nome Discord obbligatorio per votare.' });
  }

  const cleanName = voterName.trim();
  const validVoteType: 'yes' | 'maybe' | 'interested' = ['yes', 'maybe', 'interested'].includes(voteType)
    ? voteType
    : 'yes';

  const sessions = readSessions();
  const sessionIndex = sessions.findIndex((s) => s.id === id);

  if (sessionIndex === -1) {
    return res.status(404).json({ success: false, error: 'Sessione di gioco non trovata.' });
  }

  const session = sessions[sessionIndex];
  const existingVoteIndex = session.voters.findIndex(
    (v) => v.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (existingVoteIndex >= 0) {
    if (session.voters[existingVoteIndex].type === validVoteType) {
      session.voters.splice(existingVoteIndex, 1);
    } else {
      session.voters[existingVoteIndex].type = validVoteType;
      session.voters[existingVoteIndex].votedAt = new Date().toISOString();
    }
  } else {
    session.voters.push({
      id: 'vote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      type: validVoteType,
      votedAt: new Date().toISOString(),
    });
  }

  sessions[sessionIndex] = session;
  writeSessions(sessions);

  res.json({ success: true, session });
});

app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sessions = readSessions();
  const filtered = sessions.filter((s) => s.id !== id);

  if (filtered.length === sessions.length) {
    return res.status(404).json({ success: false, error: 'Sessione non trovata.' });
  }

  writeSessions(filtered);
  res.json({ success: true, message: 'Sessione eliminata con successo.' });
});

// Clear dummy sessions file if it exists so calendar has no preset examples
try {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
} catch (e) {
  // ignore
}

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CALENDARIO GIOCHI BlackOut404 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
