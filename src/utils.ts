import { select } from "@clack/prompts";

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
