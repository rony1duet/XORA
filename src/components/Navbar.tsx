/**
 * XORA: EARTH · MOON · MARS
 * Clean Minimal Navigation Bar
 * Features:
 * - Left: Brand wordmark with live status anchor
 * - Right: Floating glass capsule navigation (Explore Atlas, Compare, Rankings) and mobile trigger
 * - Mobile: Smooth backdrop-blur drawer with clean action cards
 */

import React, { useState } from 'react';
import { Compass, BarChart3, GitCompare, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore Atlas', icon: Compass },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'rankings', label: 'Rankings', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#07090E]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <button
          onClick={() => {
            navigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer shrink-0"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            <div className="absolute w-4 h-4 rounded-full bg-cyan-400/20 animate-ping opacity-75" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-widest text-white uppercase font-sans">
              XORA
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-slate-400 border-l border-slate-800 pl-2 uppercase">
              Terrain Atlas
            </span>
          </div>
        </button>

        {/* Right: Floating Glass Capsule Navigation & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center p-1 rounded-full bg-[#0D131F]/90 border border-slate-800/80 shadow-inner">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => navigate(link.id)}
                  className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#080C16]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
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
                className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/50'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{link.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
