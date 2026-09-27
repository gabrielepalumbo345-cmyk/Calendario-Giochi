import React, { useState } from 'react';
import { Plus, Gamepad2, ShieldCheck, Check, KeyRound, X, Copy } from 'lucide-react';

interface HeaderProps {
  onOpenNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewSession,
}) => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === '1234') {
      setIsAdminAuthenticated(true);
      setPinError(false);
      // Automatically copy link once verified
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
    } else {
      setPinError(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleCloseModal = () => {
    setIsAdminModalOpen(false);
    setAdminPin('');
    setPinError(false);
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-[#0d111a]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/src/assets/images/85D16C61-FB03-448D-8E7C-F488E2101FB7.png"
                alt="BlackOut404 Logo"
                className="w-full h-full object-cover rounded-[10px]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <Gamepad2 className="w-5 h-5 text-indigo-400 hidden fallback-icon" />
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                CALENDARIO GIOCHI BlackOut404
              </h1>
              <p className="text-[11px] text-slate-400">
                Community Discord · Voti pubblici per tutti
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Discord Share Button (Protected by PIN 1234) */}
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  handleCopyLink();
                } else {
                  setIsAdminModalOpen(true);
                }
              }}
              title="Condividi link su Discord (Riservato Admin - Codice 1234)"
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isAdminAuthenticated
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700 hover:bg-emerald-900/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiato!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isAdminAuthenticated ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <span className="hidden sm:inline">Condividi Link (Admin)</span>
                  <span className="sm:hidden">Admin</span>
                </>
              )}
            </button>

            {/* Proponi Gioco */}
            <button
              onClick={onOpenNewSession}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Proponi Gioco</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Verification Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
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
                  <h3 className="text-base font-bold text-white">Accesso Admin Discord</h3>
                  <p className="text-xs text-slate-400">Condivisione riservata agli amministratori</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAdminAuthenticated ? (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Inserisci il Codice Admin
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Codice numerico"
                    autoFocus
                    className="w-full text-center tracking-widest font-mono text-lg px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {pinError && (
                    <p className="text-xs text-rose-400 mt-1.5 text-center font-medium">
                      ❌ Codice errato! Solo gli admin possono condividere il link.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Verifica Codice
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Autorizzato come Admin</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Il link del calendario è pronto per essere incollato su Discord!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>{linkCopied ? 'Link Ricopiato!' : 'Copia Link Calendario'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
