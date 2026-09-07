#!/usr/bin/env node
/**
 * compat-demo.ts —— 演示 pi-ai 的 compat 字段如何影响实际发出的 HTTP 请求
 *
 * 运行：cd packages/ai && npx tsx scripts/compat-demo.ts
 *
 * 工作原理：
 *   1. baseUrl 指向不可达端口（127.0.0.1:1），让 fetch 失败
 *   2. 注入 mock fetch，在请求发出前把 URL / headers / body 打出来
 *   3. onPayload 回调（stream 入参）让我们再次看到 pi 内部构造的请求对象
 *
 * 阅读顺序：
 *   1) supportsDeveloperRole —— systemPrompt 走 developer 还是 system 消息
 *   2) thinkingFormat        —— 思考参数是 reasoning_effort 还是 thinking.type
 *   3) maxTokensField        —— 上限字段是 max_tokens 还是 max_completion_tokens
 *   4) supportsStore         —— 反直觉：true 时才发 store=false
 *   5) sessionAffinityFormat —— 请求头 session_id / x-client-request-id / x-session-id
 */

import type { Context, Model } from '@earendil-works/pi-ai';
import { stream as completionsStream } from '@earendil-works/pi-ai/api/openai-completions';
import { stream as responsesStream } from '@earendil-works/pi-ai/api/openai-responses';

// ---------- 工具：mock fetch + 拦截打印 ----------

const UNREACHABLE = "http://127.0.0.1:1";

/** 抓取请求并抛错终止调用 —— 这样 onPayload 仍然被触发，但不会真的发请求 */
function makeSpyFetch(label: string): typeof globalThis.fetch {
    return async (input, init) => {
        const url = typeof input === "string" ? input : (input as Request).url;
        let body = init?.body;
        try {
            body = typeof body === "string" ? JSON.parse(body) : body;
        } catch {
            /* 不是 JSON 也没关系 */
        }

        // Headers / tuples / plain object 三种形态都归一化为 plain object（OpenAI SDK 用的是 Headers）
        const headerObj: Record<string, string> = {};
        const h = init?.headers;
        if (h instanceof Headers) {
            h.forEach((v, k) => {
                headerObj[k] = v;
            });
        } else if (Array.isArray(h)) {
            for (const [k, v] of h) { // @ts-ignore
                headerObj[k] = v;
            }
        } else if (h) {
            Object.assign(headerObj, h);
        }

        console.log(`\n──── ${label} ────`);
        console.log("URL      :", url);
        console.log("METHOD   :", init?.method ?? "POST");
        console.log("HEADERS  :", JSON.stringify(headerObj, null, 2));
        console.log("BODY     :", JSON.stringify(body, null, 2));
        throw new Error(`[mock-fetch] ${label}: abort`);
    };
}

/** 调用 stream()，吃下错误（mock fetch 抛错属预期） */
async function call(label: string, fn: () => Promise<unknown>) {
    try {
        await fn();
    } catch (e) {
        /* 静默 */
    }
}

// ---------- 公用的演示模型工厂 ----------

const ctx: Context = {
    systemPrompt: "你是一个乐于助人的助手。",
    messages: [{ role: "user", content: "你好", timestamp: Date.now() }],
};

function makeCompletionsModel(compat: Model<"openai-completions">["compat"]): Model<"openai-completions"> {
    return {
        id: "demo",
        name: "demo",
        api: "openai-completions",
        provider: "demo",
        baseUrl: UNREACHABLE,
        reasoning: true,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 100_000,
        maxTokens: 10_000,
        thinkingLevelMap: { off: null, minimal: null, low: "low", medium: "medium", high: "high", xhigh: null, max: "max" },
        compat,
    };
}

function makeResponsesModel(compat: Model<"openai-responses">["compat"]): Model<"openai-responses"> {
    return {
        id: "demo",
        name: "demo",
        api: "openai-responses",
        provider: "demo",
        baseUrl: UNREACHABLE,
        reasoning: true,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 100_000,
        maxTokens: 10_000,
        thinkingLevelMap: { off: null, minimal: null, low: "low", medium: "medium", high: "high", xhigh: null, max: "max" },
        compat,
    };
}

// ---------- 演示 1：supportsDeveloperRole ----------
//   两条规则的差异（值得一看）：
//     openai-completions: model.reasoning && compat.supportsDeveloperRole
//                        —— 只有 true 才用 developer，默认 system
//     openai-responses : model.reasoning && compat.supportsDeveloperRole !== false
//                        —— 默认 true，**只有显式 false 才回退 system**

