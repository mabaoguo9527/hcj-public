import { Type, type Context, type Tool } from '@earendil-works/pi-ai';
import { builtinModels } from '@earendil-works/pi-ai/providers/all';

// 注册了所有内置提供商的 Models 集合
const models = builtinModels();

// 在集合中同步查找
const model = models.getModel('zai-coding-cn', 'glm-5.3')!;

// 用 TypeBox schema 定义工具，获得类型安全与校验
const tools: Tool[] = [{
  name: 'get_time',
  description: '获取当前时间',
  parameters: Type.Object({
    timezone: Type.Optional(Type.String({ description: '可选时区（例如 America/New_York）' }))
  })
}];

// 构建会话上下文（易于序列化，可在不同模型之间传递）
const context: Context = {
  systemPrompt: '你是一个乐于助人的助手。',
  messages: [{ role: 'user', content: '现在几点了？', timestamp: Date.now() }],
  tools
};

// 方式一：流式输出，包含所有事件类型。
// 认证经由提供商解析（此处为环境变量中的 ZAI_CODING_CN_API_KEY）。
const s = models.stream(model, context);

for await (const event of s) {
  switch (event.type) {
    case 'start':
      console.log(`开始，模型：${event.partial.model}`);
      break;
    case 'text_start':
      console.log('\n[文本开始]');
      break;
    case 'text_delta':
      process.stdout.write(event.delta);
      break;
    case 'text_end':
      console.log('\n[文本结束]');
      break;
    case 'thinking_start':
      console.log('[模型正在思考...]');
      break;
    case 'thinking_delta':
      process.stdout.write(event.delta);
      break;
    case 'thinking_end':
      console.log('[思考完成]');
      break;
    case 'toolcall_start':
      console.log(`\n[工具调用开始：索引 ${event.contentIndex}]`);
      break;
    case 'toolcall_delta':
      // 正在流式传输部分工具参数
      const partialCall = event.partial.content[event.contentIndex];
      if (partialCall?.type === 'toolCall') {
        console.log(`[正在流式传输 ${partialCall.name} 的参数]`);
      }
      break;
    case 'toolcall_end':
      console.log(`\n工具被调用：${event.toolCall.name}`);
      console.log(`参数：${JSON.stringify(event.toolCall.arguments)}`);
      break;
    case 'done':
      console.log(`\n结束：${event.reason}`);
      break;
    case 'error':
      console.error(`错误：${event.error.errorMessage}`);
      break;
  }
}

// 流式结束后获取最终消息，并加入上下文
const finalMessage = await s.result();
context.messages.push(finalMessage);

// 如有工具调用则处理
const toolCalls = finalMessage.content.filter(b => b.type === 'toolCall');
for (const call of toolCalls) {
  const result = call.name === 'get_time'
      ? new Date().toLocaleString('en-US', {
        timeZone: call.arguments.timezone || 'UTC',
        dateStyle: 'full',
        timeStyle: 'long'
      })
      : '未知工具';

  // 将工具结果加入上下文（支持文本和图像）
  context.messages.push({
    role: 'toolResult',
    toolCallId: call.id,
    toolName: call.name,
    content: [{ type: 'text', text: result }],
    isError: false,
    timestamp: Date.now()
  });
}

// 如果发生了工具调用则继续
if (toolCalls.length > 0) {
  const continuation = await models.complete(model, context);
  context.messages.push(continuation);
  console.log('工具执行之后：', continuation.content);
}

console.log(`总 token 数：输入 ${finalMessage.usage.input}，输出 ${finalMessage.usage.output}`);
console.log(`成本：$${finalMessage.usage.cost.total.toFixed(4)}`);

// 方式二：不使用流式，直接获取完整响应
const response = await models.complete(model, context);

for (const block of response.content) {
  if (block.type === 'text') {
    console.log(block.text);
  } else if (block.type === 'toolCall') {
    console.log(`工具：${block.name}(${JSON.stringify(block.arguments)})`);
  }
}