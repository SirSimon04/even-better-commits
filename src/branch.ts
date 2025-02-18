import {
  log,
  intro,
  outro,
  text,
  select,
  isCancel,
  cancel,
  spinner,
} from "@clack/prompts";
import color from "picocolors";
import { GitHelper } from "./GitHelper";
import { getLLMElseSetup, selectType } from "./utils";
import { GithubHelper } from "./GithubHelper";
import { LLM } from "./llm/LLM";

export async function createBranch() {
  intro("Welcome to even-better-branch!");

  let llm: LLM = await getLLMElseSetup();

  log.info("Using " + llm.toString());

  const git = new GitHelper();
  const github = new GithubHelper();

  if (!git.inGitRepository()) {
    outro("Not in a git repository. Exiting...");
    return;
  }

  const branchType = await selectType("feat");
  if (isCancel(branchType)) {
    cancel("Operation cancelled.");
    return;
  }

  let issueNumber = await text({
    message: "Enter issue number (optional):",
    placeholder: "Leave empty if not applicable",
    validate: (value) =>
      value && isNaN(parseInt(value)) ? "Must be a number" : undefined,
  });

  if (isCancel(issueNumber)) {
    cancel("Operation cancelled.");
    return;
  }

  let shortDescription = "";
  const s = spinner();

  if (issueNumber) {
    try {
      s.start("Fetching issue description...");
      const isLogged = github.checkIfLoggedIn();
      console.log(isLogged);

      if (!isLogged) {
        log.error(
          "Not logged in to GitHub. Please login to GitHub using `gh auth login`.",
        );
        throw new Error("Not logged in to GitHub.");
      }

      const issueData = await github.fetchIssueData(parseInt(issueNumber));
      s.stop("Issue description fetched successfully.");

      s.start("Generating branch name...");
      shortDescription = await llm.generateBranchName(issueData);
      s.stop("Branch name generated successfully.");
    } catch (error) {
      s.stop(
        "Failed to generate issue description. Please provide it manually.",
      );
      shortDescription = (
        await text({ message: "Enter short description:" })
      ).toString();
    }
  } else {
    shortDescription = (
      await text({ message: "Enter short description:" })
    ).toString();
  }

  if (isCancel(shortDescription)) {
    cancel("Operation cancelled.");
    return;
  }

  shortDescription = shortDescription
    .replace(/\s+/g, "-")
    .replace(/-+$/, "")
    .toLowerCase();
  const branchName = issueNumber
    ? `${branchType}/${issueNumber}-${shortDescription}`
    : `${branchType}/${shortDescription}`;

  log.success("Creating branch: " + color.green(branchName));

  try {
    git.createBranch(branchName);
    outro(
      "Branch successfully created and switched to " + color.green(branchName),
    );
  } catch (error) {
    outro("Terminating even-better-branch");
  }
}