async function demoDeveloperRole() {
    console.log("\n=== [1] supportsDeveloperRole ===");
    console.log("影响: systemPrompt 落到 system 消息还是 developer 消息");
    console.log("对比: openai-completions 默认 system，openai-responses 默认 developer（除非显式 false）");

    // openai-completions: true / false
    for (const flag of [true, false] as const) {
        const model = makeCompletionsModel({ supportsDeveloperRole: flag });
        await call(`completions / supportsDeveloperRole=${flag}`, () =>
            completionsStream(model, ctx, {
                apiKey: "sk-test",
                reasoningEffort: "high",
                fetch: makeSpyFetch(`completions supportsDeveloperRole=${flag}`),
                onPayload: (p) => {
                    const sys = (p as any).messages?.find((m: any) => m.role === "system" || m.role === "developer");
                    console.log(`   → messages[0] role = ${sys?.role ?? "(none)"}`);
                    return undefined;
                },
            }).result(),
        );
    }

    // openai-responses: undefined（默认）/ false
    for (const flag of [undefined, false] as const) {
        const model = makeResponsesModel({ supportsDeveloperRole: flag });
        await call(`responses / supportsDeveloperRole=${flag ?? "undefined"}`, () =>
            responsesStream(model, ctx, {
                apiKey: "sk-test",
                reasoningEffort: "high",
                fetch: makeSpyFetch(`responses supportsDeveloperRole=${flag ?? "undefined"}`),
                onPayload: (p) => {
                    const sys = (p as any).input?.find((m: any) => m.role === "system" || m.role === "developer");
                    console.log(`   → input[0] role = ${sys?.role ?? "(none)"}`);
                    return undefined;
                },
            }).result(),
        );
    }
}

// ---------- 演示 2：thinkingFormat ----------
//   zai / qwen / openai / openrouter 等不同提供商的"思考"参数字段名都不一样：
//     - zai    : thinking: { type: "enabled"|"disabled" } + 可选 reasoning_effort
//     - qwen   : enable_thinking: bool
//     - deepseek: thinking: { type: "enabled" } + reasoning_effort
//     - openrouter: reasoning: { effort }
//     - openai (默认): reasoning_effort 顶层字段
//   这里对比 zai 风格与 openai 风格，看请求体的差异。

async function demoThinkingFormat() {
    console.log("\n=== [2] thinkingFormat ===");
    console.log("影响: 思考参数字段名 / 嵌套结构 / 与 reasoning_effort 的关系");

    const cases: Array<{ label: string; compat: Model<"openai-completions">["compat"] }> = [
        { label: "openai (default)", compat: {} },
        { label: "zai", compat: { thinkingFormat: "zai", supportsReasoningEffort: true } },
        { label: "qwen", compat: { thinkingFormat: "qwen", supportsReasoningEffort: true } },
        { label: "deepseek", compat: { thinkingFormat: "deepseek", supportsReasoningEffort: true } },
        { label: "openrouter", compat: { thinkingFormat: "openrouter", supportsReasoningEffort: true } },
        { label: "zai + 关闭思考", compat: { thinkingFormat: "zai", supportsReasoningEffort: true } }, // 用 off 触发
    ];

    for (const c of cases) {
        const isZaiOff = c.label === "zai + 关闭思考";
        const model = makeCompletionsModel(c.compat);
        const effort = isZaiOff ? undefined : "high";
        await call(`completions / thinkingFormat=${c.label} / effort=${effort ?? "off"}`, () =>
            completionsStream(model, ctx, {
                apiKey: "sk-test",
                reasoningEffort: effort,
                fetch: makeSpyFetch(`thinkingFormat=${c.label} / effort=${effort ?? "off"}`),
            }).result(),
        );
    }
}

// ---------- 演示 3：maxTokensField ----------
//   OpenAI 在 2024 年把 max_tokens 改名 max_completion_tokens（gpt-4o+）。
//   老模型 / 多数第三方兼容实现仍认 max_tokens。
//   compat.maxTokensField === "max_tokens" 时用旧字段名。

async function demoMaxTokensField() {
    console.log("\n=== [3] maxTokensField ===");
    console.log("影响: 输出上限字段是 max_tokens 还是 max_completion_tokens");

    for (const field of [undefined, "max_tokens", "max_completion_tokens"] as const) {
        const model = makeCompletionsModel({ maxTokensField: field });
        await call(`completions / maxTokensField=${field ?? "default"}`, () =>
            completionsStream(model, ctx, {
                apiKey: "sk-test",
                maxTokens: 4096,
                fetch: makeSpyFetch(`maxTokensField=${field ?? "default"}`),
            }).result(),
        );
    }
}

