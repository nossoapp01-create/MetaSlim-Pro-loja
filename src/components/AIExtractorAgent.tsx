import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  Bot,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Key,
  Globe,
  Sliders,
  Store,
  Layers,
  Check,
  Eye,
  Info,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, TenantAccount } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs-dist worker safely
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (err) {
    console.warn('PDF.js worker initialization notice:', err);
  }
}

// Default high-res peptide product images
const DEFAULT_PEPTIDE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUNGHYf5ysPyg9SVloHweRJLVtK7y5NHDOdgmRp-aIaz3Z8fjdAKwE2dDPcuIMx19hngOImZjWukDeXgDra6_XouFN9a8BTVO-hNK3VOwb3QxYPuka98-qURmbj16A4to2F1mJZyu5_qqcLBTpipCTA6cvQmD_7wCoN1qU7PPvBpSeKTcX_I1gpIIoff8NZhFOPZReAbmYzwa5c_1HhnMoZyp69ZmChlEq7iQdllvtjFQ1Tr_Tnoz0vnmHx4_mxB7E5O4',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=80',
];

interface ExtractedProductDraft {
  tempId: string;
  name: string;
  subtitle: string;
  refCode: string;
  category: 'glp1' | 'muscular' | 'longevidade' | 'kits';
  categoryLabel: string;
  price: number;
  originalPrice: number;
  purity: string;
  whatIsItFor: string;
  scientificDescription: string;
  stock: number;
  image: string;
  batchNumber: string;
  casNumber?: string;
  molecularWeight?: string;
  formula?: string;
  featured: boolean;
  badge: string;
  confidenceScore: number;
  benefits?: string[];
}

