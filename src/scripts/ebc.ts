#!/usr/bin/env node

process.env.SAP_CLOUD_SDK_LOG_LEVEL = "production";
process.env.NODE_ENV = "error";

import { main, restoreScreen } from "..";

// Suppress console logs
console.log = () => {};
console.error = () => {};
console.warn = () => {};

main();
restoreScreen();
