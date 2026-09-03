
// ...“支持的提供商”列表中每个提供商各有一个模块
import {zaiCodingCnProvider} from "@earendil-works/pi-ai/providers/zai-coding-cn";
import {type Api, createModels, hasApi, type Model} from "@earendil-works/pi-ai";

const models = createModels();
models.setProvider(zaiCodingCnProvider());


// 全部模型
//const models = builtinModels();
//let providers: Provider[] = builtinProviders();


const zai = models.getProvider('zai-coding-cn');  // 单个提供商
console.log(zai);

const model: Model<Api> = models.getModel('zai-coding-cn', 'glm-5.3-flash')!;
console.log(model);
console.log(model.api);
console.log(hasApi(model, 'anthropic-messages'));

console.log(`-------------------------------------------`);
console.log(`${model.id}: ${model.name}`);
console.log(`  API: ${model.api}`);
console.log(`  上下文：${model.contextWindow} tokens`);
console.log(`  视觉：${model.input.includes('image')}`);
console.log(`  推理：${model.reasoning}`);

console.log(`-------------------------------------------`);

const providerAuth = await models.getAuth(model.provider);
console.log(`提供商认证：${providerAuth ? '已配置' : '未配置'}`);
const modelAuth = await models.getAuth(model);
console.log(`模型认证：${modelAuth ? '已配置' : '未配置'}`);

if (modelAuth) {
    console.log(`配置来源：${modelAuth.source}`); // 例如 "ANTHROPIC_API_KEY"、"OAuth"、"stored credential"
    console.log(modelAuth.auth.headers);          // 提供商认证头 + model.headers
} else {
    console.log('未配置');
}