#!/usr/bin/env ts-node

import * as p from "@clack/prompts";
import { log } from "@clack/prompts";
import {
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
import { MockLLM } from "./llm/MockLLM";
import { LLM } from "./llm/LLM";
import { Ollama } from "./llm/Ollama";
import { PromptBuilder } from "./PromptBuilder";

async function main() {
  intro("Welcome to CAPmits");

  // ----------------------------------------------------
  // git
  var git = new GitHelper();
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
  // generate message

  var llm: LLM = new Ollama();
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

main();
