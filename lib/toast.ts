import { toast as sonnerToast } from "sonner";
import React from "react";

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  cancel?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
}

/**
 * Enterprise Studio Toast Helper
 * Designed for Impressa Digital with high-contrast, polished UI/UX & micro-interactions.
 */
export const toast = {
  /**
   * Success notification (Lime / Emerald accent)
   */
  success: (title: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.success(title, {
      description: opts?.description,
      duration: opts?.duration ?? 4000,
      action: opts?.action,
      cancel: opts?.cancel,
    });
  },

  /**
   * Error notification (Crimson / Coral accent)
   */
  error: (title: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.error(title, {
      description: opts?.description,
      duration: opts?.duration ?? 5000,
      action: opts?.action,
      cancel: opts?.cancel,
    });
  },

  /**
   * Informational notification (Cyan / Slate accent)
   */
  info: (title: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.info(title, {
      description: opts?.description,
      duration: opts?.duration ?? 4000,
      action: opts?.action,
      cancel: opts?.cancel,
    });
  },

  /**
   * Warning notification (Amber / Gold accent)
   */
  warning: (title: string, options?: ToastOptions | string) => {
    const opts = typeof options === "string" ? { description: options } : options;
    return sonnerToast.warning(title, {
      description: opts?.description,
      duration: opts?.duration ?? 4500,
      action: opts?.action,
      cancel: opts?.cancel,
    });
  },

  /**
   * Convenient helper for copy to clipboard actions
   */
  copied: (textLabel: string = "Copied to clipboard!") => {
    return sonnerToast.success(textLabel, {
      description: "Text is now in your clipboard ready to paste.",
      duration: 3000,
    });
  },

  /**
   * Async Promise notification wrapper
   */
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, msgs);
  },

  /**
   * Dismiss toast by ID or all toasts
   */
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },

  /**
   * Raw sonner instance access if needed
   */
  raw: sonnerToast,
};
