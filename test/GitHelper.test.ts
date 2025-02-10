import { GitHelper, CommitParts } from "../src/GitHelper";

describe("parseCommitMessage", () => {
  it("should parse a valid commit message with type, scope, and message", () => {
    const commitMessage: string =
      "feat(app): Add new user authentication feature";
    const expected: CommitParts = {
      type: "feat",
      scope: "app",
      message: "Add new user authentication feature",
    };
    expect(GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
  });

  it("should parse a valid commit message with type, scope, and message that include whitespaces", () => {
    const commitMessage: string =
      "  feat(app): Add new user authentication feature  ";
    const expected: CommitParts = {
      type: "feat",
      scope: "app",
      message: "Add new user authentication feature",
    };
    expect(GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
  });

  it("should parse a valid commit message with type and message only", () => {
    const commitMessage = "fix: Correct typo in error message";
    const expected: CommitParts = {
      type: "fix",
      message: "Correct typo in error message",
    };
    expect(GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
  });

  it("should return empty strings for an invalid commit message format", () => {
    const commitMessage = "This is an invalid commit message";
    const expected: CommitParts = {
      type: "",
      scope: "",
      message: "",
    };
    expect(GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
  });
});

