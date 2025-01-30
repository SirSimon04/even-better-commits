import { ConfigFile } from "../config/Config";

export interface LLM {
  call(prompt: string): Promise<string>;
  setup(): Promise<ConfigFile>;
  toString(): string;
}
