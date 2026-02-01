import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider.js";
import { SvgHoverProvider } from "./SvgHoverProvider.js";
import { SvgDecorator } from "./SvgDecorator.js";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "asset-finder" is now active!');
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  const svgDecorator = new SvgDecorator();

  // Initial update
  svgDecorator.triggerUpdateDecorations(vscode.window.activeTextEditor);

  // Listeners for decorations
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      svgDecorator.triggerUpdateDecorations(editor);
    },
    null,
    context.subscriptions,
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        svgDecorator.triggerUpdateDecorations(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions,
  );

  context.subscriptions.push(svgDecorator);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "asset-finder-sidebar",
      sidebarProvider,
    ),
  );

  // Trigger view to open the panel
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("asset-finder-sidebar-trigger", {
      resolveWebviewView: (webviewView) => {
        const redirect = () => {
          if (webviewView.visible) {
            // 1. Focus the assets in the bottom panel
            vscode.commands.executeCommand("asset-finder.focus");
            // 2. Return the sidebar focus back to project explorer
            vscode.commands.executeCommand("workbench.view.explorer");
          }
        };

        // Trigger on first load
        redirect();

        // Trigger every time it's clicked again
        webviewView.onDidChangeVisibility(() => {
          redirect();
        });

        webviewView.webview.html = "";
      },
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("asset-finder.refresh", () => {
      sidebarProvider.refresh();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("asset-finder.focus", () => {
      vscode.commands.executeCommand(
        "workbench.view.extension.asset-finder-panel",
      );
    }),
  );
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { scheme: "file", language: "*" },
      new SvgHoverProvider(),
    ),
  );
}

export function deactivate() {}
