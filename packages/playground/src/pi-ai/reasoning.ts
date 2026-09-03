import {builtinModels} from "@earendil-works/pi-ai/providers/all";
import 'dotenv/config';

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

// 使用简化的推理选项
const response = await models.completeSimple(model, {
    messages: [{ role: 'user', content: '解方程：2x + 5 = 13', timestamp: Date.now() }]
}, {
    reasoning: 'medium'  // 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
});

// 访问思考块和文本块
for (const block of response.content) {
    if (block.type === 'thinking') {
        console.log('思考：', block.thinking);
    } else if (block.type === 'text') {
        console.log('回答：', block.text);
    }
}