import * as vscode from "vscode";
import { PathResolver } from "./utilities/PathResolver.js";
import * as fs from "fs";
import * as path from "path";

const IMAGE_PATH_REGEX =
  /(['"`])((?:[a-zA-Z]:)?[^'"\n\r]*?\.(?:png|jpg|jpeg|gif|svg|webp))\1/gi;
const SVG_TAG_REGEX = /<svg[\s\S]*?<\/svg>/gi;

export class SvgDecorator {
  private _decorationType: vscode.TextEditorDecorationType;
  private _timeout: NodeJS.Timeout | undefined = undefined;

  constructor() {
    this._decorationType = vscode.window.createTextEditorDecorationType({
      before: {
        margin: "0 5px 0 0",
        width: "14px",
        height: "14px",
      },
    });
  }

  private _updateDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const text = editor.document.getText();
    const decorations: vscode.DecorationOptions[] = [];

    // 1. Handle SVG Tags (Icon only)
    SVG_TAG_REGEX.lastIndex = 0;
    let match;
    while ((match = SVG_TAG_REGEX.exec(text)) !== null) {
      const startPos = editor.document.positionAt(match.index);
      const rawSvg = match[0];
      const processedSvg = this._processSvg(rawSvg);
      const base64Svg = Buffer.from(processedSvg, "utf-8").toString("base64");
      const dataUri = vscode.Uri.parse(
        `data:image/svg+xml;base64,${base64Svg}`,
      );

      decorations.push({
        range: new vscode.Range(startPos, startPos.translate(0, 4)),
        renderOptions: {
          before: { contentIconPath: dataUri },
        },
      });
    }

    // 2. Handle Image Paths (Icon + Size)
    IMAGE_PATH_REGEX.lastIndex = 0;
    let pathMatch;
    while ((pathMatch = IMAGE_PATH_REGEX.exec(text)) !== null) {
      const fullMatch = pathMatch[0];
      const quotedPath = pathMatch[2];
      const endPos = editor.document.positionAt(
        pathMatch.index + fullMatch.length,
      );

      const absolutePath = PathResolver.resolvePath(
        quotedPath,
        editor.document,
      );
      if (absolutePath) {
        let dataUri: vscode.Uri;
        let fileSizeStr = "";

        try {
          const stats = fs.statSync(absolutePath);
          fileSizeStr = this._formatBytes(stats.size);
        } catch (e) {
          // Ignore if path resolved but file unreadable
        }

        let mime = "";
        let imgBase64 = "";

        if (absolutePath.toLowerCase().endsWith(".svg")) {
          const rawSvg = fs.readFileSync(absolutePath, "utf8");
          const processedSvg = this._processSvg(rawSvg);
          imgBase64 = Buffer.from(processedSvg, "utf-8").toString("base64");
          mime = "image/svg+xml";
          if (!fileSizeStr) {
            fileSizeStr = this._formatBytes(Buffer.byteLength(rawSvg, "utf8"));
          }
        } else {
          imgBase64 = fs.readFileSync(absolutePath).toString("base64");
          const ext = path.extname(absolutePath).substring(1).toLowerCase();
          mime =
            ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        }

        // Combine icon and text into one SVG to ensure both are visible
        // Approx width: 14 (icon) + 4 (gap) + (char count * 6)
        const textDisplay = fileSizeStr ? ` (${fileSizeStr})` : "";
        const estimatedWidth = 14 + textDisplay.length * 7;

        const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" width="${estimatedWidth}" height="14">
          <image href="data:${mime};base64,${imgBase64}" width="14" height="14" />
          <text x="18" y="11" font-family="Inter, sans-serif" font-size="10" fill="#888888" font-style="italic">${textDisplay}</text>
        </svg>`;

        const base64Wrapper = Buffer.from(svgWrapper).toString("base64");
        dataUri = vscode.Uri.parse(
          `data:image/svg+xml;base64,${base64Wrapper}`,
        );

        decorations.push({
          range: new vscode.Range(endPos, endPos),
          renderOptions: {
            after: {
              contentIconPath: dataUri,
              margin: "0 0 0 5px",
            },
          },
        });
      }
    }

    editor.setDecorations(this._decorationType, decorations);
  }

  private _formatBytes(bytes: number, decimals = 1) {
    if (bytes === 0) return "0B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
  }

  public triggerUpdateDecorations(editor: vscode.TextEditor | undefined) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = undefined;
    }
    this._timeout = setTimeout(() => this._updateDecorations(), 500);
  }

  public dispose() {
    this._decorationType.dispose();
  }

  private _processSvg(svg: string): string {
    let processed = svg
      .replace(/className=/g, "class=")
      .replace(/strokeWidth=/g, "stroke-width=")
      .replace(/strokeLinecap=/g, "stroke-linecap=")
      .replace(/strokeLinejoin=/g, "stroke-linejoin=")
      .replace(/fillRule=/g, "fill-rule=")
      .replace(/clipRule=/g, "clip-rule=")
      .replace(/={([\s\S]*?)}/g, '="$1"')
      .replace(/currentColor/gi, "#888888");

    if (!processed.toLowerCase().includes("xmlns=")) {
      processed = processed.replace(
        /<svg/i,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    processed = processed.replace(/\s(width|height)=".*?"/gi, "");
    processed = processed.replace(/<svg/i, '<svg width="16" height="16"');

    return processed;
  }
}
