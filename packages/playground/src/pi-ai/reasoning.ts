import {builtinModels} from "@earendil-works/pi-ai/providers/all";
import 'dotenv/config';
import {printUsage} from "./common";
import {type Context, getSupportedThinkingLevels, hasApi} from "@earendil-works/pi-ai";

const models = builtinModels();

// 各提供商的许多模型都支持思考/推理
const model = models.getModel('zai-coding-cn', 'glm-5.3-flash')!;
// 或 models.getModel('openai', 'gpt-5-mini');
// 或 models.getModel('google', 'gemini-2.5-flash');
// 或 models.getModel('xai', 'grok-4.6');

// 检查模型是否支持推理
if (model.reasoning) {
    console.log('模型支持推理/思考');
}

// // 使用简化的推理选项
// const response = await models.completeSimple(model, {
//     messages: [{ role: 'user', content: '解方程：2x + 5 = 13', timestamp: Date.now() }]
// }, {
//     reasoning: 'medium'  // 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
// });
//
// // 访问思考块和文本块
// for (const block of response.content) {
//     if (block.type === 'thinking') {
//         console.log('思考：', block.thinking);
//     } else if (block.type === 'text') {
//         console.log('回答：', block.text);
//     }
// }


console.log(`Support Thinking Levels: ${getSupportedThinkingLevels(model)}`);

const stream = models.streamSimple(model, {
    messages: [{ role: 'user', content: '解方程：2x + 5 = 13', timestamp: Date.now() }],
}, {
    reasoning: 'max',
    onPayload: (payload) => {
        console.log('提供商载荷：', JSON.stringify(payload, null, 2));
    }
});


for await (const event of stream) {
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
const response = await stream.result();
printUsage(response);








// const context: Context = {
//     messages: [{ role: 'user', content: '解方程：2x + 5 = 13', timestamp: Date.now() }],
// }
//
// // OpenAI 推理（o1、o3、gpt-5）
// const openaiModel = models.getModel('openai', 'gpt-5-mini')!;
// if (hasApi(openaiModel, 'openai-responses')) {
//     await models.complete(openaiModel, context, {
//         reasoningEffort: 'medium',
//         reasoningSummary: 'detailed'  // 仅 OpenAI Responses API
//     });
// }
//
// // Anthropic 思考
// const anthropicModel = models.getModel('anthropic', 'claude-sonnet-4-5')!;
// if (hasApi(anthropicModel, 'anthropic-messages')) {
//     await models.complete(anthropicModel, context, {
//         thinkingEnabled: true,
//         thinkingBudgetTokens: 8192  // 可选的 token 上限
//     });
// }
//
// // Google Gemini 思考
// const googleModel = models.getModel('google', 'gemini-2.5-flash')!;
// if (hasApi(googleModel, 'google-generative-ai')) {
//     await models.complete(googleModel, context, {
//         thinking: {
//             enabled: true,
//             budgetTokens: 8192  // -1 表示动态，0 表示禁用
//         }
//     });
// }