// Utility functions for image and PDF file attachments

export interface ProcessedAttachment {
  attachmentUrl: string;
  attachmentName: string;
  attachmentType: 'image' | 'pdf' | 'document';
  attachmentSize: number;
  messageType: 'image' | 'pdf' | 'document';
}

// Format bytes into human-readable size
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Convert image file into optimized compressed base64 JPEG
export function compressImageFile(file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Clean white background for transparency conversion
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert any generic file (such as PDF) to base64 data URL
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Main processor for attachments (Images and PDFs)
export async function processFileAttachment(file: File): Promise<ProcessedAttachment> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  // Max 5MB raw check
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('O arquivo excede o limite máximo de 5MB. Escolha um arquivo menor.');
  }

  if (isImage) {
    const optimizedDataUrl = await compressImageFile(file);
    return {
      attachmentUrl: optimizedDataUrl,
      attachmentName: file.name,
      attachmentType: 'image',
      attachmentSize: Math.round((optimizedDataUrl.length * 3) / 4), // Approximate bytes from base64
      messageType: 'image',
    };
  }

  if (isPdf) {
    // For PDFs, limit to 2MB to keep Firestore document size safely below 1MB
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('O documento PDF deve ter até 2MB para envio rápido no chat.');
    }

    const dataUrl = await fileToBase64(file);
    return {
      attachmentUrl: dataUrl,
      attachmentName: file.name,
      attachmentType: 'pdf',
      attachmentSize: file.size,
      messageType: 'pdf',
    };
  }

  // Generic document fallback
  const genericDataUrl = await fileToBase64(file);
  return {
    attachmentUrl: genericDataUrl,
    attachmentName: file.name,
    attachmentType: 'document',
    attachmentSize: file.size,
    messageType: 'document',
  };
}

// Download an attachment to user's device
export function downloadAttachment(url: string, filename: string) {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'arquivo';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    window.open(url, '_blank');
  }
}
