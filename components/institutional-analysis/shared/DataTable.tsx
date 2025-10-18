import React from 'react';
import { motion } from 'framer-motion';

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  maxHeight?: string;
  stickyHeader?: boolean;
}

export function DataTable<T = any>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  className = '',
  rowClassName,
  onRowClick,
  maxHeight = '500px',
  stickyHeader = true,
}: DataTableProps<T>) {
  const alignClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`overflow-auto ${className}`} style={{ maxHeight }}>
      <table className="w-full">
        <thead
          className={`${stickyHeader ? 'sticky top-0 z-10' : ''}`}
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-sm font-semibold text-purple-200 border-b border-purple-500/20 ${alignClass(column.align)}`}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const key = keyExtractor(row, index);
              const rowClass = rowClassName?.(row, index) || '';
              const clickable = onRowClick ? 'cursor-pointer hover:bg-white/5' : '';

              return (
                <motion.tr
                  key={key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  className={`border-b border-gray-700/30 transition-colors ${clickable} ${rowClass}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm ${alignClass(column.align)}`}
                      >
                        {column.render ? column.render(value, row) : value}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
