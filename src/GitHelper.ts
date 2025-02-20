import { log } from "@clack/prompts";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

export type CommitParts = {
  type: string;
  scope?: string;
  message: string;
};

export class GitHelper {
  private static readonly commitRegex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
  private static readonly branchRegex = /^(\w+)\/(.+)$/;
  getStagedFiles(): string[] {
    try {
      // Execute `git status --porcelain`
      const output = execSync("git status --porcelain", { encoding: "utf-8" });

      // Split output into lines and filter for staged files (lines starting with 'A', 'M', etc.)
      const stagedFiles = output
        .split("\n")
        .filter(
          (line) =>
            line.startsWith("A ") ||
            line.startsWith("M ") ||
            line.startsWith("R "),
        )
        .map((line) => line.substring(3).trim());

      return stagedFiles;
    } catch (error) {
      console.error("Failed to retrieve staged files:", error);
      return [];
    }
  }

  getGitDiff(): string {
    try {
      const diffOutput = execSync("git diff --cached", { encoding: "utf-8" });
      return diffOutput;
    } catch (error) {
      console.error("Failed to retrieve git diff:", error);
      return "";
    }
  }

  commit(message: string): void {
    try {
      if (!message) {
        throw new Error("Commit message cannot be empty.");
      }

      execSync(`git commit -m "${message}"`, { stdio: "inherit" });
      console.log("Commit successful.");
    } catch (error) {
      console.error("Failed to commit changes:", error);
    }
  }

  inGitRepository(): boolean {
    try {
      execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  getUnstagedFiles(): string[] {
    try {
      // Run `git status --porcelain` to get unstaged changes
      const output = execSync("git status --porcelain", { encoding: "utf-8" });

      // Filter lines that represent modified but unstaged files (' M', '??', ' D')
      const unstagedFiles = output
        .split("\n")
        .filter(
          (line) =>
            line.startsWith(" M") || // Modified but unstaged
            line.startsWith("MM") || // Staged and modified
            line.startsWith("??") || // Untracked files
            line.startsWith(" D"), // Deleted but unstaged
        )
        .map((line) => line.substring(3).trim()); // Extract file names

      return unstagedFiles;
    } catch (error) {
      console.error("Failed to retrieve unstaged files:", error);
      return [];
    }
  }

  stageFiles(files: string[]): void {
    if (files.length === 0) {
      console.log("No files to stage.");
      return;
    }

    // Ensure executing git add in the root of the repository
    const gitRoot = this.findGitRoot();
    const originalDir = process.cwd();

    try {
      process.chdir(gitRoot);
      // Run `git add` on all provided files
      execSync(`git add ${files.map(file => `"${file}"`).join(" ")}`, { stdio: "inherit" });
    } catch (error) {
      console.error("Failed to stage files:", error);
    } finally {
      // Restore the original working directory
      process.chdir(originalDir);
    }
  }

  static parseCommitMessage(commit: string): CommitParts {
    const trimmedCommit = commit.trim();
    const result = trimmedCommit.match(this.commitRegex);

    if (!result) {
      //throw new Error("Invalid commit message format");
      // Instead of throwing an error, return an object with empty strings
      return { type: "", scope: "", message: "" };
    }

    const [, type, scope, message] = result;
    return { type, ...(scope ? { scope } : {}), message };
  }

  static parseBranchName(branch: string): { type: string; message: string } {
    const trimmedBranch = branch.trim();
    const result = trimmedBranch.match(this.branchRegex);

    if (!result) {
      // Instead of throwing an error, return an object with empty strings
      return { type: "", message: "" };
    }

    const [, type, message] = result;
    return { type, message };
  }

  static getLastCommitMessages(count: number = 20): string[] {
    try {
      // Get the last `count` commit messages using `git log`
      const output = execSync(`git log -n ${count} --pretty=format:%s`, {
        encoding: "utf-8",
      });

      // Split, filter, and return only valid commit messages
      return output
        .split("\n")
        .map((msg) => msg.trim())
        .filter((msg) => this.commitRegex.test(msg));
    } catch (error) {
      console.error("Failed to retrieve commit messages:", error);
      return [];
    }
  }

  createBranch(branchName: string) {
    try {
      execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });
    } catch (error) {
      log.error("Failed to create branch.");
      throw new Error("Failed to create branch.");
    }
  }

  private findGitRoot(startPath: string = process.cwd()): string {
    let currentPath = resolve(startPath);
    
    while (currentPath !== '/' && currentPath !== '') {
      if (existsSync(`${currentPath}/.git`)) {
        return currentPath;
      }
      currentPath = resolve(currentPath, '..');
    }
    
    throw new Error('Not a git repository (or any of the parent directories)');

  }
}
