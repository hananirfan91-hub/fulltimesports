import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#01140f] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#022c22] border border-emerald-900 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="inline-flex p-4 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                Something Went Wrong
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                An unexpected interface error occurred. Please refresh the page to restore normal operation.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#01140f] border border-emerald-950 rounded-xl text-left text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full bg-[#22c55e] hover:bg-[#34d399] text-slate-950 font-mono font-bold text-xs py-3 px-6 rounded-xl uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
