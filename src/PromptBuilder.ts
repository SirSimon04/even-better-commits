import fs from "fs";
import path from "path";
import { log } from "@clack/prompts";
import { GitHelper } from "./GitHelper";
import { Config } from "./config/Config";

export class PromptBuilder {
  // Paths configuration for all prompt files
  readonly PROMPT_PATHS = {
    commit_system_message: path.join(__dirname, "prompts", "system_message.md"),
    branch_system_message: path.join(__dirname, "prompts", "branch_system_message.md"),
    project_specific_template: path.join(__dirname, "prompts", "project_specific_template.md"),
    commit_history_template: path.join(__dirname, "prompts", "commit_history_template.md"),
    git_diff_template: path.join(__dirname, "prompts", "git_diff_template.md"),
    github_issue_template: path.join(__dirname, "prompts", "github_issue_template.md"),
  };

  // Reads content from a prompt file
  private readPromptFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading prompt file ${filePath}:`, error);
      return "";
    }
  }

  private getCommitSystemMessage(): string {
    return this.readPromptFile(this.PROMPT_PATHS.commit_system_message);
  }

  private getBranchSystemMessage(): string {
    return this.readPromptFile(this.PROMPT_PATHS.branch_system_message);
  }

  private getCommitHistoryTemplate(): string {
    return this.readPromptFile(this.PROMPT_PATHS.commit_history_template);
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
      content: this.getCommitSystemMessage(),
    });

    const llmInfo = this.getEbcInfoFile();
    if (llmInfo) {
      log.info("Using from local .ebcinfo file");
      template.push({
        role: "system",
        content: 
        this.readPromptFile(this.PROMPT_PATHS.project_specific_template)
            .replace("{{project_specific_info}}", llmInfo),
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
        const commitHistoryTemplate = this.getCommitHistoryTemplate();        
        template.push({
          role: "system",
          content: commitHistoryTemplate.replace("{{commit_history}}", commitMessages.join("\n")),
        });
      }
    }

    // Add git diff to the template
    const gitDiffTemplate = this.readPromptFile(this.PROMPT_PATHS.git_diff_template);

    template.push({
      role: "user",
      content: gitDiffTemplate.replace("{{git_diff}}", diff),
    });

    return template;
  }

  buildTemplateForBranch(issueData: any): any[] {
    let template = [];

    template.push({
      role: "system",
      content: this.getBranchSystemMessage(),
    });

    const llmInfo = this.getEbcInfoFile();
    if (llmInfo) {
      log.info("Using from local .ebcinfo file");
      template.push({
        role: "system",
        content: 
        this.readPromptFile(this.PROMPT_PATHS.project_specific_template)
            .replace("{{project_specific_info}}", llmInfo),
      });
    }

    template.push({
      role: "user",
      content: "```data \n \n" + JSON.stringify(issueData) + "```",
    });

    return template;
  }
}
