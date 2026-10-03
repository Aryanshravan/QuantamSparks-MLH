import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import repoGuideRouter from './routes/repoGuide.js';
import firstIssuesRouter from './routes/firstIssues.js';
import copilotRouter from './routes/copilot.js';
import { gemmaService } from './services/gemmaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health and verification route
app.get('/api/health', async (req, res) => {
  const hasHfToken = Boolean(process.env.HF_TOKEN);
  const hasGhToken = Boolean(process.env.GITHUB_TOKEN);
  const model = process.env.GEMMA_MODEL || 'google/gemma-3-4b-it';

  let inferenceStatus = 'untested';
  if (req.query.ping === 'true' && hasHfToken) {
    try {
      await gemmaService.verifyConnection();
      inferenceStatus = 'operational';
    } catch (err) {
      inferenceStatus = `error: ${err.message}`;
    }
  }

  res.json({
    status: 'ok',
    service: 'IssuePilot AI Backend',
    timestamp: new Date().toISOString(),
    aiConfig: {
      provider: 'Hugging Face Inference Providers',
      model: model,
      tokenConfigured: hasHfToken,
      inferenceStatus: inferenceStatus
    },
    githubConfig: {
      tokenConfigured: hasGhToken
    }
  });
});

// Feature Routes
app.use('/api/repo-guide', repoGuideRouter);
app.use('/api/first-issues', firstIssuesRouter);
app.use('/api/copilot', copilotRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IssuePilot AI Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemma Model: ${process.env.GEMMA_MODEL || 'google/gemma-3-4b-it'}`);
  console.log(`🔑 HF_TOKEN configured: ${Boolean(process.env.HF_TOKEN)}`);
});
