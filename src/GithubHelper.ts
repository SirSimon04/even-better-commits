import { execSync } from "child_process";

export class GithubHelper {
  async fetchIssueData(issueNumber: number): Promise<any> {
    try {
      const output = execSync(
        `gh issue view ${issueNumber} --json title,body,labels,state`,
        {
          encoding: "utf-8",
        },
      );
      return JSON.parse(output);
    } catch (error) {
      throw new Error("Failed to fetch issue data.");
    }
  }

  checkIfLoggedIn(): boolean {
    try {
      // Get the current repository's origin URL
      const originUrl = execSync("git remote get-url origin", {
        encoding: "utf-8",
      }).trim();

      // Extract the hostname (e.g., github.com, github.enterprise.com, etc.)
      const match = originUrl.match(/(?:https:\/\/|git@)([^:/]+)/);
      if (!match) {
        return false;
      }
      const githubHost = match[1];

      // Run `gh auth status` and get the output
      const output = execSync("gh auth status", { encoding: "utf-8" });

      // Check if the expected host appears in the output
      const lines = output.split("\n").map((line) => line.trim());
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === githubHost) {
          // Look at the next line to see if the user is logged in
          if (i + 1 < lines.length && lines[i + 1].includes("✓ Logged in to")) {
            return true;
          }
        }
      }
    } catch (error: any) {
      console.error(
        "Error checking GitHub authentication status:",
        error.message,
      );
    }

    return false;
  }
}
