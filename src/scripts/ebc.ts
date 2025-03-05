#!/usr/bin/env node

process.env.SAP_CLOUD_SDK_LOG_LEVEL = "production";
process.env.NODE_ENV = "error";

import { main } from "..";
import { checkVersionFlag, clearScreen, restoreScreen } from "../utils";

checkVersionFlag();

// Suppress console logs
console.log = () => {};
console.error = () => {};
console.warn = () => {};

clearScreen();
main();
restoreScreen();