// ---------- 演示 4：supportsStore ----------
//   反直觉：supportsStore === true 时才会显式发 store=false（OpenAI 默认 true，会持久化）。
//   supportsStore === false（默认）→ 字段完全不出现。
//   vLLM / Ollama / GLM 这些非 OpenAI 实现通常 supportsStore=false，开了反而可能报错。

async function demoSupportsStore() {
    console.log("\n=== [4] supportsStore ===");
    console.log("影响: 极反直觉 —— supportsStore=true 才发 store=false（OpenAI 默认持久化，要主动禁用）");
    console.log("      supportsStore=false（默认）→ 字段根本不出现");

    for (const flag of [false, true] as const) {
        const model = makeCompletionsModel({ supportsStore: flag });
        await call(`completions / supportsStore=${flag}`, () =>
            completionsStream(model, ctx, {
                apiKey: "sk-test",
                fetch: makeSpyFetch(`supportsStore=${flag}`),
                onPayload: (p) => {
                    console.log(`   → 请求体是否含 store 字段: ${"store" in (p as any) ? "是 (" + (p as any).store + ")" : "否"}`);
                    return undefined;
                },
            }).result(),
        );
    }
}

// ---------- 演示 5：sessionAffinityFormat + sendSessionAffinityHeaders ----------
//   这两个字段只影响**请求头**（不在 body 里）。
//   共同前提：stream(options) 必须传 sessionId，否则 header 一律不发。
//   openai-responses   ：sessionId 存在 → 按 sessionAffinityFormat 发头
//                        "openai"           → session_id + x-client-request-id + x-session-affinity
//                        "openai-nosession" → x-client-request-id + x-session-affinity
//                        "openrouter"       → x-session-id
//   openai-completions：双重判断 sessionId && compat.sendSessionAffinityHeaders，
//                        sendSessionAffinityHeaders 默认 false（需要显式开启才能发）

async function demoSessionAffinity() {
    console.log("\n=== [5] sessionAffinityFormat + sendSessionAffinityHeaders ===");
    console.log("影响: 请求头里的 session_id / x-client-request-id / x-session-affinity");
    console.log("前提: 必须传 options.sessionId，否则不开关");

    const SID = "sess-abc-123";

    // openai-responses —— 三种 format 对比
    console.log("\n--- openai-responses ---");
    const responsesCases: Array<{ label: string; baseUrl: string; compat: Model<"openai-responses">["compat"] }> = [
        { label: "openai (默认 auto-detect → openai)", baseUrl: UNREACHABLE, compat: {} },
        { label: "openai-nosession", baseUrl: UNREACHABLE, compat: { sessionAffinityFormat: "openai-nosession" } },
        { label: "openrouter", baseUrl: "https://openrouter.ai/api/v1", compat: { sessionAffinityFormat: "openrouter" } },
    ];
    for (const c of responsesCases) {
        const model = { ...makeResponsesModel(c.compat), baseUrl: c.baseUrl };
        await call(`responses / sessionAffinity=${c.label}`, () =>
            responsesStream(model, ctx, {
                apiKey: "sk-test",
                sessionId: SID,
                fetch: makeSpyFetch(`responses sessionAffinity=${c.label}`),
            }).result(),
        );
    }

    // openai-completions —— sendSessionAffinityHeaders 开关
    console.log("\n--- openai-completions（注意：默认 sendSessionAffinityHeaders=false） ---");
    const completionsCases: Array<{ label: string; compat: Model<"openai-completions">["compat"] }> = [
        { label: "默认（不开启）", compat: {} },
        { label: "sendSessionAffinityHeaders=true", compat: { sendSessionAffinityHeaders: true } },
        { label: "sendSessionAffinityHeaders=true + openrouter", compat: { sendSessionAffinityHeaders: true, sessionAffinityFormat: "openrouter" } },
    ];
    for (const c of completionsCases) {
        const model = makeCompletionsModel(c.compat);
        await call(`completions / ${c.label}`, () =>
            completionsStream(model, ctx, {
                apiKey: "sk-test",
                sessionId: SID,
                fetch: makeSpyFetch(`completions ${c.label}`),
            }).result(),
        );
    }
}

// ---------- 入口 ----------

(async () => {
    console.log("pi-ai compat 字段演示 —— 任意 Ctrl+C 中断\n");
    await demoDeveloperRole();
    await demoThinkingFormat();
    await demoMaxTokensField();
    await demoSupportsStore();
    await demoSessionAffinity();
    console.log("\n✓ 演示完成。所有请求都打到了 127.0.0.1:1（不可达），mock fetch 抛错属预期。");
})();