"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, Layers, Briefcase, Users, MessageSquare, ArrowRight, X } from "lucide-react";
import { toast } from "@/lib/toast";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "service" | "portfolio" | "blog" | "team" | "message";
  href: string;
}

const TYPE_ICONS = {
  service: Layers,
  portfolio: Briefcase,
  blog: FileText,
  team: Users,
  message: MessageSquare,
};

export function CommandKModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = Router();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function Router() {
    return useRouter();
  }

  // Handle focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data) => {
          setResults(data.results || []);
          setSelectedIndex(0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keydown navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex];
        toast.info(`Opening ${item.type}: ${item.title}`);
        router.push(item.href);
        onClose();
      }
    },
    [results, selectedIndex, router, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-[#14121f] text-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search services, blog posts, portfolio, messages..."
            className="w-full bg-transparent px-3 text-base text-white placeholder-white/40 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[#6D3BF5]" />}
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="p-8 text-center text-sm text-white/40">
              Start typing to search across the entire admin panel...
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="p-8 text-center text-sm text-white/40">
              No matching items found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((item, idx) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 transition text-left ${
                  isSelected ? "bg-[#6D3BF5] text-white" : "text-white/80 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isSelected ? "bg-black text-[#6D3BF5]" : "bg-white/10 text-white/70"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? "text-black" : "text-white"}`}>
                      {item.title}
                    </p>
                    <p className={`text-xs ${isSelected ? "text-black/70" : "text-white/40"}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className={`h-4 w-4 opacity-0 transition group-hover:opacity-100 ${
                    isSelected ? "opacity-100 text-black" : "text-white/40"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">↑↓</span> to navigate
            <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">↵</span> to select
          </div>
          <div>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">ESC</span> to close
          </div>
        </div>
      </div>
    </div>
  );
}
