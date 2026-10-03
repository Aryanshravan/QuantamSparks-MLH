import { Compass, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Header({ health, isCheckingHealth, onCheckHealth, activeTab, setActiveTab }) {
  const isOperational = health?.aiConfig?.tokenConfigured;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  IssuePilot <span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  MLH Hack Day
                </span>
              </div>
              <p className="text-xs text-slate-400">Open-Source AI Contribution Assistant</p>
            </div>
          </div>

          {/* Feature Navigation Tabs */}
          <nav className="flex space-x-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              id="nav-repo-guide"
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              1. Repo Guide
            </button>
            <button
              id="nav-first-issues"
              onClick={() => setActiveTab('issues')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'issues'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              2. First-Issue Finder
            </button>
            <button
              id="nav-copilot"
              onClick={() => setActiveTab('copilot')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'copilot'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              3. Contribution Copilot
            </button>
          </nav>

          {/* Model Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Model:</span>
              <span className="font-mono text-slate-200">{health?.aiConfig?.model || 'google/gemma-3-4b-it'}</span>
              
              {isOperational ? (
                <span className="flex items-center text-emerald-400 font-medium pl-1 border-l border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Live
                </span>
              ) : (
                <span className="flex items-center text-amber-400 font-medium pl-1 border-l border-slate-800">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Key Required
                </span>
              )}
            </div>

            <button
              title="Test server and Gemma connection"
              onClick={onCheckHealth}
              disabled={isCheckingHealth}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
