import { Type, StringEnum, type Tool, type Context } from '@mariozechner/pi-ai';

/** 示例工具：查询天气（仅做演示，返回固定数据） */
export const weatherTool: Tool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  parameters: Type.Object({
    location: Type.String({ description: 'City name or coordinates' }),
    units: StringEnum(['celsius', 'fahrenheit'], { default: 'celsius' }),
  }),
};

/** 模拟执行天气工具，返回固定结果 */
export function executeWeatherTool(args: { location: string; units?: string }): string {
  return JSON.stringify({
    location: args.location,
    temperature: args.units === 'fahrenheit' ? 68 : 20,
    condition: 'sunny',
  });
}

/** 构建一个带系统提示与工具的对话上下文 */
export function buildContext(systemPrompt: string, userMessage: string, tools: Tool[] = []): Context {
  return {
    systemPrompt,
    messages: [{ role: 'user', content: userMessage, timestamp: Date.now() }],
    tools,
  };
}
