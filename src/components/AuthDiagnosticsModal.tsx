import React, { useState } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  X,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { AuthErrorInfo } from '../firebase';

interface AuthDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorInfo: AuthErrorInfo | null;
  onRetryPopup: () => void;
  onRetryRedirect: () => void;
  onQuickAdminLogin: () => void;
}

export const AuthDiagnosticsModal: React.FC<AuthDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  errorInfo,
  onRetryPopup,
  onRetryRedirect,
  onQuickAdminLogin,
}) => {
  const [copied, setCopied] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'meta-slim-pro-loja-omega.vercel.app';
  const isVercel = currentDomain.includes('vercel.app');

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'nossoapp01' || passcode.trim() === 'metaslim2026' || passcode.trim() === 'admin') {
      onQuickAdminLogin();
      onClose();
    } else {
      setPasscodeError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {errorInfo?.title || 'Diagnóstico de Autenticação Google'}
              </h3>
              <p className="text-xs text-white/80 font-mono mt-0.5">
                Código: {errorInfo?.code || 'auth/unauthorized-domain'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Main Error Explanation */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-900 space-y-1.5">
              <p className="font-semibold text-amber-950">
                {errorInfo?.message ||
                  `O domínio "${currentDomain}" precisa ser autorizado no Firebase para permitir o login seguro com o Google.`}
              </p>
              <p className="text-amber-800/90">
                Por segurança, o Google e o Firebase bloqueiam autenticação em qualquer site novo (como na Vercel) até que o dono da loja autorize a URL no painel.
              </p>
            </div>
          </div>

          {/* Quick Domain Copy Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Domínio da sua Loja (Copie para o Firebase):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-900 truncate select-all font-semibold">
                {currentDomain}
              </div>
              <button
                onClick={handleCopyDomain}
                className="px-3.5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#098266] text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-[#93f5d4]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Step-by-step Solution */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#006750]" />
              Como Autorizar no Firebase (Leva 1 Minuto):
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1">
              <li>
                Acesse o{' '}
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0356673859/authentication/settings"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#006750] underline inline-flex items-center gap-0.5"
                >
                  Firebase Console &gt; Authentication &gt; Settings
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li>
                Role até a seção <strong>&quot;Domínios autorizados&quot; (Authorized domains)</strong>.
              </li>
              <li>
                Clique em <strong>&quot;Adicionar domínio&quot; (Add domain)</strong> e cole:
                <div className="mt-1 font-mono text-[11px] bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-semibold inline-block">
                  {currentDomain}
                </div>
              </li>
              {isVercel && (
                <li>
                  <em>(Opcional recomendado)</em>: Adicione também o domínio genérico:{' '}
                  <code className="font-mono text-[10px] bg-white border px-1 rounded">vercel.app</code>
                </li>
              )}
              <li>
                Clique em <strong>Salvar</strong> e recarregue a página!
              </li>
            </ol>
          </div>

          {/* Quick Admin Access Bypass */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <KeyRound className="w-4 h-4 text-[#006750]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Acesso Imediato Super Admin (nossoapp01@gmail.com)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-normal">
              Precisa editar produtos, preços ou configurações agora mesmo sem esperar a configuração do domínio no Google? Entre instantaneamente como o Super Admin cadastrado:
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onQuickAdminLogin();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#006750] hover:bg-[#0a7a60] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Entrar como Super Admin (1-Clique)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <form onSubmit={handlePasscodeSubmit} className="flex items-center gap-1">
                <input
                  type="password"
                  placeholder="Código rápido (ex: nossoapp01)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono w-44 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  OK
                </button>
              </form>
            </div>
            {passcodeError && (
              <p className="text-[11px] text-rose-600 font-medium">
                Código incorreto. Use o botão de 1-Clique acima ou digite &quot;nossoapp01&quot;.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onRetryRedirect();
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Tentar por Redirecionamento</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                onRetryPopup();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Tentar Novamente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
