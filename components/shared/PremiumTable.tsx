'use client';

import { ReactNode } from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface PremiumTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  className?: string;
}

export function PremiumTable({ 
  columns, 
  data, 
  onRowClick,
  emptyMessage = 'No data available',
  className = '' 
}: PremiumTableProps) {
  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-white/40 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-sm font-semibold text-white/60 ${getAlignment(column.align)}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-white/5 last:border-0
                ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}
                transition-colors duration-150
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-white ${getAlignment(column.align)}`}
                >
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
