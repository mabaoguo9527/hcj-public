import type {AssistantMessage} from "@earendil-works/pi-ai";

export function printUsage(response: AssistantMessage): void {
    console.log(
        `Usage: input=${response.usage.input}, output=${response.usage.output}, cost=${response.usage.cost.total}`,
    );
}