'use client';

/**
 * Example component demonstrating Liquidity Flow Map usage
 * This is a reference implementation showing how to use the infrastructure
 */

import { useLiquidityFlowData, useFlowClassification } from './hooks';
import type { Coin, TimeWindow } from './types';

export interface LiquidityFlowMapExampleProps {
  coin?: Coin;
  timeWindow?: TimeWindow;
}

export function LiquidityFlowMapExample({
  coin = 'BTC',
  timeWindow = '5m',
}: LiquidityFlowMapExampleProps) {
  const {
    flowData,
    metrics,
    timeSeries,
    isCollecting,
    lastUpdate,
    state,
  } = useLiquidityFlowData({
    coin,
    timeWindow,
    updateInterval: 1000,
  });

  const { classification } = useFlowClassification({
    metrics,
    timeSeries,
    enabled: true,
  });

  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Liquidity Flow Map - {coin}</h2>
        <p className="text-sm text-gray-600">
          Time Window: {timeWindow} | Status: {isCollecting ? '🟢 Collecting' : '🔴 Stopped'}
        </p>
        {lastUpdate && (
          <p className="text-xs text-gray-500">
            Last Update: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-xs text-gray-600">Flow Direction</div>
            <div className="text-lg font-bold capitalize">
              {metrics.flowDirection}
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded">
            <div className="text-xs text-gray-600">Net Flow</div>
            <div className="text-lg font-bold">
              {metrics.netFlow.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded">
            <div className="text-xs text-gray-600">Total Trades</div>
            <div className="text-lg font-bold">{metrics.totalTrades}</div>
          </div>

          <div className="p-3 bg-orange-50 rounded">
            <div className="text-xs text-gray-600">Whale Trades</div>
            <div className="text-lg font-bold">{metrics.whaleTradeCount}</div>
          </div>

          <div className="p-3 bg-teal-50 rounded">
            <div className="text-xs text-gray-600">Buy Volume</div>
            <div className="text-lg font-bold">
              {metrics.totalBuyVolume.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded">
            <div className="text-xs text-gray-600">Sell Volume</div>
            <div className="text-lg font-bold">
              {metrics.totalSellVolume.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded">
            <div className="text-xs text-gray-600">Volume Imbalance</div>
            <div className="text-lg font-bold">
              {(metrics.volumeImbalance * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-3 bg-pink-50 rounded">
            <div className="text-xs text-gray-600">Liquidations</div>
            <div className="text-lg font-bold">
              {metrics.totalLiquidations}
            </div>
          </div>
        </div>
      )}

      {classification && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Flow Classification</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Strength:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${classification.strength}%` }}
                />
              </div>
              <span className="text-sm font-bold">
                {classification.strength.toFixed(0)}%
              </span>
            </div>

            <div className="text-sm">
              Confidence: {(classification.confidence * 100).toFixed(0)}%
            </div>

            {classification.signals.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-semibold mb-1">Signals:</div>
                <ul className="text-xs space-y-1">
                  {classification.signals.map((signal, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="font-mono">{signal.type}</span>
                      <span className="text-gray-600">
                        {signal.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {flowData && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Liquidity Nodes</h3>
          <div className="text-sm text-gray-600">
            Active price levels: {flowData.nodes.size}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <div>Trades processed: {state.tradesProcessed}</div>
        <div>Liquidations processed: {state.liquidationsProcessed}</div>
        {state.errors.length > 0 && (
          <div className="text-red-600 mt-1">
            Errors: {state.errors.length}
          </div>
        )}
      </div>
    </div>
  );
}
