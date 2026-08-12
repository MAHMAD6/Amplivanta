"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "@/lib/toast";
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange(data.url);
      toast.success("Image Uploaded", {
        description: "Media asset ready for preview and publishing.",
      });
    } catch {
      toast.error("Upload Failed", {
        description: "Could not upload image. Ensure format is JPG, PNG, or WEBP.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <Image src={value} alt="Uploaded" width={200} height={120} className="rounded-xl border border-[#e9e7f0] object-cover" />
        <button
          type="button"
          onClick={() => {
            onChange(null);
            toast.info("Image Removed");
          }}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition"
          aria-label="Remove image"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e9e7f0] bg-[#f8f7fb] text-sm text-[#767287] transition hover:border-[#6D3BF5]">
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
