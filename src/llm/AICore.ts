import { OrchestrationClient } from "@sap-ai-sdk/orchestration";
import { ConfigurationApi, DeploymentApi } from "@sap-ai-sdk/ai-api";
import type {
  AiDeploymentCreationResponse,
  AiDeploymentList,
  AiApiError,
} from "@sap-ai-sdk/ai-api";
import { ConfigFile } from "../config/Config";
import { LLM } from "./LLM";
import { isCancel, select, log, cancel, outro, spinner } from "@clack/prompts";
import { PromptBuilder } from "../PromptBuilder";

export class AICore implements LLM {
  model!: string;

  constructor(config: ConfigFile) {
    this.setDetails(config);
  }
  async generateBranchName(issueInfo: any): Promise<string> {
    const orchestrationClient = new OrchestrationClient({
      llm: {
        model_name: this.model,
      },
      templating: {
        template: new PromptBuilder().buildTemplateForBranch(issueInfo),
      },
    });

    const result = await orchestrationClient.chatCompletion();

    return result.getContent() ?? "ERROR";
  }

  async call(diff: string): Promise<string> {
    const orchestrationClient = new OrchestrationClient({
      llm: {
        model_name: this.model,
      },
      templating: {
        template: new PromptBuilder().buildTemplate(diff),
      },
    });

    const result = await orchestrationClient.chatCompletion();

    return result.getContent() ?? "ERROR";
  }

  async setup(): Promise<ConfigFile> {
    // Check deployment for global orchestration service
    const defaultOrchestration: Boolean =
      await this.checkOrchestrationDeployment();
    if (!defaultOrchestration) {
      log.warning(
        "No orchestration deployment found under default resource group!",
      );
      var options = await select({
        message: "Do you want to create an orchestration deployment?",
        options: [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ],
      });

      if (!options || isCancel(options)) {
        cancel("Operation cancelled.");
        process.exit(1);
      }

      // Create orchestration deployment
      const s = spinner();
      s.start("Creating Orchestration Deployment");
      const config = await this.createOrchestrationConfig();
      const deployment = await this.createDeployment(config.id);
      s.stop("Orchestration deployment created with ID: " + deployment.id);
    }
    try {
      const selectModel = await select({
        message: "Select the model you want to use",
        options: [
          { value: "gpt-35-turbo", label: "GPT 3.5 Turbo" },
          { value: "gpt-35-turbo-16k", label: "GPT 3.5 Turbo 16K" },
          { value: "gpt-4o-mini", label: "GPT 4o Mini" },
          { value: "gpt-4o", label: "GPT 4o" },
          { value: "gpt-4", label: "GPT 4" },
          { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" },
          { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
          { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
          { value: "anthropic--claude-3-haiku", label: "Claude 3 Haiku" },
          { value: "anthropic--claude-3-opus", label: "Claude 3 Opus" },
          { value: "anthropic--claude-3-sonnet", label: "Claude 3 Sonnet" },
          { value: "anthropic--claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
          { value: "meta--llama3-70b-instruct", label: "LLaMA 3 70B Instruct" },
          {
            value: "meta--llama3.1-70b-instruct",
            label: "LLaMA 3.1 70B Instruct",
          },
        ],
      });

      if (isCancel(selectModel) || selectModel === null) {
        throw new Error("No Model selected!");
      } else {
        return {
          provider: "aicore",
          providerDetails: {
            model: selectModel,
          },
        };
      }
    } catch (error) {
      throw new Error("AI Core setup failed");
    }
  }

  setDetails(config: ConfigFile): void {
    this.model = config.providerDetails.model;
  }

  toString(): string {
    return "SAP AI Core with " + this.model + " model";
  }

  async checkOrchestrationDeployment(resourceGroup?: string): Promise<boolean> {
    const list: AiDeploymentList = await this.getDeployments(resourceGroup);
    if (
      list.resources.some(
        (s) => s.scenarioId == "orchestration" && s.status === "RUNNING",
      )
    ) {
      return true;
    }
    return false;
  }

  async getDeployments(resourceGroup?: string): Promise<AiDeploymentList> {
    return DeploymentApi.deploymentQuery(
      {},
      { "AI-Resource-Group": resourceGroup ? resourceGroup : "default" },
    ).execute();
  }

  async createOrchestrationConfig() {
    const requestBody = {
      name: "orchestration-config",
      executableId: "orchestration",
      scenarioId: "orchestration",
      inputArtifactBindings: [],
    };

    try {
      const responseData = await ConfigurationApi.configurationCreate(
        requestBody,
        { "AI-Resource-Group": "default" },
      ) // use default resource group
        .execute();

      return responseData;
    } catch (errorData: any) {
      const apiError = errorData.response.data.error as AiApiError;
      console.error("Status code:", errorData.response.status);
      throw new Error(`Configuration creation failed: ${apiError.message}`);
    }
  }

  async createDeployment(
    configurationId: string,
  ): Promise<AiDeploymentCreationResponse> {
    return DeploymentApi.deploymentCreate(
      { configurationId },
      { "AI-Resource-Group": "default" },
    ).execute();
  }
}
