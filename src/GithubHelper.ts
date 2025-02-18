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
      console.log(JSON.parse(output));
      return JSON.parse(output);
    } catch (error) {
      throw new Error("Failed to fetch issue data.");
    }
  }

  checkIfLoggedIn(): boolean {
    try {
      const originUrl = execSync("git remote get-url origin", {
        encoding: "utf-8",
      }).trim();

      const match = originUrl.match(/(?:https:\/\/|git@)([^:/]+)/);
      if (!match) {
        console.error("Could not determine repository origin.");
        return false;
      }
      const githubHost = match[1];

      const output = execSync("gh auth status", { encoding: "utf-8" });

      const loginRegex = new RegExp(`Logged in to ${githubHost} as`);
      if (loginRegex.test(output)) {
        return true;
      }
    } catch (error) {
      console.error("Error checking GitHub authentication status:");
    }

    return false;
  }
}
