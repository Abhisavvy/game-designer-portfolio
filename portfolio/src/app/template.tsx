"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/features/portfolio/components/media/useMediaPreferences";

export default function Template({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  
  if (reducedMotion) {
    return <>{children}</>;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.25, 
        ease: [0.22, 1, 0.36, 1] // Custom easing for professional feel
      }}
    >
      {children}
    </motion.div>
  );
}