/**
 * XORA Perceived Performance Shimmer Skeleton Suite
 * Provides smooth, zero-layout-shift shimmer placeholders for:
 * 1. Terrain & Orbital Satellite Imagery (progressive fade-in on load)
 * 2. Radial Similarity Fingerprint Graphs
 * 3. 25km Elevation Transect Curves
 * 4. Metric Score Cards and Candidate Rows
 */

import React, { useState } from 'react';

interface ShimmerProps {
  className?: string;
  rounded?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = 'w-full h-4',
  rounded = 'rounded-md',
}) => {
  return (
    <div
      className={`bg-[#0D1424] border border-[#1A253A] animate-shimmer ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
};

interface ShimmerImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  aspectRatio?: string;
  fallbackSrc?: string;
}

export const ShimmerImage: React.FC<ShimmerImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden bg-[#090D17]',
  aspectRatio,
  fallbackSrc,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`${containerClassName} ${aspectRatio || ''} relative select-none`}>
      {/* Shimmer Placeholder shown until image is fully loaded */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 w-full h-full bg-[#0B111E] animate-shimmer flex flex-col items-center justify-center p-4 z-10">
          <div className="w-8 h-8 rounded-full border border-cyan-500/30 border-t-cyan-400 animate-spin mb-2" />
          <span className="text-[10px] font-mono tracking-widest text-cyan-400/70 uppercase">
            Loading Terrain Frame
          </span>
        </div>
      )}

      {/* Main Image with smooth perceived transition */}
      <img
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />

      {/* Fallback Display if image fails */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B101D] text-slate-400 text-xs font-mono p-4 text-center">
          <span className="text-amber-400 mb-1">Satellite Feed Unavailable</span>
          <span className="text-[10px] text-slate-400">Rendering synthetic hillshade proxy</span>
        </div>
      )}
    </div>
  );
};

export const ShimmerRadar: React.FC<{ size?: number }> = ({ size = 240 }) => {
  const center = size / 2;
  const radius = size / 2 - 34;
  const angleStep = (2 * Math.PI) / 6;

  const hexPoints = Array.from({ length: 6 })
    .map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * 0.7 * Math.cos(angle);
      const y = center + radius * 0.7 * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center bg-[#090E1A]/80 rounded-2xl border border-[#1A253A] animate-shimmer overflow-hidden"
    >
      <svg width={size} height={size} className="opacity-40">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#1E293B" strokeWidth="1" />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.66}
          fill="none"
          stroke="#1E293B"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.33}
          fill="none"
          stroke="#1E293B"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <polygon
          points={hexPoints}
          fill="rgba(6, 182, 212, 0.15)"
          stroke="#06B6D4"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
      </svg>
      <div className="absolute text-center">
        <div className="w-5 h-5 mx-auto rounded-full border border-cyan-400/40 border-t-cyan-400 animate-spin mb-1.5" />
        <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
          Synthesizing Radar Glyph...
        </span>
      </div>
    </div>
  );
};

export const ShimmerTransect: React.FC = () => {
  return (
    <div className="w-full h-52 bg-[#090D18] rounded-xl border border-[#1A253A] p-4 flex flex-col justify-between animate-shimmer relative overflow-hidden">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Computing 25km Radial Elevation Transect...</span>
        </span>
        <span>0 to 25 km</span>
      </div>

      <div className="w-full h-32 flex items-center justify-center opacity-40">
        <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
          <path
            d="M 0 80 Q 120 20 250 60 T 500 40"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <path
            d="M 0 100 Q 140 50 260 70 T 500 80"
            fill="none"
            stroke="#34D399"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
        </svg>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-400">
        <span>-3500m Datum</span>
        <span>Standardized 25km Spatial Analysis Window</span>
        <span>+3500m Datum</span>
      </div>
    </div>
  );
};

export const ShimmerMetricCard: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-[#0B101D] border border-slate-800/80 animate-shimmer space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-24 h-3 bg-slate-800 rounded" />
        <div className="w-12 h-3 bg-slate-800 rounded" />
      </div>
      <div className="w-3/4 h-5 bg-slate-800 rounded" />
      <div className="w-full h-2 bg-slate-800 rounded-full" />
      <div className="flex justify-between pt-1">
        <div className="w-16 h-3 bg-slate-800 rounded" />
        <div className="w-16 h-3 bg-slate-800 rounded" />
      </div>
    </div>
  );
};

