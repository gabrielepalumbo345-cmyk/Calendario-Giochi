import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { GameSession } from '../types';

interface CalendarGridProps {
  sessions: GameSession[];
  onSelectSession: (session: GameSession) => void;
  onProposeDate: (dateStr: string) => void;
  selectedGameFilter: string;
  onGameFilterChange: (game: string) => void;
  availableGames: string[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  sessions,
  onSelectSession,
  onProposeDate,
  selectedGameFilter,
  onGameFilterChange,
  availableGames,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  const weekDayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build grid calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek < 0) startingDayOfWeek = 6;

  const totalDaysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  interface CalendarCell {
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  const cells: CalendarCell[] = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, day);
    const dStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr: dStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr: dStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
    });
  }

  // Trailing next month days
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dateStr: dStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
    });
  }

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (!selectedGameFilter || selectedGameFilter === 'ALL') return true;
    return s.game.toLowerCase() === selectedGameFilter.toLowerCase();
  });

  // Map sessions by date
  const sessionsByDate: Record<string, GameSession[]> = {};
  filteredSessions.forEach((s) => {
    if (!sessionsByDate[s.date]) {
      sessionsByDate[s.date] = [];
    }
    sessionsByDate[s.date].push(s);
  });

  return (
    <div className="space-y-3">
      {/* Month Bar */}
      <div className="flex items-center justify-between bg-[#111726]/80 px-4 py-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            aria-label="Mese precedente"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            Oggi
          </button>
          <button
            onClick={nextMonth}
            aria-label="Mese successivo"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <h2 className="text-lg font-bold text-white ml-2">
            {monthNames[month]} <span className="text-indigo-400 font-mono">{year}</span>
          </h2>
        </div>

        {/* Filter if games exist */}
        {availableGames.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={selectedGameFilter}
              onChange={(e) => onGameFilterChange(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-900 text-white">Tutti i Giochi</option>
              {availableGames.map((game) => (
                <option key={game} value={game} className="bg-slate-900 text-white">
                  {game}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDayNames.map((name, index) => (
          <div
            key={name}
            className={`py-1.5 text-center text-xs font-bold uppercase tracking-wider ${
              index >= 5 ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Clean Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((cell) => {
          const daySessions = sessionsByDate[cell.dateStr] || [];

          return (
            <div
              key={cell.dateStr}
              onClick={() => onProposeDate(cell.dateStr)}
              className={`min-h-[90px] sm:min-h-[115px] p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between select-none ${
                !cell.isCurrentMonth
                  ? 'bg-[#0d111a]/30 border-slate-900/60 opacity-30 hover:opacity-60'
                  : cell.isToday
                  ? 'bg-indigo-950/20 border-indigo-500/60 shadow-sm'
                  : 'bg-[#111726]/60 border-slate-800/80 hover:border-indigo-500/60 hover:bg-[#151c2e]'
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold ${
                    cell.isToday
                      ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                      : cell.isCurrentMonth
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {cell.dayNumber}
                </span>
                {cell.isToday && (
                  <span className="text-[9px] uppercase font-bold text-indigo-400 hidden sm:inline">
                    Oggi
                  </span>
                )}
              </div>

              {/* Sessions inside day */}
              <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(session);
                    }}
                    className="p-1 rounded bg-slate-900 border border-slate-700/80 hover:border-indigo-400 text-left transition-colors"
                  >
                    <div className="text-[11px] font-bold text-white truncate">
                      {session.game}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>{session.time}</span>
                      <span className="text-indigo-300">
                        {session.voters.length} {session.voters.length === 1 ? 'voto' : 'voti'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discreet click hint if empty */}
              {daySessions.length === 0 && cell.isCurrentMonth && (
                <div className="text-[10px] text-slate-600 hover:text-slate-400 text-center transition-colors">
                  + clicca
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
