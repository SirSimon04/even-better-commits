import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";

export class MockLLM implements LLM {
  constructor(config: ConfigFile) {}

  async generateBranchName(issueInfo: any): Promise<string> {
    return "some mock changes";
  }

  configure(config: ConfigFile): void {}
  setup(): Promise<ConfigFile> {
    return Promise.resolve({ provider: "mock", providerDetails: {} });
  }

  async call(prompt: string): Promise<string> {
    console.log(prompt);
    return "refactor: rename vars";
  }

  setDetails(config: ConfigFile): void {}

  toString(): string {
    return "MockLLM";
  }
}
