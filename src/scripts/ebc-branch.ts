#!/usr/bin/env node

process.env.SAP_CLOUD_SDK_LOG_LEVEL = "production";
process.env.NODE_ENV = "error";

// Suppress console logs
console.log = () => {};
console.error = () => {};
console.warn = () => {};

import { createBranch } from "../branch";
import { clearScreen, restoreScreen } from "../utils";

clearScreen();
createBranch();
restoreScreen();
