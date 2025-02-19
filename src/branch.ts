import {
  log,
  intro,
  outro,
  text,
  isCancel,
  cancel,
  spinner,
} from "@clack/prompts";
import color from "picocolors";
import { GitHelper } from "./GitHelper";
import { getLLMElseSetup, selectType } from "./utils";
import { GithubHelper } from "./GithubHelper";
import { LLM } from "./llm/LLM";
import { PromptBuilder } from "./PromptBuilder";

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

  let branchName = "";

  const isLogged = github.checkIfLoggedIn();

  if (!isLogged) {
    log.warning(
      "You are not logged in to GitHub. The generation of a branch name will not work automatically from issue content. If you want to use this feature, please login to GitHub using `gh auth login`.",
    );

    branchName = await createBranchNameManually();
  } else {
    let issueNumber = await text({
      message: "Enter issue number (optional):",
      placeholder: "Leave empty if not applicable",
      validate: (value) =>
        value && isNaN(parseInt(value)) ? "Must be a number" : undefined,
    });

    if (isCancel(issueNumber)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    try {
      branchName = await createBranchNameAutomatically(
        parseInt(issueNumber),
        github,
        llm,
      );
    } catch (error) {
      branchName = await createBranchNameManually();
    }
  }

  // TODO: Logic for confirming the name or edit it

  log.success("Creating branch: " + color.green(branchName));

  try {
    //git.createBranch(branchName);
    outro(
      "Branch successfully created and switched to " + color.green(branchName),
    );
  } catch (error) {
    outro("Terminating even-better-branch");
  }
}

async function createBranchNameManually(): Promise<string> {
  const branchType = await selectType("feat");
  if (isCancel(branchType)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  let shortDescription = await text({ message: "Enter short description:" });

  if (isCancel(shortDescription)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  shortDescription = shortDescription
    .replace(/\s+/g, "-")
    .replace(/-+$/, "")
    .toLowerCase();

  return `${branchType}/${shortDescription}`;
}

async function createBranchNameAutomatically(
  issueNumber: number,
  github: GithubHelper,
  llm: LLM,
): Promise<string> {
  let shortDescription = "";
  const spin = spinner();
  spin.start("Fetching issue description and Generating Branch name");
  const issueData = await github.fetchIssueData(issueNumber);

  shortDescription = await llm.generateBranchName(issueData);
  spin.stop("Branch name generated successfully.");

  return PromptBuilder.removeBackticks(shortDescription);
}
