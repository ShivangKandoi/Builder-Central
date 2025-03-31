'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  const [items, setItems] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    setItems(childrenArray);
  }, [children]);

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 