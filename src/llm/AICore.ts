import { AzureOpenAiChatClient } from "@sap-ai-sdk/foundation-models";
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
    const response = await new AzureOpenAiChatClient(this.model).run({
      messages: [
        {
          role: "system",
          content: new PromptBuilder().getCommitMessageSystemPrompt(),
        },
        {
          role: "user",
          content: "```diff \n \n" + diff + "```",
        },
      ],
    });

    // Use getContent() to access the content responded by LLM.

    return response.getContent() ?? "ERROR";
  }

  async setup(): Promise<ConfigFile> {
    try {
      const selectModel = await select({
        message: "Select the model you want to use",
        options: [{ value: "gpt-35-turbo", label: "GPT 3.5 Turbo" }],
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
