/**
 * 最小示例：使用 pi-ai 调用 DeepSeek。
 *
 * 运行前设置 API key：
 *   export DEEPSEEK_API_KEY=sk-...
 *
 * 运行（任选其一）：
 *   npx tsx packages/playground/src/pi-ai/index.ts
 *   node --experimental-strip-types packages/playground/src/pi-ai/index.ts
 */
import { builtinModels } from '@earendil-works/pi-ai/providers/all';
import { contentText } from '@earendil-works/pi-ai';

const PROVIDER_ID = 'deepseek';
const MODEL_ID = 'deepseek-v4-flash';

function requireApiKey(): void {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('Missing DEEPSEEK_API_KEY environment variable');
  }
}

function requireModel() {
  const model = builtinModels().getModel(PROVIDER_ID, MODEL_ID);
  if (!model) {
    throw new Error(`Model not found: ${PROVIDER_ID}/${MODEL_ID}`);
  }
  return model;
}

async function main(): Promise<void> {
  requireApiKey();

  const models = builtinModels();
  const model = requireModel();

  const response = await models.complete(model, {
    systemPrompt: 'You are a helpful assistant.',
    messages: [{ role: 'user', content: '用一句话介绍你自己。', timestamp: Date.now() }],
  });

  console.log('Reply:', contentText(response.content));
  console.log(
    `Usage: input=${response.usage.input}, output=${response.usage.output}, cost=${response.usage.cost.total}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
