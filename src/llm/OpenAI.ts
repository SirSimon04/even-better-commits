import OpenAI from "openai";
import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";
import { PromptBuilder } from "../PromptBuilder";
import { isCancel, Option, select } from "@clack/prompts";

export class OpenAi implements LLM {
    model!: string;

    constructor(config: ConfigFile) {
        this.setDetails(config);
    }

    async call(diff: string): Promise<string> {
        // get git diff for the prompt
        const gitDiffTemplate = new PromptBuilder().getDiffTemplate();
        const prompt = gitDiffTemplate.replace("{{git_diff}}", diff);

        const client = new OpenAI();
        const completion = await client.chat.completions.create({
            model: this.model,
            messages: [
                { role: 'developer', content: new PromptBuilder().getCommitSystemMessage() },
                { role: 'user', content: prompt },
            ],
        });

        return completion.choices[0].message.content ?? "ERROR";
    }
    generateBranchName(issueInfo: any): Promise<string> {
        throw new Error("Method not implemented.");
    }
    generatePRDetails(changeInfo: any): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async setup(): Promise<ConfigFile> {
        try {
            const selectModel = await select({
                message: "Select a model you want to use",
                options: await this.listAvailableModels(),
            });
            if (isCancel(selectModel) || selectModel === null) {
                throw new Error("No model selected!");
            } else {
                return {
                    provider: "openai",
                    providerDetails: {
                        model: selectModel,
                    },
                };
            }
        } catch (error) {
            throw new Error("OpenAI setup failed");
        }
    }

    setDetails(config: ConfigFile): void {
        this.model = config.providerDetails.model;
    }

    toString(): string {
        return "OpenAI with " + this.model + " model";
    }

    private async listAvailableModels(): Promise<Option<string>[]> {
        try {
            const client = new OpenAI();
            const response = await client.models.list();
            const models = response.data;

            const options = models.map((model) => ({
                value: model.id,
                label: model.id,
            }));

            return options;
        } catch (error) {
            console.error("Error retrieving models:", error);
            return [];
        }
    }
}