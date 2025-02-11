import fs from "fs";
import path from "path";
import { log } from "@clack/prompts";

export class PromptBuilder {
  private readonly _SYSTEM_MESSAGE: string = path.join(
    __dirname, // directory of this file
    "prompts",
    "system_message.md",
  );

  getCommitMessageSystemPrompt(): string {
    try {
      const msg = fs.readFileSync(this._SYSTEM_MESSAGE, "utf-8");
      return msg;
    } catch (error) {
      console.error("Error reading system message file:", error);
      return "";
    }
  }

  getFromLLMInfoFile() {
    try {
      const filePath = path.join(process.cwd(), ".llminfo");

      const msg = fs.readFileSync(filePath, "utf-8");

      return msg;
    } catch (error) {
      return undefined;
    }
  }

  buildTemplate(diff: string): any[] {
    let template = [];
    template.push({
      role: "system",
      content: this.getCommitMessageSystemPrompt(),
    });

    const llmInfo = this.getFromLLMInfoFile();
    if (llmInfo) {
      log.info("Using from local .llminfo file");
      template.push({
        role: "system",
        content: `Here is some additional information that describes the project where the change is made: \n \n ${llmInfo}`,
      });
    }

    template.push({
      role: "user",
      content: "```diff \n \n" + diff + "```",
    });

    return template;
  }
}
