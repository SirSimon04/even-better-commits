# capmits
A CLI tool to generate commit messages with the help of AI.

## Installation (Development)
```
# In the root of the project (one-time setup):
npm run build
npm link
chmod +x build/scripts/capmits.js
chmod +x build/scripts/capmits-setup.js

# Anywhere in your system:
capmits
```
capmits will automatically guide you through the initial setup if a configuration file doesn't exist.  You can also run `capmits-setup` manually at any time to reconfigure or update your settings.

## Providers
capmits supports multiple AI providers:
### Ollama
capmits can use any locally installed Ollama model. Simply ensure your desired model is available to Ollama. No further configuration within capmits is required for Ollama.

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

