import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-8 border-t border-gray-200 bg-white text-center">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>
          WebAudit — Automated Website Auditing Platform
        </p>
        <p className="text-gray-400">
          WCAG 2.2 AA & UX Intelligence Platform
        </p>
      </div>
    </footer>
  );
};
