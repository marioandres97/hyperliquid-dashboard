'use client';

import { ValidationResult, RedFlag } from '../types';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ValidationAlertsProps {
  validation: ValidationResult;
}

export function ValidationAlerts({ validation }: ValidationAlertsProps) {
  const getStatusColor = () => {
    if (validation.passed) return 'green';
    if (validation.redFlags.length > 0) return 'red';
    return 'yellow';
  };

  const statusColor = getStatusColor();
  const statusIcon = validation.passed ? CheckCircle : 
                     validation.redFlags.length > 0 ? XCircle : AlertTriangle;
  const StatusIcon = statusIcon;

  return (
    <div className="space-y-3">
      {/* Status Header */}
      <div className={`p-4 rounded-xl border-2 ${
        statusColor === 'green' ? 'bg-green-500/10 border-green-400' :
        statusColor === 'red' ? 'bg-red-500/10 border-red-400' :
        'bg-yellow-500/10 border-yellow-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${
              statusColor === 'green' ? 'text-green-400' :
              statusColor === 'red' ? 'text-red-400' :
              'text-yellow-400'
            }`} />
            <div>
              <h3 className={`text-lg font-bold ${
                statusColor === 'green' ? 'text-green-400' :
                statusColor === 'red' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {validation.passed ? 'STRATEGY PASSED ✅' :
                 validation.redFlags.length > 0 ? 'STRATEGY FAILED ❌' :
                 'STRATEGY WARNING ⚠️'}
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Validation Score: {validation.score}/100
              </p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${
            statusColor === 'green' ? 'text-green-400' :
            statusColor === 'red' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {validation.score}
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {validation.redFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <h4 className="text-sm font-bold text-red-400">
              Red Flags ({validation.redFlags.length})
            </h4>
          </div>
          <ul className="space-y-2">
            {validation.redFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span className="text-sm text-white/80">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h4 className="text-sm font-bold text-yellow-400">
              Warnings ({validation.warnings.length})
            </h4>
          </div>
          <ul className="space-y-2">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <div>
                  <span className="text-sm text-white/80">{warning.message}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    warning.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    warning.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {warning.severity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {validation.passed && validation.warnings.length === 0 && (
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-green-400" />
            <p className="text-sm text-white/80">
              This strategy passed all validation checks and appears to be realistic and robust.
              However, past performance does not guarantee future results. Always practice proper
              risk management and start with small position sizes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
