"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setTransitionStage("exit");
    }
  }, [pathname]);

  useEffect(() => {
    if (transitionStage === "enter") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [transitionStage]);

  return (
    <motion.div
      key={transitionStage === "exit" ? "old" : pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onAnimationComplete={() => {
        if (transitionStage === "exit") {
          setDisplayChildren(children);
          setTransitionStage("enter");
        }
      }}
    >
      {transitionStage === "exit" ? displayChildren : children}
    </motion.div>
  );
}
