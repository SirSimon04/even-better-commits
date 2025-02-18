import * as p from "@clack/prompts";
import {
  log,
  intro,
  outro,
  select,
  spinner,
  isCancel,
  cancel,
  text,
  multiselect,
} from "@clack/prompts";
import color from "picocolors";
import { GitHelper } from "./GitHelper";
import { LLM } from "./llm/LLM";
import { getLLMElseSetup, selectType } from "./utils";

export async function main() {
  intro("Welcome to even-better-commits!");

  var git = new GitHelper();
  if (!git.inGitRepository()) {
    outro("Not in a git repository. Exiting...");
    return;
  }

  let llm: LLM = await getLLMElseSetup();

  log.info("Using " + llm.toString());

  // ----------------------------------------------------
  // git
  var stagedFiles = git.getStagedFiles();
  if (stagedFiles.length > 0) {
    log.success(
      "Changes to be committed:\n" +
        stagedFiles.map((file) => color.green(file)).join("\n"),
    );
  }

  var unstagedFiles = git.getUnstagedFiles();

  if (unstagedFiles.length > 0) {
    const filesToStage: any = await multiselect({
      message: "Select files to stage",
      options: [
        { value: ".", label: "." },
        ...unstagedFiles.map((file) => ({ value: file, label: file })),
      ],
      required: false,
    });

    if (filesToStage.length > 0) git.stageFiles(filesToStage);
  }

  stagedFiles = git.getStagedFiles();
  if (stagedFiles.length === 0) {
    outro("No Changes to commit.");
    return;
  }

  var output =
    "Changes in the following files will be committed:\n \n" +
    stagedFiles.join("\n");

  p.log.info(output);

  var diff = git.getGitDiff();

  // ----------------------------------------------------
  // generate message

  var commitMessage = await getCommitMessage(diff, llm);
  var committed = false;

  while (!committed) {
    const continueProcedere: any = await select({
      message: commitMessage,
      options: [
        {
          value: "c",
          label: "Confirm the commit",
        },
        { value: "r", label: "Generate a new message" },
        { value: "t", label: "Edit the generated message" },
      ],
    });

    if (isCancel(continueProcedere)) {
      cancel("Operation cancelled.");
      return;
    }

    if (continueProcedere === "c") {
      committed = true;
    } else if (continueProcedere === "r") {
      commitMessage = await getCommitMessage(diff, llm);
    } else if (continueProcedere === "t") {
      try {
        var commitParts = GitHelper.parseCommitMessage(commitMessage);

        const group = await p.group(
          {
            type: () => selectType(commitParts.type),
            scope: () =>
              select({
                message: "Scope",
                initialValue: commitParts.scope || "",
                options: [
                  { value: "app", label: "app", hint: "UI-related content" },
                  {
                    value: "srv",
                    label: "srv",
                    hint: "Service-related content",
                  },
                  {
                    value: "db",
                    label: "db",
                    hint: "Domain models and database-related content",
                  },
                  {
                    value: "tools",
                    label: "tools",
                    hint: "Development tools and scripts",
                  },
                  { value: "", label: "none" },
                ],
              }),
            message: () =>
              text({ message: "Message", initialValue: commitParts.message }),
          },
          {
            onCancel: ({ results }) => {
              p.cancel("Operation cancelled.");
              return;
            },
          },
        );

        let scope = group.scope ? `(${group.scope})` : "";
        commitMessage = group.type + scope + ": " + group.message;
      } catch (error) {
        const newMessage = await text({
          message:
            "Generated Message was not in Conventional Commits format. Change the message here.",
          initialValue: commitMessage,
        });

        commitMessage = newMessage.toString();
      }
    }
  }

  outro("Committing changes...");
  git.commit(commitMessage);
}

async function getCommitMessage(diff: string, llm: LLM): Promise<string> {
  const s = spinner();
  s.start("Generating commit message");
  const commitMessage = await llm.call(diff);
  s.stop("Generated commit message.");

  return commitMessage.replace(/^```\s*([\s\S]*?)\s*```$/m, "$1").trim();
}
