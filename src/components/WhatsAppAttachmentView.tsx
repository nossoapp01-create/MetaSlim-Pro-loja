import React, { useState } from 'react';
import { FileText, Download, ExternalLink, X, ZoomIn, Eye } from 'lucide-react';
import { formatFileSize, downloadAttachment } from '../utils/fileUtils';

interface WhatsAppAttachmentViewProps {
  attachmentUrl: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'document';
  attachmentSize?: number;
  isAdmin?: boolean;
}

export const WhatsAppAttachmentView: React.FC<WhatsAppAttachmentViewProps> = ({
  attachmentUrl,
  attachmentName,
  attachmentType = 'image',
  attachmentSize = 0,
  isAdmin = false,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Check if it's an image
  const isImage =
    attachmentType === 'image' ||
    attachmentUrl.startsWith('data:image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(attachmentName || '');

  // Check if it's a PDF
  const isPdf =
    attachmentType === 'pdf' ||
    attachmentUrl.startsWith('data:application/pdf') ||
    /\.pdf$/i.test(attachmentName || '');

  // 1. RENDER IMAGE / PHOTO
  if (isImage) {
    return (
      <div className="my-1">
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="group relative rounded-xl overflow-hidden cursor-pointer border border-black/10 bg-black/5 hover:opacity-95 transition-all shadow-xs max-w-sm"
        >
          <img
            src={attachmentUrl}
            alt={attachmentName || 'Foto enviada'}
            className="w-full max-h-72 object-cover rounded-xl"
            loading="lazy"
          />

          {/* Hover Overlay with Zoom Icon */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
            <span className="p-2 rounded-full bg-black/60 backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold">
              <ZoomIn className="w-4 h-4" />
              <span>Ver Foto</span>
            </span>
          </div>
        </div>

        {/* Full-Screen Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar with File Name and Action Buttons */}
            <div
              className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 truncate max-w-[70%]">
                <span className="text-sm font-bold truncate">
                  {attachmentName || 'Visualização da Foto'}
                </span>
                {attachmentSize > 0 && (
                  <span className="text-xs text-white/60 font-mono">
                    ({formatFileSize(attachmentSize)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadAttachment(attachmentUrl, attachmentName || 'foto.jpg')}
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Baixar imagem"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Centered Image */}
            <div
              className="relative max-w-4xl max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={attachmentUrl}
                alt={attachmentName || 'Foto'}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. RENDER PDF DOCUMENT (AUTHENTIC WHATSAPP PDF CARD)
  if (isPdf) {
    const displayName = attachmentName || 'Documento.pdf';

    return (
      <div className="my-1 max-w-sm">
        <div
          onClick={() => downloadAttachment(attachmentUrl, displayName)}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            isAdmin
              ? 'bg-[#d1f4cc]/70 hover:bg-[#d1f4cc] border-emerald-300/80 text-emerald-950'
              : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-900'
          }`}
          title="Clique para abrir ou baixar o PDF"
        >
          {/* Red PDF Icon Badge */}
          <div className="w-11 h-12 rounded-lg bg-rose-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">PDF</span>
          </div>

          {/* Document Information */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-xs font-bold truncate leading-snug">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
              <span>{formatFileSize(attachmentSize)}</span>
              <span>•</span>
              <span className="text-[10px] uppercase font-semibold text-rose-600">Documento PDF</span>
            </span>
          </div>

          {/* Download Action Icon */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center shrink-0 transition-colors cursor-pointer text-slate-700"
            title="Baixar arquivo"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. GENERIC FILE ATTACHMENT
  const genericName = attachmentName || 'Arquivo';
  return (
    <div className="my-1 max-w-sm">
      <div
        onClick={() => downloadAttachment(attachmentUrl, genericName)}
        className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-slate-50 border-slate-200 transition-all cursor-pointer shadow-xs"
        title="Clique para baixar o arquivo"
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-900 truncate block">
            {genericName}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {formatFileSize(attachmentSize)}
          </span>
        </div>
        <Download className="w-4 h-4 text-slate-600 shrink-0" />
      </div>
    </div>
  );
};
