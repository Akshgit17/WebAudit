import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="text-xs uppercase font-bold tracking-widest text-brand-500 mb-2">404 Error</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">We can't find that page.</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          The link may be broken, or the page may have moved.
        </p>

        <div className="flex items-center justify-center gap-3 text-sm font-medium">
          <Link to="/" className="text-brand-600 hover:text-brand-700 hover:underline">
            Go home
          </Link>
          <span className="text-gray-300">·</span>
          <Link to="/audit" className="text-brand-600 hover:text-brand-700 hover:underline">
            View your audits
          </Link>
          <span className="text-gray-300">·</span>
          <Link to="/how-it-works" className="text-brand-600 hover:text-brand-700 hover:underline">
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
};
