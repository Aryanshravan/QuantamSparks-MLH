/**
 * GitHub API Service for public repository metadata and file retrieval.
 * Respects strict size limits and treats all external content as untrusted data.
 */
export class GitHubService {
  constructor() {
    this.apiBase = 'https://api.github.com';
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'IssuePilot-AI-Hackathon-App'
    };
    const token = process.env.GITHUB_TOKEN;
    if (token && token.trim() !== '') {
      headers['Authorization'] = `token ${token.trim()}`;
    }
    return headers;
  }

  /**
   * Parses and validates a GitHub URL or "owner/repo" string.
   */
  parseRepoUrl(urlOrSlug) {
    if (!urlOrSlug || typeof urlOrSlug !== 'string') {
      throw new Error('Invalid input: GitHub repository URL or "owner/repo" is required.');
    }

    const trimmed = urlOrSlug.trim();
    // Match https://github.com/owner/repo or github.com/owner/repo or owner/repo
    const regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/;
    const slugRegex = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;

    let owner = null;
    let repo = null;

    const urlMatch = trimmed.match(regex);
    if (urlMatch) {
      owner = urlMatch[1];
      repo = urlMatch[2].replace(/\.git$/, '');
    } else {
      const slugMatch = trimmed.match(slugRegex);
      if (slugMatch) {
        owner = slugMatch[1];
        repo = slugMatch[2].replace(/\.git$/, '');
      }
    }

    if (!owner || !repo) {
      throw new Error('Could not parse GitHub repository. Expected format: https://github.com/owner/repo or owner/repo');
    }

    return { owner, repo, fullName: `${owner}/${repo}` };
  }

  /**
   * Fetch repo metadata from GitHub API.
   */
  async getRepoMetadata(owner, repo) {
    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}`, {
      headers: this.getHeaders()
    });

    if (res.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add an optional GITHUB_TOKEN to .env or try again shortly.');
    }
    if (!res.ok) {
      throw new Error(`GitHub API error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description || 'No description provided.',
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language || 'Unknown',
      license: data.license ? data.license.spdx_id || data.license.name : 'Not specified',
      topics: data.topics || [],
      htmlUrl: data.html_url
    };
  }

  /**
   * Fetch raw file content with bounding to prevent token overflow.
   */
  async getRawFileContent(owner, repo, filePath, branch = 'main', maxBytes = 40000) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    try {
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return null;

      const text = await res.text();
      if (text.length > maxBytes) {
        return {
          content: text.slice(0, maxBytes) + `\n\n... [Content truncated at ${maxBytes} bytes for bounded analysis]`,
          truncated: true,
          path: filePath
        };
      }
      return { content: text, truncated: false, path: filePath };
    } catch {
      return null;
    }
  }

  /**
   * Retrieve README.md or common documentation files.
   */
  async getReadme(owner, repo, branch = 'main') {
    const commonNames = ['README.md', 'readme.md', 'README', 'Readme.md', 'docs/README.md'];
    for (const name of commonNames) {
      const file = await this.getRawFileContent(owner, repo, name, branch, 35000);
      if (file) return file;
    }
    return null;
  }

  /**
   * Fetch repository file tree (depth bounded).
   */
  async getRepoTree(owner, repo, branch = 'main') {
    try {
      const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];

      const data = await res.json();
      if (!data.tree || !Array.isArray(data.tree)) return [];

      // Filter out standard ignorable dirs and keep meaningful code files
      const ignored = [
        'node_modules/', '.git/', 'dist/', 'build/', '.github/',
        'vendor/', 'target/', '.next/', '__pycache__/', 'coverage/'
      ];

      return data.tree
        .filter(item => !ignored.some(ig => item.path.startsWith(ig)))
        .map(item => ({
          path: item.path,
          type: item.type === 'blob' ? 'file' : 'dir',
          size: item.size || 0
        }));
    } catch {
      return [];
    }
  }

  /**
   * Retrieve manifest and config files (package.json, requirements.txt, etc.)
   */
  async getManifests(owner, repo, branch = 'main') {
    const manifestCandidates = [
      'package.json',
      'requirements.txt',
      'pyproject.toml',
      'Cargo.toml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'tsconfig.json',
      'CONTRIBUTING.md'
    ];

    const manifests = {};
    for (const candidate of manifestCandidates) {
      const file = await this.getRawFileContent(owner, repo, candidate, branch, 15000);
      if (file) {
        manifests[candidate] = file.content;
      }
    }
    return manifests;
  }

  /**
   * Retrieve a bounded sample of representative source code files for deep analysis.
   */
  async getRepresentativeSourceFiles(owner, repo, tree, branch = 'main', maxFiles = 4) {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.cpp', '.c'];
    
    // Prioritize src/ or lib/ or main code files under 30KB
    const candidateFiles = tree
      .filter(item => item.type === 'file')
      .filter(item => codeExtensions.some(ext => item.path.endsWith(ext)))
      .filter(item => !item.path.includes('.test.') && !item.path.includes('.spec.') && !item.path.includes('min.'))
      .sort((a, b) => {
        const aScore = (a.path.startsWith('src/') || a.path.startsWith('lib/') || a.path.startsWith('app/')) ? 2 : 1;
        const bScore = (b.path.startsWith('src/') || b.path.startsWith('lib/') || b.path.startsWith('app/')) ? 2 : 1;
        return bScore - aScore;
      })
      .slice(0, maxFiles);

    const sourceFiles = [];
    for (const candidate of candidateFiles) {
      const file = await this.getRawFileContent(owner, repo, candidate.path, branch, 15000);
      if (file) {
        sourceFiles.push(file);
      }
    }
    return sourceFiles;
  }
}

export const githubService = new GitHubService();
