import { PromptBuilder } from "../PromptBuilder";
import { isCancel, log, select } from "@clack/prompts";
import { exec } from "child_process";
import { log as cLog } from "console";
import { existsSync, readdirSync } from "fs";
import { LLM } from "./LLM";
import ollama from "ollama";
import { join } from "path";
import { ConfigFile } from "../config/Config";

export class Ollama implements LLM {
  model!: string;

  private ollamaPath: string = join(process.env.HOME || process.env.USERPROFILE || "", ".ollama", );

  constructor(config: ConfigFile) {
    this.setDetails(config);
  }

  async call(diff: string): Promise<string> {
    const response = await ollama.chat({
      model: this.model,
      messages: [
        {
          role: "system",
          content: new PromptBuilder().getCommitMessageSystemPrompt(),
        },
        {
          role: "user",
          content:
            "Current Git Diff: \n \n" +
            diff,
        },
      ],
    });
    return response.message.content;
  }

  async setup(): Promise<ConfigFile> {
    if (!this.isOllamaInstalled())
      throw new Error("Ollama must be installed on the system.");

    const models = await this.getInstalledOllamaModels();
    let selectedModel: string;
    if (models.length === 0) {
      throw new Error("No ollama models installed.");
    }
    if (models.length === 1) {
      log.info(`Using the only installed ollama model: ${models[0]}`);
      selectedModel = models[0];
    } else {
      const selectModel = await select({
        message: "Select the model you want to use",
        options: models.map((model) => ({ value: model, label: model })),
      });

      if (isCancel(selectModel) || selectModel === null) {
        throw new Error("No Model selected!");
      } else {
        this.model = selectModel.toString();
        return {
          provider: "ollama",
          providerDetails: {
            model: selectModel,
          },
        };
      }
    }
    throw new Error("Ollama setup failed");
  }

  setDetails(config: ConfigFile): void {
    this.model = config.providerDetails.model;
  }

  private isOllamaInstalled(): boolean {
    return existsSync(this.ollamaPath);
  }

  private async getInstalledOllamaModels(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec("ollama ls", (error, stdout, stderr) => {
        if (error) {
          cLog(error);
          reject(error);
          return;
        }
        const lines = stdout.trim().split("\n");
        const models: string[] = [];

        // Start from index 1 to skip the header line
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(/\s+/); // Split by any number of spaces
          if (parts.length > 0) {
            models.push(parts[0]); // Add the first part (model name) to the array
          }
        }
        resolve(models);
      });
    });
  }

  toString(): string {
    return "Ollama with " + this.model + " model";
  }
}
