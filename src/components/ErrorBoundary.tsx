import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('metaslim_active_tenant_id');
    } catch {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl font-bold text-slate-900">
              Estamos restaurando sua visualização
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Ocorreu uma pequena instabilidade temporária na interface. Clique abaixo para restabelecer a loja com dados atualizados.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-[#006750] hover:bg-[#0b745c] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Loja</span>
              </button>
              
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch {}
                  window.location.href = '/';
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Limpar Cache &amp; Iniciar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
