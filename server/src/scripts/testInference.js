import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { gemmaService } from '../services/gemmaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  console.log('----------------------------------------------------');
  console.log('🧪 Testing Genuine Google Gemma Inference via Hugging Face');
  console.log(`🤖 Target Model: ${process.env.GEMMA_MODEL || 'google/gemma-3-4b-it'}`);
  console.log(`🔑 HF_TOKEN present: ${Boolean(process.env.HF_TOKEN)}`);
  console.log('----------------------------------------------------');

  if (!process.env.HF_TOKEN) {
    console.error('❌ HF_TOKEN is missing! Please paste your token in .env');
    process.exit(1);
  }

  try {
    console.log('⏳ Sending test prompt to Gemma...');
    const result = await gemmaService.verifyConnection();
    console.log('✅ Inference Successful!');
    console.log(`💬 Model Response: ${result.content.trim()}`);
    console.log(`🏷️ Model Name: ${result.model}`);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Inference Failed:', err.message);
    console.log('\n💡 Tips:');
    console.log('1. Verify your Hugging Face token at https://huggingface.co/settings/tokens');
    console.log('2. Ensure you have accepted the Gemma license at https://huggingface.co/google/gemma-3-4b-it');
    process.exit(1);
  }
}

main();
