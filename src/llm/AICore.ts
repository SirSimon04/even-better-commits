import { OrchestrationClient } from "@sap-ai-sdk/orchestration";
import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";
import { isCancel, select } from "@clack/prompts";
import { PromptBuilder } from "../PromptBuilder";

export class AICore implements LLM {
  model!: string;

  constructor(config: ConfigFile) {
    this.setDetails(config);
  }

  async call(diff: string): Promise<string> {
    const orchestrationClient = new OrchestrationClient({
      llm: {
        model_name: this.model,
      },
      templating: {
        template: [
          {
            role: "system",
            content: new PromptBuilder().getCommitMessageSystemPrompt(),
          },
          {
            role: "user",
            content: "```diff \n \n" + diff + "```",
          },
        ],
      },
    });

    const result = await orchestrationClient.chatCompletion();

    return result.getContent() ?? "ERROR";
  }

  async setup(): Promise<ConfigFile> {
    try {
      const selectModel = await select({
        message: "Select the model you want to use",
        options: [
          { value: "gpt-35-turbo", label: "GPT 3.5 Turbo" },
          { value: "gpt-35-turbo-16k", label: "GPT 3.5 Turbo 16K" },
          { value: "gpt-4o-mini", label: "GPT 4o Mini" },
          { value: "gpt-4o", label: "GPT 4o" },
          { value: "gpt-4", label: "GPT 4" },
          { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" },
          { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
          { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
          { value: "anthropic--claude-3-haiku", label: "Claude 3 Haiku" },
          { value: "anthropic--claude-3-opus", label: "Claude 3 Opus" },
          { value: "anthropic--claude-3-sonnet", label: "Claude 3 Sonnet" },
          { value: "anthropic--claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
          { value: "meta--llama3-70b-instruct", label: "LLaMA 3 70B Instruct" },
          {
            value: "meta--llama3.1-70b-instruct",
            label: "LLaMA 3.1 70B Instruct",
          },
        ],
      });

      if (isCancel(selectModel) || selectModel === null) {
        throw new Error("No Model selected!");
      } else {
        return {
          provider: "aicore",
          providerDetails: {
            model: selectModel,
          },
        };
      }
    } catch (error) {
      throw new Error("AI Core setup failed");
    }
  }

  setDetails(config: ConfigFile): void {
    this.model = config.providerDetails.model;
  }

  toString(): string {
    return "Ollama with " + this.model + " model";
  }
}
