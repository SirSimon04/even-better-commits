# 🚀 even-better-commits

A CLI tool that helps you write **better, faster, and more consistent commit messages** with the power of AI! ✨

---

## 🎯 Why?
Writing great commit messages is hard. **even-better-commits** makes it easy! It suggests commit messages based on your changes while strictly following the **Conventional Commits** specification. This ensures compatibility with tools like **semantic-release** and helps teams maintain consistency in their commit history.

---

## ⚡ Prerequisites
- Node.js **v22 or higher**
- [GitHub CLI](https://cli.github.com/) (optional; not needed for basic commits) 

---

## 📦 Installation
```sh
npm i -g even-better-commits
```

## Usage
even-better-commits offers multiple commands for different use cases: creating commits, creating branches, and opening pull requests.

🚀 **First-time Usage?** No worries! **even-better-commits** will guide you through the initial configuration automatically. You can also run `ebc-setup` anytime to update your settings.

### 📝 Creating a commit
```sh
ebc
```

### 🌿 Creating a Branch

The GitHub CLI (gh) is required for this command.

This command creates a new branch based on a GitHub issue. The issue information is used to generate a descriptive branch name.
```sh
ebb
ebc-branch
```

### 📤 Opening a Pull Request

The GitHub CLI (gh) is required for this command.

This command opens a pull request based on the commit messages in the current branch. It generates a title and a short overview of the changes, including a list of commits with brief descriptions.
```sh
ebp
ebc-pr
```
---

## 🧠 AI Providers
**even-better-commits** supports multiple AI-powered commit message generation providers:

### 🏠 Ollama (Local)
If you have **Ollama** installed, you can use any available local model—no extra setup required! 🔥

### ☁️ SAP AI Core
To use **SAP AI Core**, set your credentials via the `AICORE_SERVICE_KEY` environment variable:
```sh
export AICORE_SERVICE_KEY='{
  "url": "",
  "clientid": "",
  "clientsecret": "",
  "serviceurls": { "AI_API_URL": "" }
}'
```

---

## 💡 Inspiration
This project is inspired by [better-commits](https://github.com/Everduin94/better-commits), a tool we love and use daily. Our goal? **Keep it simple, but make it even better**—so developers can focus on coding instead of writing commit messages. 💙

---

🎉 Happy committing! 🚀
