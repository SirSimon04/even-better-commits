import { execSync } from "child_process";

export class GitHelper {
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
    try {
      if (files.length === 0) {
        console.log("No files to stage.");
        return;
      }

      // Run `git add` on all provided files
      execSync(`git add ${files.join(" ")}`, { stdio: "inherit" });

      console.log("Files staged successfully.");
    } catch (error) {
      console.error("Failed to stage files:", error);
    }
  }
}
