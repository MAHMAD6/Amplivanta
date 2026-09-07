"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteSocialPost } from "@/app/(app)/app/social/actions";

export function DeletePostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!confirming) {
    return (
      <button
        type="button"
        aria-label="Delete post"
        onClick={() => setConfirming(true)}
        className="rounded-lg p-1.5 text-ink-muted transition hover:bg-bg-soft hover:text-red-600"
      >
        <Trash2 aria-hidden className="h-4 w-4" />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteSocialPost(postId);
            setConfirming(false);
            router.refresh();
          })
        }
        className="inline-flex h-7 items-center gap-1 rounded-lg bg-red-600 px-2 text-[11.5px] font-bold text-white disabled:opacity-60"
      >
        {pending && <Loader2 aria-hidden className="h-3 w-3 animate-spin" />} Delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="h-7 rounded-lg border border-line px-2 text-[11.5px] font-bold text-ink-soft"
      >
        Cancel
      </button>
    </span>
  );
}
