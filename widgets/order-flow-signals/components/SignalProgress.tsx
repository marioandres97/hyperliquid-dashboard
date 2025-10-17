interface SignalProgressProps {
  currentPrice: number;
  entry: number;
  target: number;
  stop: number;
  type: 'LONG' | 'SHORT';
}

export function SignalProgress({ currentPrice, entry, target, stop, type }: SignalProgressProps) {
  const isLong = type === 'LONG';
  
  // Calculate progress percentage
  const totalDistance = Math.abs(target - stop);
  const currentDistance = isLong 
    ? currentPrice - stop
    : stop - currentPrice;
  
  const progress = Math.max(0, Math.min(100, (currentDistance / totalDistance) * 100));
  
  // Calculate distance to target and stop
  const distanceToTarget = ((Math.abs(currentPrice - target) / entry) * 100).toFixed(2);
  const distanceToStop = ((Math.abs(currentPrice - stop) / entry) * 100).toFixed(2);

  return (
    <div className="mb-6">
      {/* Labels */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs opacity-70 font-medium">Progress to Target</span>
        <span className={`text-xs font-semibold ${isLong ? 'text-green-400' : 'text-red-400'}`}>
          {progress.toFixed(0)}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 relative overflow-hidden
            ${isLong ? 'bg-gradient-to-r from-green-400 to-cyan-400' : 'bg-gradient-to-r from-red-400 to-orange-400'}
          `}
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
               style={{ 
                 animation: 'shimmer 2s infinite',
                 backgroundSize: '200% 100%'
               }} 
          />
        </div>
      </div>
      
      {/* Distance labels */}
      <div className="flex justify-between text-xs opacity-60 mt-2">
        <span>Stop: {distanceToStop}% away</span>
        <span>Target: {distanceToTarget}% away</span>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}