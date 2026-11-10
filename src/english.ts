/** Presentation-only localization; raw native/server errors remain in debug.log. */
export function englishError(message: string): string {
  const http = /^HTTP (\d{3})\b/.exec(message)?.[1];
  if (http) return `Server request failed (HTTP ${http}). Try again or change the server in Settings.`;
  if (/[\u3400-\u9fff]/.test(message)) {
    if (/(用户|账号|账户).*(或密码|密码).*(错误|不正确)|密码(错误|不正确)/.test(message)) return "Incorrect username or password.";
    if (/(用户名|账号|邮箱).*(已存在|已被|已注册|占用)/.test(message)) return "This username or email is already registered. Use another one or sign in.";
    if (/(用户|账号|账户).*(不存在|未注册)/.test(message)) return "Account not found. Check your username or register.";
    if (/(登录|会话|token).*(过期|失效)/i.test(message)) return "Your session has expired. Please sign in again.";
    if (/(频繁|过于频繁|次数过多)/.test(message)) return "Too many requests. Please wait before trying again.";
    if (/(用户名|账号|密码|邮箱).*(不能为空|必填)/.test(message)) return "Please fill in all required account fields.";
    if (/邮箱.*(无效|格式|不正确)/.test(message)) return "Please enter a valid email address.";
    if (/密码.*(长度|至少|太短)/.test(message)) return "The password does not meet the server's length requirements.";
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
