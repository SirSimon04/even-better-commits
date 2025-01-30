import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";

export class MockLLM implements LLM {
  constructor(config?: ConfigFile) {}

  configure(config: ConfigFile): void {
    throw new Error("Method not implemented.");
  }
  setup(): Promise<ConfigFile> {
    throw new Error("Method not implemented.");
  }
  public async call(prompt: string): Promise<string> {
    console.log(prompt);
    return "refactor: rename vars";
  }

  toString(): string {
    return "MockLLM";
  }
}
