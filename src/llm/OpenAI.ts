import OpenAI from "openai";
import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";
import { PromptBuilder } from "../PromptBuilder";
import { isCancel, log, Option, select } from "@clack/prompts";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export class OpenAi implements LLM {
    model!: string;

    constructor(config: ConfigFile) {
        this.setDetails(config);
    }

    async call(diff: string): Promise<string> {
        // create message object for prompt
        const prompt: Array<ChatCompletionMessageParam> = [];
        prompt.push({ role: 'developer', content: new PromptBuilder().getSystemMessageForCommit() });

        // check for ebcinfo file
        const ebcInfo = new PromptBuilder().getEbcInfoFile();
        if (ebcInfo) {
            log.info("Using from local .ebcinfo file");
            prompt.push({
                role: "developer",
                content: new PromptBuilder().getProjectSpecificInfo(ebcInfo),
            });
        }

        // get git diff for the prompt
        const gitDiffTemplate = new PromptBuilder().getDiffTemplate();
        const gitDiff = gitDiffTemplate.replace("{{git_diff}}", diff);
        prompt.push({ role: 'user', content: gitDiff });

        const client = new OpenAI();
        const completion = await client.chat.completions.create({
            model: this.model,
            messages: prompt
        });

        return completion.choices[0].message.content ?? "ERROR";
    }

    async generateBranchName(issueInfo: any): Promise<string> {
        // create message object for prompt
        const prompt: Array<ChatCompletionMessageParam> = [];
        prompt.push({ role: 'developer', content: new PromptBuilder().getSystemMessageForBranch() });

        // check for ebcinfo file
        const ebcInfo = new PromptBuilder().getEbcInfoFile();
        if (ebcInfo) {
            log.info("Using from local .ebcinfo file");
            prompt.push({
                role: "developer",
                content: new PromptBuilder().getProjectSpecificInfo(ebcInfo),
            });
        }
        // add issue info to the prompt
        prompt.push({
            role: "user",
            content: "```data \n \n" + JSON.stringify(issueInfo) + "```",
        });

        // make the call
        const client = new OpenAI();
        const completion = await client.chat.completions.create({
            model: this.model,
            messages: prompt,
        });

        return completion.choices[0].message.content ?? "ERROR";
    }

    async generatePRDetails(changeInfo: any): Promise<string> {
        // create message object for prompt
        const prompt: Array<ChatCompletionMessageParam> = [];
        prompt.push({ role: 'developer', content: new PromptBuilder().getSystemMessageForPR() });

        // check for ebcinfo file
        const ebcInfo = new PromptBuilder().getEbcInfoFile();
        if (ebcInfo) {
            log.info("Using from local .ebcinfo file");
            prompt.push({
                role: "developer",
                content: new PromptBuilder().getProjectSpecificInfo(ebcInfo),
            });
        }

        // add change info to the prompt
        prompt.push({
            role: "user",
            content: "```data \n \n" + JSON.stringify(changeInfo) + "```",
        });

        // make the call
        const client = new OpenAI();
        const completion = await client.chat.completions.create({
            model: this.model,
            messages: prompt,
        });

        return completion.choices[0].message.content ?? "ERROR";
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