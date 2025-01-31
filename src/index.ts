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
    llm = LLMFactory.buildWithoutConfig("mock");
    llm = await setup();
  }

  log.info("Using provider: " + llm.toString());

  // ----------------------------------------------------
  // git
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

  const s = spinner();
  s.start("Generating commit message");
  const commitMessage = await llm.call(diff);
  s.stop("Generated commit message");

  // ----------------------------------------------------
  // commit

  const shouldCommit = await p.confirm({
    message: "Confirm commit with the following message? \n" + commitMessage,
  });

  if (!shouldCommit) {
    p.cancel("User cancelled commit.");
    return;
  }

  git.commit(commitMessage);

  outro("Goodbye!");
}
