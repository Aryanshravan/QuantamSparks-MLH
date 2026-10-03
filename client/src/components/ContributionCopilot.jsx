import React, { useState } from 'react';
import { 
  Bot, Send, Code, GitPullRequest, ShieldCheck, Terminal, 
  Copy, Check, Loader2, Sparkles 
} from 'lucide-react';

export default function ContributionCopilot({ initialContext, repoUrl }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: initialContext
        ? `Hello! I'm your **IssuePilot Contribution Copilot**.\n\nI've loaded your selected task: **${initialContext.title}** (${initialContext.filePath}).\n\nPaste your draft implementation or Git diff below, or ask me for code review, tests, or PR drafting!`
        : `👋 Welcome to **Contribution Copilot**!\n\nI can help you:\n- 🔍 **Review your code changes** or Git diff\n- 🧪 **Suggest unit tests & edge cases**\n- 📝 **Draft Conventional Commits & Pull Request descriptions**\n- 🚀 **Guide your Git branch, commit, and PR commands**\n\nPaste code below or ask a question to start.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState(
    initialContext?.evidenceSnippet || ''
  );
  const [showCodeInput, setShowCodeInput] = useState(Boolean(initialContext));
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSend = async (actionType = 'chat') => {
    if (!inputText.trim() && !codeSnippet.trim() && actionType === 'chat') return;

    let userLabel = inputText.trim();
    if (!userLabel) {
      if (actionType === 'review') userLabel = 'Review this code implementation and highlight improvements.';
      if (actionType === 'tests') userLabel = 'Suggest unit tests and edge cases for this code.';
      if (actionType === 'commit_pr') userLabel = 'Draft a Conventional Commit message and a Pull Request description.';
      if (actionType === 'git_guide') userLabel = 'Give me the step-by-step Git commands to branch, commit, and open a PR.';
    }

    const newMsg = {
      role: 'user',
      content: userLabel + (codeSnippet ? `\n\n[Attached Code / Diff]:\n\`\`\`\n${codeSnippet}\n\`\`\`` : '')
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userLabel,
          action: actionType,
          codeSnippet: codeSnippet,
          repoContext: repoUrl || initialContext?.filePath || '',
          history: updatedHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Copilot request failed');
      }

      setMessages([...updatedHistory, {
        role: 'assistant',
        content: data.reply
      }]);
    } catch (err) {
      setMessages([...updatedHistory, {
        role: 'assistant',
        content: `❌ **Error:** ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feature C • Code Review & PR Assistant</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            Contribution Copilot
          </h1>
          <p className="text-sm text-slate-300">
            Get intelligent code reviews, test suggestions, Conventional Commit messages, and PR descriptions before submitting to the open-source maintainers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat & Response History (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col h-[600px]">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 text-sm ${
                  m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 border border-slate-700 text-teal-400'
                  }`}
                >
                  {m.role === 'user' ? <Terminal className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.content, idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-850 border border-slate-700 flex items-center justify-center text-teal-400">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                  <span>Google Gemma is analyzing your contribution...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="pt-3 pb-2 flex flex-wrap gap-1.5 border-t border-slate-800 text-xs">
            <button
              onClick={() => handleSend('review')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>Review Code</span>
            </button>
            <button
              onClick={() => handleSend('tests')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Suggest Tests</span>
            </button>
            <button
              onClick={() => handleSend('commit_pr')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
            >
              <GitPullRequest className="w-3 h-3 text-purple-400" />
              <span>Draft Commit & PR</span>
            </button>
            <button
              onClick={() => handleSend('git_guide')}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
            >
              <Terminal className="w-3 h-3 text-amber-400" />
              <span>Git Commands</span>
            </button>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend('chat');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question or request guidance..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !codeSnippet.trim())}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Code / Git Diff Panel (1 col) */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Attached Code / Git Diff</span>
            </div>
            <button
              onClick={() => setCodeSnippet('')}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition"
            >
              Clear
            </button>
          </div>

          <p className="text-xs text-slate-400 my-2">
            Paste your new function, bug fix, or <code className="text-indigo-300">git diff</code> output here. Copilot will base its reviews, tests, and PR drafts on it.
          </p>

          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder={`// Paste your code or diff here...\n\nfunction validateInput(user) {\n  if (!user || !user.id) {\n    throw new Error('Invalid user');\n  }\n  return true;\n}`}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />

          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => handleSend('review')}
              disabled={loading || !codeSnippet.trim()}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium disabled:opacity-50 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              <span>Analyze Attached Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
