export class PromptBuilder {
  //
  getCommitMessageSystemPrompt(): string {
    let msg =
      "You are an expert in creating git commit messages that adhere to the conventional commit standard. You get the output of git diff and then craft a meaningful commit message based on the changes shown in the git diff output." +
      " Your output commit message must be in the conventional commit format. Only output the commit messsage in a single line, without any qoutes around it. Do not include the intent of what is done but only the change made. Create only one commit message.";

    return msg;
  }
}
