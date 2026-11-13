/**
 * XORA API Hub & Planetary Match Modal
 * Enables connecting to teammate's dataset API (https://planetary-analog-finder.vercel.app),
 * testing live health/latency, syncing remote candidate sites, running custom terrain matches,
 * and inspecting the Ridge regression ML model.
 */

import React, { useState, useEffect } from 'react';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  getApiKey,
  setApiKey,
  testApiConnection,
  ApiHealthStatus,
  getTeammateApiSpecification,
  matchPlanetaryTarget,
  fetchApiSites,
  DEFAULT_API_URL,
  DEFAULT_API_KEY,
} from '../services/analogApiService';
import { EARTH_ANALOG_CANDIDATES } from '../data/earthAnalogs';
import { EarthCandidateSite, GeologicalClass, MissionActivity, SimilarityResult } from '../types/analog';
import {
  Server,
  Activity,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Sparkles,
  X,
  Code2,
  Brain,
} from 'lucide-react';

interface ApiHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSitesUpdated?: (sites: EarthCandidateSite[], isRemote: boolean) => void;
  onViewTwin?: (earthId: string) => void;
}

export const ApiHubModal: React.FC<ApiHubModalProps> = ({
  isOpen,
  onClose,
  onSitesUpdated,
  onViewTwin,
}) => {
  const [apiUrl, setApiUrlState] = useState<string>('');
  const [apiKey, setApiKeyState] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'connection' | 'custom-match' | 'schema'>('connection');
  const [health, setHealth] = useState<ApiHealthStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Custom Target Matcher State
  const [customBody, setCustomBody] = useState<'moon' | 'mars'>('mars');
  const [customRelief, setCustomRelief] = useState<number>(1200);
  const [customSlope, setCustomSlope] = useState<number>(8.5);
  const [customRoughness, setCustomRoughness] = useState<number>(0.75);
  const [customHazards, setCustomHazards] = useState<number>(30);
  const [customLithology, setCustomLithology] = useState<GeologicalClass>('volcanic_basalt');
  const [customActivity, setCustomActivity] = useState<MissionActivity>('rover-traverse');
  const [customResults, setCustomResults] = useState<SimilarityResult[] | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const url = getApiBaseUrl();
      const key = getApiKey();
      setApiUrlState(url);
      setApiKeyState(key);
      runHealthCheck();
    }
  }, [isOpen]);

  const runHealthCheck = async () => {
    setIsTesting(true);
    try {
      const res = await testApiConnection();
      setHealth(res);
    } catch (_) {
      setHealth({
        connected: false,
        url: apiUrl || 'None',
        latencyMs: 0,
        datasetCount: 12,
        message: 'Unable to connect to endpoint',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    setApiBaseUrl(apiUrl);
    setApiKey(apiKey);
    setIsSyncing(true);
    try {
      const status = await testApiConnection();
      setHealth(status);
      if (onSitesUpdated) {
        const sites = await fetchApiSites();
        onSitesUpdated(sites, status.connected);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUseProductionDefaults = () => {
    setApiUrlState(DEFAULT_API_URL);
    setApiKeyState(DEFAULT_API_KEY);
    setApiBaseUrl(DEFAULT_API_URL);
    setApiKey(DEFAULT_API_KEY);
    runHealthCheck();
  };

  const handleClearApi = () => {
    setApiUrlState('');
    setApiKeyState('');
    setApiBaseUrl('');
    setApiKey('');
    runHealthCheck();
    if (onSitesUpdated) {
      onSitesUpdated(EARTH_ANALOG_CANDIDATES, false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(getTeammateApiSpecification());
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleRunCustomMatch = async () => {
    setIsMatching(true);
    try {
      const results = await matchPlanetaryTarget({
        customTarget: {
          name: `Custom ${customBody.toUpperCase()} Point`,
          body: customBody,
          reliefM: customRelief,
          slopeMeanDeg: customSlope,
          roughnessRmsM: customRoughness,
          hazardsPerKm2: customHazards,
          geologicalClass: customLithology,
          aridityIndex: customBody === 'moon' ? 0.0 : 0.02,
          diurnalTempRangeC: customBody === 'moon' ? 220 : 75,
        },
        activity: customActivity,
      });
      setCustomResults(results);
    } finally {
      setIsMatching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#0E1526] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Planetary Dataset API & Earth Match Hub</span>
                {health?.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-mono text-[10px]">
                    LIVE CONNECTED ({health.latencyMs}ms · v{health.model_version || '1.0.0'})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[10px]">
                    BUILT-IN BASELINES ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Connected to teammate&apos;s live ML model &amp; 50 global Earth analog sites across 29 countries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E293B] bg-[#090D18] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'connection'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>API Connection &amp; Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('custom-match')}
            className={`px-4 py-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'custom-match'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Planetary Twin Matcher</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Teammate API Spec (OpenAPI)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'connection' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  health?.connected
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                    : 'bg-[#12192A] border-slate-800 text-slate-300'
                }`}
              >
                {health?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{health?.connected ? 'Teammate API Live & Connected' : 'Operating on Standard Verified Baselines'}</span>
                    {health?.connected && (
                      <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[10px]">
                        Ridge Regression ML v{health.model_version || '1.0.0'}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {health?.message || 'Connecting to remote planetary analog model...'}
                  </p>
                  <div className="font-mono text-[11px] text-cyan-400 pt-1">
                    Dataset Pool: {health?.datasetCount || 50} Verified Analog Locations across Earth
                  </div>
                </div>
              </div>

              {/* Endpoint Input Form */}
              <div className="space-y-4 bg-[#0E1526] p-4 rounded-xl border border-slate-800/80">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Teammate API Base URL:</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="e.g. https://planetary-analog-finder.vercel.app"
                      value={apiUrl}
                      onChange={(e) => setApiUrlState(e.target.value)}
                      className="flex-1 bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={runHealthCheck}
                      disabled={isTesting}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Pinging...' : 'Test Ping'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Default: https://planetary-analog-finder.vercel.app</span>
                    <button
                      onClick={handleUseProductionDefaults}
                      className="text-cyan-400 hover:underline cursor-pointer font-mono"
                    >
                      Reset to Live Teammate API
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">API Key (Header X-Api-Key):</label>
                  <input
                    type="password"
                    placeholder="xora_live_..."
                    value={apiKey}
                    onChange={(e) => setApiKeyState(e.target.value)}
                    className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <button
                    onClick={handleClearApi}
                    className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Reset to Local Defaults
                  </button>

                  <button
                    onClick={handleSaveAndSync}
                    disabled={isSyncing}
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Syncing 50 Sites...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save &amp; Sync Datasets</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom-match' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-200">
                <p className="leading-relaxed">
                  <strong>Planetary Twin Finder:</strong> Enter any custom or newly discovered Lunar/Martian surface parameters to calculate the #1 closest analog location on Earth using the live trained ML model.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0E1526] p-4 rounded-xl border border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Target Body:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCustomBody('moon')}
                      className={`flex-1 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                        customBody === 'moon'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-[#070A12] border-slate-800 text-slate-400'
                      }`}
                    >
                      Moon (1.62 m/s²)
                    </button>
                    <button
                      onClick={() => setCustomBody('mars')}
                      className={`flex-1 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                        customBody === 'mars'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-[#070A12] border-slate-800 text-slate-400'
                      }`}
                    >
                      Mars (3.71 m/s²)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Mission Activity:</label>
                  <select
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value as MissionActivity)}
                    className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="rover-traverse">Rover Mobility &amp; Traverse</option>
                    <option value="landing-hazard">Landing Hazard Avoidance</option>
                    <option value="habitat-siting">Permanent Base / Habitat Siting</option>
                    <option value="lava-tube">Lava-Tube Subsurface Shelter</option>
                    <option value="polar-ice">Polar Volatile Ice Prospecting</option>
                    <option value="excavation-isru">ISRU Regolith Excavation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Macro Relief:</span>
                    <span className="font-mono text-cyan-400">{customRelief} m</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={customRelief}
                    onChange={(e) => setCustomRelief(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Mean Slope:</span>
                    <span className="font-mono text-cyan-400">{customSlope.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    step="0.5"
                    value={customSlope}
                    onChange={(e) => setCustomSlope(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">10m Baseline Roughness:</span>
                    <span className="font-mono text-cyan-400">{customRoughness.toFixed(2)} m RMS</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.5"
                    step="0.05"
                    value={customRoughness}
                    onChange={(e) => setCustomRoughness(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Boulder / Crater Density:</span>
                    <span className="font-mono text-cyan-400">{customHazards} /km²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={customHazards}
                    onChange={(e) => setCustomHazards(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-medium">Primary Lithology:</label>
                  <select
                    value={customLithology}
                    onChange={(e) => setCustomLithology(e.target.value as GeologicalClass)}
                    className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="volcanic_basalt">Volcanic Basalt (Mare / Volcanic Plains)</option>
                    <option value="impact_crater_breccia">Impact Crater Breccia (Rim &amp; Ejecta)</option>
                    <option value="sedimentary_deltaic">Sedimentary Deltaic (Ancient Lacustrine Fan)</option>
                    <option value="polar_periglacial">Polar Periglacial (Patterned Ground / Ice)</option>
                    <option value="highland_anorthosite">Highland Anorthosite (Ancient Lunar Crust)</option>
                    <option value="pyroclastic_mare">Pyroclastic Mare (Glass Bead Ash)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunCustomMatch}
                disabled={isMatching}
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {isMatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Querying ML Model for Best Earth Match...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Calculate Best Earth Twin Match (POST /api/search)</span>
                  </>
                )}
              </button>

              {/* Match Results */}
              {customResults && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Ranked Terrestrial Analogs for Custom Target:</span>
                    <span className="text-cyan-400 font-mono text-[11px]">
                      Top Match: {customResults[0]?.site.name} ({customResults[0]?.overallScore.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customResults.slice(0, 4).map((res, i) => (
                      <div
                        key={res.site.id}
                        className="p-3 rounded-lg bg-[#0E1526] border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 font-mono font-bold flex items-center justify-center text-cyan-300">
                            #{i + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white">{res.site.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {res.site.location}, {res.site.country} · Relief {res.site.metrics.elevationReliefM}m
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-cyan-300">
                              {res.overallScore.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-slate-400">Match</div>
                          </div>

                          {onViewTwin && (
                            <button
                              onClick={() => {
                                onViewTwin(res.site.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Inspect Twin
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">OpenAPI 3.0 Specification:</span>
                <button
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied to Clipboard' : 'Copy JSON Schema'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#070A12] border border-slate-800 rounded-xl max-h-72 overflow-y-auto">
                <pre className="text-[11px] font-mono text-cyan-300/90 whitespace-pre leading-relaxed">
                  {getTeammateApiSpecification()}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200">Teammate Backend Endpoints (Live):</div>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>GET /api/health</code>: Public health check &amp; catalog status</li>
                  <li><code>GET /api/targets</code>: Moon &amp; Mars reference targets</li>
                  <li><code>GET /api/sites</code>: 50 global candidate sites across 29 countries</li>
                  <li><code>GET /api/model</code>: Ridge regression model card &amp; weights</li>
                  <li><code>GET /api/search?target=&lt;key&gt;</code>: Search top analogs with X-Api-Key</li>
                  <li><code>POST /api/search</code>: Search with custom feature vectors</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
