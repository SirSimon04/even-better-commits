export interface LLM {
  call(prompt: string): Promise<string>;
}
