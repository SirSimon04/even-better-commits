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
import { Ollama } from "./llm/Ollama";
import { Config, ConfigFile } from "./config/Config";
import { LLMFactory } from "./llm/LLMFactory";

export async function setup(): Promise<LLM> {
  var provider = await select({
    message: "Select a model provider2",
    options: [
      { value: "ollama", label: "Ollama" },
      { value: "mock", label: "Simple mock provider" },
    ],
  });
  var llm = LLMFactory.buildWithoutConfig(provider.toString());
  var config: ConfigFile = await llm.setup();
  Config.getInstance().writeConfig(config);

  log.info("Config file written to " + Config.getInstance().configFilePath);

  return llm;
}
