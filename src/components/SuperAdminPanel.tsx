import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TenantAccount } from '../types';
import { AIExtractorAgent } from './AIExtractorAgent';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Store,
  Mail,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  LogOut,
  X,
  Eye,
  Sliders,
  Sparkles,
  Bot,
  FileText,
} from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
  const {
    allTenants,
    currentTenant,
    switchTenant,
    isSuperAdmin,
    superAdminKeyUnlocked,
    unlockSuperAdmin,
    lockSuperAdmin,
    approveTenant,
    suspendTenant,
    reactivateTenant,
    deleteTenant,
    updateTenantAccount,
    createTenantBySuperAdmin,
    setActiveTab,
    showToast,
    formatPrice,
  } = useStore();

  const [activeSuperAdminTab, setActiveSuperAdminTab] = useState<'tenants' | 'ai-extractor'>('tenants');
  const [pinInput, setPinInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenantToEdit, setSelectedTenantToEdit] = useState<TenantAccount | null>(null);

  // New store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<'starter' | 'pro' | 'clinic'>('pro');
  const [newCurrency, setNewCurrency] = useState<'EUR' | 'BRL'>('EUR');
  const [newNotes, setNewNotes] = useState('');

  // Edit store form state
  const [editStoreName, setEditStoreName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState<'starter' | 'pro' | 'clinic'>('starter');
  const [editStatus, setEditStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [editNotes, setEditNotes] = useState('');

  // Lock Screen if not Super Admin
  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-200/80 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center mb-5 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Acesso Restrito: Super Admin
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Este painel é de uso exclusivo da administração da plataforma para gerenciar, auditar e autorizar as lojas cadastradas.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            unlockSuperAdmin(pinInput);
          }}
          className="mt-6 flex flex-col gap-3"
        >
          <input
            type="password"
            placeholder="Digite a Chave Mestra ou Senha..."
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#006750]"
            autoFocus
          />
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Desbloquear Painel do Super Admin</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Conta oficial: nossoapp01@gmail.com</span>
          <button
            onClick={() => setActiveTab('inicio')}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            ← Voltar à Loja
          </button>
        </div>
      </div>
    );
  }

  // Filtered tenants calculation
  const pendingCount = allTenants.filter((t) => t.status === 'pending').length;
  const activeCount = allTenants.filter((t) => t.status === 'active').length;
  const suspendedCount = allTenants.filter((t) => t.status === 'suspended').length;

  const filteredTenants = allTenants.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.storeName.toLowerCase().includes(q);
      const matchOwner = t.ownerName.toLowerCase().includes(q);
      const matchEmail = t.ownerEmail.toLowerCase().includes(q);
      const matchSlug = t.storeSlug.toLowerCase().includes(q);
      return matchName || matchOwner || matchEmail || matchSlug;
    }
    return true;
  });

  const handleCopyLink = (tenantId: string) => {
    const url = `${window.location.origin}/?store=${tenantId}`;
    try {
      navigator.clipboard.writeText(url);
      setCopiedId(tenantId);
      showToast('Link exclusivo da loja copiado!');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      showToast(url);
    }
  };

  const handleOpenEdit = (tenant: TenantAccount) => {
    setSelectedTenantToEdit(tenant);
    setEditStoreName(tenant.storeName);
    setEditOwnerName(tenant.ownerName);
    setEditOwnerEmail(tenant.ownerEmail);
    setEditPhone(tenant.phone || '');
    setEditPlan(tenant.plan);
    setEditStatus(tenant.status);
    setEditNotes(tenant.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTenantToEdit) return;
    await updateTenantAccount(selectedTenantToEdit.tenantId, {
      storeName: editStoreName.trim(),
      ownerName: editOwnerName.trim(),
      ownerEmail: editOwnerEmail.trim(),
      phone: editPhone.trim(),
      plan: editPlan,
      status: editStatus,
      notes: editNotes.trim(),
      approvedAt: editStatus === 'active' && !selectedTenantToEdit.approvedAt ? new Date().toISOString() : selectedTenantToEdit.approvedAt,
    });
    setIsEditModalOpen(false);
    setSelectedTenantToEdit(null);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newOwnerName.trim() || !newOwnerEmail.trim()) {
      showToast('Preencha os campos obrigatórios.');
      return;
    }
    await createTenantBySuperAdmin({
      storeName: newStoreName.trim(),
      ownerName: newOwnerName.trim(),
      ownerEmail: newOwnerEmail.trim(),
      phone: newPhone.trim(),
      plan: newPlan,
      currency: newCurrency,
      notes: newNotes.trim() || 'Criada diretamente pelo Super Admin com autorização instantânea.',
    });
    setNewStoreName('');
    setNewOwnerName('');
    setNewOwnerEmail('');
    setNewPhone('');
    setNewNotes('');
    setIsCreateModalOpen(false);
  };

  const handleImpersonate = (tenantId: string) => {
    switchTenant(tenantId);
    setActiveTab('admin');
    showToast(`Ambiente alterado para a loja selecionada. Painel de administração aberto!`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16" id="super-admin-panel">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-[#00281e] to-[#004736] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg font-black">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-3 py-0.5 rounded-full border border-amber-400/30">
                  CONTROLE MESTRE DA PLATAFORMA SAAS
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Super Admin Autenticado
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                Painel do Super Admin • Autorização de Lojas
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Gerencie todas as lojas parceiras cadastradas. O Super Admin tem a autoridade exclusiva para <strong>autorizar</strong> novas lojas, suspender operações ou auditar estoques isolados.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveSuperAdminTab(activeSuperAdminTab === 'ai-extractor' ? 'tenants' : 'ai-extractor')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                activeSuperAdminTab === 'ai-extractor'
                  ? 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>{activeSuperAdminTab === 'ai-extractor' ? 'Ver Gestão de Lojas' : 'Agente IA Extrator'}</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar &amp; Autorizar Loja</span>
            </button>
            <button
              onClick={lockSuperAdmin}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer"
              title="Encerrar sessão de Super Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Super Admin Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveSuperAdminTab('tenants')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSuperAdminTab === 'tenants'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4 text-emerald-700" />
          <span>Lojas Parceiras &amp; Autorizações</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {allTenants.length}
          </span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSuperAdminTab('ai-extractor')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSuperAdminTab === 'ai-extractor'
              ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className={`w-4 h-4 ${activeSuperAdminTab === 'ai-extractor' ? 'text-amber-300' : 'text-emerald-700'}`} />
          <span>Agente IA: Extrator de PDF &amp; Imagens</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSuperAdminTab === 'ai-extractor' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Gemini &amp; DeepSeek
          </span>
        </button>
      </div>

      {/* Conditionally Render AI Extractor Agent or Tenants Management */}
      {activeSuperAdminTab === 'ai-extractor' ? (
        <AIExtractorAgent />
      ) : (
        <>
          {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lojas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Total de Lojas
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {allTenants.length}
            </div>
            <span className="text-[11px] text-slate-500">Lojas no ecossistema</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* Pendentes de Autorização */}
        <div className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center justify-between transition-all ${
          pendingCount > 0 ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-400/30' : 'border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 font-mono">
                Aguardando Autorização
              </span>
              {pendingCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-0.5">
              {pendingCount}
            </div>
            <span className="text-[11px] text-amber-800/80 font-medium">
              {pendingCount === 1 ? '1 loja requer aprovação' : `${pendingCount} lojas requerem aprovação`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Ativas e Autorizadas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Ativas &amp; Autorizadas
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">
              {activeCount}
            </div>
            <span className="text-[11px] text-emerald-800/80">Lojas com vendas liberadas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Suspensas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 font-mono">
              Lojas Suspensas
            </span>
            <div className="text-2xl font-extrabold text-rose-700 mt-0.5">
              {suspendedCount}
            </div>
            <span className="text-[11px] text-rose-800/80">Bloqueadas pelo Super Admin</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Ban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({allTenants.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Pendentes</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Ativas ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'suspended'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Suspensas ({suspendedCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px] md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
          />
        </div>
      </div>

      {/* Stores List */}
      <div className="flex flex-col gap-4">
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nenhuma loja encontrada</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tente mudar o filtro de status ou o termo da busca.
            </p>
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const isCurrentlyActiveInSession = tenant.tenantId === currentTenant.tenantId;
            const isPending = tenant.status === 'pending';
            const isSuspended = tenant.status === 'suspended';
            const isActive = tenant.status === 'active';

            return (
              <div
                key={tenant.tenantId}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                  isPending
                    ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-400/40'
                    : isSuspended
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Store Identity & Details */}
                <div className="flex items-start gap-4">
                  {/* Store Logo / Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {tenant.logoUrl ? (
                      <img
                        src={tenant.logoUrl}
                        alt={tenant.storeName}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Store className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  {/* Text details */}
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {tenant.storeName}
                      </h3>

                      {/* Status Badges */}
                      {isPending && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>AGUARDANDO AUTORIZAÇÃO</span>
                        </span>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>AUTORIZADA / ATIVA</span>
                        </span>
                      )}
                      {isSuspended && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                          <Ban className="w-3 h-3 text-rose-600" />
                          <span>SUSPENSA</span>
                        </span>
                      )}

                      {/* Plan Badge */}
                      <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        Plano {tenant.plan}
                      </span>

                      {isCurrentlyActiveInSession && (
                        <span className="text-[10px] font-bold bg-[#006750] text-white px-2 py-0.5 rounded-full">
                          Loja em Visualização
                        </span>
                      )}
                    </div>

                    {/* Metadata & Owner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-800">Proprietário:</span>
                        <span>{tenant.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700">{tenant.ownerEmail}</span>
                      </div>
                      {tenant.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700">{tenant.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Registration and Approval Dates */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span>Cadastrada em: {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</span>
                      {tenant.approvedAt && (
                        <span>• Autorizada em: {new Date(tenant.approvedAt).toLocaleDateString('pt-BR')}</span>
                      )}
                      <span>• ID: <span className="font-mono">{tenant.tenantId}</span></span>
                    </div>

                    {/* Notes if any */}
                    {tenant.notes && (
                      <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-slate-700">
                        <span className="font-bold text-slate-900">Observações:</span> {tenant.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Group */}
                <div className="flex flex-wrap items-center lg:justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Copy Store Public Link */}
                  <button
                    onClick={() => handleCopyLink(tenant.tenantId)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copiar Link da Loja Pública"
                  >
                    {copiedId === tenant.tenantId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-[11px]">Link Loja</span>
                  </button>

                  {/* View Public Store */}
                  <a
                    href={`/?store=${tenant.tenantId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Abrir Loja em Nova Aba"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px]">Abrir</span>
                  </a>

                  {/* Edit Store Info */}
                  <button
                    onClick={() => handleOpenEdit(tenant)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Editar Informações da Loja"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px]">Editar</span>
                  </button>

                  {/* Impersonate / Enter Store Admin */}
                  <button
                    onClick={() => handleImpersonate(tenant.tenantId)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Acessar o painel administrativo desta loja como lojista"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Acessar Painel</span>
                  </button>

                  {/* PRIMARY AUTHORIZATION ACTIONS */}
                  {isPending && (
                    <button
                      onClick={() => approveTenant(tenant.tenantId)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AUTORIZAR LOJA</span>
                    </button>
                  )}

                  {isActive && tenant.tenantId !== 'tenant_metaslim_prime' && (
                    <button
                      onClick={() => suspendTenant(tenant.tenantId)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Suspender vendas desta loja"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspender</span>
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => reactivateTenant(tenant.tenantId)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      title="Reativar loja suspensa"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reativar Loja</span>
                    </button>
                  )}

                  {tenant.tenantId !== 'tenant_metaslim_prime' && (
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir permanentemente a loja "${tenant.storeName}"?`)) {
                          deleteTenant(tenant.tenantId);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir Loja"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* CREATE STORE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Loja Parceira</h3>
                  <p className="text-xs text-slate-500">Criação direta pelo Super Admin com autorização imediata.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Loja *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clínica BioSlim Peptídeos"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Proprietário *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Nome do Médico / Lojista"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail do Lojista *</label>
                  <input
                    type="email"
                    required
                    placeholder="lojista@clinica.com"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+351 912 345 678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plano da Loja</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  >
                    <option value="starter">Starter (Individual)</option>
                    <option value="pro">Pro (Clínica Crescimento)</option>
                    <option value="clinic">Clinic (Rede / Alta Performance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações Internas (Super Admin)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Parceiro homologado com CRM verificado."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white font-bold shadow-md cursor-pointer"
                >
                  Criar e Autorizar Loja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STORE MODAL */}
      {isEditModalOpen && selectedTenantToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Editar Loja: {selectedTenantToEdit.storeName}</h3>
                  <p className="text-xs text-slate-500">Alteração cadastral pelo Super Admin.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Proprietário</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail do Proprietário</label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status da Loja (Super Admin)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  >
                    <option value="pending">🟡 Pendente (Aguardando)</option>
                    <option value="active">🟢 Ativa &amp; Autorizada</option>
                    <option value="suspended">🔴 Suspensa / Bloqueada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plano da Loja</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="clinic">Clinic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações Internas</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white font-bold shadow-md cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
