/**
 * Data Sources View
 * Searchable, filterable catalog of verified planetary and terrestrial remote sensing datasets,
 * documenting resolutions, licenses, access endpoints, and sensor limitations.
 */

import React, { useState, useMemo } from 'react';
import { VERIFIED_DATASETS, VerifiedDataset } from '../data/datasets';
import { Database, Search, ExternalLink, Filter, ShieldCheck, AlertCircle } from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bodyFilter, setBodyFilter] = useState<'all' | 'Earth' | 'Moon' | 'Mars'>('all');

  const filteredDatasets = useMemo(() => {
    return VERIFIED_DATASETS.filter((ds) => {
      const matchesSearch =
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.dataType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBody = bodyFilter === 'all' || ds.body === bodyFilter;
      return matchesSearch && matchesBody;
    });
  }, [searchQuery, bodyFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400">
          <Database className="w-4 h-4" />
          <span>Remote Sensing Data Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Verified Planetary & Terrestrial Datasets
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Complete provenance inventory for all satellite and laser altimetry datasets integrated into XORA.
          All data points directly derive from published NASA, ESA, USGS, and Copernicus remote sensing missions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dataset, organization, or sensor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1523] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Body Filter Tabs */}
        <div className="inline-flex rounded-lg p-1 bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
          {(['all', 'Earth', 'Moon', 'Mars'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBodyFilter(b)}
              className={`px-3 py-1.5 rounded transition-colors uppercase font-mono ${
                bodyFilter === b
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDatasets.map((ds) => (
          <div
            key={ds.id}
            className="bg-[#0E1523] border border-slate-800 rounded-lg p-5 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
                    {ds.body} · {ds.dataType}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2 leading-snug">{ds.name}</h3>
                </div>
                <a
                  href={ds.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors shrink-0"
                  title="Open official dataset archive"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Organization */}
              <div className="text-xs text-slate-400 font-mono">
                Agency: <span className="text-slate-200">{ds.organization}</span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-500 uppercase text-[10px]">Resolution</div>
                  <div className="text-slate-300 font-semibold truncate">{ds.resolution}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-500 uppercase text-[10px]">Coverage</div>
                  <div className="text-slate-300 font-semibold truncate">{ds.coverage}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-500 uppercase text-[10px]">License</div>
                  <div className="text-slate-300 font-semibold truncate">{ds.license}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <div className="text-slate-500 uppercase text-[10px]">Acquisition Period</div>
                  <div className="text-slate-300 font-semibold truncate">{ds.acquisitionDate}</div>
                </div>
              </div>
            </div>

            {/* Documented Limitations */}
            <div className="pt-3 border-t border-slate-800 text-xs space-y-1">
              <div className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Documented Known Limitations</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {ds.limitations}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
