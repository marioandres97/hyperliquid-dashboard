'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EducationalTooltipProps {
  title?: string;
  sections: {
    howToAnalyze: string[];
    example: string;
    tip: string;
  };
}

export const EducationalTooltip: React.FC<EducationalTooltipProps> = ({ 
  title = '📚 Cómo Entender Estos Datos', 
  sections 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-purple-400" />
          <span className="font-bold text-purple-300">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? (
            <ChevronUp size={20} className="text-purple-400" />
          ) : (
            <ChevronDown size={20} className="text-purple-400" />
          )}
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Cómo Analizar */}
              <div>
                <h4 className="text-sm font-bold text-blue-400 mb-2">Cómo Analizar:</h4>
                <ul className="space-y-2">
                  {sections.howToAnalyze.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ejemplo */}
              <div 
                className="p-3 rounded-lg"
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <h4 className="text-sm font-bold text-green-400 mb-2">Ejemplo:</h4>
                <p className="text-sm text-gray-300">{sections.example}</p>
              </div>

              {/* Consejo */}
              <div 
                className="p-3 rounded-lg"
                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
              >
                <h4 className="text-sm font-bold text-yellow-400 mb-2">Consejo:</h4>
                <p className="text-sm text-gray-300">{sections.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
