"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GitHelper_1 = require("../src/GitHelper");
describe("parseCommitMessage", function () {
    it("should parse a valid commit message with type, scope, and message", function () {
        var commitMessage = "feat(app): Add new user authentication feature";
        var expected = {
            type: "feat",
            scope: "app",
            message: "Add new user authentication feature",
        };
        expect(GitHelper_1.GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
    });
    it("should parse a valid commit message with type, scope, and message that include whitespaces", function () {
        var commitMessage = "  feat(app): Add new user authentication feature  ";
        var expected = {
            type: "feat",
            scope: "app",
            message: "Add new user authentication feature",
        };
        expect(GitHelper_1.GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
    });
    it("should parse a valid commit message with type and message only", function () {
        var commitMessage = "fix: Correct typo in error message";
        var expected = {
            type: "fix",
            message: "Correct typo in error message",
        };
        expect(GitHelper_1.GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
    });
    it("should return empty strings for an invalid commit message format", function () {
        var commitMessage = "This is an invalid commit message";
        var expected = {
            type: "",
            scope: "",
            message: "",
        };
        expect(GitHelper_1.GitHelper.parseCommitMessage(commitMessage)).toEqual(expected);
    });
});
