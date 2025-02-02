import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";
import { MockLLM } from "./MockLLM";
import { Ollama } from "./Ollama";

export class LLMFactory {
  static build(config: ConfigFile): LLM {
    switch (config.provider) {
      case "ollama":
        return new Ollama(config);
      case "mock":
        return new MockLLM(config);
      default:
        throw new Error("NO_MODEL_FOUND");
    }
  }
}
