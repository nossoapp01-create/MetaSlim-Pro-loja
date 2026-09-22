import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Lock,
  Mail,
  User,
  Store,
  Phone,
  ShieldCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  X,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SaaSAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: 'login' | 'register' | 'demo';
}

export const SaaSAuthModal: React.FC<SaaSAuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab,
}) => {
  const {
    currentTenant,
    allTenants,
    switchTenant,
    loginTenantWithPassword,
    createTenantStore,
    resetTenantPassword,
    loginWithGoogle,
    quickAdminLogin,
    setActiveTab,
    showToast,
    authModalOpen,
    setAuthModalOpen,
    authModalDefaultTab,
  } = useStore();

  const isModalOpen = isOpen !== undefined ? isOpen : authModalOpen;
  const handleClose = onClose || (() => setAuthModalOpen(false));

  const [tab, setTab] = useState<'login' | 'register' | 'demo'>(
    defaultTab || authModalDefaultTab || 'login'
  );

  React.useEffect(() => {
    if (authModalDefaultTab) {
      setTab(authModalDefaultTab);
    }
  }, [authModalDefaultTab]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  if (!isModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Preencha seu e-mail e senha');
      return;
    }
    setLoading(true);
    const res = await loginTenantWithPassword(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      handleClose();
      setActiveTab('admin');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regStoreName.trim() || !regEmail.trim() || !regPassword) {
      showToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    if (regPassword.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    const res = await createTenantStore(regStoreName, regName, regEmail, regPassword, regPhone);
    setLoading(false);
    if (res.success) {
      handleClose();
      setActiveTab('admin');
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail.trim()) {
      showToast('Digite seu e-mail no campo acima para recuperar a senha');
      return;
    }
    setLoading(true);
    const res = await resetTenantPassword(loginEmail);
    setLoading(false);
    if (res.success) {
      setShowForgotPass(false);
    }
  };

  const handleSelectDemoTenant = (tenantId: string) => {
    switchTenant(tenantId);
    handleClose();
    setActiveTab('admin');
  };

  return (
    <div
      id="saas-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="saas-auth-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-6 py-5 text-white relative">
          <button
            id="close-saas-auth-modal-btn"
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              SaaS Multi-Tenant Seguro
            </span>
            <span className="text-[11px] text-slate-300 font-mono">Isolamento Total</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            Portal de Acesso Lojista & Clínicas
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Cada cliente possui seu próprio login, senha, catálogo e painel administrativo exclusivo.
          </p>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 border-b border-white/10 pb-0">
            <button
              id="tab-saas-login-btn"
              onClick={() => {
                setTab('login');
                setShowForgotPass(false);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border-t-2 border-emerald-500'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Entrar (Login)
            </button>
            <button
              id="tab-saas-register-btn"
              onClick={() => {
                setTab('register');
                setShowForgotPass(false);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm border-t-2 border-emerald-500'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Criar Nova Loja SaaS
            </button>
            <button
              id="tab-saas-demo-btn"
              onClick={() => {
                setTab('demo');
                setShowForgotPass(false);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
                tab === 'demo'
                  ? 'bg-white text-slate-900 shadow-sm border-t-2 border-emerald-500'
                  : 'text-emerald-300 hover:text-emerald-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Alternar Lojas Demo
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail do Administrador / Lojista
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="saas-login-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@clinica.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPass(!showForgotPass)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="saas-login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {showForgotPass && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <p className="text-slate-600">
                    Insira seu e-mail cadastrado acima e clique abaixo para enviarmos as instruções de redefinição de senha:
                  </p>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleForgotPassword}
                    className="px-3 py-1.5 bg-slate-800 text-white font-medium rounded text-xs hover:bg-slate-900 transition-colors"
                  >
                    Enviar Link de Redefinição
                  </button>
                </div>
              )}

              <button
                id="submit-saas-login-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Entrando no Painel...' : 'Entrar no Meu Painel Admin'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-4 text-center">
                <hr className="border-slate-200" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-[11px] text-slate-400">
                  ou acesse com
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await loginWithGoogle();
                    handleClose();
                  }}
                  className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickAdminLogin();
                    handleClose();
                  }}
                  className="py-2 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Super Admin
                </button>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs text-slate-600">
                <span className="font-semibold text-emerald-800">Isolamento Garantido:</span> Ao fazer login na sua conta,
                seus produtos, margens, preços e pedidos ficam 100% blindados de qualquer outro cliente do sistema.
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER NEW SAAS STORE */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seu Nome Completo / Profissional
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="saas-reg-name-input"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Dr. Lucas Medeiros"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Sua Loja ou Clínica
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="saas-reg-store-input"
                    type="text"
                    required
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    placeholder="Ex: Clínica BioPeptídeos Prime"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Login (Será o Administrador da Loja)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="saas-reg-email-input"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="lucas@clinicabiopeptideos.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Senha de Acesso (Mín. 6 dígitos)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="saas-reg-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp para Pedidos (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="saas-reg-phone-input"
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+351 912 345 678"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
                <span className="font-semibold text-slate-800 block">O que você recebe imediatamente:</span>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Painel Administrativo exclusivo e isolado
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Catálogo inicial de peptídeos pronto para personalizar preços
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Link público exclusivo para seus clientes comprarem
                </div>
              </div>

              <button
                id="submit-saas-register-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Criando sua loja...' : 'Criar Minha Loja & Painel Isolado'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: DEMO SWITCHER TO VERIFY ISOLATION */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong className="block font-semibold mb-1">
                  🧪 Teste de Isolamento Multi-Tenant em Tempo Real:
                </strong>
                Alterne entre as contas abaixo para constatar que cada cliente enxerga apenas o seu próprio painel,
                catálogo de produtos, valores e pedidos. Modificações em uma loja não afetam as outras!
              </div>

              <div className="space-y-2">
                {allTenants.map((t) => {
                  const isActive = currentTenant?.tenantId === t.tenantId;
                  return (
                    <div
                      key={t.tenantId}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-700" />
                          <h4 className="text-xs font-bold text-slate-900">{t.storeName}</h4>
                          {isActive && (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {t.ownerName} • <span className="font-mono">{t.ownerEmail}</span>
                        </p>
                        <span className="inline-block text-[10px] text-slate-400 font-mono">
                          ID: {t.tenantId}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectDemoTenant(t.tenantId)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isActive ? 'Acessar Painel' : 'Acessar Esta Conta'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setTab('register');
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
                >
                  + Ou registre uma loja inédita com seu próprio email e senha
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Dados criptografados & autenticação segura</span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
