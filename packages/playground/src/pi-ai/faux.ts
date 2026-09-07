import {
    type Context,
    createModels,
    fauxAssistantMessage,
    fauxProvider,
    fauxText,
    fauxThinking,
    fauxToolCall,
} from '@earendil-works/pi-ai';

const faux = fauxProvider({
    tokensPerSecond: 50 // 可选
});

const models = createModels();
models.setProvider(faux.provider);

const model = faux.getModel();
const context: Context = {
    messages: [{ role: 'user', content: '总结 package.json 然后调用 echo', timestamp: Date.now() }]
};

faux.setResponses([
    fauxAssistantMessage([
        fauxThinking('需要先查看包的元数据。'),
        fauxToolCall('echo', { text: 'package.json' })
    ], { stopReason: 'toolUse' })
]);

const first = await models.complete(model, context, {
    sessionId: 'session-1',
    cacheRetention: 'short'
});
context.messages.push(first);

context.messages.push({
    role: 'toolResult',
    toolCallId: first.content.find((block) => block.type === 'toolCall')!.id,
    toolName: 'echo',
    content: [{ type: 'text', text: '这里是 package.json 的内容' }],
    isError: false,
    timestamp: Date.now()
});

faux.setResponses([
    fauxAssistantMessage([
        fauxThinking('现在可以总结工具输出了。'),
        fauxText('这是总结。')
    ])
]);

const s = models.stream(model, context);
for await (const event of s) {
    console.log(event.type);
}

// 可选：用于模型切换测试的多个 faux 模型
const multiModel = fauxProvider({
    provider: 'faux-multi',
    models: [
        { id: 'faux-fast', reasoning: false },
        { id: 'faux-thinker', reasoning: true }
    ]
});
models.setProvider(multiModel.provider);
const thinker = multiModel.getModel('faux-thinker');

console.log(thinker?.reasoning);
console.log(faux.getPendingResponseCount());
console.log(faux.state.callCount);