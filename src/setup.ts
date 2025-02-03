import { log, select } from "@clack/prompts";
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
  Config.getInstance().writeConfig(config);

  log.info("Config file written to " + Config.getInstance().configFilePath);

  return llm;
}
