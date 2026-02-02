/**
 * File and formatting utility functions
 */

export class FileUtils {
  /**
   * Format bytes to human-readable string
   * @param bytes File size in bytes
   * @param decimals Number of decimal places (default: 1)
   * @param verbose Use verbose format like "Bytes" instead of "B" (default: false)
   * @returns Formatted string like "1.5 KB" or "1.5KB"
   */
  static formatBytes(
    bytes: number,
    decimals: number = 1,
    verbose: boolean = false,
  ): string {
    if (bytes === 0) return verbose ? "0 Bytes" : "0B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = verbose
      ? ["Bytes", "KB", "MB", "GB", "TB"]
      : ["B", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedValue = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return verbose
      ? `${formattedValue} ${sizes[i]}`
      : `${formattedValue}${sizes[i]}`;
  }
}
