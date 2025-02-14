#!/usr/bin/env node

process.env.SAP_CLOUD_SDK_LOG_LEVEL = "production";
process.env.NODE_ENV = "error";

// Suppress console logs
console.log = () => {};
console.error = () => {};
console.warn = () => {};

import { setup } from "../setup";
import { intro, outro } from "@clack/prompts";

async function main() {
  intro("Setup even-better-commits");
  try {
    await setup();
    outro("Setup complete.");
  } catch (error) {
    outro("Setup canceled.");
  }
}

main();
