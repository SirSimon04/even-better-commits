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
}
