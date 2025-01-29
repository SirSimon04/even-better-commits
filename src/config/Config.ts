import { exec } from 'child_process';
import { log } from 'console';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export class Config {
    private static instance: Config;
    private ollamaPath: string = join(process.env.HOME || process.env.USERPROFILE || '', '.ollama');
    public static readonly CAPMITS_CONFIG_FILE: string = ".capmits";

    private constructor() {

    }

    public static getInstance(): Config {
        if(!Config.instance){
            Config.instance = new Config();
        }
        return Config.instance;
    }

    public isOllamaInstalled(): boolean {
        return existsSync(this.ollamaPath);
    }

    public async getInstalledOllamaModels(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            exec('ollama ls', (error, stdout, stderr) => {
                if(error){
                    log(error);
                    reject(error);
                    return;
                }
                const lines = stdout.trim().split('\n');
                const models: string[] = [];

                // Start from index 1 to skip the header line
                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].split(/\s+/); // Split by any number of spaces
                    if (parts.length > 0) {
                        models.push(parts[0]); // Add the first part (model name) to the array
                    }
                }
                resolve(models);
            });
        });
    }

    
}