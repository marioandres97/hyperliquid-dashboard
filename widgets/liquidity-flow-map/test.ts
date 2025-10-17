// Simple manual test to verify the infrastructure

import {
  // Types
  Coin,
  TimeWindow,
  RawTrade,
  RawLiquidation,
  
  // Utilities
  classifyTrade,
  classifyLiquidation,
  aggregateTradesToNodes,
  calculateFlowMetrics,
  
  // Services (can be tested in browser)
  TradeCollector,
  LiquidationCollector,
  DataAggregator,
} from './index';

/**
 * Test data classification
 */
export function testClassification() {
  console.log('Testing trade classification...');
  
  const rawTrade: RawTrade = {
    coin: 'BTC',
    side: 'B',
    px: '106000',
    sz: '10',
    time: Date.now(),
    hash: 'test123',
    tid: 1,
  };
  
  const classified = classifyTrade(rawTrade);
  console.log('Classified trade:', classified);
  console.log('Level:', classified.classification.level);
  console.log('Notional:', classified.notional);
  
  return classified;
}

/**
 * Test aggregation
 */
export function testAggregation() {
  console.log('Testing data aggregation...');
  
  const trades = [
    classifyTrade({
      coin: 'BTC',
      side: 'B',
      px: '106000',
      sz: '10',
      time: Date.now(),
      hash: 'hash1',
      tid: 1,
    }),
    classifyTrade({
      coin: 'BTC',
      side: 'A',
      px: '106005',
      sz: '5',
      time: Date.now(),
      hash: 'hash2',
      tid: 2,
    }),
  ];
  
  const nodes = aggregateTradesToNodes(trades, 10);
  console.log('Aggregated nodes:', nodes.size);
  nodes.forEach((node, price) => {
    console.log(`Price ${price}:`, node);
  });
  
  const metrics = calculateFlowMetrics(trades, [], nodes);
  console.log('Flow metrics:', metrics);
  
  return { nodes, metrics };
}

/**
 * Test data aggregator service
 */
export function testDataAggregator() {
  console.log('Testing DataAggregator service...');
  
  const aggregator = new DataAggregator();
  
  // Add some test trades
  const trade1 = classifyTrade({
    coin: 'BTC',
    side: 'B',
    px: '106000',
    sz: '10',
    time: Date.now(),
    hash: 'hash1',
    tid: 1,
  });
  
  const trade2 = classifyTrade({
    coin: 'BTC',
    side: 'A',
    px: '106005',
    sz: '5',
    time: Date.now() - 1000,
    hash: 'hash2',
    tid: 2,
  });
  
  aggregator.addTrade(trade1);
  aggregator.addTrade(trade2);
  
  const flowData = aggregator.getFlowData('BTC', '5m');
  console.log('Flow data:', flowData);
  console.log('Metrics:', flowData.metrics);
  
  const counts = aggregator.getDataCounts();
  console.log('Data counts:', counts);
  
  return flowData;
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('=== Running Liquidity Flow Map Tests ===\n');
  
  try {
    console.log('\n--- Test 1: Classification ---');
    testClassification();
    
    console.log('\n--- Test 2: Aggregation ---');
    testAggregation();
    
    console.log('\n--- Test 3: DataAggregator Service ---');
    testDataAggregator();
    
    console.log('\n=== All tests completed successfully ===');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).liquidityFlowMapTests = {
    testClassification,
    testAggregation,
    testDataAggregator,
    runAllTests,
  };
}
