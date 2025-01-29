import { PromptBuilder } from "../PromptBuilder";
import { LLM } from "./LLM";
import ollama from "ollama";

export class Ollama implements LLM {
  model: string = "llama3.2";

  async call(diff: string): Promise<string> {
    const response = await ollama.chat({
      model: this.model,
      messages: [
        {
          role: "system",
          content: new PromptBuilder().getCommitMessageSystemPrompt(),
        },
        {
          role: "user",
          content:
            "This is the diff where the commit message needs to be created for: \n \n" +
            diff,
        },
      ],
    });
    return response.message.content;
  }
}
