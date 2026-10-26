import React from 'react';
import { SimpleElement } from '../../types';
import { X } from 'lucide-react';

export interface ElementDetailsModalProps {
  element: SimpleElement | null;
  onClose: () => void;
}

export const ElementDetailsModal: React.FC<ElementDetailsModalProps> = ({ element, onClose }) => {
  if (!element) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-elevated overflow-hidden z-50 p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Element Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Screenshot
            </span>
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center">
              <img
                src={element.screenshotUrl || '/assets/placeholder-300x202.jpg'}
                alt="Element screenshot"
                className="max-h-64 object-contain rounded border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/placeholder-300x202.jpg';
                }}
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              CSS Selector
            </span>
            <pre className="mt-1 p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto">
              {element.cssSelector || element.name || element.tagName || 'Unknown selector'}
            </pre>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-400">X Position</span>
              <p className="font-semibold text-gray-800 mt-0.5">{element.xlocation}px</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-400">Y Position</span>
              <p className="font-semibold text-gray-800 mt-0.5">{element.ylocation}px</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-400">Width</span>
              <p className="font-semibold text-gray-800 mt-0.5">{element.width}px</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-400">Height</span>
              <p className="font-semibold text-gray-800 mt-0.5">{element.height}px</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
