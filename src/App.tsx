/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CalendarGrid } from './components/CalendarGrid';
import { NewSessionModal } from './components/NewSessionModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { GameSession } from './types';
import {
  subscribeToGameSessions,
  createGameSession,
  voteOnSession,
  deleteGameSession,
  getSavedDiscordName,
} from './utils/api';
import { testFirestoreConnection } from './firebase';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameFilter, setSelectedGameFilter] = useState('ALL');
  const [myDiscordName, setMyDiscordName] = useState(() => getSavedDiscordName());

  // Modals state
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [selectedDateForNew, setSelectedDateForNew] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<GameSession | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Listen in real-time to Firestore sessions
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToGameSessions((updatedSessions) => {
      setSessions(updatedSessions);
      setIsLoading(false);

      // Keep detail modal synced if open
      setSelectedSessionForDetail((curr) => {
        if (!curr) return null;
        return updatedSessions.find((s) => s.id === curr.id) || null;
      });
    });

    return () => unsubscribe();
  }, []);

  // Handle clicking on a calendar day
  const handleProposeDate = (dateStr: string) => {
    setSelectedDateForNew(dateStr);
    setIsNewSessionModalOpen(true);
  };

  // Handle creating a new session
  const handleCreateSession = async (sessionData: {
    creatorDiscord: string;
    date: string;
    time: string;
    game: string;
  }) => {
    try {
      const created = await createGameSession(sessionData);
      setSessions((prev) => {
        if (prev.some((s) => s.id === created.id)) return prev;
        return [...prev, created];
      });
      showToast(`Partita a ${created.game} pubblicata!`);
    } catch (err) {
      console.error('Failed to create session:', err);
      showToast('Errore durante la creazione della sessione.');
    }
  };

  // Handle voting on a session
  const handleVote = async (
    sessionId: string,
    voterName: string,
    voteType: 'yes' | 'maybe' | 'interested'
  ) => {
    try {
      const updated = await voteOnSession(sessionId, voterName, voteType);
      if (updated) {
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
        if (selectedSessionForDetail?.id === sessionId) {
          setSelectedSessionForDetail(updated);
        }
        showToast(`Voto registrato per @${voterName}!`);
      }
    } catch (err) {
      console.error('Failed to cast vote:', err);
      showToast('Errore durante la registrazione del voto.');
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteGameSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSelectedSessionForDetail(null);
      showToast('Sessione rimossa.');
    } catch (err) {
      console.error('Failed to delete session:', err);
      showToast('Errore durante la rimozione della sessione.');
    }
  };

  // Calculate unique games for filter dropdown
  const availableGames = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => set.add(s.game));
    return Array.from(set).sort();
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-xl border border-indigo-400 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenNewSession={() => {
          const today = new Date();
          setSelectedDateForNew(
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
          );
          setIsNewSessionModalOpen(true);
        }}
      />

      {/* Main Content Area: Focused pure interactive calendar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Caricamento calendario da Firebase Firestore...</p>
          </div>
        ) : (
          <CalendarGrid
            sessions={sessions}
            onSelectSession={(session) => setSelectedSessionForDetail(session)}
            onProposeDate={handleProposeDate}
            selectedGameFilter={selectedGameFilter}
            onGameFilterChange={setSelectedGameFilter}
            availableGames={availableGames}
          />
        )}
      </main>

      {/* Proponi Gioco Modal (Searchable games dropdown, name, date, time) */}
      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onSubmit={handleCreateSession}
        initialDate={selectedDateForNew}
        myDiscordName={myDiscordName}
        onUpdateDiscordName={setMyDiscordName}
      />

      {/* Dettagli e Votazione Sessione Modal */}
      <SessionDetailModal
        session={selectedSessionForDetail}
        isOpen={Boolean(selectedSessionForDetail)}
        onClose={() => setSelectedSessionForDetail(null)}
        onVote={handleVote}
        onDelete={handleDeleteSession}
        myDiscordName={myDiscordName}
        onUpdateDiscordName={setMyDiscordName}
      />
    </div>
  );
}
