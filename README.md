# capmits
A CLI tool to generate commit messages with the help of AI.

## Usage during development
```
# in the root of the project
npm link
chmod +x src/scripts/capmits.ts
chmod +x src/scripts/capmits-setup.ts

# anywhere in your system
capmits
capmits-setup
```
If no config file is found when executing `capmits`, it guides through the setup process. This can be manually invoked to change the config with `capmits-setup`

## Providers
### Ollama
All locally installed models can be used.

### AI Core
Use all models available in the SAP AI Core.

Setup your credentials by exporting the following variable to your env. (This will be changed later to something like a config file)
```
AICORE_SERVICE_KEY='{
  "url": "",
  "clientid": "",
  "clientsecret": "",
  "serviceurls": { "AI_API_URL": ""}
}'
```

