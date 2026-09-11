import { query } from "@anthropic-ai/claude-agent-sdk";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

const q = query({
    prompt: "列出account-service的所有接口，成列表",
    options: {
        cwd: "/Users/gatesma/project/IdeaProjects/finance",
        // env 是整体替换，不是合并 —— 必须展开 process.env
        env: {
            ...process.env,
            // DeepSeek 官方 Anthropic 兼容端点（注意：不带 /v1）
            ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
            ANTHROPIC_AUTH_TOKEN: process.env.DEEPSEEK_API_KEY!,
            // 模型映射：CC 引擎内部按 opus/sonnet/haiku 分级调度
            ANTHROPIC_MODEL: "deepseek-v4-pro[1m]",
            ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek-v4-pro[1m]",
            ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek-v4-pro[1m]",
            ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek-flash",
            CLAUDE_CODE_SUBAGENT_MODEL: "deepseek-flash",
            CLAUDE_CODE_EFFORT_LEVEL: "max",
            // 长输出防断线 + 关闭非必要遥测
            API_TIMEOUT_MS: "600000",
            CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
        },
        // DeepSeek 没有针对 CC 提示词做过调优，建议带上完整 preset
        systemPrompt: { type: "preset", preset: "claude_code" },
        permissionMode: "acceptEdits",
        maxTurns: 30,
    },
});

// ---------- 终端着色 ----------
const c = {
    bold: (s: string) => `\x1b[1;37m${s}\x1b[0m`,
    dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
    green: (s: string) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
    magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
};

/** 截断多行文本：超出 maxLines 时只显示前 maxLines 行并标注总行数 */
function truncate(text: string, maxLines = 8, maxCols = 160): string {
    const lines = text
        .replace(/\t/g, "  ")
        .split("\n")
        .map((l) => l.slice(0, maxCols).trimEnd());
    if (lines.length <= maxLines) return lines.join("\n");
    return `${lines.slice(0, maxLines).join("\n")}\n${c.dim(`  …（共 ${lines.length} 行，已截断）`)}`;
}

/** 把工具调用的入参压缩成一行摘要：优先展示关键路径/命令类字段 */
function summarizeToolInput(input: unknown): string {
    if (!input || typeof input !== "object") return "";
    const entries = Object.entries(input as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${c.dim(k + ":")} ${String(v).replace(/\s+/g, " ").slice(0, 120)}`);
    if (entries.length === 0) return "";
    if (entries.length <= 3) return `  ${entries.join("  ")}`;
    return `  ${entries.slice(0, 3).join("  ")} ${c.dim(`+${entries.length - 3} 项`)}`;
}

/** 从 tool_result 的 content（string 或 content block 数组）中提取纯文本 */
function toolResultText(content: unknown): string {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map((b) => {
                if (typeof b === "string") return b;
                if (b && typeof b === "object" && "text" in b) return String((b as { text: unknown }).text);
                return "";
            })
            .filter(Boolean)
            .join("\n");
    }
    return content === undefined ? "" : JSON.stringify(content);
}

// ---------- 消息分发 ----------
for await (const message of q satisfies AsyncIterable<SDKMessage>) {
    switch (message.type) {
        // 会话初始化：打印运行环境
        case "system":
            if (message.subtype === "init") {
                const mcp = message.mcp_servers.length
                    ? ` | MCP: ${message.mcp_servers.map((s) => s.name).join(", ")}`
                    : "";
                console.log(
                    c.bold(`── 会话启动 ── `) +
                        `模型: ${c.cyan(message.model)} | 权限: ${message.permissionMode} | 工具: ${message.tools.length} 个${mcp}`,
                );
                console.log(c.dim(`   CC v${message.claude_code_version} | cwd: ${message.cwd}`));
            }
            break;

        // 模型输出：按 content block 分发（思考 / 正文 / 工具调用）
        case "assistant":
            // parent_tool_use_id 非空 => 这条来自子代理（Agent/Task 工具内部）
            const indent = message.parent_tool_use_id ? c.magenta("└ [子代理] ") : "";
            for (const block of message.message.content) {
                if (block.type === "thinking") {
                    console.log(c.dim(`${indent}${truncate(block.thinking, 12)}`));
                } else if (block.type === "text") {
                    if (block.text) console.log(`${indent}${c.bold(block.text)}`);
                } else if (block.type === "tool_use") {
                    console.log(
                        `${c.cyan("▶ " + block.name)}${summarizeToolInput(block.input)}`,
                    );
                }
                // 其余 block 类型（server_tool_use / web_search 等）暂不展示
            }
            break;

        // 工具执行结果回传（user 角色承载 tool_result）
        case "user": {
            const content = message.message.content;
            if (typeof content === "string") break; // 人类输入，本 demo 不会出现
            for (const block of content) {
                if (block.type !== "tool_result") continue;
                const text = toolResultText(block.content);
                if (!text) continue;
                if (block.is_error) {
                    console.log(c.red(`✗ 工具失败\n${truncate(text, 8)}`));
                } else {
                    console.log(c.dim(`✓ 结果\n${truncate(text, 5)}`));
                }
            }
            break;
        }

        // 最终结果：统计信息
        case "result":
            const head =
                message.subtype === "success"
                    ? c.green("✓ 完成")
                    : c.red(`✗ 失败 (${message.subtype})`);

            const usage = Object.entries(message.modelUsage)
                .map(
                    ([model, u]) =>
                        c.dim("   ") +
                        `${model}: 输入 ${u.inputTokens.toLocaleString()}` +
                        c.dim(` (缓存读 ${u.cacheReadInputTokens.toLocaleString()} / 写 ${u.cacheCreationInputTokens.toLocaleString()})`) +
                        ` | 输出 ${u.outputTokens.toLocaleString()}` +
                        (u.thinkingTokens ? c.dim(` (思考 ${u.thinkingTokens.toLocaleString()})`) : "") +
                        c.dim(` | $${u.costUSD.toFixed(4)}`),
                )
                .join("\n");

            console.log(
                `\n${c.bold("══════════════════════════")}\n` +
                    `${head} | 回合: ${message.num_turns}` +
                    ` | 耗时: ${(message.duration_ms / 1000).toFixed(1)}s` +
                    c.dim(` (API ${(message.duration_api_ms / 1000).toFixed(1)}s)`) +
                    ` | 成本: $${message.total_cost_usd.toFixed(4)}` +
                    (usage ? `\n${usage}` : "") +
                    (message.permission_denials.length
                        ? `\n${c.yellow(`   ⚠ 权限被拒 ${message.permission_denials.length} 次`)}`
                        : ""),
            );
            if (message.subtype !== "success" && message.errors.length) {
                console.log(c.red(`   ${message.errors.join("; ")}`));
            }
            if (message.subtype === "success" && message.result) {
                console.log(c.dim(`   结果摘要: ${truncate(message.result, 3)}`));
            }
            break;
    }
}
