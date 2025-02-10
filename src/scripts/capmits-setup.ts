#!/usr/bin/env node

import { setup } from "../setup";
import { intro, outro } from "@clack/prompts";

async function main() {
  intro("Setup CAPmits");
  try {
    await setup();
    outro("Setup complete.");
  } catch (error) {
    outro("Setup canceled.");
  }
}

main();
