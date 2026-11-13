import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('XORA Uncaught Telemetry Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#home';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] text-[#F8FAFC] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0D121F] border border-cyan-900/50 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Telemetry Signal Interrupted
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                An unexpected exception occurred during planetary terrain processing. Your mission state is preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-[#07090E] border border-slate-800 font-mono text-[11px] text-cyan-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-align Sensors</span>
              </button>
              <button
                onClick={() => {
                  window.location.hash = '#home';
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-lg bg-[#141C2B] hover:bg-[#1E293B] border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Base</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
