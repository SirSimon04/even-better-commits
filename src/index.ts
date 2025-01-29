#!/usr/bin/env ts-node

import * as p from "@clack/prompts";
import { log } from "@clack/prompts";
import { multiselect } from '@clack/prompts';
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
import { Config } from "./config/Config";

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
  // check the ollama version and prompt user to select
  const config = Config.getInstance();
  try {
    const models = await config.getInstalledOllamaModels();
    let selectedModel: string;
    if (models.length === 0) {
      log.error("No ollama models installed.");
      return;
    }
    if (models.length === 1) {
      log.info(`Using the only installed ollama model: ${models[0]}`);
      selectedModel = models[0];
    } else {
      const selectModel = await select({
        message: "Select the model you want to use",
        options: models.map(model => ({ value: model, label: model })),        
      });
  
      if (selectModel === null) {
        log.error("No Model selected!");
      } else {
        //selectedModel = selectModel;
        //log.info(`Selected model: ${selectModel}`);
      }      
    }

  } catch (error) {
    log.error("Failed to get installed ollama models");
    return;
  }

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
