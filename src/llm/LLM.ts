import { ConfigFile } from "../config/Config";

export interface LLM {
  call(prompt: string): Promise<string>;
  generateBranchName(issueInfo: any): Promise<string>;
  setup(): Promise<ConfigFile>;
  toString(): string;
  setDetails(config: ConfigFile): void;
}
