import { LLM } from "./LLM";

export class MockLLM implements LLM {
  public async call(prompt: string): Promise<string> {
    console.log(prompt);
    return "refactor: rename vars";
  }
}
