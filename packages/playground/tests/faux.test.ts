import { describe, it, expect } from 'vitest';
import {
  createModels,
  fauxProvider,
  fauxAssistantMessage,
  fauxText,
  fauxToolCall,
  fauxThinking,
} from '@earendil-works/pi-ai';
import { buildContext, weatherTool, executeWeatherTool } from '../src/pi-ai/tools';

/**
 * Faux Provider：内存中的脚本化响应，无需 API key 即可测试完整的
 * 调用/流式/工具循环链路。
 */
function setup() {
  const faux = fauxProvider();
  const models = createModels();
  models.setProvider(faux.provider);
  return { faux, models, model: faux.getModel() };
}

describe('faux provider 基础调用', () => {
  it('complete 返回脚本化的 assistant 消息', async () => {
    const { faux, models, model } = setup();
    faux.setResponses([fauxAssistantMessage([fauxText('hello world')])]);

    const response = await models.complete(model, buildContext('', 'hi'));

    const text = response.content.find((block) => block.type === 'text');
    expect(text && text.type === 'text' && text.text).toBe('hello world');
    expect(faux.state.callCount).toBe(1);
  });

  it('stream 事件流最终产出完整消息', async () => {
    const { faux, models, model } = setup();
    faux.setResponses([fauxAssistantMessage([fauxText('counting 1 2 3')])]);

    const s = models.stream(model, buildContext('', 'Count from 1 to 3.'));
    const eventTypes: string[] = [];
    for await (const event of s) {
      eventTypes.push(event.type);
    }
    const finalMessage = await s.result();

    expect(eventTypes).toContain('start');
    expect(eventTypes).toContain('text_delta');
    expect(eventTypes).toContain('done');
    expect(finalMessage.content.length).toBeGreaterThan(0);
  });
});

describe('faux provider 工具调用循环', () => {
  it('模型发起 toolCall -> 回填 toolResult -> 二次调用拿到总结', async () => {
    const { faux, models, model } = setup();
    // 第一轮：发起 get_weather 工具调用
    faux.setResponses([
      fauxAssistantMessage([fauxToolCall('get_weather', { location: 'London' })], {
        stopReason: 'toolUse',
      }),
    ]);

    const context = buildContext('You are a weather assistant.', 'Weather in London?', [weatherTool]);
    const first = await models.complete(model, context);
    context.messages.push(first);

    const toolCall = first.content.find((block) => block.type === 'toolCall');
    expect(toolCall).toBeDefined();
    expect(toolCall && toolCall.type === 'toolCall' && toolCall.name).toBe('get_weather');

    // 回填工具结果
    if (toolCall && toolCall.type === 'toolCall') {
      context.messages.push({
        role: 'toolResult',
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        content: [{ type: 'text', text: executeWeatherTool(toolCall.arguments as never) }],
        isError: false,
        timestamp: Date.now(),
      });
    }

    // 第二轮：拿到最终总结
    faux.setResponses([fauxAssistantMessage([fauxText('London is sunny, 20C')])]);
    const second = await models.complete(model, context);

    const text = second.content.find((block) => block.type === 'text');
    expect(text && text.type === 'text' && text.text).toContain('sunny');
    expect(faux.state.callCount).toBe(2);
  });
});

describe('faux provider 边界行为', () => {
  it('队列耗尽时返回错误消息', async () => {
    const { faux, models, model } = setup();
    // 不设置响应，队列为空

    const response = await models.complete(model, buildContext('', 'hi'));
    expect(response.stopReason).toBe('error');
    expect(response.errorMessage).toContain('No more faux responses queued');
  });

  it('支持 thinking 与工具调用混合输出', async () => {
    const { faux, models, model } = setup();
    faux.setResponses([
      fauxAssistantMessage(
        [fauxThinking('Need to check the weather first.'), fauxToolCall('get_weather', { location: 'Paris' })],
        { stopReason: 'toolUse' },
      ),
    ]);

    const response = await models.complete(
      model,
      buildContext('', 'Weather in Paris?', [weatherTool]),
    );

    expect(response.content.some((block) => block.type === 'thinking')).toBe(true);
    expect(response.content.some((block) => block.type === 'toolCall')).toBe(true);
    expect(response.stopReason).toBe('toolUse');
  });
});
