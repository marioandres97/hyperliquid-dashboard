'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EducationalTooltipProps {
  title: string;
  content: string | React.ReactNode;
  examples?: string[];
  tips?: string[];
}

export const EducationalTooltip: React.FC<EducationalTooltipProps> = ({
  title,
  content,
  examples,
  tips,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="mt-6 rounded-lg overflow-hidden"
      style={{
        background: 'rgba(139, 92, 246, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-500/10 transition-all"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="text-purple-400" size={18} />
          <span className="text-purple-300 font-semibold text-sm">
            📚 Cómo Entender Estos Datos
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-purple-400" size={18} />
        ) : (
          <ChevronDown className="text-purple-400" size={18} />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Main Content */}
              <div className="text-gray-300 text-sm leading-relaxed">
                {typeof content === 'string' ? (
                  <p>{content}</p>
                ) : (
                  content
                )}
              </div>

              {/* Examples */}
              {examples && examples.length > 0 && (
                <div>
                  <h4 className="text-purple-300 font-semibold text-sm mb-2">
                    📖 Ejemplos Prácticos:
                  </h4>
                  <ul className="space-y-2">
                    {examples.map((example, index) => (
                      <li 
                        key={index}
                        className="text-gray-400 text-sm pl-4 border-l-2 border-purple-500/30"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {tips && tips.length > 0 && (
                <div>
                  <h4 className="text-blue-300 font-semibold text-sm mb-2">
                    💡 Consejos:
                  </h4>
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li 
                        key={index}
                        className="text-gray-400 text-sm pl-4 border-l-2 border-blue-500/30"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationalTooltip;
