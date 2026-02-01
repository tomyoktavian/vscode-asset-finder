import * as vscode from "vscode";
import { PathResolver } from "./utilities/PathResolver.js";
import * as fs from "fs";

const IMAGE_PATH_REGEX =
  /(['"`])((?:[a-zA-Z]:)?[^'"\n\r]*?\.(?:png|jpg|jpeg|gif|svg|webp))\1/gi;
const SVG_TAG_REGEX = /<svg[\s\S]*?<\/svg>/gi;

export class SvgHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Hover | undefined> {
    const text = document.getText();
    const offset = document.offsetAt(position);

    SVG_TAG_REGEX.lastIndex = 0;
    let match;
    while ((match = SVG_TAG_REGEX.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;

      if (offset >= start && offset <= end) {
        const rawSvg = match[0];
        const processedSvg = this._processSvg(rawSvg);
        const base64Svg = Buffer.from(processedSvg).toString("base64");
        const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
        const fileSize = this._formatBytes(Buffer.byteLength(rawSvg, "utf8"));

        const markdown = new vscode.MarkdownString();
        markdown.supportHtml = true;
        markdown.isTrusted = true;

        const openGalleryCommand = vscode.Uri.parse(
          `command:asset-finder.focus`,
        );

        markdown.appendMarkdown(`
<table border="0">
  <tr>
    <td valign="top" style="padding-right: 12px;">
      <img src="${dataUri}" width="100" height="100" />
    </td>
    <td valign="top">
      <div style="margin-bottom: 2px;"><b>SVG Preview</b></div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        <b>Size:</b> ${fileSize}
      </div>
      <div style="font-size: 10px; opacity: 0.8;">
        <b>Asset Finder</b>
      </div>
      <br/>
      <div style="font-size: 11px;">
        <a href="${openGalleryCommand}">[ Show Gallery ]</a>
      </div>
    </td>
  </tr>
</table>
`);

        return new vscode.Hover(markdown);
      }
    }

    IMAGE_PATH_REGEX.lastIndex = 0;
    let pathMatch;
    while ((pathMatch = IMAGE_PATH_REGEX.exec(text)) !== null) {
      const start = pathMatch.index;
      const end = pathMatch.index + pathMatch[0].length;

      if (offset >= start && offset <= end) {
        const quotedPath = pathMatch[2];
        const absolutePath = PathResolver.resolvePath(quotedPath, document);

        if (absolutePath) {
          const fileUri = vscode.Uri.file(absolutePath);
          const stats = fs.statSync(absolutePath);
          const fileSize = this._formatBytes(stats.size);

          const markdown = new vscode.MarkdownString();
          markdown.supportHtml = true;
          markdown.isTrusted = true;

          const openCommand = vscode.Uri.parse(
            `command:vscode.open?${encodeURIComponent(JSON.stringify([fileUri]))}`,
          );
          const openGalleryCommand = vscode.Uri.parse(
            `command:asset-finder.focus`,
          );

          markdown.appendMarkdown(`
<table border="0">
  <tr>
    <td valign="top" style="padding-right: 12px;">
      <img src="${fileUri}" width="100" height="100" />
    </td>
    <td valign="top">
      <div style="margin-bottom: 2px;"><b>Image Preview</b></div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        <i>Path:</i> <a href="${openCommand}">${quotedPath}</a><br/>
        <b>Size:</b> ${fileSize}
      </div>
      <div style="font-size: 10px; opacity: 0.8;">
        <b>Asset Finder</b>
      </div>
      <br/>
      <div style="font-size: 11px;">
        <a href="${openGalleryCommand}">[ Show Gallery ]</a>
      </div>
    </td>
  </tr>
</table>
`);

          return new vscode.Hover(markdown);
        }
      }
    }

    return undefined;
  }

  private _formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  private _processSvg(svg: string): string {
    let processed = svg
      .replace(/className=/g, "class=")
      .replace(/strokeWidth=/g, "stroke-width=")
      .replace(/strokeLinecap=/g, "stroke-linecap=")
      .replace(/strokeLinejoin=/g, "stroke-linejoin=")
      .replace(/fillRule=/g, "fill-rule=")
      .replace(/clipRule=/g, "clip-rule=")
      // Handle framework specific syntax (React, Kotlin, Dart)
      .replace(/={([\s\S]*?)}/g, '="$1"')
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/\$[a-zA-Z0-9_]+/g, "")
      .replace(/\$\{[\s\S]*?\}/g, "")
      .replace(/currentColor/gi, "#888888");

    if (!processed.includes("http://www.w3.org/2000/svg")) {
      processed = processed.replace(
        /<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    processed = processed.replace(/\s(width|height)=".*?"/g, "");
    processed = processed.replace(/<svg/, '<svg width="100" height="100"');

    return processed;
  }
}
