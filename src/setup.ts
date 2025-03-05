import { log, select, text } from "@clack/prompts";
import { LLM } from "./llm/LLM";
import { Config, ConfigFile } from "./config/Config";
import { LLMFactory } from "./llm/LLMFactory";

export async function setup(): Promise<LLM> {
  var provider = await select({
    message: "Select a model provider",
    options: [
      { value: "ollama", label: "Ollama" },
      { value: "aicore", label: "SAP AI Core" },
      { value: "mock", label: "Simple mock provider" },
    ],
  });

  var llm = LLMFactory.build({
    provider: provider.toString(),
    providerDetails: {},
  });

  var config: ConfigFile = await llm.setup();
  llm.setDetails(config);

  var numberOfLoadedCommits = await text({
    message:
      "Do you want to load the last commit messages for the generation of new ones? If so, how many?",
    placeholder: "Leave empty if not",
    validate(value) {
      const int = parseInt(value);
      if (value !== "" && isNaN(int)) return `Please enter a number`;
    },
  });

  if (numberOfLoadedCommits !== undefined)
    config.loadLastCommitMessages = parseInt(numberOfLoadedCommits.toString());

  Config.getInstance().writeConfig(config);

  log.info("Config file written to " + Config.getInstance().configFilePath);

  //test
  return llm;
}
