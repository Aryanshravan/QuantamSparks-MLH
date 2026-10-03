import express from 'express';
import { githubService } from '../services/githubService.js';
import { gemmaService } from '../services/gemmaService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required.' });
    }

    const { owner, repo, fullName } = githubService.parseRepoUrl(repoUrl);

    // 1. Fetch real repository evidence
    console.log(`[RepoGuide] Fetching metadata for ${fullName}...`);
    const metadata = await githubService.getRepoMetadata(owner, repo);
    const readme = await githubService.getReadme(owner, repo, metadata.defaultBranch);
    const tree = await githubService.getRepoTree(owner, repo, metadata.defaultBranch);
    const manifests = await githubService.getManifests(owner, repo, metadata.defaultBranch);
    const sourceFiles = await githubService.getRepresentativeSourceFiles(owner, repo, tree, metadata.defaultBranch, 3);

    // Prepare evidence payload for Gemma
    const fileTreeSummary = tree.slice(0, 40).map(t => t.path).join('\n');
    const manifestSummary = Object.entries(manifests)
      .map(([name, content]) => `--- FILE: ${name} ---\n${content.slice(0, 1500)}`)
      .join('\n\n');
    const sourceSummary = sourceFiles
      .map(sf => `--- SOURCE FILE: ${sf.path} ---\n${sf.content.slice(0, 1500)}`)
      .join('\n\n');

    const systemPrompt = `You are IssuePilot AI, an expert open-source onboarding architect powered by Google Gemma.
Analyze the provided GitHub repository evidence to create an accurate, beginner-friendly onboarding guide.

CRITICAL ACCURACY RULES:
1. Base all findings strictly on the provided README, file tree, manifests, and source code.
2. Cite exact file paths (e.g. \`package.json\`, \`src/index.js\`) when making claims.
3. NEVER invent dependencies, nonexistent commands, or fake directory structures.
4. Clearly state if any information (like run scripts or tests) is missing or unverified.
5. Format your output in clear, structured Markdown with the following exact sections:
   - ## 🎯 Project Purpose & Overview
   - ## 🛠️ Technology Stack & Dependencies (cite manifests)
   - ## 📁 Key Files & Directory Architecture
   - ## 🚀 Setup & Local Execution (only if found in README/manifests)
   - ## 🧪 Testing & Quality Tools
   - ## 💡 3 Essential Concepts for Beginners Before Contributing`;

    const userPrompt = `REPOSITORY: ${fullName}
PRIMARY LANGUAGE: ${metadata.language}
DESCRIPTION: ${metadata.description}
STARS: ${metadata.stars} | FORKS: ${metadata.forks} | OPEN ISSUES: ${metadata.openIssues}

--- README EXCERPT ---
${readme ? readme.content.slice(0, 3000) : 'No README.md found.'}

--- REPOSITORY FILE TREE SAMPLE (${tree.length} total files) ---
${fileTreeSummary || 'No tree items available'}

--- DEPENDENCY MANIFESTS ---
${manifestSummary || 'No manifest files found'}

--- KEY SOURCE SAMPLES ---
${sourceSummary || 'No source files sampled'}

Produce the comprehensive, grounded repository guide now:`;

    console.log(`[RepoGuide] Querying Google Gemma for ${fullName}...`);
    const gemmaResult = await gemmaService.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.2, max_tokens: 2200 });

    res.json({
      repository: metadata,
      guideMarkdown: gemmaResult.content,
      modelUsed: gemmaResult.model,
      evidenceSources: {
        readmeFound: Boolean(readme),
        manifestsFound: Object.keys(manifests),
        filesAnalyzed: sourceFiles.map(f => f.path),
        totalTreeFiles: tree.length
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
