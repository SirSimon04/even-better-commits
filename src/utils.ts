import { log, select } from "@clack/prompts";
import { LLM } from "./llm/LLM";
import { Config } from "./config/Config";
import { LLMFactory } from "./llm/LLMFactory";
import { setup } from "./setup";

export const selectType = (type: string) =>
  select({
    message: "Type",
    initialValue: type,
    options: [
      { value: "feat", label: "feat", hint: "A new feature" },
      { value: "fix", label: "fix", hint: "A bug fix" },
      {
        value: "docs",
        label: "docs",
        hint: "Documentation only changes",
      },
      {
        value: "refactor",
        label: "refactor",
        hint: "A code change that neither fixes a bug nor adds a feature",
      },
      {
        value: "perf",
        label: "perf",
        hint: "A code change that improves performance",
      },
      {
        value: "test",
        label: "test",
        hint: "Adding missing tests or correcting existing tests",
      },
      {
        value: "build",
        label: "build",
        hint: "Changes that affect the build system or external dependencies",
      },
      {
        value: "ci",
        label: "ci",
        hint: "Changes to our CI configuration files and scripts",
      },
      {
        value: "chore",
        label: "chore",
        hint: "Other changes that don't modify src or test files",
      },
    ],
  });

// Function to clear the screen
export function clearScreen() {
  console.clear(); // Clears terminal
  process.stdout.write("\x1b[?25l"); // Hide cursor
}

export function restoreScreen() {
  process.stdout.write("\x1b[?25h"); // Show cursor
}

export async function getLLMElseSetup(): Promise<LLM> {
  let llm: LLM;
  //-----------------------------------------------------
  // config
  try {
    var config = Config.getInstance().getConfigFile();

    llm = LLMFactory.build(config);
  } catch (error) {
    log.info("No config file found. Setting up...");
    //llm = LLMFactory.buildWithoutConfig("mock");
    llm = await setup();
  }

  return llm;
}
