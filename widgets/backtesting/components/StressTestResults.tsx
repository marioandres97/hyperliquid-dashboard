'use client';

import { StressTestResults } from '../types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StressTestResultsProps {
  results: StressTestResults | null;
}

export function StressTestResultsComponent({ results }: StressTestResultsProps) {
  if (!results) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <p className="text-sm text-white/60 text-center">
          Stress tests not run yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white/70">Stress Test Results</h3>
      
      {/* Overall Status */}
      <div className={`p-4 rounded-xl border-2 ${
        results.overallPassed 
          ? 'bg-green-500/10 border-green-400/30' 
          : 'bg-red-500/10 border-red-400/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {results.overallPassed ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-bold ${
              results.overallPassed ? 'text-green-400' : 'text-red-400'
            }`}>
              {results.overallPassed ? 'All Tests Passed' : 'Some Tests Failed'}
            </span>
          </div>
          <span className="text-sm text-white/60">
            {results.tests.filter(t => t.passed).length}/{results.tests.length} passed
          </span>
        </div>
      </div>

      {/* Individual Tests */}
      <div className="space-y-2">
        {results.tests.map((test, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              test.passed
                ? 'bg-green-500/5 border-green-400/20'
                : 'bg-red-500/10 border-red-400/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {test.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {test.name}
                </span>
              </div>
              <span className={`text-xs font-bold ${
                test.degradation < 20 ? 'text-green-400' :
                test.degradation < 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {test.degradation.toFixed(1)}% degradation
              </span>
            </div>
            <p className="text-xs text-white/60 mb-2">{test.description}</p>
            
            {/* Metrics Comparison */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-white/50">Original PnL: </span>
                <span className="text-white">
                  ${test.originalMetrics.totalPnL?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div>
                <span className="text-white/50">Stressed PnL: </span>
                <span className={test.stressedMetrics.totalPnL! >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${test.stressedMetrics.totalPnL?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Worst Case */}
      {results.worstCase && (
        <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">Worst Case Scenario</span>
          </div>
          <p className="text-xs text-white/80">
            {results.worstCase.name}: {results.worstCase.degradation.toFixed(1)}% performance degradation
          </p>
        </div>
      )}
    </div>
  );
}
