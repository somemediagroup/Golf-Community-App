import React from 'react';
import { motion } from 'framer-motion';
import { BRAND } from '@/constants/brand';

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  if (!isLoading) return null;
  
  return (
    <motion.div
      className={`fixed inset-0 bg-[${BRAND.colors.white}] z-50 flex flex-col items-center justify-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div
          className={`absolute -inset-4 rounded-full bg-[${BRAND.colors.primary}]/20 blur-lg`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="relative z-10 flex items-center justify-center"
          animate={{ 
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <img 
            src={BRAND.logos.golfball} 
            alt={BRAND.name} 
            className="h-16 w-16"
          />
        </motion.div>
      </div>
      <motion.h2 
        className={`mt-6 text-[${BRAND.colors.darkGrey}] font-medium text-lg`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Loading...
      </motion.h2>
      <motion.div 
        className="mt-4 bg-gray-200 h-1.5 w-48 rounded-full overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className={`bg-[${BRAND.colors.primary}] h-full`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src={BRAND.logos.golfball} 
            alt="" 
            className="h-6 w-6 -ml-3" 
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default LoadingScreen; 