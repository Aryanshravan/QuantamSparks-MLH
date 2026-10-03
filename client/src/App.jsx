import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RepoGuideView from './components/RepoGuideView';
import FirstIssuesView from './components/FirstIssuesView';
import ContributionCopilot from './components/ContributionCopilot';
import { AlertCircle, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'issues' | 'copilot'
  const [repoUrl, setRepoUrl] = useState('https://github.com/sindresorhus/is');
  const [guideData, setGuideData] = useState(null);
  const [issuesData, setIssuesData] = useState(null);
  const [copilotContext, setCopilotContext] = useState(null);

  const [health, setHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({
        status: 'offline',
        aiConfig: { tokenConfigured: false, model: 'google/gemma-3-4b-it' }
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSendIssueToCopilot = (issue) => {
    setCopilotContext(issue);
    setActiveTab('copilot');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        health={health}
        isCheckingHealth={isCheckingHealth}
        onCheckHealth={checkHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Token Missing Warning Banner if applicable */}
        {health && !health.aiConfig?.tokenConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-100">Hugging Face Token Needed for Live Gemma Inference</p>
              <p className="text-amber-300/90 text-xs mt-0.5">
                Add <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white font-mono">HF_TOKEN=hf_...</code> to your <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white font-mono">.env</code> file.
              </p>
            </div>
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition flex-shrink-0"
            >
              <span>Get Token</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        )}

        {/* Feature Tab View Rendering */}
        {activeTab === 'guide' && (
          <RepoGuideView
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            guideData={guideData}
            setGuideData={setGuideData}
            onSelectIssueTab={() => setActiveTab('issues')}
          />
        )}

        {activeTab === 'issues' && (
          <FirstIssuesView
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            issuesData={issuesData}
            setIssuesData={setIssuesData}
            onSendToCopilot={handleSendIssueToCopilot}
          />
        )}

        {activeTab === 'copilot' && (
          <ContributionCopilot
            initialContext={copilotContext}
            repoUrl={repoUrl}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">IssuePilot AI</span>
            <span>—</span>
            <span>Built for MLH Hack Day: Best Open-Source AI Project</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Powered by <strong className="text-slate-300">Google Gemma-2</strong> & <strong className="text-slate-300">Hugging Face Inference</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
