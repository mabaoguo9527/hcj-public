import { streamSimple } from '@earendil-works/pi-ai/api/openai-responses';
import { builtinModels } from "@earendil-works/pi-ai/providers/all";
import 'dotenv/config';
import { printUsage } from "./common.ts";
import { getSupportedThinkingLevels, hasApi } from "@earendil-works/pi-ai";

const models = builtinModels();

// 各提供商的许多模型都支持思考/推理
const model = models.getModel('zai-coding-cn', 'glm-5.3-flash')!;

// glm-5.3-flash 走 openai-completions API，用 hasApi 收窄类型后才能传给对应的 streamSimple
if (!hasApi(model, 'openai-responses')) {
    throw new Error('glm-5.3-flash does not support openai-responses API');
}

// 检查模型是否支持推理
if (model.reasoning) {
    console.log('模型支持推理/思考');
}


console.log(`Support Thinking Levels: ${getSupportedThinkingLevels(model)}`);

const s = streamSimple(model, {
    messages: [{ role: 'user', content: '解方程：2x + 5 = 13', timestamp: Date.now() }],
}, {
    onPayload: (payload) => {
        console.log('提供商载荷：', JSON.stringify(payload, null, 2));
    },
    apiKey: process.env.ZAI_CODING_CN_API_KEY,
    reasoning: 'max',
});



for await (const event of s) {
    switch (event.type) {
        case 'thinking_start':
            process.stdout.write('\n[模型开始思考] ');
            break;
        case 'thinking_delta':
            process.stdout.write(event.delta);      // 思考增量，可实时打印
            break;
        case 'thinking_end':
            process.stdout.write('\n[模型思考结束] ');
            break;
        case 'text_start':
            process.stdout.write('\n[模型开始回答] ');
            break;
        case 'text_delta':
            process.stdout.write(event.delta);      // 回答增量
            break;
    }
}

// 流结束后拿完整消息：content 里含 thinking / text 块，还带 usage
const response = await s.result();
printUsage(response);

