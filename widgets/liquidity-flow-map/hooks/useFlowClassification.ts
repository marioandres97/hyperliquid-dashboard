'use client';

// Hook for flow classification and signal detection

import { useState, useEffect, useMemo } from 'react';
import { FlowMetrics, FlowTimePoint, FlowClassification } from '../types';
import { classifyFlow } from '../utils';

export interface UseFlowClassificationOptions {
  metrics: FlowMetrics | null;
  timeSeries: FlowTimePoint[];
  enabled?: boolean;
}

export interface UseFlowClassificationReturn {
  classification: FlowClassification | null;
  isAnalyzing: boolean;
  lastAnalysis: Date | null;
}

/**
 * Hook for classifying flow direction and detecting signals
 */
export function useFlowClassification({
  metrics,
  timeSeries,
  enabled = true,
}: UseFlowClassificationOptions): UseFlowClassificationReturn {
  const [classification, setClassification] = useState<FlowClassification | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  /**
   * Classify flow when metrics change
   */
  useEffect(() => {
    if (!enabled || !metrics) {
      setClassification(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = classifyFlow(metrics, timeSeries);
      setClassification(result);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('[useFlowClassification] Classification error:', error);
      setClassification(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [metrics, timeSeries, enabled]);

  return {
    classification,
    isAnalyzing,
    lastAnalysis,
  };
}
