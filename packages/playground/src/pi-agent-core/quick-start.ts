import "dotenv/config";
import { Agent } from "@earendil-works/pi-agent-core";
import { createModels } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";

if (!process.env.DEEPSEEK_API_KEY) {
    console.error("Missing DEEPSEEK_API_KEY (set it in .env or the environment)");
    process.exit(1);
}

const models = createModels();
models.setProvider(deepseekProvider());
const model = models.getModel("deepseek", "deepseek-v4-flash");
if (!model) throw new Error("Model not found");

const agent = new Agent({
    initialState: {
        systemPrompt: "You are a helpful assistant.",
        model,
    },
    streamFn: models.streamSimple.bind(models),
});

agent.subscribe((event) => {
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
        // 只输出新增的文本分块
        process.stdout.write(event.assistantMessageEvent.delta);
    }
    if (event.type === "message_end" && event.message.role === "assistant" && event.message.stopReason === "error") {
        console.error(`\n[error] ${event.message.errorMessage ?? "unknown error"}`);
    }
});

await agent.prompt("Hello!");
process.stdout.write("\n");