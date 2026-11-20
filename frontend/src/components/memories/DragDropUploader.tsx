"use client";

import { CheckCircle2, FileText, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import React, { useRef, useState } from "react";

interface DragDropUploaderProps {
  onAttachmentAdded: (attachment: {
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    extracted_text: string | null;
  }) => void;
}

export function DragDropUploader({ onAttachmentAdded }: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
    ocr: string | null;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;

      // Simulated OCR / Vision extraction
      setTimeout(() => {
        let simulatedOcr = "Preserved image document in memory vault.";
        if (file.name.toLowerCase().includes("book") || file.name.toLowerCase().includes("page")) {
          simulatedOcr = "Extracted quote: 'True architecture creates an emotional shelter for our virtues.'";
        } else if (file.name.toLowerCase().includes("ticket") || file.name.toLowerCase().includes("receipt")) {
          simulatedOcr = "Travel ticket: Kyoto Express line #402, Heian period commemorative entrance slip.";
        } else if (file.name.toLowerCase().includes("menu") || file.name.toLowerCase().includes("coffee")) {
          simulatedOcr = "Espresso origin: Sidama Bensa anaerobic natural process, notes of bergamot and lilac.";
        }

        const attachment = {
          file_path: base64Url,
          file_name: file.name,
          file_type: file.type || "image/jpeg",
          file_size: file.size,
          extracted_text: simulatedOcr,
        };

        setPreview({
          url: base64Url,
          name: file.name,
          ocr: simulatedOcr,
        });

        onAttachmentAdded(attachment);
        setIsProcessing(false);
      }, 900);
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-purple-500 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              : "border-[#27243c] hover:border-purple-500/50 hover:bg-[#12111d]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,application/pdf,text/*"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-200">
                {isProcessing
                  ? "Extracting text with Vision OCR..."
                  : "Drop photo, ticket, or note here to upload"}
              </p>
              <p className="text-[10px] text-gray-400 font-mono-retro mt-0.5">
                Supports JPG, PNG, WEBP, PDF (Auto-OCR enabled)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#11101b] border border-purple-900/40 flex items-start gap-3 relative">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#2b2744] bg-black flex-shrink-0">
            {preview.url.startsWith("data:image") || preview.url.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-400">
                <FileText className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6 space-y-1">
            <p className="text-xs font-medium text-gray-200 truncate">{preview.name}</p>
            {preview.ocr && (
              <div className="text-[11px] text-purple-300 font-mono-retro bg-purple-950/40 p-1.5 rounded border border-purple-900/30 flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">OCR: {preview.ocr}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={removeAttachment}
            className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
