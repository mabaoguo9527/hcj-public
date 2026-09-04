/**
 * 运行
 * ZAI_CODING_CN_API_KEY=... npx tsx src/pi-ai/provider.ts
 * npx tsx src/pi-ai/provider.ts
 */
import {createModels, type Provider} from "@earendil-works/pi-ai";
import 'dotenv/config';



import { zaiCodingCnProvider } from '@earendil-works/pi-ai/providers/zai-coding-cn';
import {printUsage} from "./common.ts";
import {builtinModels, builtinProviders} from "@earendil-works/pi-ai/providers/all";

// ...“支持的提供商”列表中每个提供商各有一个模块
const models = createModels();
models.setProvider(zaiCodingCnProvider());


// 全部模型
//const models = builtinModels();
//let providers: Provider[] = builtinProviders();


// 在集合中同步查找
const model = models.getModel('zai-coding-cn', 'glm-5.3')!;

const stream = models.stream(model, {
    systemPrompt: 'You are a helpful assistant.',
    messages: [
        { role: 'user', content: '用两句话介绍人工智能。', timestamp: Date.now() },
    ],
});

process.stdout.write('\nStreaming reply: \n');
for await (const event of stream) {
    if (event.type === 'text_delta') {
        process.stdout.write(event.delta);
    }
}
process.stdout.write('\n');
const response = await stream.result();
printUsage(response);
process.stdout.write('\n');