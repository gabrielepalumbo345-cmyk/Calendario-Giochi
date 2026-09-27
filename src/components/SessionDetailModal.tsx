import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Gamepad2,
  CheckCircle2,
  Trash2,
  KeyRound,
  ShieldCheck,
  Share2,
  Check,
} from 'lucide-react';
import { GameSession } from '../types';
import { saveDiscordName } from '../utils/api';

interface SessionDetailModalProps {
  session: GameSession | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (sessionId: string, voterName: string, voteType: 'yes' | 'maybe' | 'interested') => void;
  onDelete: (sessionId: string) => void;
  myDiscordName: string;
  onUpdateDiscordName: (name: string) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onVote,
  onDelete,
  myDiscordName,
  onUpdateDiscordName,
}) => {
  const [voterNameInput, setVoterNameInput] = useState(myDiscordName || '');
  const [nameError, setNameError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Admin share state for this session
  const [showAdminShareModal, setShowAdminShareModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !session) return null;

  const dateObj = new Date(`${session.date}T00:00:00`);
  const formattedDate = dateObj.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hasVoted = session.voters.some(
    (v) => v.name.toLowerCase() === (myDiscordName || voterNameInput).trim().toLowerCase()
  );

  const handleVoteToggle = () => {
    const finalName = voterNameInput.trim();
    if (!finalName) {
      setNameError('Scrivi il tuo Nome Discord per votare!');
      return;
    }
    setNameError('');
    saveDiscordName(finalName);
    onUpdateDiscordName(finalName);
    onVote(session.id, finalName, 'yes');
  };

  const copySessionDiscordPost = () => {
    const voterList =
      session.voters.length > 0
        ? session.voters.map((v) => `@${v.name}`).join(', ')
        : 'Nessun voto ancora';

    const text = `🎮 **CALENDARIO GIOCHI BlackOut404**\n🕹️ **Gioco:** ${session.game}\n📅 **Data:** ${formattedDate}\n⏰ **Orario:** ${session.time}\n👑 **Proposto da:** @${session.creatorDiscord}\n🗳️ **Voti Pubblici (${session.voters.length}):** ${voterList}\n\n👉 Vota anche tu sul calendario: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === '1234') {
      setIsAdminAuth(true);
      setAdminPinError(false);
      copySessionDiscordPost();
    } else {
      setAdminPinError(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div
          className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-400 font-semibold">
                Proposto da @{session.creatorDiscord}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {session.game}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="capitalize">{formattedDate}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{session.time}</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voting & Participants */}
          <div className="p-6 space-y-5">
            {/* Vote section */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                Vota questa partita (Voti pubblici):
              </label>
              <input
                type="text"
                value={voterNameInput}
                onChange={(e) => {
                  setVoterNameInput(e.target.value);
                  setNameError('');
                }}
                placeholder="Tuo Nome Discord..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              {nameError && (
                <p className="text-xs text-rose-400">{nameError}</p>
              )}

              <button
                type="button"
                onClick={handleVoteToggle}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  hasVoted
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {hasVoted ? 'Hai Votato! (Clicca per annullare)' : 'Vota Partita (Ci sono / Mi interessa)'}
                </span>
              </button>
            </div>

            {/* List of who voted - Always 100% public */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Voti Pubblici della Community ({session.voters.length})
                </h4>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Visibile a tutti
                </span>
              </div>

              {session.voters.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 italic">Nessun voto ancora espresso. Sii il primo a votare!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {session.voters.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-semibold truncate">@{v.name}</span>
                      {v.name.toLowerCase() === session.creatorDiscord.toLowerCase() && (
                        <span className="text-[9px] text-indigo-400 font-mono shrink-0 ml-auto">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {/* Admin Discord Share Button */}
              <button
                type="button"
                onClick={() => {
                  if (isAdminAuth) {
                    copySessionDiscordPost();
                  } else {
                    setShowAdminShareModal(true);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Post Copiato!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Condividi su Discord (Admin)</span>
                  </>
                )}
              </button>

              {showConfirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(session.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Conferma elimina
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Elimina</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin verification modal for sharing to discord */}
      {showAdminShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div
            className="relative w-full max-w-sm bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Admin BlackOut404</h3>
                  <p className="text-xs text-slate-400">Condivisione riservata agli amministratori</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminShareModal(false);
                  setAdminPin('');
                  setAdminPinError(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Codice Admin
                </label>
                <input
                  type="password"
                  maxLength={10}
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setAdminPinError(false);
                  }}
                  placeholder="Inserisci codice (es. 1234)"
                  autoFocus
                  className="w-full text-center tracking-widest font-mono text-lg px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {adminPinError && (
                  <p className="text-xs text-rose-400 mt-1.5 text-center font-medium">
                    ❌ Codice errato! Solo gli admin possono condividere il post.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminShareModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                >
                  Sblocca e Copia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
