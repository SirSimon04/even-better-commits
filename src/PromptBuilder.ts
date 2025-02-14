import fs from "fs";
import path from "path";
import { log } from "@clack/prompts";
import { GitHelper } from "./GitHelper";
import { Config } from "./config/Config";

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

  getEbcInfoFile() {
    try {
      const filePath = path.join(process.cwd(), ".ebcinfo");

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

    const llmInfo = this.getEbcInfoFile();
    if (llmInfo) {
      log.info("Using from local .ebcinfo file");
      template.push({
        role: "system",
        content: `Here is some additional information that describes the project where the change is made: \n \n ${llmInfo}`,
      });
    }

    var config = Config.getInstance().getConfigFile();
    if (
      config &&
      config.loadLastCommitMessages &&
      config.loadLastCommitMessages > 0
    ) {
      const commitMessages = GitHelper.getLastCommitMessages(
        config.loadLastCommitMessages,
      );
      if (commitMessages.length > 0) {
        console.log(commitMessages);
        template.push({
          role: "system",
          content: `Here are the last commit messages in this repository. Use them to get to know how the message is usually written, to get the tone and the language specific format. Use them to create a commit that sounds similar:\n\n${commitMessages.join("\n")}`,
        });
      }
    }

    template.push({
      role: "user",
      content: "```diff \n \n" + diff + "```",
    });

    return template;
  }
}
