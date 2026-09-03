/**
 * 示例：使用 pi-ai 向智谱 Z.AI Coding CN 发起普通请求和流式请求。
 *
 * 运行：
 *   ZAI_CODING_CN_API_KEY=... npx tsx packages/playground/src/pi-ai/zhipu.ts
 *   npx tsx src/pi-ai/zhipu.ts
 *   node src/pi-ai/zhipu.ts
 */
import { builtinModels } from '@earendil-works/pi-ai/providers/all';
import {
  contentText,
  type Api,
  type AssistantMessage,
  type Model,
  type Models,
} from '@earendil-works/pi-ai';

const PROVIDER_ID = 'zai-coding-cn';
const MODEL_ID = 'glm-5.3';
const API_KEY_ENV = 'ZAI_CODING_CN_API_KEY';

function requireApiKey(): void {
  if (!process.env[API_KEY_ENV]) {
    throw new Error(`Missing ${API_KEY_ENV} environment variable`);
  }
}

function requireModel(models: Models): Model<Api> {
  const model = models.getModel(PROVIDER_ID, MODEL_ID);
  if (!model) {
    throw new Error(`Model not found: ${PROVIDER_ID}/${MODEL_ID}`);
  }
  return model;
}

function printUsage(response: AssistantMessage): void {
  console.log(
    `Usage: input=${response.usage.input}, output=${response.usage.output}, cost=${response.usage.cost.total}`,
  );
}

async function runStreamingExample(models: Models, model: Model<Api>): Promise<void> {
  const stream = models.stream(model, {
    systemPrompt: 'You are a helpful assistant.',
    messages: [
      { role: 'user', content: '用几句话介绍一下人工智能。', timestamp: Date.now() },
    ],
  });

  process.stdout.write('\nStreaming reply: ');
  for await (const event of stream) {
    if (event.type === 'text_delta') {
      process.stdout.write(event.delta);
    }
  }

  const response = await stream.result();
  process.stdout.write('\n');
  printUsage(response);
}

//
// async function runExample(models: Models, model: Model<Api>): Promise<void> {
//   const response = await models.complete(model, {
//     systemPrompt: 'You are a helpful assistant.',
//     messages: [{ role: 'user', content: '用一句话介绍你自己。', timestamp: Date.now() }],
//   });
//
//   console.log('Reply:', contentText(response.content));
//   printUsage(response);
// }
//


async function main(): Promise<void> {
  requireApiKey();

  const models = builtinModels();
  console.log('BTI Models:', models);
  const model = requireModel(models);
  console.log('ZAI Models:', models.getModels('zai-coding-cn'));
  console.log('ZAI Models:', models.getModels('zai'));

  // 运行普通请求示例
  // await runExample(models, model);

  // 运行流式请求示例
  //await runStreamingExample(models, model);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
