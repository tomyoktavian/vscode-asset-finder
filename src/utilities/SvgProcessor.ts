/**
 * SVG processing utility for cleaning and preparing SVG markup for display
 */

export class SvgProcessor {
  /**
   * Normalize and convert non-standard icon formats (Android Vector, XAML Path) to renderable SVG.
   * @param markup Raw markup string
   * @returns Normalized SVG markup
   */
  private static convertToStandardSvg(markup: string): string {
    const trimmed = markup.trim();

    // 1. Handle Android Vector Drawable (<vector>)
    if (trimmed.toLowerCase().startsWith("<vector")) {
      const widthMatch = trimmed.match(/android:width="([\d.]+)(?:dp|px)?"/i);
      const heightMatch = trimmed.match(/android:height="([\d.]+)(?:dp|px)?"/i);
      const vwMatch = trimmed.match(/android:viewportWidth="([\d.]+)"/i);
      const vhMatch = trimmed.match(/android:viewportHeight="([\d.]+)"/i);

      const w = widthMatch ? widthMatch[1] : "24";
      const h = heightMatch ? heightMatch[1] : "24";
      const vw = vwMatch ? vwMatch[1] : w;
      const vh = vhMatch ? vhMatch[1] : h;

      let content = trimmed
        .replace(/<vector[\s\S]*?>/i, "")
        .replace(/<\/vector>/i, "")
        .replace(/android:pathData=/gi, "d=")
        .replace(/android:strokeColor=/gi, "stroke=")
        .replace(/android:fillColor=/gi, "fill=")
        .replace(/android:strokeWidth=/gi, "stroke-width=")
        .replace(/android:strokeLineCap=/gi, "stroke-linecap=")
        .replace(/android:strokeLineJoin=/gi, "stroke-linejoin=")
        .replace(/android:fillAlpha=/gi, "fill-opacity=")
        .replace(/android:strokeAlpha=/gi, "stroke-opacity=")
        .replace(/\s+android:[a-zA-Z]+="[^"]*"/gi, "")
        .replace(/\s+xmlns:android="[^"]*"/gi, "")
        .replace(/<group/gi, "<g")
        .replace(/<\/group>/gi, "</g>")
        .replace(/<path\s+/gi, "<path ");

      return `<svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
    }

    // 2. Handle XAML Path (<Path ... />)
    if (trimmed.toLowerCase().startsWith("<path")) {
      const dataMatch = trimmed.match(/Data="([\s\S]*?)"/i);
      if (dataMatch && !trimmed.toLowerCase().includes("<svg")) {
        const openingTagMatch = trimmed.match(/<Path([\s\S]*?)(\/?>|>)/i);
        const rawAttrs = openingTagMatch ? openingTagMatch[1] : "";

        const w = rawAttrs.match(/Width="([\d.]+)"/i)?.[1] || "24";
        const h = rawAttrs.match(/Height="([\d.]+)"/i)?.[1] || "24";

        let attrs = rawAttrs
          // Convert XAML attributes to SVG
          .replace(/Data=/gi, "d=")
          .replace(/StrokeThickness=/gi, "stroke-width=")
          .replace(/Stroke=/gi, "stroke=")
          .replace(/Fill=/gi, "fill=")
          .replace(/StrokeEndLineCap=/gi, "stroke-linecap=")
          .replace(/StrokeStartLineCap=/gi, "stroke-linecap=")
          .replace(/StrokeDashCap=/gi, "stroke-linecap=")
          .replace(/StrokeDashArray=/gi, "stroke-dasharray=")
          // Remove XAML-specific attributes
          .replace(/\s+xmlns:[a-zA-Z]+="[^"]*"/gi, "")
          .replace(/\s+x:[a-zA-Z]+="[^"]*"/gi, "")
          .replace(/\s+HorizontalAlignment="[^"]*"/gi, "")
          .replace(/\s+VerticalAlignment="[^"]*"/gi, "")
          .replace(/\s+Stretch="[^"]*"/gi, "")
          .replace(/\s+Width="[^"]*"/gi, "")
          .replace(/\s+Height="[^"]*"/gi, "")
          .replace(/\s+Margin="[^"]*"/gi, "")
          .replace(/\s+Padding="[^"]*"/gi, "")
          // Remove WPF bindings
          .replace(/="\{[^}]*\}"/gi, '=""');

        return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><path ${attrs.trim()} /></svg>`;
      }
    }

