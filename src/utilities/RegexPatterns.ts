/**
 * Shared regex patterns for asset detection across the extension
 */

/**
 * Regex to match image file paths in code (quoted strings)
 * Matches: "path/to/image.png", 'image.jpg', `./assets/icon.svg`
 */
export const IMAGE_PATH_REGEX =
  /(['"`])((?:[a-zA-Z]:)?[^'"\n\r]*?\.(?:png|jpg|jpeg|gif|svg|webp))\1/gi;

/**
 * Regex to match inline asset tags (SVG, Android Vector, XAML Path)
 * Matches: <svg>...</svg>, <vector>...</vector>, <Path ... />, etc.
 * Handles both self-closing and separate closing tags correctly.
 */
export const SVG_TAG_REGEX =
  /<(svg|vector|Path)(?:(?:\s+[^>]*?\/>)|(?:\s+[^>]*?>[\s\S]*?<\/\1>)|(?:\s*>[\s\S]*?<\/\1>))/gi;

/**
 * Supported asset file extensions
 */
export const ASSET_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "mp4",
  "webm",
  "pdf",
  "xlsx",
  "xls",
  "csv",
  "docx",
  "doc",
  "zip",
] as const;

/**
 * Code file extensions that may contain inline SVGs
 */
export const CODE_FILE_EXTENSIONS = [
  "html",
  "jsx",
  "tsx",
  "vue",
  "svelte",
  "php",
  "dart",
  "blade.php",
  "kt",
  "py",
  "xml",
  "xaml",
  "txt",
  "rb",
  "go",
  "rs",
  "java",
  "swift",
  "cpp",
  "h",
  "cs",
  "m",
  "mm",
] as const;
