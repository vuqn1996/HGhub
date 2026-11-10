/** Presentation-only localization; raw native/server errors remain in debug.log. */
export function englishError(message: string): string {
  const http = /^HTTP (\d{3})\b/.exec(message)?.[1];
  if (http) return `Server request failed (HTTP ${http}). Try again or change the server in Settings.`;
  if (/[\u3400-\u9fff]/.test(message)) {
    if (message.includes("镜像线路仅供游客")) return "Mirrors support guest browsing only. Switch to a primary server to sign in or register.";
    if (message.includes("请先登录")) return "Please sign in first.";
    if (message.includes("线路已变化")) return "The server changed during this request. Please sign in again.";
    if (/超时/.test(message)) return "The request timed out. Check your connection and try again.";
    if (/DNS/.test(message)) return "Could not resolve the server address. Check your connection.";
    if (/禁止|只允许/.test(message)) return "This request was blocked by the network security policy.";
    if (/镜像/.test(message)) return "Could not load mirror servers. Try refreshing the list.";
    return "The request failed. Please try again. Details are available in debug.log.";
  }
  return message.length > 140 ? `${message.slice(0, 140)}…` : message;
}

export function formatCount(n: number | undefined): string {
  const v = Number(n) || 0;
  const compact = (divisor: number, suffix: string) => `${(v / divisor).toFixed(1).replace(/\.0$/, "")}${suffix}`;
  if (v >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (v >= 1_000_000) return compact(1_000_000, "M");
  if (v >= 1_000) return compact(1_000, "K");
  return String(v);
}
