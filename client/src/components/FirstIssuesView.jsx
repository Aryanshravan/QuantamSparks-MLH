import React, { useState } from 'react';
import { 
  Code, AlertTriangle, ArrowRight, Loader2, 
  Sparkles, Send, ListChecks, CheckCircle2 
} from 'lucide-react';

export default function FirstIssuesView({ 
  repoUrl, 
  setRepoUrl, 
  issuesData, 
  setIssuesData, 
  onSendToCopilot 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFindIssues = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl || !repoUrl.trim()) {
      setError('Please provide a repository URL first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/first-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect repository code');
      }

      setIssuesData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat = '') => {
    switch (cat.toLowerCase()) {
      case 'testing':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'edge cases':
      case 'error handling':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'documentation':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default:
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feature B • Grounded Code Inspection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            AI First-Issue Finder
          </h1>
          <p className="text-sm text-slate-300 mb-6">
            Instead of just scraping pre-existing issue labels, Gemma directly inspects raw source code to uncover actionable, beginner-friendly contributions (edge cases, missing tests, validation, error handling).
          </p>

          <form onSubmit={handleFindIssues} className="flex flex-col sm:flex-row gap-2">
            <input
              id="issues-repo-input"
              type="text"
              placeholder="e.g. https://github.com/sindresorhus/is"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              id="find-issues-btn"
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inspecting Source Code...
                </>
              ) : (
                <>
                  <span>Discover Opportunities</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Inspection Failed</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {issuesData && (
        <div className="space-y-6">
          {/* Files Inspected Header */}
          <div className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-200">Repository: {issuesData.repository.fullName}</span>
              <span className="text-slate-500">•</span>
              <span>Source files inspected: {issuesData.analyzedFiles.join(', ')}</span>
            </div>
            <span className="text-purple-300 font-mono text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Gemma-2 Grounded
            </span>
          </div>

          {/* Issue Cards Grid */}
          {issuesData.data?.issues && issuesData.data.issues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {issuesData.data.issues.map((issue, idx) => (
                <div 
                  key={issue.id || idx} 
                  className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(issue.category)}`}>
                        {issue.category || 'Contribution'}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {issue.difficulty || 'Beginner'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white leading-snug">
                      {issue.title}
                    </h3>

                    {/* Reason */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {issue.reason}
                    </p>

                    {/* File Path & Evidence Snippet */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-mono">
                        <Code className="w-3.5 h-3.5" />
                        <span className="truncate">{issue.filePath}</span>
                      </div>
                      {issue.evidenceSnippet && (
                        <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {issue.evidenceSnippet}
                        </pre>
                      )}
                    </div>

                    {/* Implementation Steps */}
                    {issue.implementationSteps && issue.implementationSteps.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-teal-400" />
                          Recommended Steps:
                        </p>
                        <ul className="space-y-1 text-xs text-slate-400 pl-4 list-disc">
                          {issue.implementationSteps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Tests */}
                    {issue.suggestedTests && issue.suggestedTests.length > 0 && (
                      <div className="space-y-1 pt-2">
                        <p className="text-xs font-semibold text-slate-300">Suggested Unit Tests:</p>
                        <p className="text-xs text-slate-400 italic">
                          {issue.suggestedTests.join('; ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 italic">
                      {issue.difficultyReason || 'Accessible for newcomers'}
                    </span>
                    <button
                      onClick={() => onSendToCopilot(issue)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm shadow-indigo-600/20"
                    >
                      <span>Work in Copilot</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl text-slate-300 text-sm whitespace-pre-wrap">
              {issuesData.data?.rawOutput || 'No structured issues returned from model.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
