import React, { useState } from 'react';
import { 
  Search, BookOpen, Star, GitFork, AlertCircle, FileCode, 
  ExternalLink, Layers, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Copy, Check 
} from 'lucide-react';

const SAMPLE_REPOS = [
  { label: 'sindresorhus/is', url: 'https://github.com/sindresorhus/is', desc: 'Type check utilities (JavaScript)' },
  { label: 'expressjs/express', url: 'https://github.com/expressjs/express', desc: 'Fast web framework (Node.js)' },
  { label: 'pallets/click', url: 'https://github.com/pallets/click', desc: 'CLI creation kit (Python)' },
  { label: 'facebook/docusaurus', url: 'https://github.com/facebook/docusaurus', desc: 'Static site generator (React)' }
];

export default function RepoGuideView({ 
  repoUrl, 
  setRepoUrl, 
  guideData, 
  setGuideData, 
  onSelectIssueTab 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl || !repoUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/repo-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze repository');
      }

      setGuideData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (guideData?.guideMarkdown) {
      navigator.clipboard.writeText(guideData.guideMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner & Search */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Feature A • Intelligent Repository Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Understand Any Repository in Seconds
          </h1>
          <p className="text-sm text-slate-300 mb-6">
            Enter a public GitHub repository. Gemma inspects real manifests, structure, and code to synthesize an accurate, evidence-backed onboarding guide.
          </p>

          {/* Search Form */}
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="repo-url-input"
                type="text"
                placeholder="e.g. https://github.com/expressjs/express or sindresorhus/is"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
              />
            </div>
            <button
              id="analyze-repo-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with Gemma...
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Repositories */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Quick Test:</span>
            {SAMPLE_REPOS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setRepoUrl(item.url);
                  setError(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition font-mono"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold text-rose-200">Analysis Error</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Guide Content Results */}
      {guideData && (
        <div className="space-y-6">
          {/* Metadata & Evidence Header */}
          <div className="glass-card p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{guideData.repository.fullName}</h2>
                <a
                  href={guideData.repository.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-400 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{guideData.repository.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>{guideData.repository.language}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300/30 text-amber-300" />
                <span>{guideData.repository.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <GitFork className="w-3.5 h-3.5 text-slate-400" />
                <span>{guideData.repository.forks.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>{guideData.repository.license}</span>
              </div>
            </div>
          </div>

          {/* Evidence Sources Inspected */}
          <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Evidence Grounded:
              </span>
              <span>README: {guideData.evidenceSources.readmeFound ? '✅ Inspected' : '❌ Not present'}</span>
              <span>Manifests: {guideData.evidenceSources.manifestsFound.join(', ') || 'None'}</span>
              <span>Files Sampled: {guideData.evidenceSources.filesAnalyzed.length}</span>
              <span>Total Tree: {guideData.evidenceSources.totalTreeFiles} items</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Guide'}</span>
              </button>
              <button
                onClick={onSelectIssueTab}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition text-xs shadow-sm"
              >
                <span>Find Issues Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Markdown Guide Presentation */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-code:text-indigo-300 prose-code:bg-slate-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
            <div className="whitespace-pre-wrap leading-relaxed text-sm font-sans text-slate-200">
              {guideData.guideMarkdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
