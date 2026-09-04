import { createModels, createProvider, envApiKeyAuth, hasApi, type Context, type Model } from '@earendil-works/pi-ai';
import { openAIResponsesApi } from '@earendil-works/pi-ai/api/openai-responses.lazy';
import {printUsage} from "./common";

const BASE_URL = 'https://open.bigmodel.cn/api/v1'; // 智谱国内站 OpenAI Responses 端点

const glm53: Model<'openai-responses'> = {
    id: 'glm-5.3',
    name: 'GLM-5.3 (Coding Plan CN)',
    api: 'openai-responses',
    provider: 'zai-coding-cn-responses',
    baseUrl: BASE_URL,
    reasoning: true,
    // GLM-5.3 思考不可关闭，只支持 low/high/max（默认 max）
    thinkingLevelMap: {
        off: null, minimal: null, low: 'low',
        medium: null, high: 'high', xhigh: null, max: 'max',
    },
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, // Coding Plan 积分制
    contextWindow: 1_000_000,
    maxTokens: 131_072,
    compat: {
        supportsDeveloperRole: false,      // 回退 system 角色
        supportsLongCacheRetention: false, // 不发 prompt_cache_retention: "24h"
    },
};

// Flash 额度是 5.3 的 3 倍，还带视觉，顺手一起注册
const glm53Flash: Model<'openai-responses'> = {
    ...glm53,
    id: 'glm-5.3-flash',
    name: 'GLM-5.3-Flash (Coding Plan CN)',
    input: ['text', 'image'],
};

const zai = createProvider({
    id: 'zai-coding-cn-responses',
    name: 'Z.AI Coding Plan CN (Responses)',
    baseUrl: BASE_URL,
    auth: { apiKey: envApiKeyAuth('Z.AI Coding CN API key', ['ZAI_CODING_CN_API_KEY']) },
    models: [glm53, glm53Flash],
    api: openAIResponsesApi(),
});

const models = createModels();
models.setProvider(zai);
const model = models.getModel('zai-coding-cn-responses', 'glm-5.3')!;

// ------------------------------------------------------------------------

// getModel() 返回宽泛的 Model<Api>，用 hasApi 收窄为 Model<'openai-responses'>
if (!hasApi(model, 'openai-responses')) {
    throw new Error('glm-5.3 does not support openai-responses API');
}

const s = models.stream(model, {
    systemPrompt: '你是一个乐于助人的助手。',
    messages: [{ role: 'user', content: '用一句话介绍你自己', timestamp: Date.now() }],
}, {
    onPayload: (payload) => {
        console.log('提供商载荷：', JSON.stringify(payload, null, 2));
    },
    apiKey: process.env.ZAI_CODING_CN_API_KEY,
    reasoningEffort: 'high',
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
const final = await s.result();
printUsage(final)