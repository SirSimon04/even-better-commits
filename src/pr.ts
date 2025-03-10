import {
  log,
  intro,
  outro,
  text,
  isCancel,
  cancel,
  spinner,
  select,
  group,
} from "@clack/prompts";
import { GitHelper } from "./GitHelper";
import { getLLMElseSetup } from "./utils";
import { GithubHelper } from "./GithubHelper";
import { LLM } from "./llm/LLM";
import { PromptBuilder } from "./PromptBuilder";

export async function createPullRequest() {
  intro("Welcome to even-better-pr!");

  let llm: LLM = await getLLMElseSetup();
  log.info("Using " + llm.toString());

  const git = new GitHelper();
  const github = new GithubHelper();

  if (!git.inGitRepository()) {
    outro("Not in a git repository. Exiting...");

    return;
  }

  const isLogged = github.checkIfLoggedIn();
  if (!isLogged) {
    log.warning(
      "You are not logged in to GitHub. Please login using `gh auth login`.",
    );
    cancel("Operation cancelled.");
    return;
  }

  let prTitle = "";
  let prDescription = "";

  const spin = spinner();
  spin.start("Fetching changes and generating PR title/description");

  try {
    const changes = git.getChangesSinceBranch();
    const details = await llm.generatePRDetails(changes);

    const parsedDetails = parsePRDetails(details);

    prTitle = parsedDetails.title;
    prDescription = parsedDetails.description;

    spin.stop("PR details generated successfully.");
  } catch (error) {
    spin.stop("PR generation failed.");
    log.error("Falling back to manual input.");
    ({ title: prTitle, description: prDescription } = await manualPRInput());
  }

  let prConfirmed = false;
  while (!prConfirmed) {
    const options = [
      { value: "c", label: "Confirm and create PR" },
      { value: "e", label: "Edit title" },
      { value: "r", label: "Generate a new PR title/description" },
    ];

    const selection = await select({
      message: `Title: ${prTitle}\nDescription: ${prDescription}`,
      options,
    });

    if (isCancel(selection)) {
      cancel("Operation cancelled.");
      return;
    }

    if (selection === "c") {
      prConfirmed = true;
    } else if (selection === "e") {
      prTitle = await manualTitleInput(prTitle);
    } else if (selection === "r") {
      const changes = git.getChangesSinceBranch();
      const prDetails = await llm.generatePRDetails(changes);
      const parsedDetails = parsePRDetails(prDetails);

      prTitle = parsedDetails.title;
      prDescription = parsedDetails.description;
    }
  }

  log.success("Creating pull request...");
  try {
    github.createPullRequest(prTitle, prDescription);
    outro("Pull request successfully created!");
  } catch (error) {
    outro("Failed to create pull request.");
  }
}

async function manualPRInput(initialTitle = "", initialDescription = "") {
  const inputGroup = await group(
    {
      title: () =>
        text({ message: "Enter PR title:", initialValue: initialTitle }),
      description: () =>
        text({
          message: "Enter PR description:",
          initialValue: initialDescription,
        }),
    },
    {
      onCancel: () => {
        cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  return { title: inputGroup.title, description: inputGroup.description };
}

async function manualTitleInput(initialTitle = ""): Promise<string> {
  const t = await text({
    message: "Enter PR title:",
    initialValue: initialTitle,
  });

  return t.toString();
}

const parsePRDetails = (prDetails: string) =>
  JSON.parse(PromptBuilder.removeBackticksAndWord(prDetails));
