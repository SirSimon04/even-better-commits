import fs from "fs";
import path from "path";
import { log } from "@clack/prompts";
import { GitHelper } from "./GitHelper";
import { Config } from "./config/Config";

export class PromptBuilder {
  // Paths configuration for all prompt files
  readonly PROMPT_PATHS = {
    system_message_commit: path.join(__dirname, "prompts", "system_message.md"),
    system_message_branch: path.join(__dirname, "prompts", "branch_system_message.md"),
    system_message_pr: path.join(__dirname, "prompts", "pr.md"),
    template_diff: path.join(__dirname, "prompts", "git_diff_template.md"),
    template_project_specific: path.join(__dirname, "prompts", "project_specific_template.md"),
    template_commit_history: path.join(__dirname, "prompts", "commit_history_template.md"),
    template_github_issue: path.join(__dirname, "prompts", "github_issue_template.md"),
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

  public getSystemMessageForCommit(): string {
    return this.readPromptFile(this.PROMPT_PATHS.system_message_commit);
  }

  public getSystemMessageForPR(): string {
    return this.readPromptFile(this.PROMPT_PATHS.system_message_pr);
  }

  public getSystemMessageForBranch(): string {
    return this.readPromptFile(this.PROMPT_PATHS.system_message_branch);
  }

  private getCommitHistoryTemplate(): string {
    return this.readPromptFile(this.PROMPT_PATHS.template_commit_history);
  }

  public getDiffTemplate(): string {
    return this.readPromptFile(this.PROMPT_PATHS.template_diff);
  }

  public getProjectSpecificInfo(ebcInfo: string): string {
    const template: string = this.readPromptFile(this.PROMPT_PATHS.template_project_specific);
    return template.replace("{{project_specific_info}}", ebcInfo);    
  }

  public getEbcInfoFile(): string | undefined {
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
      content: this.getSystemMessageForCommit(),
    });

    const llmInfo = this.getEbcInfoFile();
    if (llmInfo) {
      log.info("Using from local .ebcinfo file");
      template.push({
        role: "system",
        content: this.readPromptFile(
          this.PROMPT_PATHS.template_project_specific,
        ).replace("{{project_specific_info}}", llmInfo),
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
          content: commitHistoryTemplate.replace(
            "{{commit_history}}",
            commitMessages.join("\n"),
          ),
        });
      }
    }

    // Add git diff to the template
    const gitDiffTemplate = this.readPromptFile(
      this.PROMPT_PATHS.template_diff,
    );

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
      content: this.getSystemMessageForBranch(),
    });

    const llmInfo = this.getEbcInfoFile();
    if (llmInfo) {
      log.info("Using from local .ebcinfo file");
      template.push({
        role: "system",
        content: this.getProjectSpecificInfo(llmInfo),
      });
    }

    template.push({
      role: "user",
      content: "```data \n \n" + JSON.stringify(issueData) + "```",
    });

    return template;
  }

  buildTemplateForPR(changeInfo: string): any[] {
    let template = [];

    template.push({
      role: "system",
      content: this.getSystemMessageForPR(),
    });

    const llmInfo = this.getEbcInfoFile();
    if (llmInfo) {
      log.info("Using from local .ebcinfo file");
      template.push({
        role: "system",
        content: this.readPromptFile(
          this.PROMPT_PATHS.template_project_specific,
        ).replace("{{project_specific_info}}", llmInfo),
      });
    }

    template.push({
      role: "user",
      content: "```data \n " + changeInfo + " \n" + +"```",
    });

    return template;
  }

  static removeBackticks(text: string): string {
    return text.replace(/^```\s*([\s\S]*?)\s*```$/m, "$1").trim();
  }

  static removeBackticksAndWord(text: string): string {
    return text.replace(/^```(?:\w+)?\s*([\s\S]*?)\s*```$/m, "$1").trim();
  }
}
