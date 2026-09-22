import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  FileImage,
} from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  helperText?: string;
  aspectRatio?: 'logo' | 'square' | 'banner' | 'portrait' | 'any';
  placeholder?: string;
  id?: string;
  maxDimension?: number;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'square',
  placeholder = 'https://...',
  id,
  maxDimension = 1200,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal url input if external value changes
  React.useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback('Erro: O arquivo selecionado não é uma imagem válida.');
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionamento inteligente no cliente via Canvas
        let { width, height } = img;
        const max = maxDimension;

        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Para logos transparentes ou PNGs manter transparência
          if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml') {
            ctx.clearRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Salvar como WebP ou PNG
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';
          const quality = outputType === 'image/webp' ? 0.88 : undefined;
          const compressedDataUrl = canvas.toDataURL(outputType, quality);

          onChange(compressedDataUrl);
          setIsProcessing(false);
          setFeedback('Imagem carregada com sucesso!');
          setTimeout(() => setFeedback(null), 3000);
        } else {
          // Fallback para resultado direto do reader
          onChange(event.target?.result as string);
          setIsProcessing(false);
          setFeedback('Imagem carregada com sucesso!');
          setTimeout(() => setFeedback(null), 3000);
        }
      };

      img.onerror = () => {
        setIsProcessing(false);
        setFeedback('Não foi possível ler os dados desta imagem.');
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setFeedback('Erro ao ler o arquivo local.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFeedback('Imagem removida.');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleUrlApply = () => {
    onChange(urlInput.trim());
    setFeedback('URL aplicada com sucesso!');
    setTimeout(() => setFeedback(null), 2500);
  };

  // Preview container styling based on aspect ratio
  const getPreviewClasses = () => {
    switch (aspectRatio) {
      case 'banner':
        return 'w-full h-32 sm:h-40';
      case 'logo':
        return 'w-24 h-24 sm:w-28 sm:h-28';
      case 'portrait':
        return 'w-24 h-32 sm:w-28 sm:h-36';
      case 'square':
      default:
        return 'w-24 h-24 sm:w-28 sm:h-28';
    }
  };

  const isBase64 = value && value.startsWith('data:image');

  return (
    <div className={`flex flex-col gap-2 ${className}`} id={id}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FileImage className="w-3.5 h-3.5 text-[#006750]" />
          <span>{label}</span>
        </label>

        {/* Mode Toggle (Upload vs URL) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-white text-[#006750] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload (Arquivo)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white text-[#006750] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Main Upload Dropzone or URL Panel */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Thumbnail Preview Area */}
        <div
          className={`relative rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1.5 shadow-2xs ${getPreviewClasses()}`}
          style={{
            backgroundImage:
              'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        >
          {value ? (
            <>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                title="Remover imagem"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
              <ImageIcon className="w-6 h-6 mb-1 opacity-50 text-slate-400" />
              <span className="text-[10px] font-medium leading-tight">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Interaction Panel */}
        <div className="flex-1 w-full flex flex-col gap-2">
          {mode === 'upload' ? (
            /* DRAG AND DROP UPLOAD ZONE */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full min-h-[96px] p-3 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging
                  ? 'border-[#006750] bg-emerald-50 scale-[1.01]'
                  : 'border-slate-300 hover:border-[#006750] bg-slate-50/70 hover:bg-emerald-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {isProcessing ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#006750]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Otimizando imagem para upload...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-[#006750] flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    <span className="text-[#006750] underline font-bold">Clique para selecionar</span> ou arraste a imagem aqui
                  </div>
                  <span className="text-[10px] text-slate-400">
                    PNG, JPG, WebP ou SVG (otimização instantânea)
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* URL INPUT PANEL */
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlApply();
                    }
                  }}
                  placeholder={placeholder}
                  className="flex-1 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006750]"
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-3 h-9 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Aplicar
                </button>
              </div>
              <span className="text-[10px] text-slate-400">
                Pressione Aplicar ou Enter para atualizar a imagem via link externo.
              </span>
            </div>
          )}

          {/* Feedback message / Helper text */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            {feedback ? (
              <span
                className={`font-semibold flex items-center gap-1 ${
                  feedback.includes('Erro') ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {feedback.includes('Erro') ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{feedback}</span>
              </span>
            ) : (
              <span className="text-slate-500">
                {helperText ||
                  (isBase64
                    ? '✓ Imagem enviada via upload local'
                    : value
                    ? '✓ Imagem configurada via URL'
                    : 'Nenhuma imagem selecionada')}
              </span>
            )}

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
