#!/usr/bin/env node

process.env.SAP_CLOUD_SDK_LOG_LEVEL = "production";
process.env.NODE_ENV = "error";

import { setup } from "../setup";
import { intro, outro } from "@clack/prompts";
import { checkVersionFlag } from "../utils";

checkVersionFlag();

// Suppress console logs
console.log = () => {};
console.error = () => {};
console.warn = () => {};
async function main() {
  intro("Setup even-better-commits");
  try {
    await setup();
    outro("Setup completed.");
  } catch (error) {
    outro("Setup canceled.");
  }
}

main();
