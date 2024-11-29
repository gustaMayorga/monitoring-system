import React from 'react';
import { ViewGridIcon, ViewBoardsIcon } from '@heroicons/react/outline';

interface Layout {
  rows: number;
  cols: number;
}

interface LayoutSelectorProps {
  currentLayout: Layout;
  onLayoutChange: (layout: Layout) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange
}) => {
  const layouts: Layout[] = [
    { rows: 1, cols: 1 },
    { rows: 1, cols: 2 },
    { rows: 2, cols: 2 },
    { rows: 3, cols: 3 }
  ];

  return (
    <div className="flex space-x-2">
      {layouts.map((layout, index) => (
        <button
          key={index}
          onClick={() => onLayoutChange(layout)}
          className={`
            p-2 rounded-lg
            ${currentLayout.rows === layout.rows && currentLayout.cols === layout.cols
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }
          `}
        >
          {layout.rows === 1 && layout.cols === 1 ? (
            <ViewBoardsIcon className="h-5 w-5" />
          ) : (
            <ViewGridIcon className="h-5 w-5" />
          )}
          <span className="sr-only">
            {layout.rows}x{layout.cols}
          </span>
        </button>
      ))}
    </div>
  );
}; 