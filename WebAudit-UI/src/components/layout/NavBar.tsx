import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Network, BookOpen } from 'lucide-react';
import { AuthButton } from '../shared/AuthButton';

export const NavBar: React.FC = () => {
  return (
    <nav
      id="default-sidebar"
      className="fixed top-0 left-0 h-screen w-64 z-30"
      aria-label="Sidenav"
    >
      <div className="flex flex-col h-full bg-charcoal-950 text-white border-r border-white/10">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
            <Search size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight">WebAudit</span>
          <span className="text-2xs font-medium bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded">
            BETA
          </span>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3">
            <span className="text-2xs font-semibold uppercase tracking-wider text-white/40">
              Workspace
            </span>
          </div>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/audit"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Search size={18} className="text-center" />
                <span>Audits</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/integration"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Network size={18} className="text-center" />
                <span>Integrations</span>
              </NavLink>
            </li>
          </ul>

          <div className="mt-6 mb-2 px-3">
            <span className="text-2xs font-semibold uppercase tracking-wider text-white/40">
              Resources
            </span>
          </div>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/how-it-works"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <BookOpen size={18} className="text-center" />
                <span>How it works</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Bottom Section: Auth */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-1 py-1">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
