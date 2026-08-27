import { describe, it, expect } from 'vitest';
import { complete, stream, getModel } from '@mariozechner/pi-ai';
import { buildContext, weatherTool, executeWeatherTool } from '../src/tools';

/**
 * 集成测试：真实调用 LLM。
 * 未设置 OPENAI_API_KEY 时自动跳过，设置后运行：
 *   OPENAI_API_KEY=sk-... pnpm --filter demo-pi-ai test
 */
const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

describe.skipIf(!hasApiKey)('pi-ai 真实调用（需要 OPENAI_API_KEY）', () => {
  const model = getModel('openai', 'gpt-4o-mini');

  it('complete 返回文本回复并带 usage 统计', async () => {
    const context = buildContext('You are a helpful assistant.', 'Reply with exactly: hello');
    const response = await complete(model, context);

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    expect(text.toLowerCase()).toContain('hello');
    expect(response.usage.input).toBeGreaterThan(0);
    expect(response.usage.output).toBeGreaterThan(0);
    expect(response.usage.cost.total).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it('stream 事件流最终产出完整消息', async () => {
    const context = buildContext('You are a helpful assistant.', 'Count from 1 to 3.');
    const s = stream(model, context);

    let sawTextDelta = false;
    for await (const event of s) {
      if (event.type === 'text_delta') sawTextDelta = true;
    }

    const finalMessage = await s.result();
    expect(sawTextDelta).toBe(true);
    expect(finalMessage.content.length).toBeGreaterThan(0);
  }, 60_000);

  it('模型能发起工具调用并拿到结果（weather tool loop）', async () => {
    const context = buildContext(
      'You are a weather assistant. Always use the get_weather tool.',
      'What is the weather in London?',
      [weatherTool],
    );

    const first = await complete(model, context);
    context.messages.push(first);

    const toolCall = first.content.find((block) => block.type === 'toolCall');
    expect(toolCall).toBeDefined();

    if (toolCall && toolCall.type === 'toolCall') {
      context.messages.push({
        role: 'toolResult',
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        content: [{ type: 'text', text: executeWeatherTool(toolCall.arguments as never) }],
        isError: false,
        timestamp: Date.now(),
      });

      const second = await complete(model, context);
      const text = second.content
        .filter((block) => block.type === 'text')
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('');
      expect(text).toBeTruthy();
    }
  }, 120_000);
});