export const AIExtractorAgent: React.FC = () => {
  const { allTenants, activeTenantId, addMultipleProducts, showToast, currentTenant } = useStore();

  // Selected Target Tenant for publishing
  const [targetTenantId, setTargetTenantId] = useState<string>(activeTenantId);

  // AI Configuration State
  const [provider, setProvider] = useState<'gemini' | 'deepseek'>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('metaslim_custom_gemini_key') || '';
  });
  const [geminiModel, setGeminiModel] = useState<string>('gemini-3.8-flash');
  const [deepseekApiKey, setDeepseekApiKey] = useState<string>(() => {
    return localStorage.getItem('metaslim_custom_deepseek_key') || '';
  });
  const [deepseekModel, setDeepseekModel] = useState<string>('deepseek-chat');
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(true);

  // Connection testing state
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  // File Upload and PDF Render State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('');
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Processing & Extraction State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProductDraft[]>([]);
  const [extractionSummary, setExtractionSummary] = useState<string>('');
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [isPublishingAll, setIsPublishingAll] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Save keys to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('metaslim_custom_gemini_key', geminiApiKey);
    } catch {}
  }, [geminiApiKey]);

  useEffect(() => {
    try {
      localStorage.setItem('metaslim_custom_deepseek_key', deepseekApiKey);
    } catch {}
  }, [deepseekApiKey]);

  // Test AI Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          geminiApiKey,
          geminiModel,
          deepseekApiKey,
          deepseekModel,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectionStatus({
          tested: true,
          success: true,
          message: `${provider.toUpperCase()} Operacional: "${data.reply}" (${data.source || data.model})`,
        });
        showToast(`Conexão com ${provider.toUpperCase()} confirmada com sucesso!`);
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: data.error || 'Falha ao conectar com o serviço de IA.',
        });
        showToast(`Erro na conexão com ${provider.toUpperCase()}: ${data.error || 'Verifique sua chave'}`);
      }
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err.message || 'Erro de rede ao conectar à API.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Render PDF pages using pdfjs-dist
  const renderPdfPages = async (file: File) => {
    try {
      setProcessingStep('Renderizando páginas do PDF...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfTotalPages(pdf.numPages);
      setPdfCurrentPage(1);

      const renderedPages: string[] = [];
      // Render first 5 pages for preview
      const pagesToRender = Math.min(pdf.numPages, 5);

      for (let i = 1; i <= pagesToRender; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await (page.render as any)({
            canvasContext: context,
            canvas,
            viewport,
          }).promise;
          renderedPages.push(canvas.toDataURL('image/png'));
        }
      }

      setPdfPageImages(renderedPages);
      if (renderedPages.length > 0) {
        setPreviewImage(renderedPages[0]);
      }
    } catch (err) {
      console.warn('Erro ao renderizar PDF no navegador, mas o backend processará diretamente:', err);
    }
  };

  // Handle File Input Selection
  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setConnectionStatus(null);
    const mime = file.type || 'image/png';
    setFileMimeType(mime);

    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setIsPdf(isFilePdf);

    try {
      const b64 = await fileToBase64(file);
      setFileBase64(b64);

      if (isFilePdf) {
        await renderPdfPages(file);
      } else {
        setPreviewImage(b64);
      }
      showToast(`Arquivo "${file.name}" carregado. Clique em "Iniciar Extração com IA".`);
    } catch (err) {
      showToast('Erro ao ler arquivo.');
      console.error(err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Preset Demonstrations for instant testing
  const loadPresetDemo = (presetType: 'incretins' | 'recovery' | 'longevity') => {
    if (presetType === 'incretins') {
      const simulatedText = `CATÁLOGO OFICIAL METASLIM PRO - INCRETINAS & GLP-1 DE ALTA PUREZA
1. Retatrutide 10mg
Ref: RT-10
Triagonista GLP-1 / GIP / Glucagon. Redução potente de peso de 6 a 8kg por mês com aceleração metabólica basal.
Pureza HPLC >99.6%. Preço: 89.00 EUR.
2. Tirzepatide 15mg
Ref: TZ-15
Duplo Agonista GIP / GLP-1. Otimização profunda da sensibilidade à insulina e saciedade neuroendócrina.
Pureza HPLC >99.4%. Preço: 79.00 EUR.
3. Semaglutida 5mg
Ref: SM-05
Agonista seletivo do receptor GLP-1. Controle absoluto da fome hedônica e compulsão noturna.
Pureza HPLC >99.2%. Preço: 59.00 EUR.`;
      runExtractionWithCustomPayload('', 'text/plain', 'catalogo_incretinas.pdf', simulatedText);
    } else if (presetType === 'recovery') {
      const simulatedText = `PROTOCOLO CIRÚRGICO E REPARO TECIDUAL DE ALTA PERFORMANCE
1. BPC-157 5mg (Body Protection Compound)
Pentadecapeptídeo gástrico. Estimula angiogênese VEGFR2 e regeneração miofascial e intestinal acelerada.
Pureza HPLC >99.5%. Preço: 49.00 EUR.
2. TB-500 10mg (Timosina Beta-4)
Peptídeo de migração celular e reparo de tendões e cartilagens.
Pureza HPLC >99.3%. Preço: 65.00 EUR.
3. GHK-Cu 50mg (Complexo Cobre Tripeptídico)
Firmeza dérmica pós-emagrecimento, biogênese de colágeno e anti-inflamatório sistêmico.
Pureza HPLC >99.1%. Preço: 55.00 EUR.`;
      runExtractionWithCustomPayload('', 'text/plain', 'protocolo_reparo.pdf', simulatedText);
    } else {
      const simulatedText = `LINHA EXCLUSIVA MITOCONDRIAL E MEDICINA DA LONGEVIDADE
1. Epitalon 50mg (AEDG Tetrapeptídeo)
Alongamento de telômeros, reativação da telomerase e sincronização do ciclo circadiano.
Pureza HPLC >99.7%. Preço: 85.00 EUR.
2. MOTS-c 10mg (Mitocôndria Ativa)
Ativação direta da via AMPK celular, transporte GLUT4 muscular sem depender de insulina pancreática.
Pureza HPLC >99.4%. Preço: 79.00 EUR.
3. AOD-9604 5mg (Lipolítico Alvo)
Fragmento lipolítico C-terminal sem alteração do IGF-1. Queima direta de gordura visceral profunda.
Pureza HPLC >99.5%. Preço: 69.00 EUR.`;
      runExtractionWithCustomPayload('', 'text/plain', 'linha_longevidade.pdf', simulatedText);
    }
  };

  // Run Extraction through Server Endpoint
  const runExtractionWithCustomPayload = async (
    b64: string,
    mime: string,
    name: string,
    extractedTxt?: string
  ) => {
    setIsProcessing(true);
    setProcessingStep('Iniciando análise com a Inteligência Artificial...');
    setExtractionSummary('');

    try {
      setProcessingStep(
        provider === 'gemini'
          ? 'Analisando documento visualmente e ativando Google Search Grounding...'
          : 'Processando documento via DeepSeek com raciocínio analítico...'
      );

      const targetTenant = allTenants.find((t) => t.tenantId === targetTenantId) || currentTenant;

      const res = await fetch('/api/ai/extract-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: b64 || fileBase64,
          mimeType: mime || fileMimeType,
          fileName: name || selectedFile?.name || 'documento.pdf',
          extractedText: extractedTxt || '',
          provider,
          geminiApiKey,
          geminiModel,
          deepseekApiKey,
          deepseekModel,
          enableWebSearch,
          targetTenantName: targetTenant?.storeName || 'MetaSlim Pro Store',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao extrair produtos.');
      }

      setProcessingStep('Formatando fichas farmacêuticas e imagens...');
      const rawProducts: any[] = data.products || [];

      // Map raw extracted products into rich drafts
      const formatted: ExtractedProductDraft[] = rawProducts.map((p, index) => {
        let mappedCategory: 'glp1' | 'muscular' | 'longevidade' | 'kits' = 'glp1';
        let categoryLabel = 'Emagrecimento & GLP-1';

        const catLower = (p.category || '').toLowerCase();
        if (catLower.includes('massa') || catLower.includes('muscular') || catLower.includes('forca')) {
          mappedCategory = 'muscular';
          categoryLabel = 'Ganho Muscular & Força';
        } else if (catLower.includes('longevidade') || catLower.includes('anti') || catLower.includes('repar') || catLower.includes('mitoc')) {
          mappedCategory = 'longevidade';
          categoryLabel = 'Longevidade & Antienvelhecimento';
        } else if (catLower.includes('kit') || catLower.includes('combo')) {
          mappedCategory = 'kits';
          categoryLabel = 'Kits & Combos Clínicos';
        }

        const priceNum = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 79.0;
        const cleanRef = (p.name || 'PROD')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 6);

        // Assign preview image or fallback default
        const prodImage =
          previewImage && !isPdf
            ? previewImage
            : DEFAULT_PEPTIDE_IMAGES[index % DEFAULT_PEPTIDE_IMAGES.length];

        return {
          tempId: `draft-${Date.now()}-${index}`,
          name: p.name || `Peptídeo Clínico #${index + 1}`,
          subtitle: p.subtitle || p.dosage || 'Grau de Pureza Farmacêutica HPLC >99%',
          refCode: cleanRef || `MSP-${index + 1}`,
          category: mappedCategory,
          categoryLabel,
          price: priceNum,
          originalPrice: Math.round(priceNum * 1.35),
          purity: p.purity || 'HPLC >99.4% (Grau Farmacêutico Analítico)',
          whatIsItFor:
            p.whatIsItFor ||
            (p.benefits && p.benefits.length > 0
              ? p.benefits.join(' • ')
              : 'Otimização metabólica avançada com alta biodisponibilidade celular.'),
          scientificDescription:
            p.description ||
            `Composto peptídico sintético de elevada estabilidade molecular. Formulado para reconstituição com Água Bacteriostática estéril (BAC water) e conservação sob refrigeração de 2°C a 8°C.`,
          stock: p.stock || 50,
          image: prodImage,
          batchNumber: `LOTE-${new Date().getFullYear()}-${index + 10}`,
          casNumber: p.casNumber || undefined,
          molecularWeight: p.molecularWeight || undefined,
          formula: p.formula || p.molecularFormula || undefined,
          featured: true,
          badge: p.suggestedBadge || 'NOVO',
          confidenceScore: p.confidenceScore || 95,
          benefits: p.benefits || [],
        };
      });

      setExtractedProducts(formatted);
      setExtractionSummary(
        data.summary ||
          `Sucesso! ${formatted.length} produto(s) extraídos e enriquecidos com evidências clínicas.`
      );
      showToast(`${formatted.length} produto(s) extraídos pela IA!`);
    } catch (err: any) {
      console.error(err);
      showToast(`Erro na extração: ${err.message || 'Falha desconhecida'}`);
      setExtractionSummary(`Erro: ${err.message || 'Não foi possível concluir a extração'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleStartExtraction = () => {
    if (!fileBase64 && !selectedFile) {
      showToast('Por favor, carregue um arquivo PDF ou imagem primeiro.');
      return;
    }
    runExtractionWithCustomPayload(
      fileBase64,
      fileMimeType,
      selectedFile?.name || 'documento'
    );
  };

  // Re-enrich single product via web search
  const handleEnrichSingle = async (draft: ExtractedProductDraft) => {
    setEnrichingId(draft.tempId);
    try {
      const res = await fetch('/api/ai/enrich-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: draft.name,
          provider,
          geminiApiKey,
          geminiModel,
          deepseekApiKey,
          deepseekModel,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const enriched = data.data;
        setExtractedProducts((prev) =>
          prev.map((item) => {
            if (item.tempId === draft.tempId) {
              return {
                ...item,
                purity: enriched.purity || item.purity,
                scientificDescription: enriched.description || item.scientificDescription,
                price: enriched.price || item.price,
                originalPrice: Math.round((enriched.price || item.price) * 1.35),
                badge: enriched.suggestedBadge || item.badge,
                whatIsItFor:
                  enriched.benefits && enriched.benefits.length > 0
                    ? enriched.benefits.join(' • ')
                    : item.whatIsItFor,
              };
            }
            return item;
          })
        );
        showToast(`Pesquisa na web concluída para "${draft.name}"!`);
      } else {
        showToast('Não foi possível enriquecer mais informações.');
      }
    } catch (e: any) {
      showToast(`Erro ao pesquisar: ${e.message}`);
    } finally {
      setEnrichingId(null);
    }
  };

  // Change Draft Field in place
  const updateDraftField = (
    tempId: string,
    field: keyof ExtractedProductDraft,
    val: any
  ) => {
    setExtractedProducts((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  // Replace draft image with custom uploaded image
  const handleCustomImageForDraft = (tempId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      updateDraftField(tempId, 'image', b64);
      showToast('Imagem do produto atualizada!');
    };
    reader.readAsDataURL(file);
  };

  // Remove single draft
  const removeDraft = (tempId: string) => {
    setExtractedProducts((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  // Publish Single Product
  const handlePublishSingle = async (draft: ExtractedProductDraft) => {
    const targetTenant = allTenants.find((t) => t.tenantId === targetTenantId);
    const storeLabel = targetTenant ? targetTenant.storeName : 'Loja Atual';

    const newProd: Omit<Product, 'id'> = {
      name: draft.name,
      subtitle: draft.subtitle,
      refCode: draft.refCode,
      category: draft.category,
      categoryLabel: draft.categoryLabel,
      price: draft.price,
      originalPrice: draft.originalPrice,
      purity: draft.purity,
      whatIsItFor: draft.whatIsItFor,
      scientificDescription: draft.scientificDescription,
      stock: draft.stock,
      image: draft.image,
      batchNumber: draft.batchNumber,
      casNumber: draft.casNumber,
      molecularWeight: draft.molecularWeight,
      formula: draft.formula,
      paymentLink: '',
      featured: draft.featured,
      badge: draft.badge,
    };

    await addMultipleProducts([newProd], targetTenantId);
    removeDraft(draft.tempId);
    showToast(`Produto "${draft.name}" adicionado à ${storeLabel}!`);
  };

  // Publish All Products in Batch
  const handlePublishAll = async () => {
    if (extractedProducts.length === 0) return;
    setIsPublishingAll(true);
    const targetTenant = allTenants.find((t) => t.tenantId === targetTenantId);
    const storeLabel = targetTenant ? targetTenant.storeName : 'Loja Oficial';

    try {
      const listToPublish: Omit<Product, 'id'>[] = extractedProducts.map((draft) => ({
        name: draft.name,
        subtitle: draft.subtitle,
        refCode: draft.refCode,
        category: draft.category,
        categoryLabel: draft.categoryLabel,
        price: draft.price,
        originalPrice: draft.originalPrice,
        purity: draft.purity,
        whatIsItFor: draft.whatIsItFor,
        scientificDescription: draft.scientificDescription,
        stock: draft.stock,
        image: draft.image,
        batchNumber: draft.batchNumber,
        casNumber: draft.casNumber,
        molecularWeight: draft.molecularWeight,
        formula: draft.formula,
        paymentLink: '',
        featured: draft.featured,
        badge: draft.badge,
      }));

      const count = await addMultipleProducts(listToPublish, targetTenantId);
      setExtractedProducts([]);
      showToast(`🎉 ${count} produto(s) publicados com sucesso no catálogo da loja "${storeLabel}"!`);
    } catch (err: any) {
      showToast(`Erro ao publicar produtos: ${err.message || 'Falha desconhecida'}`);
    } finally {
      setIsPublishingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto" id="ai-product-extractor-agent">
      {/* Agent Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#03261e] to-[#044030] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-lg font-black">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-emerald-400/20 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-400/30">
                  AGENTE IA MULTIMODAL &amp; GROUNDING
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini &amp; DeepSeek Habilitados
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight text-white">
                Agente Extrator de Produtos &amp; Catálogos (PDF e Imagens)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Faça upload de catálogos em <strong>PDF</strong>, fotos de frascos em <strong>PNG/JPG</strong> ou tabelas de fornecedores. O Agente extrai as imagens, lê nomes e dosagens, <strong>pesquisa na internet informações clínicas ausentes</strong> e cadastra os produtos diretamente no catálogo da loja parceira.
              </p>
            </div>
          </div>

          {/* Quick Target Store Selector */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[260px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1.5">
              <Store className="w-4 h-4" />
              <span>Loja de Destino do Catálogo:</span>
            </div>
            <select
              value={targetTenantId}
              onChange={(e) => setTargetTenantId(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {allTenants.map((tenant: TenantAccount) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.storeName} ({tenant.plan.toUpperCase()} • {tenant.status === 'active' ? 'Ativa' : 'Pendente'})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Os produtos extraídos serão injetados diretamente na loja selecionada.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Left Column (AI Settings & Upload) - Right Column (Preview & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): AI Providers & File Upload */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card: AI Config (Gemini / DeepSeek) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Configuração dos Modelos de IA
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                {provider === 'gemini' ? 'Google AI' : 'DeepSeek AI'}
              </span>
            </div>

            {/* Provider Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setConnectionStatus(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  provider === 'gemini'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Gemini</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvider('deepseek');
                  setConnectionStatus(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  provider === 'deepseek'
                    ? 'bg-white text-indigo-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>DeepSeek</span>
              </button>
            </div>

            {/* Gemini Settings */}
            {provider === 'gemini' && (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      Chave da API Google Gemini:
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Chave do Servidor Ativa
                    </span>
                  </div>
                  <input
                    type="password"
                    placeholder="Chave customizada opcional (ou deixe em branco para usar do servidor)"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Por padrão, o servidor já utiliza o ambiente seguro com o SDK @google/genai.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Modelo do Google Gemini:
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado • Visão + Grounding Web)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Ultra Rápido • Ideal para OCR direto)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Raciocínio Clínico Aprofundado)</option>
                  </select>
                </div>

                {/* Web Search Grounding Switch */}
                <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        Pesquisa na Internet (Google Search Grounding)
                      </div>
                      <div className="text-[10px] text-emerald-800">
                        Busca automaticamente laudos, evidências e posologia caso o documento não tenha.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWebSearch}
                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* DeepSeek Settings */}
            {provider === 'deepseek' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    Chave da API DeepSeek (sk-...):
                  </label>
                  <input
                    type="password"
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={deepseekApiKey}
                    onChange={(e) => setDeepseekApiKey(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Obtenha sua chave no painel oficial do DeepSeek (platform.deepseek.com). Fica salva localmente.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Modelo DeepSeek:
                  </label>
                  <select
                    value={deepseekModel}
                    onChange={(e) => setDeepseekModel(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="deepseek-chat">deepseek-chat (DeepSeek-V3 • Rápido e Analítico)</option>
                    <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek-R1 • Raciocínio Profundo)</option>
                  </select>
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-start gap-2 text-indigo-900 text-xs">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    O DeepSeek processará tabelas e dados textuais com rigor lógico. Para imagens binárias, o sistema utiliza o motor visual do servidor para reconhecimento e o DeepSeek para a estruturação clínica.
                  </p>
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando conexão com {provider.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Testar Conexão com a IA ({provider.toUpperCase()})</span>
                  </>
                )}
              </button>

              {connectionStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                    connectionStatus.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {connectionStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{connectionStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Upload File Area (PDF / PNG) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Upload de Arquivo (PDF ou PNG/JPG)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Até 50 MB
              </span>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-emerald-500/80 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                {isPdf ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>

              <div className="text-xs font-bold text-slate-800 mb-0.5">
                {selectedFile ? selectedFile.name : 'Arraste seu PDF ou imagem aqui'}
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Suporta catálogos em <strong>PDF</strong>, tabelas de preço, fotos de frascos em <strong>PNG/JPG</strong> ou laudos de pureza.
              </p>
            </div>

            {/* Quick Demonstration Presets */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Ou teste com exemplos rápidos de peptídeos:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loadPresetDemo('incretins')}
                  className="p-2.5 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 text-left text-xs font-bold text-emerald-950 transition-all flex flex-col cursor-pointer"
                >
                  <span className="text-[10px] text-emerald-700 font-mono">EXEMPLO 1</span>
                  <span>Incretinas GLP-1</span>
                  <span className="text-[10px] text-slate-500 font-normal">Retatrutide, Tirzepatide...</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetDemo('recovery')}
                  className="p-2.5 rounded-xl border border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 text-left text-xs font-bold text-blue-950 transition-all flex flex-col cursor-pointer"
                >
                  <span className="text-[10px] text-blue-700 font-mono">EXEMPLO 2</span>
                  <span>Reparo Tecidual</span>
                  <span className="text-[10px] text-slate-500 font-normal">BPC-157, TB-500, GHK-Cu</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetDemo('longevity')}
                  className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50 text-left text-xs font-bold text-amber-950 transition-all flex flex-col cursor-pointer"
                >
                  <span className="text-[10px] text-amber-700 font-mono">EXEMPLO 3</span>
                  <span>Longevidade</span>
                  <span className="text-[10px] text-slate-500 font-normal">Epitalon, MOTS-c, AOD</span>
                </button>
              </div>
            </div>

            {/* Action Button: Start Extraction */}
            <button
              type="button"
              onClick={handleStartExtraction}
              disabled={isProcessing || (!fileBase64 && !selectedFile)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>{processingStep || 'Processando com IA...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Executar Extração e Pesquisa com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): File Preview & Extracted Products Catalog */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card: File Preview (PDF Viewer or Image Viewer) */}
          {(previewImage || isPdf) && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {isPdf
                      ? `Visualização do PDF (Página ${pdfCurrentPage} de ${pdfTotalPages || 1})`
                      : 'Visualização da Imagem Carregada'}
                  </span>
                </div>
                {isPdf && pdfPageImages.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={pdfCurrentPage <= 1}
                      onClick={() => {
                        const prev = Math.max(1, pdfCurrentPage - 1);
                        setPdfCurrentPage(prev);
                        if (pdfPageImages[prev - 1]) setPreviewImage(pdfPageImages[prev - 1]);
                      }}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {pdfCurrentPage} / {pdfTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={pdfCurrentPage >= pdfTotalPages}
                      onClick={() => {
                        const next = Math.min(pdfTotalPages, pdfCurrentPage + 1);
                        setPdfCurrentPage(next);
                        if (pdfPageImages[next - 1]) setPreviewImage(pdfPageImages[next - 1]);
                      }}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rendered Preview Image */}
              <div className="w-full max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Pré-visualização do catálogo"
                    className="max-h-64 object-contain rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="text-xs text-slate-400 py-10 flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <span>Carregando visualização do arquivo...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Banner */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 animate-pulse">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    O Agente IA está analisando seu documento...
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{processingStep}</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-600 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Card: Extracted Products List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Produtos Extraídos e Enriquecidos ({extractedProducts.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revise os campos, imagens e dosagens antes de publicar no catálogo.
                </p>
              </div>

              {extractedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handlePublishAll}
                  disabled={isPublishingAll}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  {isPublishingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Adicionar Todos ({extractedProducts.length}) ao Catálogo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Empty State */}
            {extractedProducts.length === 0 && !isProcessing && (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="text-sm font-bold text-slate-700">
                  Nenhum produto extraído no momento
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Faça o upload de um arquivo PDF ou imagem PNG à esquerda e clique em{' '}
                  <strong>&quot;Executar Extração e Pesquisa com IA&quot;</strong>, ou utilize um dos exemplos rápidos acima para testar.
                </p>
              </div>
            )}

            {/* Extraction Summary */}
            {extractionSummary && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{extractionSummary}</div>
              </div>
            )}

            {/* Products Draft Cards List */}
            <div className="flex flex-col gap-4">
              {extractedProducts.map((draft, idx) => (
                <div
                  key={draft.tempId}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 transition-all flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Product Image Box */}
                    <div className="relative group shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                      <img
                        src={draft.image}
                        alt={draft.name}
                        className="w-full h-full object-cover"
                      />
                      <label
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-[10px] text-white font-bold cursor-pointer"
                        title="Trocar imagem deste produto"
                      >
                        <ImageIcon className="w-4 h-4 mb-0.5" />
                        <span>Trocar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCustomImageForDraft(draft.tempId, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Main Editable Fields */}
                    <div className="flex-1 w-full flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            Confiança {draft.confidenceScore}%
                          </span>
                          <input
                            type="text"
                            value={draft.badge}
                            onChange={(e) => updateDraftField(draft.tempId, 'badge', e.target.value)}
                            placeholder="Badge (ex: Mais Vendido)"
                            className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 max-w-[120px]"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEnrichSingle(draft)}
                            disabled={enrichingId === draft.tempId}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all border border-emerald-200 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Pesquisar mais detalhes na internet e enriquecer com IA"
                          >
                            <Globe className="w-3 h-3 text-emerald-600" />
                            <span>
                              {enrichingId === draft.tempId ? 'Pesquisando...' : 'Pesquisar na Web'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDraft(draft.tempId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remover este produto da lista"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Product Name & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Nome do Produto:
                          </label>
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) => updateDraftField(draft.tempId, 'name', e.target.value)}
                            className="w-full text-xs font-bold text-slate-900 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Subtítulo / Dosagem:
                          </label>
                          <input
                            type="text"
                            value={draft.subtitle}
                            onChange={(e) => updateDraftField(draft.tempId, 'subtitle', e.target.value)}
                            className="w-full text-xs text-slate-700 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Category, Purity, Price EUR */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Categoria:
                          </label>
                          <select
                            value={draft.category}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              let label = 'Emagrecimento & GLP-1';
                              if (val === 'muscular') label = 'Ganho Muscular & Força';
                              if (val === 'longevidade') label = 'Longevidade & Antienvelhecimento';
                              if (val === 'kits') label = 'Kits & Combos Clínicos';
                              setExtractedProducts((prev) =>
                                prev.map((p) =>
                                  p.tempId === draft.tempId
                                    ? { ...p, category: val, categoryLabel: label }
                                    : p
                                )
                              );
                            }}
                            className="w-full text-xs font-semibold text-slate-800 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="glp1">Emagrecimento &amp; GLP-1</option>
                            <option value="muscular">Ganho Muscular &amp; Força</option>
                            <option value="longevidade">Longevidade &amp; Reparo</option>
                            <option value="kits">Kits &amp; Combos Clínicos</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Preço (€ EUR):
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">€</span>
                            <input
                              type="number"
                              step="0.1"
                              value={draft.price}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                updateDraftField(draft.tempId, 'price', val);
                                updateDraftField(draft.tempId, 'originalPrice', Math.round(val * 1.35));
                              }}
                              className="w-full text-xs font-bold text-emerald-800 pl-6 pr-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Pureza HPLC:
                          </label>
                          <input
                            type="text"
                            value={draft.purity}
                            onChange={(e) => updateDraftField(draft.tempId, 'purity', e.target.value)}
                            className="w-full text-xs font-semibold text-slate-800 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Description & Clinical details */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          Descrição Clínica &amp; Posologia:
                        </label>
                        <textarea
                          rows={2}
                          value={draft.scientificDescription}
                          onChange={(e) =>
                            updateDraftField(draft.tempId, 'scientificDescription', e.target.value)
                          }
                          className="w-full text-xs text-slate-700 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
                        />
                      </div>

                      {/* Single Publish Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handlePublishSingle(draft)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Este Produto à Loja</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
