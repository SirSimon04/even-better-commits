import * as p from "@clack/prompts";
import {
  log,
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
  multiselect,
} from "@clack/prompts";
import { GitHelper } from "./GitHelper";
import { LLM } from "./llm/LLM";
import { Config } from "./config/Config";
import { LLMFactory } from "./llm/LLMFactory";
import { setup } from "./setup";

export async function main() {
  intro("Welcome to CAPmits");

  var git = new GitHelper();
  if (!git.inGitRepository()) {
    outro("Not in a git repository. Exiting...");
    return;
  }

  let llm: LLM;
  //-----------------------------------------------------
  // config
  try {
    var config = Config.getInstance().getConfigFile();

    llm = LLMFactory.build(config);
  } catch (error) {
    log.info("No config file found. Setting up...");
    //llm = LLMFactory.buildWithoutConfig("mock");
    llm = await setup();
  }

  log.info("Using provider: " + llm.toString());

  // ----------------------------------------------------
  // git

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

  var stagedFiles = git.getStagedFiles();
  if (stagedFiles.length === 0) {
    outro("No Changes to commit.");
    return;
  }

  var output =
    "Changes in the following files will be commited:\n \n" +
    stagedFiles.join("\n");

  p.log.info(output);

  var diff = git.getGitDiff();

  // ----------------------------------------------------
  // check the ollama version and prompt user to select

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
            type: () =>
              text({ message: "Type", initialValue: commitParts.type }),
            scope: () =>
              text({ message: "Scope", initialValue: commitParts.scope }),
            message: () =>
              text({ message: "Message", initialValue: commitParts.message }),
          },
          {
            // On Cancel callback that wraps the group
            // So if the user cancels one of the prompts in the group this function will be called
            onCancel: ({ results }) => {
              p.cancel("Operation cancelled.");
              return;
            },
          },
        );

        commitMessage = group.type + "(" + group.scope + "): " + group.message;
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

  git.commit(commitMessage);

  outro("Goodbye!");
}

async function getCommitMessage(diff: string, llm: LLM): Promise<string> {
  const s = spinner();
  s.start("Generating commit message");
  const commitMessage = await llm.call(diff);
  s.stop("Generated commit message.");

  return commitMessage;
}
