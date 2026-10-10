/**
 * XORA: EARTH · MOON · MARS
 * Top Navigation Bar with Center-Aligned Navigation Items
 */

import React, { useState } from 'react';
import { Compass, BookOpen, Database, BarChart3, GitCompare, Menu, X, FileText } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'rankings', label: 'Rankings', icon: BarChart3 },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'data-sources', label: 'Data Sources', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090A0F]/95 backdrop-blur-md border-b border-[#1F2737]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between relative">
        {/* Left: Brand Wordmark */}
        <button
          onClick={() => {
            navigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer z-10"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-xl font-black tracking-widest text-white font-sans uppercase">
            XORA
          </span>
          <span className="hidden xl:inline text-[11px] font-mono tracking-wider text-slate-400 border-l border-slate-700 pl-2.5 ml-0.5 uppercase">
            Earth · Moon · Mars
          </span>
        </button>

        {/* Center: All Navigation Links Center-Aligned */}
        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 text-sm font-medium absolute inset-x-0 mx-auto w-max">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => navigate(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Live Connection Indicator & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 z-10">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E1523] border border-slate-800/80 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-slate-400">Atlas Active</span>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1F2737] bg-[#0F121C] px-4 py-4 space-y-2 text-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  navigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 font-semibold border border-cyan-800/40'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
