"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "./LoadingSpinner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange(data.url);
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <Image src={value} alt="Uploaded" width={200} height={120} className="rounded-xl border border-[#E3E3E3] object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
          aria-label="Remove image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E3E3E3] bg-[#F4F4F4] text-sm text-[#9A9A9A] transition hover:border-[#B5FF2D]">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Upload className="h-6 w-6" />
          <span>Click to upload (max 5MB)</span>
        </>
      )}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
    </label>
  );
}
