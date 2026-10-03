import express from 'express';
import { gemmaService } from '../services/gemmaService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { 
      message, 
      action = 'chat', // 'chat' | 'review' | 'tests' | 'commit_pr' | 'git_guide'
      codeSnippet = '', 
      diff = '', 
      repoContext = '',
      history = [] 
    } = req.body;

    if (!message && !codeSnippet && !diff) {
      return res.status(400).json({ error: 'Message, code snippet, or diff is required.' });
    }

    const systemPrompt = `You are IssuePilot AI Contribution Copilot, an expert open-source mentor powered by Google Gemma.
You help beginners review code, find edge cases, write tests, draft commit messages and Pull Request descriptions, and understand Git workflows.

GUIDELINES:
- Give direct, actionable, step-by-step guidance.
- Differentiate between guaranteed facts and recommended improvements.
- When drafting Git commits, follow the Conventional Commits format (e.g. \`feat(auth): add null checks for token validation\`).
- When drafting Pull Requests, provide a clear Title, Motivation, Changes summary, and Testing checklist.
- Be encouraging, clear, and practical for hackathons and first-time contributors.`;

    let actionPrompt = '';
    switch (action) {
      case 'review':
        actionPrompt = `Please review the following code / git diff for correctness, error handling, edge cases, and cleanliness:\n\nCODE/DIFF:\n\`\`\`\n${codeSnippet || diff}\n\`\`\`\n\nUSER QUESTION/NOTES: ${message || 'Please review this change.'}`;
        break;
      case 'tests':
        actionPrompt = `Suggest thorough unit tests and edge cases to test for this code snippet / change:\n\nCODE/DIFF:\n\`\`\`\n${codeSnippet || diff}\n\`\`\`\n\nADDITIONAL REQUEST: ${message || 'What tests should I write?'}`;
        break;
      case 'commit_pr':
        actionPrompt = `Generate a high-quality Conventional Commit message and a comprehensive Pull Request (PR) title and markdown description based on this code / diff:\n\nCODE/DIFF:\n\`\`\`\n${codeSnippet || diff}\n\`\`\`\n\nCONTEXT: ${repoContext || 'Open source contribution'}\nNOTES: ${message || 'Draft PR'}`;
        break;
      case 'git_guide':
        actionPrompt = `Provide a beginner-friendly, step-by-step Git command checklist to create a new branch, commit these changes, push to a fork, and open a Pull Request.\n\nREPOSITORY CONTEXT: ${repoContext}\nNOTES: ${message}`;
        break;
      default:
        actionPrompt = `USER MESSAGE: ${message}\n` + 
          (codeSnippet ? `\nATTACHED CODE:\n\`\`\`\n${codeSnippet}\n\`\`\`\n` : '') +
          (diff ? `\nATTACHED DIFF:\n\`\`\`\n${diff}\n\`\`\`\n` : '') +
          (repoContext ? `\nREPOSITORY CONTEXT: ${repoContext}\n` : '');
        break;
    }

    // Build chat message payload including recent history
    const conversationMessages = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item.role && item.content) {
          conversationMessages.push({ role: item.role, content: item.content });
        }
      }
    }

    conversationMessages.push({ role: 'user', content: actionPrompt });

    console.log(`[Copilot] Processing action "${action}" with Google Gemma...`);
    const gemmaResult = await gemmaService.chatCompletion(conversationMessages, {
      temperature: 0.3,
      max_tokens: 2000
    });

    res.json({
      reply: gemmaResult.content,
      modelUsed: gemmaResult.model,
      action: action
    });
  } catch (err) {
    next(err);
  }
});

export default router;
