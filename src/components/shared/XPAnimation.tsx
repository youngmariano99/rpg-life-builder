import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface XPAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export const XPAnimation = ({ amount, onComplete }: XPAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -60, scale: 1.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
        >
          <span className="font-orbitron font-bold text-xl text-glow-accent text-accent">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LevelUpAnimationProps {
  level: number;
  onComplete?: () => void;
}

export const LevelUpAnimation = ({ level, onComplete }: LevelUpAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
          onClick={() => {
            setIsVisible(false);
            onComplete?.();
          }}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px hsl(var(--accent) / 0.3)',
                  '0 0 60px hsl(var(--accent) / 0.6)',
                  '0 0 20px hsl(var(--accent) / 0.3)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block p-8 rounded-full bg-card border-2 border-accent"
            >
              <span className="font-orbitron font-black text-6xl text-accent">
                {level}
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-orbitron text-3xl text-glow-primary text-primary"
            >
              ¡NIVEL ALCANZADO!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-lg text-muted-foreground"
            >
              Continúa tu aventura
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