    return markup;
  }

  /**
   * Process SVG markup: clean attributes, normalize syntax, set dimensions
   * @param svg Raw SVG string
   * @param options Processing options
   * @returns Processed SVG string ready for display
   */
  static process(
    svg: string,
    options: {
      width?: number;
      height?: number;
      colorReplacement?: string;
    } = {},
  ): string {
    // First, convert alien formats
    svg = this.convertToStandardSvg(svg);

    const { width = 100, height = 100, colorReplacement = "#888888" } = options;

    // Normalize framework-specific syntax and handle variable-based colors
    let processed = svg
      .replace(
        /(^|[\s<])(?::|v-bind:|v-attr:|v-)?(fill|stroke|color|stop-color|stopColor)=("[^"]*"|'[^']*'|{[^}]*}|{{[^}]*}})?/gi,
        (match, prefix, attr, value) => {
          const val = value || "";
          const isPrefixed = match.includes(":") || match.includes("v-bind");
          const isDynamicVal =
            val.startsWith("{") ||
            val.includes("$") ||
            val.includes("{{") ||
            val.includes("<?") ||
            isPrefixed;

          if (isDynamicVal) {
            return `${prefix}${attr}="currentColor"`;
          }
          return match;
        },
      )
      .replace(/([\s<])(?::|v-bind:|v-attr:|v-):?([\w-]+)=/gi, "$1$2=")
      .replace(/className=/g, "class=")
      .replace(/strokeWidth=/g, "stroke-width=")
      .replace(/strokeLinecap=/g, "stroke-linecap=")
      .replace(/strokeLinejoin=/g, "stroke-linejoin=")
      .replace(/fillRule=/g, "fill-rule=")
      .replace(/clipRule=/g, "clip-rule=")
      .replace(/={([\s\S]*?)}/g, '="$1"')
      .replace(/="{{([\s\S]*?)}}"/g, '="$1"')
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/\$[a-zA-Z0-9_]+/g, "")
      .replace(/\$\{[\s\S]*?\}/g, "")
      .replace(/currentColor/gi, colorReplacement);

    const tagInfo = this.extractOpeningTag(processed);
    if (!tagInfo) {
      return processed; // Not a valid SVG
    }

    let { openingTag, restOfSvg } = tagInfo;

    if (!openingTag.toLowerCase().includes("xmlns=")) {
      openingTag = openingTag.replace(
        /<svg/i,
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    openingTag = openingTag.replace(/\s(width|height)="[^"]*"/gi, "");
    openingTag = openingTag.replace(
      /<svg/i,
      `<svg width="${width}" height="${height}"`,
    );

    return openingTag + restOfSvg;
  }

  /**
   * Clean SVG for gallery display (lighter processing, no dimension changes)
   * @param svg Raw SVG string
   * @returns Cleaned SVG string
   */
  static clean(svg: string): string {
    svg = this.convertToStandardSvg(svg);
    return svg
      .replace(
        /(^|[\s<])(?::|v-bind:|v-attr:|v-)?(fill|stroke|color|stop-color|stopColor)=("[^"]*"|'[^']*'|{[^}]*}|{{[^}]*}})?/gi,
        (match, prefix, attr, value) => {
          const val = value || "";
          const isPrefixed = match.includes(":") || match.includes("v-bind");
          const isDynamicVal =
            val.startsWith("{") ||
            val.includes("$") ||
            val.includes("{{") ||
            val.includes("<?") ||
            isPrefixed;

          if (isDynamicVal) {
            return `${prefix}${attr}="currentColor"`;
          }
          return match;
        },
      )
      .replace(/([\s<])(?::|v-bind:|v-attr:|v-):?([\w-]+)=/gi, "$1$2=")
      .replace(/className=/g, "class=")
      .replace(/strokeWidth=/g, "stroke-width=")
      .replace(/strokeLinecap=/g, "stroke-linecap=")
      .replace(/strokeLinejoin=/g, "stroke-linejoin=")
      .replace(/fillRule=/g, "fill-rule=")
      .replace(/clipRule=/g, "clip-rule=")
      .replace(/={([\s\S]*?)}/g, '="$1"')
      .replace(/="{{([\s\S]*?)}}"/g, '="$1"')
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/\$[a-zA-Z0-9_]+/g, "")
      .replace(/\$\{[\s\S]*?\}/g, "")
      .replace(/\s(width|height)=".*?"/g, "");
  }

  /**
   * Convert SVG attributes to camelCase JSX style
   * @param svg SVG markup
   * @returns JSX-compatible SVG markup
   */
  static toJsx(svg: string): string {
    return svg
      .replace(/className=/g, "class=")
      .replace(/class=/g, "className=")
      .replace(/stroke-width=/g, "strokeWidth=")
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin=")
      .replace(/fill-rule=/g, "fillRule=")
      .replace(/clip-rule=/g, "clipRule=")
      .replace(/stop-color=/g, "stopColor=")
      .replace(/stop-opacity=/g, "stopOpacity=")
      .replace(/stroke-opacity=/g, "strokeOpacity=")
      .replace(/fill-opacity=/g, "fillOpacity=")
      .replace(/font-family=/g, "fontFamily=")
      .replace(/font-size=/g, "fontSize=")
      .replace(/font-weight=/g, "fontWeight=")
      .replace(/text-anchor=/g, "textAnchor=");
  }

  /**
   * Wrap JSX SVG into a React Functional Component
   * @param svg SVG markup
   * @param name Name of the component
   * @returns React Component code
   */
  static toReactComponent(svg: string, name: string): string {
    const jsx = this.toJsx(svg);
    // Sanitize component name
    const componentName = name
      .replace(/[^a-zA-Z0-9]/g, " ")
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
      .replace(/File|Svg|Png|Jpg|Jpeg|Webp/gi, "");

    return `import React from 'react';

export const ${componentName || "Icon"} = (props: React.SVGProps<SVGSVGElement>) => (
  ${jsx.replace(/<svg/, "<svg {...props}")}
);`;
  }

  /**
   * Wrap SVG into a Vue Functional Component
   * @param svg SVG markup
   * @param name Name of the component
   * @returns Vue Component code
   */
  static toVueComponent(svg: string, name: string): string {
    const componentName = name
      .replace(/[^a-zA-Z0-9]/g, " ")
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
      .replace(/File|Svg|Png|Jpg|Jpeg|Webp/gi, "");

    return `<template>
  ${svg.replace(/<svg/, '<svg v-bind="$attrs"')}
</template>

<script>
export default {
  name: '${componentName || "Icon"}',
  inheritAttrs: false
}
</script>`;
  }

  /**
   * Convert SVG to Android Vector Drawable XML
   * @param svg SVG markup
   * @returns Android Vector XML
   */
  static toAndroidVector(svg: string): string {
    const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/i);
    const vw = viewBox ? viewBox[1] : "24";
    const vh = viewBox ? viewBox[2] : "24";

    let content = svg
      .replace(/<svg[\s\S]*?>/i, "")
      .replace(/<\/svg>/i, "")
      .replace(/<path/gi, "    <path")
      .replace(/\s+d="([\s\S]*?)"/gi, ' android:pathData="$1"')
      .replace(/\s+fill="([\s\S]*?)"/gi, ' android:fillColor="$1"')
      .replace(/\s+stroke="([\s\S]*?)"/gi, ' android:strokeColor="$1"')
      .replace(/\s+stroke-width="([\s\S]*?)"/gi, ' android:strokeWidth="$1"')
      .replace(
        /\s+stroke-linecap="([\s\S]*?)"/gi,
        ' android:strokeLineCap="$1"',
      )
      .replace(
        /\s+stroke-linejoin="([\s\S]*?)"/gi,
        ' android:strokeLineJoin="$1"',
      )
      .replace(/\s+opacity="([\s\S]*?)"/gi, ' android:alpha="$1"')
      .replace(/<g/gi, "    <group")
      .replace(/<\/g>/gi, "    </group>");

    return `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${vw}dp"
    android:height="${vh}dp"
    android:viewportWidth="${vw}"
    android:viewportHeight="${vh}">
${content.trim()}
</vector>`;
  }

  /**
   * Convert SVG to XAML Path
   * @param svg SVG markup
   * @returns XAML Path markup
   */
  static toXamlPath(svg: string): string {
    let content = svg
      .replace(/<svg[\s\S]*?>/i, "")
      .replace(/<\/svg>/i, "")
      .replace(/<path/gi, "<Path")
      .replace(/\s+d="([\s\S]*?)"/gi, ' Data="$1"')
      .replace(/\s+fill="([\s\S]*?)"/gi, ' Fill="$1"')
      .replace(/\s+stroke="([\s\S]*?)"/gi, ' Stroke="$1"')
      .replace(/\s+stroke-width="([\s\S]*?)"/gi, ' StrokeThickness="$1"')
      .replace(
        /\s+stroke-linecap="([\s\S]*?)"/gi,
        ' StrokeStartLineCap="$1" StrokeEndLineCap="$1"',
      )
      .replace(/\s+stroke-linejoin="([\s\S]*?)"/gi, ' StrokeLineJoin="$1"');

    return content.trim();
  }

  /**
   * Convert SVG to Base64
   * @param svg SVG markup
   * @returns Base64 string
   */
  static toBase64(svg: string): string {
    return Buffer.from(svg).toString("base64");
  }

  /**
   * Convert SVG to Data URI
   * @param svg SVG markup
   * @returns Data URI string
   */
  static toDataUri(svg: string): string {
    const b64 = this.toBase64(svg);
    return `data:image/svg+xml;base64,${b64}`;
  }

  /**
   * Extract opening <svg> tag from SVG string
   * @param svg SVG markup
   * @returns Object with openingTag and restOfSvg, or null if not valid
   */
  private static extractOpeningTag(
    svg: string,
  ): { openingTag: string; restOfSvg: string } | null {
    const svgOpenTagMatch = svg.match(/<svg[^>]*>/i);
    if (!svgOpenTagMatch) {
      return null;
    }

    const openingTag = svgOpenTagMatch[0];
    const restOfSvg = svg.substring(openingTag.length);

    return { openingTag, restOfSvg };
  }
}
