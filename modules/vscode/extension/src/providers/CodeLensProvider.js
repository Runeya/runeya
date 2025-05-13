// eslint-disable-next-line import/no-unresolved
const vscode = require('vscode');

/**
 * CodelensProvider
 */
module.exports = class CodelensProvider {
  constructor(context, message) {
    this.message = message;
    this.context = context;
    this.regex = /(.+)/g;
    /** @type {vscode.CodeLens[]} */
    this.codeLenses = [];
    /** @type {vscode.EventEmitter<void>} */
    this._onDidChangeCodeLenses = new vscode.EventEmitter();
    /** @type {vscode.Event<void>} */
    this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

    vscode.workspace.onDidChangeConfiguration(() => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  /**
   * @param {vscode.TextDocument} document
   * @returns {vscode.CodeLens[] | Thenable<vscode.CodeLens[]>}
   */
  provideCodeLenses(document) {
    this.codeLenses = [];
    const { line } = vscode.window.activeTextEditor.selection.start;
    const range = document.getWordRangeAtPosition(new vscode.Position(line, 0), new RegExp(this.regex));
    if (range) {
      this.codeLenses.push(new vscode.CodeLens(range));
    }
    return this.codeLenses;
  }

  /** @param {vscode.CodeLens} codeLens */
  async resolveCodeLens(codeLens) {
    codeLens.command = {
      title: this.message,
      tooltip: 'Tooltip provided by sample extension',
      command: 'codelens-runeya.codelensAction',
      arguments: ['Argument 1', false],
    };
    return codeLens;
  }
};
