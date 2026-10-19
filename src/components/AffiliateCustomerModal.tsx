import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  TrendingUp,
  CreditCard,
  X,
  ExternalLink,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AffiliateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliateCustomerModal: React.FC<AffiliateCustomerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    customerUser,
    settings,
    affiliateSales,
    updateCustomerPayoutInfo,
    showToast,
    openAuthModal,
    formatPrice,
    quickCustomerLogin,
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pixOrIbanInput, setPixOrIbanInput] = useState(customerUser?.payoutPixOrIban || '');
  const [activeTab, setActiveTab] = useState<'link' | 'vendas' | 'saque'>('link');

  if (!isOpen) return null;

  const commissionPercent = settings.affiliateProgram?.commissionPercentage ?? 10;
  const referralCode = customerUser?.referralCode || 'METAPRO-VIP';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://metaslim-pro.shop';
  const referralUrl = `${origin}/?ref=${referralCode}`;

  // Filter sales for this customer's referral code
  const mySales = affiliateSales.filter(
    (s) => s.affiliateCode.toUpperCase() === referralCode.toUpperCase()
  );

  const totalEarned = mySales.reduce((sum, s) => sum + s.commissionAmount, 0);
  const pendingEarned = mySales
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.commissionAmount, 0);
  const paidEarned = mySales
    .filter((s) => s.status === 'paid')
    .reduce((sum, s) => sum + s.commissionAmount, 0);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      showToast('Link de afiliado copiado para a área de transferência!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Erro ao copiar. Copie manualmente.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      showToast(`Código ${referralCode} copiado!`);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      showToast('Erro ao copiar código.');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Recomendo os peptídeos de pureza clínica da MetaSlim Pro (com pureza HPLC >99%). Conheça o catálogo oficial e compre com envio refrigerado através do meu link exclusivo de indicação:\n${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixOrIbanInput.trim()) {
      showToast('Insira sua Chave PIX ou IBAN bancário.');
      return;
    }
    updateCustomerPayoutInfo(pixOrIbanInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003b2d] via-[#006750] to-[#0a483a] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-400/20 text-[#71face] flex items-center justify-center border border-emerald-400/30">
              <Gift className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full">
              Programa de Indicação &amp; Afiliados
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Indique Amigos e Ganhe{' '}
            <span className="text-[#71face] underline decoration-emerald-400 decoration-wavy">
              {commissionPercent}% de Comissão
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Cada pessoa que comprar na MetaSlim Pro através do seu link exclusivo gera{' '}
            <strong>{commissionPercent}% do valor da compra</strong> direto para a sua conta.
          </p>

          {/* Sub Navigation */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab('link')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'link'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Meu Link &amp; Divulgação</span>
            </button>
            <button
              onClick={() => setActiveTab('vendas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vendas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Minhas Comissões ({mySales.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('saque')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saque'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Dados para Saque</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!customerUser ? (
            /* Prompt to Login / Register if guest */
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <h4 className="font-bold text-sm">Cadastre-se para Ativar seu Link de Afiliado</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Ao criar sua conta gratuita de cliente na MetaSlim Pro, seu código e link de afiliado são gerados
                instantaneamente. Todas as compras indicadas acumulam comissões automaticamente!
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('register');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#006750] text-white text-xs font-bold hover:bg-[#005240] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Cadastrar e Ganhar Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Já tenho conta (Entrar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickCustomerLogin();
                    showToast('Autenticado com a conta de demonstração!');
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Testar com Conta Demo
                </button>
              </div>
            </div>
          ) : null}

          {/* TAB 1: MEU LINK & DIVULGAÇÃO */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#006750]" />
                    Cliques
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {customerUser?.totalReferralClicks ?? mySales.length * 5 + 3}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">No seu link</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    Vendas Feitas
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {mySales.length}
                  </div>
                  <span className="text-[10px] text-blue-700 font-medium">Convertidas</span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#006750]" />
                    A Receber
                  </span>
                  <div className="text-xl font-bold font-mono text-[#006750] mt-1">
                    {formatPrice(pendingEarned)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Pendente</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Total Pago
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-1">
                    {formatPrice(paidEarned)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Já transferido</span>
                </div>
              </div>

              {/* Exclusive Link Box */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-2 border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#006750]" />
                    Seu Link Exclusivo de Afiliado
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#006750] text-white px-2.5 py-0.5 rounded-full">
                    {commissionPercent}% de Ganho
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="flex-1 bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-xs">
                    <span className="text-xs font-mono text-slate-800 truncate select-all">
                      {referralUrl}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                      CÓDIGO: {referralCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#006750] hover:bg-[#005240] text-white shadow-sm'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#006750]" />
                    <span>Rastreamento ativo por 30 dias (via cookies e sessão).</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar no WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* How it Works Step-by-Step */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Como Funciona o Programa de Indicação:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#006750] font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <p className="text-xs font-bold text-slate-800">Você Compartilha</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Envie seu link para colegas, pacientes, amigos ou nas suas redes sociais.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#006750] font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <p className="text-xs font-bold text-slate-800">Eles Compram</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      A pessoa acessa pelo seu link e adquire Retatrutida, Tirzepatida ou qualquer produto.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#006750] font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <p className="text-xs font-bold text-slate-800">Você Lucra {commissionPercent}%</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Sua comissão cai no seu saldo e pode ser resgatada via PIX ou transferência IBAN!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MINHAS COMISSÕES */}
          {activeTab === 'vendas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Histórico de Pedidos Indicados</h4>
                  <p className="text-xs text-slate-500">
                    Vendas vinculadas ao seu código <strong>{referralCode}</strong>.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Acumulado:</span>
                  <span className="text-base font-bold font-mono text-[#006750]">
                    {formatPrice(totalEarned)}
                  </span>
                </div>
              </div>

              {mySales.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <Gift className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Nenhuma venda indicada ainda</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Compartilhe seu link exclusivo de afiliado com seus contatos para começar a faturar{' '}
                    {commissionPercent}% em cada compra!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('link')}
                    className="mt-2 px-4 py-2 bg-[#006750] text-white rounded-xl text-xs font-bold hover:bg-[#005240] transition-colors cursor-pointer"
                  >
                    Ver Meu Link
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3">Pedido</th>
                        <th className="p-3">Data</th>
                        <th className="p-3">Comprador</th>
                        <th className="p-3 text-right">Valor Venda</th>
                        <th className="p-3 text-right">Sua Comissão ({commissionPercent}%)</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mySales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">{sale.orderId}</td>
                          <td className="p-3 text-slate-500">
                            {new Date(sale.createdAt).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800">{sale.buyerName}</span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700">
                            {formatPrice(sale.orderTotal)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">
                            +{formatPrice(sale.commissionAmount)}
                          </td>
                          <td className="p-3 text-center">
                            {sale.status === 'paid' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                PAGO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                PENDENTE
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DADOS PARA SAQUE */}
          {activeTab === 'saque' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-sm">
                  Como você recebe seus pagamentos:
                </span>
                <p>
                  As comissões são liquidadas pelo administrador diretamente na sua Chave PIX (Brasil) ou conta
                  IBAN (Europa/Portugal) assim que o pedido for concluído.
                </p>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Valor Mínimo para Transferência: {formatPrice(settings.affiliateProgram?.minPayout ?? 50)}</span>
                </div>
              </div>

              <form onSubmit={handleSavePayout} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sua Chave PIX (CPF/CNPJ/Email/Telefone) ou IBAN Bancário Europeu
                  </label>
                  <input
                    type="text"
                    required
                    value={pixOrIbanInput}
                    onChange={(e) => setPixOrIbanInput(e.target.value)}
                    placeholder="Ex: seu-pix@email.com ou PT50 0033 0000 1234 5678 9012 3"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#006750] focus:border-[#006750] outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Garantimos total confidencialidade dos seus dados cadastrais.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006750] hover:bg-[#005240] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Dados de Saque</span>
                </button>
              </form>

              {customerUser?.payoutPixOrIban && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Chave cadastrada:{' '}
                      <strong className="font-mono">{customerUser.payoutPixOrIban}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    ATIVO
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#006750]" />
            MetaSlim Pro Affiliate Network • Sistema de Comissões Seguras
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
