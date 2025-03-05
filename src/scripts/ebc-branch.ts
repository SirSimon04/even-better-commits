#!/usr/bin/env node

process.env.SAP_CLOUD_SDK_LOG_LEVEL = "production";
process.env.NODE_ENV = "error";

import { createBranch } from "../branch";
import { checkVersionFlag, clearScreen, restoreScreen } from "../utils";

checkVersionFlag();

// Suppress console logs
console.log = () => {};
console.error = () => {};
console.warn = () => {};

clearScreen();
createBranch();
restoreScreen();
