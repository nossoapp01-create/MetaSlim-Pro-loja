import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface PWAInstallPromptProps {
  variant?: 'button' | 'banner' | 'pill';
  title?: string;
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  variant = 'button',
  title = 'Baixar App no Celular',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed in standalone mode, don't show
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // Show guided instructions for iOS or desktop
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'pill' ? (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
          title="Instalar aplicativo na tela do celular"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{title}</span>
        </button>
      ) : variant === 'banner' ? (
        <div
          className={`bg-gradient-to-r from-[#008069] to-[#075e54] text-white p-3 sm:p-4 rounded-2xl shadow-lg border border-emerald-500/40 flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center p-1.5 shrink-0 border border-white/30">
              <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm">Aplicativo no seu Celular</span>
                <span className="bg-[#25d366] text-[#003816] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  App
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 leading-tight mt-0.5">
                Instale direto na tela de início para acesso rápido e notificações exclusivas.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#008069] font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 shadow-xs transition-all active:scale-95 cursor-pointer ${className}`}
          title="Baixar e adicionar o aplicativo à tela inicial do celular"
        >
          <Download className="w-4 h-4 text-emerald-300" />
          <span>{installSuccess ? 'Instalado!' : title}</span>
        </button>
      )}

      {/* Guided Installation Modal (for iOS Safari or manual installation) */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 relative animate-in zoom-in-95 duration-200 font-sans">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with App Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00a884] to-[#25d366] p-2 shadow-xl shadow-emerald-600/30 mb-3 flex items-center justify-center">
                <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
              </div>

              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1">
                Instalação no Celular
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                Instalar Aplicativo Oficial
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Tenha o ícone oficial na tela inicial do seu celular, com abertura rápida e notificações.
              </p>
            </div>

            {/* Steps Instructions */}
            <div className="mt-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      No navegador <strong>Safari</strong> do iPhone, toque no botão <strong>Compartilhar</strong>{' '}
                      <Share className="w-3.5 h-3.5 inline text-blue-600 align-middle" /> na barra inferior.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Role para baixo e selecione a opção <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 align-middle" />.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Toque em <strong>&ldquo;Adicionar&rdquo;</strong> no canto superior direito. Pronto! O app fica instalado no seu celular.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      No Chrome ou navegador do seu celular, toque nos <strong>3 pontinhos</strong> do menu no topo.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Escolha a opção <strong>&ldquo;Instalar Aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à Tela Inicial&rdquo;</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      Confirme em <strong>&ldquo;Instalar&rdquo;</strong>. O ícone oficial do App será colocado na tela de início.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl bg-[#008069] hover:bg-[#006e5a] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Entendi</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
