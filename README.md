# even-better-commits
A CLI tool to generate commit messages with the help of AI.

## Prerequisites
- node version >= 22

## Installation (Development)
```
# In the root of the project (one-time setup):
npm run build
npm link
chmod +x build/scripts/ebv.js
chmod +x build/scripts/ebc-setup.js

# Anywhere in your system:
ebc
ebc-setup
```
even-better-commits will automatically guide you through the initial setup if a configuration file doesn't exist.  You can also run `ebc-setup` manually at any time to reconfigure or update your settings.

## Providers
even-better-commits supports multiple AI providers:
### Ollama
even-better-commits can use any locally installed Ollama model. Simply ensure your desired model is available to Ollama. No further configuration within capmits is required for Ollama.

### SAP AI Core
To use **SAP AI Core**, you need to configure your credentials. Currently, this is done by setting the `AICORE_SERVICE_KEY` environment variable.
```
export AICORE_SERVICE_KEY='{
  "url": "",
  "clientid": "",
  "clientsecret": "",
  "serviceurls": { "AI_API_URL": ""}
}'
```

