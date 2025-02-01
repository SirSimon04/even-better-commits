import fs from "fs";
import path from "path";
export class PromptBuilder {

  private readonly _SYSTEM_MESSAGE: string = path.join(
    __dirname, // directory of this file    
    "prompts",    
    "system_message.md",
  );
  
  getCommitMessageSystemPrompt(): string {
    try {
      const msg = fs.readFileSync(this._SYSTEM_MESSAGE, 'utf-8');
      return msg;
    } catch (error) {
      console.error("Error reading system message file:", error);
      return "";
    }
  }
}
