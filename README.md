# IssuePilot AI

> **An AI-powered open-source contribution assistant that helps developers understand unfamiliar GitHub repositories, discover meaningful contribution opportunities through deep code analysis, and prepare pull requests.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Model: Google Gemma 3 4B IT](https://img.shields.io/badge/Model-Google%20Gemma%203%204B%20IT-blue.svg)](https://huggingface.co/google/gemma-3-4b-it)
[![Built for MLH](https://img.shields.io/badge/MLH-Hack%20Day%20Submission-red.svg)](https://mlh.io)

---

## 🎯 Problem

For anyone wanting to start contributing to open source, finding the right repository and getting started is notoriously difficult:

* **Thousands of Repositories:** Navigating endless organizations and projects across GitHub without domain context is overwhelming.
* **Complex & Unfamiliar Stacks:** Understanding architecture, dependency configurations, and internal conventions by reading sprawling codebases takes hours or days.
* **Stale or Superficial Issue Tags:** Relying solely on `"good first issue"` labels often leads newcomers to outdated tickets or issues that have already been resolved.
* **Intimidating Contribution Process:** Knowing how to write appropriate unit tests, format conventional commit messages, and write clear pull request descriptions creates a steep barrier to entry for beginners.

This manual discovery process is time-consuming and often discourages developers before they submit their first pull request.

---

## 💡 Solution

**IssuePilot AI** reduces manual exploration by analyzing real repository artifacts and source code with open-weight AI:

$$\text{Repository URL} \longrightarrow \text{Repository Guide} \longrightarrow \text{Code Inspection} \longrightarrow \text{First-Issue Discovery} \longrightarrow \text{Contribution Copilot}$$

Instead of answering generic programming questions, IssuePilot AI grounds its analysis in real repository evidence—including directory structures, dependency manifests (`package.json`, `tsconfig.json`, `requirements.txt`), and source code files.

---

## ✨ Features

### 1. 📖 Repo Guide
Input any public GitHub repository URL to receive an evidence-grounded onboarding breakdown:
* **Project Purpose & Overview:** High-level summary of what the software does.
* **Technology Stack & Dependencies:** Identified frameworks, build tools, and dependencies cited directly from manifest files.
* **Directory Architecture & Key Files:** Structure map highlighting core logic and entry points.
* **Setup & Local Execution:** Validated run and build commands based on repository configuration.
* **Testing Setup & Quality Tools:** Identified test runners and linters.
* **3 Essential Concepts:** Key mental models a newcomer must understand before editing code.

### 2. 🔍 AI First-Issue Finder
Discovers actionable, beginner-accessible contribution opportunities by inspecting real source code:
* **Deep Code Inspection:** Examines representative source files rather than merely querying issue labels.
* **Identifies Meaningful Gaps:** Uncovers missing edge-case validation, incomplete error handling, missing unit tests, and documentation gaps.
* **Evidence-Grounded Findings:** References exact file paths and code snippets, clearly distinguishing between verified facts and hypotheses.
* **Actionable Step-by-Step Plans:** Outlines beginner-friendly implementation checklists and suggested unit tests.
* *(Note: AI-generated findings serve as recommendations and may require developer verification).*

### 3. 🤖 Contribution Copilot
An interactive assistant tailored to the contributor's workflow:
* **Code & Diff Review:** Analyzes proposed fixes or Git diffs for correctness, edge cases, and maintainability.
* **Unit Test Recommendations:** Suggests edge cases and specific test scenarios to validate the fix.
* **Conventional Commit Generator:** Formats commit messages following standard conventions (e.g., `feat(auth): handle null token payload`).
* **Pull Request Drafter:** Generates comprehensive PR titles, motivation summaries, change logs, and verification checklists.
* **Step-by-Step Git Guidance:** Provides command sequences for branching, committing, pushing, and opening PRs.

---

## 🏗️ How It Works

```
User (Browser)
      │
      ▼
React / Vite Frontend  (Dashboard, Repo Guide, Issue Cards, Copilot)
      │
      ▼  REST API (/api/repo-guide, /api/first-issues, /api/copilot, /api/health)
Node.js / Express Backend
      │
      ├───────────────────────────────┐
      ▼                               ▼
GitHub REST API             Hugging Face Inference Provider
(Fetches README, tree,       (Runs Google Gemma 3 4B IT
 manifests, & source files)   open-weight model)
      │                               │
      └───────────────┬───────────────┘
                      ▼
            Structured Evidence &
            Grounded AI Response
                      │
                      ▼
              React UI Display
```

---

## 🧠 AI / Open-Weight Model

IssuePilot AI uses Google's **Gemma 3 4B instruction-tuned model** ([`google/gemma-3-4b-it`](https://huggingface.co/google/gemma-3-4b-it)) as its open-weight AI model, accessed through **Hugging Face Inference Providers**.

### Understanding the Architecture Components:
* **Google Gemma 3 4B IT:** The underlying open-weight instruction-tuned language model that performs code reasoning, architecture summarization, and PR generation.
* **Hugging Face:** The inference platform providing API access to run the open-weight Gemma model.
* **GitHub REST API:** The data retrieval layer that fetches public repository metadata, file trees, manifests, and source files.
* **IssuePilot AI:** The application combining grounded data retrieval, prompt engineering, and an interactive developer experience.

---

## ⚖️ Why Open-Weight AI Is Important

The AI model in IssuePilot AI is not a decorative chatbot—it is an integral component of the core product workflows:
1. **Repository Understanding:** Synthesizing complex multi-file structures and manifests into beginner-accessible guides.
2. **Code Analysis & Defect Discovery:** Evaluating real source code to discover unhandled edge cases and testing gaps.
3. **Contribution Guidance:** Generating step-by-step implementation roadmaps.
4. **Code Review:** Providing constructive feedback on user-submitted diffs.
5. **Contribution Documentation:** Drafting conventional commits and structured PR descriptions.

Without the open-weight Gemma model, the core intelligence and reasoning of IssuePilot AI would not be possible.

---

## 💻 Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
* **Backend:** Node.js, Express (ES Modules), CORS, Dotenv
* **AI Model:** Google Gemma 3 4B IT (`google/gemma-3-4b-it`)
* **Inference Access:** Hugging Face Inference Providers (`@huggingface/inference` & Router API)
* **Repository Data:** GitHub REST API (Read-only, public repositories)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)
* A free Hugging Face User Access Token ([huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) with Read access)

### 1. Clone Repository
```bash
git clone https://github.com/Aryanshravan/QuantamSparks-MLH.git
cd QuantamSparks-MLH
```

### 2. Configure Environment Variables
Copy the example environment template:
```bash
cp .env.example .env
```

Open `.env` and fill in your keys:
```env
HF_TOKEN=your_huggingface_token_here
GEMMA_MODEL=google/gemma-3-4b-it
HF_MODEL=google/gemma-3-4b-it
GITHUB_TOKEN=
PORT=5000
```

> [!WARNING]
> **Never commit your `.env` file or API tokens to GitHub.** All `.env` files are strictly excluded via `.gitignore`.

### 3. Install Dependencies
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 4. Verify AI Model Inference
Run the standalone verification test to ensure Google Gemma inference is active:
```bash
npm run test:ai
```

### 5. Start the Application
In **Terminal 1** (Backend):
```bash
npm run server
```

In **Terminal 2** (Frontend):
```bash
npm run client
```

Open your browser at **`http://localhost:5173`**.

---

## 🔐 Security & Data Integrity

* **Server-Side Credentials:** All API keys (`HF_TOKEN`, `GITHUB_TOKEN`) remain securely on the Node.js backend and are never sent to the client browser.
* **Untrusted Input Handling:** Repository content (READMEs, source code, issues) is treated strictly as data, never as executable code.
* **Bounded Context Windows:** File sizes, tree depth, and code samples are bounded to prevent token overflow and prompt injection.
* **Read-Only by Default:** The application operates strictly in read-only mode and does not perform unapproved write operations to GitHub accounts.

---

## ⚠️ Limitations

* **Human Verification Required:** AI-suggested first issues are hypotheses based on static inspection and should be verified by the contributor.
* **Bounded File Sampling:** For very large repositories, analysis is performed on key entry points and representative modules rather than the entire repository.
* **Rate Limits:** Public GitHub API calls are subject to standard unauthenticated rate limits (adding an optional `GITHUB_TOKEN` increases limits).
* **Provider Availability:** Inference latency and availability depend on the upstream Hugging Face inference provider status.

---

## 🔮 Future Improvements

* 👤 **Contributor Skill Profiling:** Match repository tasks with the user's specific skill level and preferred programming languages.
* 🎯 **Interest-Based Discovery:** Recommend repositories across GitHub based on user interests.
* 🔑 **GitHub OAuth Integration:** Optional authenticated flow for one-click forking and branch creation.
* 🧪 **Isolated Test Execution:** Run automated tests in a sandboxed WebContainer to verify fixes before submitting PRs.
* 📊 **Repository Comparison:** Compare multiple repositories side-by-side to help beginners choose where to contribute.

---

## 🏆 Hackathon Context

**IssuePilot AI** was built for the **MLH Hack Day: Best Open-Source AI Project** challenge. The project demonstrates how open-weight AI (Google Gemma 3 4B IT) can be meaningfully applied to lower the barrier to open-source software contributions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
*(Note: Use of the Google Gemma model is subject to the [Gemma Terms of Use](https://ai.google.dev/gemma/terms)).*
