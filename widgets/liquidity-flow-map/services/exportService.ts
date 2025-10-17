/**
 * Export Service
 * Handles exporting data in various formats: screenshot, video, CSV, JSON, PDF
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type {
  ExportConfig,
  ExportResult,
  FlowData,
  TradeSetup,
  DetectedPattern,
  FlowMetrics,
} from '../types';

export class ExportService {
  /**
   * Export as screenshot (PNG)
   */
  async exportScreenshot(
    elementId: string,
    filename?: string
  ): Promise<ExportResult> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#000000',
      scale: 2, // Higher quality
      logging: false,
    });

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    const finalFilename = filename || `liquidity-flow-${Date.now()}.png`;

    return {
      format: 'screenshot',
      data: blob,
      filename: finalFilename,
      timestamp: Date.now(),
    };
  }

  /**
   * Export as video (series of screenshots)
   */
  async exportVideo(
    elementId: string,
    snapshots: (() => Promise<void>)[],
    filename?: string
  ): Promise<ExportResult> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const frames: Blob[] = [];

    for (const snapshot of snapshots) {
      await snapshot(); // Apply snapshot state
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render

      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      frames.push(blob);
    }

    // Combine frames into a zip or create a simple video format
    // For now, we'll just return the first frame as a placeholder
    // A full video implementation would require a video encoding library

    const finalFilename = filename || `liquidity-flow-video-${Date.now()}.png`;

    return {
      format: 'video',
      data: frames[0] || new Blob(),
      filename: finalFilename,
      timestamp: Date.now(),
    };
  }

  /**
   * Export flow data as CSV
   */
  exportCSV(
    flowData: FlowData,
    config: Partial<ExportConfig> = {}
  ): ExportResult {
    const lines: string[] = [];

    // Header
    lines.push('Timestamp,Price,Buy Volume,Sell Volume,Net Flow,Buy Count,Sell Count,Whale Activity');

    // Data rows from nodes
    flowData.nodes.forEach((node, price) => {
      lines.push([
        new Date(node.timestamp).toISOString(),
        price,
        node.buyVolume,
        node.sellVolume,
        node.netFlow,
        node.buyCount,
        node.sellCount,
        node.whaleActivity ? 'Yes' : 'No',
      ].join(','));
    });

    // Trade data if requested
    if (config.includePatterns && flowData.trades.length > 0) {
      lines.push('\n# Trades');
      lines.push('Timestamp,Side,Price,Size,Notional,Classification');
      
      flowData.trades.forEach(trade => {
        lines.push([
          new Date(trade.timestamp).toISOString(),
          trade.side,
          trade.price,
          trade.size,
          trade.notional,
          trade.classification.level,
        ].join(','));
      });
    }

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = `flow-data-${flowData.coin}-${Date.now()}.csv`;

    return {
      format: 'csv',
      data: blob,
      filename,
      timestamp: Date.now(),
    };
  }

  /**
   * Export setups as CSV
   */
  exportSetupsCSV(setups: TradeSetup[]): ExportResult {
    const lines: string[] = [];

    // Header
    lines.push('ID,Coin,Type,Quality,Confidence,Entry,Target1,Target2,Stop Loss,R:R,Status,Description');

    // Data rows
    setups.forEach(setup => {
      lines.push([
        setup.id,
        setup.coin,
        setup.type,
        setup.quality.toFixed(1),
        setup.confidence.toFixed(2),
        setup.entry.toFixed(2),
        setup.target1.toFixed(2),
        setup.target2.toFixed(2),
        setup.stopLoss.toFixed(2),
        setup.riskRewardRatio.toFixed(2),
        setup.status,
        `"${setup.description}"`,
      ].join(','));
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const filename = `trade-setups-${Date.now()}.csv`;

    return {
      format: 'csv',
      data: blob,
      filename,
      timestamp: Date.now(),
    };
  }

  /**
   * Export as JSON
   */
  exportJSON(
    data: any,
    filename?: string
  ): ExportResult {
    // Convert Maps to arrays for JSON serialization
    const serializable = this.makeSerializable(data);
    
    const json = JSON.stringify(serializable, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const finalFilename = filename || `export-${Date.now()}.json`;

    return {
      format: 'json',
      data: blob,
      filename: finalFilename,
      timestamp: Date.now(),
    };
  }

  /**
   * Export as PDF report
   */
  async exportPDF(
    title: string,
    metrics: FlowMetrics,
    patterns: DetectedPattern[],
    setups: TradeSetup[],
    screenshotBlob?: Blob
  ): Promise<ExportResult> {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(title, 20, yPosition);
    yPosition += 15;

    // Timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;

    // Flow Metrics
    doc.setFontSize(16);
    doc.text('Flow Metrics', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const metricsText = [
      `Net Flow: ${metrics.netFlow.toFixed(2)}`,
      `Flow Direction: ${metrics.flowDirection}`,
      `Total Trades: ${metrics.totalTrades}`,
      `Whale Trades: ${metrics.whaleTradeCount}`,
      `Volume Imbalance: ${metrics.volumeImbalance.toFixed(2)}`,
      `Liquidations: ${metrics.totalLiquidations}`,
    ];

    metricsText.forEach(text => {
      doc.text(text, 25, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Patterns
    if (patterns.length > 0) {
      doc.setFontSize(16);
      doc.text('Detected Patterns', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      patterns.slice(0, 5).forEach(pattern => {
        doc.text(`• ${pattern.type}: ${pattern.description}`, 25, yPosition);
        yPosition += 7;
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });

      yPosition += 5;
    }

    // Trade Setups
    if (setups.length > 0) {
      doc.setFontSize(16);
      doc.text('Trade Setups', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      setups.forEach(setup => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(`${setup.description}`, 25, yPosition);
        yPosition += 7;
        doc.text(`  Type: ${setup.type.toUpperCase()}  Quality: ${setup.quality.toFixed(1)}/100`, 25, yPosition);
        yPosition += 7;
        doc.text(`  Entry: ${setup.entry.toFixed(2)}  Target: ${setup.target1.toFixed(2)}  Stop: ${setup.stopLoss.toFixed(2)}`, 25, yPosition);
        yPosition += 7;
        doc.text(`  R:R: ${setup.riskRewardRatio.toFixed(2)}:1`, 25, yPosition);
        yPosition += 10;
      });
    }

    // Add screenshot if provided
    if (screenshotBlob) {
      doc.addPage();
      const imageData = await this.blobToBase64(screenshotBlob);
      doc.addImage(imageData, 'PNG', 10, 10, 190, 100);
    }

    const pdfBlob = doc.output('blob');
    const filename = `report-${Date.now()}.pdf`;

    return {
      format: 'pdf',
      data: pdfBlob,
      filename,
      timestamp: Date.now(),
    };
  }

  /**
   * Download export result
   */
  download(result: ExportResult): void {
    const url = URL.createObjectURL(result.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Share export result (Web Share API)
   */
  async share(result: ExportResult): Promise<void> {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const file = new File([result.data as Blob], result.filename, {
      type: (result.data as Blob).type,
    });

    await navigator.share({
      files: [file],
      title: 'Liquidity Flow Map Export',
      text: `Export from Liquidity Flow Map - ${new Date().toLocaleString()}`,
    });
  }

  /**
   * Make data serializable for JSON export
   */
  private makeSerializable(data: any): any {
    if (data instanceof Map) {
      return Array.from(data.entries());
    }

    if (Array.isArray(data)) {
      return data.map(item => this.makeSerializable(item));
    }

    if (data && typeof data === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.makeSerializable(value);
      }
      return result;
    }

    return data;
  }

  /**
   * Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Singleton instance
let instance: ExportService | null = null;

export function getExportService(): ExportService {
  if (!instance) {
    instance = new ExportService();
  }
  return instance;
}
