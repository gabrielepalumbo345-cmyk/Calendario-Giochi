import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Gamepad2, Search, Check } from 'lucide-react';
import { POPULAR_GAME_NAMES } from '../types';
import { saveDiscordName } from '../utils/api';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: {
    creatorDiscord: string;
    date: string;
    time: string;
    game: string;
  }) => void;
  initialDate?: string;
  myDiscordName: string;
  onUpdateDiscordName: (name: string) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  myDiscordName,
  onUpdateDiscordName,
}) => {
  const [discordName, setDiscordName] = useState(myDiscordName || '');
  const [date, setDate] = useState(initialDate || '2026-09-26');
  const [time, setTime] = useState('21:00');
  const [gameSearch, setGameSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    if (myDiscordName) {
      setDiscordName(myDiscordName);
    }
  }, [myDiscordName]);

  // Handle clicking outside of dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter games based on search input
  const filteredGames = POPULAR_GAME_NAMES.filter((g) =>
    g.toLowerCase().includes(gameSearch.toLowerCase().trim())
  );

  const handleSelectGame = (gameName: string) => {
    setGameSearch(gameName);
    setIsDropdownOpen(false);
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDiscordName = discordName.trim();
    const finalGame = gameSearch.trim();

    if (!finalDiscordName) {
      setErrorMsg('Inserisci il tuo Nome Discord.');
      return;
    }
    if (!date) {
      setErrorMsg('Seleziona una data.');
      return;
    }
    if (!time) {
      setErrorMsg('Inserisci l\'orario.');
      return;
    }
    if (!finalGame) {
      setErrorMsg('Scrivi o seleziona a che gioco giocare.');
      return;
    }

    saveDiscordName(finalDiscordName);
    onUpdateDiscordName(finalDiscordName);

    onSubmit({
      creatorDiscord: finalDiscordName,
      date,
      time,
      game: finalGame,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Proponi Gioco
              </h3>
              <p className="text-xs text-slate-400">
                Inserisci il tuo nome Discord, l'orario e il gioco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Nome Discord */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nome Discord
            </label>
            <input
              type="text"
              value={discordName}
              onChange={(e) => {
                setDiscordName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Es. IlTuoNick o Nickname#1234"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Data e Orario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Data</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Orario</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Gioco con menu a tendina e ricerca testuale */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Che Gioco Giocare</span>
              </span>
              <span className="text-[11px] text-slate-500 lowercase">
                cerca o scrivi
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={gameSearch}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setGameSearch(e.target.value);
                  setIsDropdownOpen(true);
                  setErrorMsg('');
                }}
                placeholder="Cerca o scrivi il nome del gioco..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Menu a tendina dei giochi filtrabile */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-30 py-1 divide-y divide-slate-800/80">
                {filteredGames.length > 0 ? (
                  filteredGames.map((gameName) => {
                    const isSelected = gameSearch.toLowerCase() === gameName.toLowerCase();
                    return (
                      <button
                        key={gameName}
                        type="button"
                        onClick={() => handleSelectGame(gameName)}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between hover:bg-indigo-950/50 hover:text-white cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/60 text-indigo-300 font-semibold'
                            : 'text-slate-300'
                        }`}
                      >
                        <span>{gameName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    Nessun gioco suggerito. Premi Salva per usare <strong className="text-white font-medium">"{gameSearch}"</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Pubblica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
