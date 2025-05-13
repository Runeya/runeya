# 🚀 Runeya

Runeya is an all-in-one development tool that simplifies microservice management and provides a complete suite of developer utilities.


## ✨ Features

- 🖥️ **Service Management** - Launch, stop, and monitor multiple services simultaneously
- 🔐 **Environment Variables** - Manage environment variables by environment, share configs securely with your team
- 🔄 **Git Integration** - Complete git operations (stash, pull, branches)
- 📦 **NPM Tools** - Run scripts, manage your dependencies
- 🔍 **Log Explorer** - Analyze logs in real-time with JSON parsing
- 🧰 **Toolbox** - JSON formatter, Regex tester, JWT explorer, UUID generator...
- 📊 **System Monitoring** - CPU/Memory monitoring for your services
- 📝 **Documentation** - Integrated Markdown documentation
- 🔄 **Workflows** - Create your own automated pipelines

## 🚀 Quick Start

### Installation

```bash
# NPM
npm install -D @runeya/runeya

# Yarn
yarn add -D @runeya/runeya
```

### Launch

```bash
# In your package.json
"scripts": {
  "serve": "runeya ./src/stack.js"
}

# Or directly
runeya <config-directory>
```

## 🌍 Environment Management

Runeya provides a powerful environment variable management system:

- **Environment-specific variables** - Configure different values for development, staging, production
- **Global variables** - Share common configurations across all environments
- **Team sharing** - Securely share configurations with your team members
- **Zero configuration** - New developers can clone your projects and start immediately without manual setup  

This feature helps teams work seamlessly with consistent configurations across all environments, reducing the "works on my machine" problem.

## 🏗️ Architecture

Runeya uses a modular architecture built with:
- Vue.js frontend
- Express backend
- Extensible plugin system

## 🤝 Contributing

```bash
# Clone the repository
git clone https://github.com/runeya/runeya.git

# Install dependencies
yarn install

# Launch in development mode
yarn serve
```

## 📄 License

ISC License

---

📚 [Complete Documentation](https://runeya.github.io/runeya/) | 👤 [Corentin Labroche](mailto:corentinlabroche@gmail.com) 