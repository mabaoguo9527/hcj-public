import { describe, it, expect } from 'vitest';
import {
  getBuiltinModel,
  getBuiltinModels,
  getBuiltinProviders,
} from '@earendil-works/pi-ai/providers/all';
import { weatherTool, executeWeatherTool, buildContext } from '../src/pi-ai/tools';

describe('静态模型目录查询（本地纯函数，无需 API key）', () => {
  it('getBuiltinProviders 返回主流 provider 列表', () => {
    const providers = getBuiltinProviders();
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('google');
    expect(providers.length).toBeGreaterThan(5);
  });

  it('getBuiltinModels 返回 anthropic 的模型，且包含上下文窗口信息', () => {
    const models = getBuiltinModels('anthropic');
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.contextWindow).toBeGreaterThan(0);
      expect(model.input).toContain('text');
    }
  });

  it('getBuiltinModel 能精确取出指定模型', () => {
    const model = getBuiltinModel('openai', 'gpt-4o-mini');
    expect(model?.id).toBe('gpt-4o-mini');
    expect(model?.provider).toBe('openai');
    expect(model?.api).toBe('openai-responses');
  });

  it('getBuiltinModel 传入不存在的模型 id 时返回 undefined', () => {
    expect(getBuiltinModel('openai', 'not-a-real-model' as never)).toBeUndefined();
  });
});

describe('tool 定义与 context 构建', () => {
  it('weatherTool 结构合法', () => {
    expect(weatherTool.name).toBe('get_weather');
    expect(weatherTool.description).toBeTruthy();
    // TypeBox schema 是普通 JSON 对象，可序列化
    expect(() => JSON.stringify(weatherTool.parameters)).not.toThrow();
  });

  it('executeWeatherTool 返回模拟天气 JSON', () => {
    const result = JSON.parse(executeWeatherTool({ location: 'London' })) as {
      location: string;
      temperature: number;
    };
    expect(result.location).toBe('London');
    expect(result.temperature).toBe(20);
  });

  it('buildContext 生成包含 system prompt 与用户消息的上下文', () => {
    const context = buildContext('You are a helpful assistant.', 'What is the weather in London?', [
      weatherTool,
    ]);
    expect(context.systemPrompt).toBe('You are a helpful assistant.');
    expect(context.messages).toHaveLength(1);
    expect(context.messages[0]?.role).toBe('user');
    expect(context.tools).toContain(weatherTool);
  });
});
