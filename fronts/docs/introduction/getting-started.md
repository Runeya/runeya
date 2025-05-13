---
outline: deep
---
# Getting Started

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) version 16 or higher.
- Terminal for launching Runeya (CLI).
- Git to enable git capabilities.

To install in a git project:
::: code-group
```sh [npm]
$ npm install -D @runeya/runeya
```

```sh [pnpm]
$ pnpm add -D @runeya/runeya
```

```sh [yarn]
$ yarn add -D @runeya/runeya
```
:::

To install in global:
::: code-group

```sh [npm]
$ npm install -g @runeya/runeya
```

```sh [yarn]
$ yarn global add @runeya/runeya
```
:::


### Launch

In project installation, you can launch it by adding a script to your package.json:

```json [json]
{
  "name": "...",
  "version": "...",
  "description": "...",
  "main": "src/stack.js",
  "license": "...",
  "author": "...",
  "scripts": {
    "serve": "cross-env RUNEYA_HTTP_PORT=6872 runeya ./src/stack.js"
  }
}
```
Runeya ships with a command line. After global installation, start it by running:

```sh [bash]
$ runeya <config-directory>
```

It will launch a web interface to write and monitor all your services

![launched](./imgs/launched.png)