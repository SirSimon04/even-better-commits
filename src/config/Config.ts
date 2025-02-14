import fs from "fs";
import path from "path";
import os from "os";

export type ConfigFile = {
  provider: string;
  providerDetails: any;
  loadLastCommitMessages?: number;
};

export class Config {
  private static instance: Config;
  private static readonly _EBC_CONFIG_FILE: string = path.join(
    os.homedir(),
    ".ebc-setup.json",
  );

  public get configFilePath(): string {
    return Config._EBC_CONFIG_FILE;
  }

  private constructor() {}

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public getConfigFile(): ConfigFile {
    if (!fs.existsSync(Config._EBC_CONFIG_FILE)) {
      throw new Error("Config file does not exist.");
    }

    try {
      const data = fs.readFileSync(Config._EBC_CONFIG_FILE, "utf-8");
      return JSON.parse(data) as ConfigFile;
    } catch (error) {
      throw new Error("Error reading config file:" + error);
    }
  }

  public writeConfig(config: ConfigFile): void {
    try {
      fs.writeFileSync(
        Config._EBC_CONFIG_FILE,
        JSON.stringify(config, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Error writing config file:", error);
    }
  }
}
