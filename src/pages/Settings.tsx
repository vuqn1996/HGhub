import { useEffect, useState, type ReactNode } from "react";
import { api, APP_VERSION, hostOf, logLine, platform, type UpdateInfo } from "../api";
import { useStore } from "../store";
import { Modal, Toggle } from "../components/ui";
import LinePicker from "../components/LinePicker";
import { copyPlaybackLog, initPlaybackLog, setPlaybackLog, usePlaybackLog } from "../playbackDiagnostics";
import { IBack, IBoltF, IBroom, IChevR, IHeart, IInfo, ILink, ILockF, IMoon, IRefresh, ISettings, ISun, IVolMute } from "../icons";

/* 独立设置页：线路 / 外观 / 播放 / 本地数据 / 清理缓存 / 网络诊断 / 关于
   入口：Windows 侧栏「设置」、Android「我的」右上角齿轮 */
export default function Settings({ onBack, wide }: { onBack: () => void; wide: boolean }) {
  const { theme, setTheme, favs, history, muteOnStartup, setMuteOnStartup, strictSecurity, strictSecurityReady, securityPending, cliRelaxed, setStrictSecurity, toast } = useStore();
  const [about, setAbout] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const [lineBase, setLineBase] = useState("");
  const [checking, setChecking] = useState(false);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const playbackLog = usePlaybackLog();
  const [copyingLog, setCopyingLog] = useState(false);

  const readLine = () => {
    api.lineState().then((s) => setLineBase(s.base)).catch(() => {});
  };
  useEffect(readLine, []);
  useEffect(() => { void initPlaybackLog(); }, []);

  const checkUpdate = async () => {
    setChecking(true);
    try {
      const info = await api.checkUpdate();
      if (info.has_update) setUpdate(info);
      else toast(`Already up to date: v${info.current}`, "ok");
    } catch (e) {
      toast((e as Error).message || "Could not check for updates", "info");
    } finally {
      setChecking(false);
    }
  };

  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <>
      <div className="text-[10.5px] font-semibold text-dim tracking-wide px-1 mt-4 mb-1.5">{title}</div>
      <div className="rounded-(--r-md) bg-s2 divide-y divide-s3">{children}</div>
    </>
  );

  return (
    <div className="absolute inset-0 bg-bg flex flex-col">
      <div className="shrink-0 relative overflow-hidden bg-s1" style={{ paddingTop: "var(--sat, 0px)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(90% 120% at 100% 0%, var(--p-pc) 0%, transparent 60%)", opacity: 0.32 }} />
        <div className="relative px-3 pt-2 pb-4">
          <button onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-full flex items-center justify-center text-on hover:bg-s3 pressable"><IBack size={20} /></button>
          <div className="px-2 mt-1 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-(--r-sm) bg-pc text-on-pc flex items-center justify-center"><ISettings size={20} strokeWidth={1.7} /></span>
                <span className="text-[24px] font-bold tracking-wide text-on">Settings</span>
              </div>
              <div className="text-[11px] text-mut mt-1">Appearance · Playback · Local data · Diagnostics</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 scroll-y px-4 pt-1 pb-10">
        <div className={wide ? "max-w-[720px] mx-auto" : ""}>
          <Section title="Appearance">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary">{theme === "dark" ? <IMoon size={16} /> : <ISun size={16} />}</span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Dark mode</div>
                <div className="text-[10.5px] text-mut">Fluent-inspired dark theme</div>
              </div>
              <Toggle on={theme === "dark"} onChange={(on) => setTheme(on ? "dark" : "light")} label="Dark mode" />
            </div>
          </Section>

          <Section title="Playback">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IVolMute size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Mute on startup</div>
                <div className="text-[10.5px] text-mut">On by default: starts muted each time. When off, remembers your last mute setting. Applies on next launch.</div>
              </div>
              <Toggle on={muteOnStartup} onChange={setMuteOnStartup} label="Mute on startup" />
            </div>
          </Section>

          <Section title="Local data">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IHeart size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Local favorites</div>
                <div className="text-[10.5px] text-mut">{favs.length} favorites · {history.length} watch records</div>
              </div>
            </div>
            <button onClick={() => setClearOpen(true)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IBroom size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Clear cache</div>
                <div className="text-[10.5px] text-mut">Cover / playback cache and local records</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <Section title="Network">
            <button onClick={() => setLineOpen(true)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IBoltF size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Server</div>
                <div className="text-[10.5px] text-mut truncate">{lineBase ? hostOf(lineBase) : "Fixed server 1 (default)"}</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><ILockF size={15} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Strict security mode</div>
                <div className="text-[10.5px] text-mut">
                  {cliRelaxed
                    ? "Compatibility mode enabled by --no-strict; you can re-enable strict mode here"
                    : "On by default to block malicious upstream content and private-network probes. Disable if articles or custom proxies fail (or launch with --no-strict)."}
                </div>
              </div>
              <Toggle
                on={strictSecurity}
                disabled={!strictSecurityReady || securityPending}
                onChange={(on) => {
                  void setStrictSecurity(on).then(() => {
                    toast(on ? "Strict security mode enabled" : "Compatibility mode enabled (aggressive sanitization and guards disabled)", "info");
                  }).catch(() => toast("Could not save security settings; previous mode retained", "info"));
                }}
                label="Strict security mode"
              />
            </div>
            {/* 打不开时先点这里：把 DNS / 代理 / HTTP 结果复制给维护者 */}
            <button onClick={async () => {
              try {
                const text = JSON.stringify(await api.netDiag(), null, 2);
                logLine(`[net_diag] ${text}`);
                await navigator.clipboard?.writeText(text);
                toast("Network diagnostics copied", "ok");
              } catch (e) {
                toast((e as Error).message || "Diagnostics failed", "info");
              }
            }} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><ILink size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Network diagnostics</div>
                <div className="text-[10.5px] text-mut">Check DNS, system proxy and upstream site connectivity</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <Section title="Playback diagnostics">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IInfo size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Playback diagnostic log</div>
                <div className="text-[10.5px] text-mut">Log taps, seeking, page changes and buffering. Reproduce the issue, then disable logging and copy the log.</div>
                {playbackLog.error && <div role="alert" className="text-[10.5px] text-danger">{playbackLog.error}</div>}
              </div>
              <Toggle label="Playback diagnostic log" on={playbackLog.enabled} disabled={!playbackLog.ready || playbackLog.pending}
                onChange={(on) => { void setPlaybackLog(on).then(() => toast(on ? "Playback logging enabled; reproduce the issue now" : "Playback logging disabled; existing logs retained", "ok")).catch(() => toast("Could not save log settings; try again", "info")); }} />
            </div>
            <button disabled={!playbackLog.ready || playbackLog.pending || copyingLog} onClick={async () => {
              setCopyingLog(true);
              try { await copyPlaybackLog(); toast("Playback diagnostic log copied", "ok"); }
              catch (e) { toast((e as Error).message || "Could not copy log", "info"); }
              finally { setCopyingLog(false); }
            }} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable disabled:opacity-60">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><ILink size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">{copyingLog ? "Copying…" : "Copy playback log"}</div>
                <div className="text-[10.5px] text-mut break-all">{playbackLog.path || "Logs are stored only on this device"}</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <Section title="Other">
            <button onClick={checkUpdate} disabled={checking} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable disabled:opacity-60">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IRefresh size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Check for updates</div>
                <div className="text-[10.5px] text-mut">{checking ? "Checking…" : `Current v${APP_VERSION} · Check GitHub Releases`}</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
            <button onClick={() => setAbout(true)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IInfo size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">About HGhub</div>
                <div className="text-[10.5px] text-mut">Version {APP_VERSION} · Noncommercial use only</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <div className="text-center text-[10px] text-dim mt-5">HGhub {APP_VERSION} · {platform === "android" ? "Android" : platform === "ios" ? "iOS" : platform === "macos" ? "macOS" : platform === "linux" ? "Linux" : "Windows"} client</div>
        </div>
      </div>

      <LinePicker open={lineOpen} onClose={() => { setLineOpen(false); readLine(); }} />

      <Modal open={about} onClose={() => setAbout(false)} width={392}>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-(--r-sm) brand-grad glow-neon flex items-center justify-center text-on-primary text-[17px] font-black">H</span>
            <div>
              <div className="text-[16px] font-bold text-on leading-tight">HGhub</div>
              <div className="text-[11px] text-mut mt-0.5">Huangguo Shorts · Third-party client v{APP_VERSION}</div>
            </div>
          </div>

          <p className="text-[12px] text-on/70 leading-relaxed mt-4">
            A cross-platform client built with Rust + Tauri 2 for Windows, macOS, Android and Linux.
            The interface follows Fluent design, with an immersive vertical video feed.
          </p>

          <div className="mt-4 rounded-(--r-sm) bg-s3/60 p-3 text-[11px] text-mut leading-relaxed">
            This project is for learning and discussion only. All content comes from upstream sites; this client does not store or distribute any video content.
            Please delete related resources within 24 hours and support licensed content.
          </div>

          <div className="mt-4 divide-y divide-s3">
            <button onClick={() => { navigator.clipboard?.writeText("https://github.com/Minireel/HGhub").then(() => toast("Repository URL copied", "ok")).catch(() => {}); }}
              className="w-full flex items-center gap-2 py-2.5 text-left pressable">
              <ILink size={15} className="text-mut" />
              <span className="text-[12px] text-on/85">github.com/Minireel/HGhub</span>
              <span className="ml-auto text-[10.5px] text-primary">Copy</span>
            </button>
            <button onClick={() => { navigator.clipboard?.writeText("https://huangguoai.com").then(() => toast("Site URL copied", "ok")).catch(() => {}); }}
              className="w-full flex items-center gap-2 py-2.5 text-left pressable">
              <ILink size={15} className="text-mut" />
              <span className="text-[12px] text-on/85">huangguoai.com</span>
              <span className="ml-auto text-[10.5px] text-primary">Copy</span>
            </button>
            <div className="flex items-center gap-2 py-2.5">
              <IInfo size={15} className="text-mut" />
              <span className="text-[12px] text-on/85">PolyForm Noncommercial 1.0.0</span>
              <span className="ml-auto text-[10.5px] text-mut">Noncommercial only</span>
            </div>
          </div>

          <button onClick={() => setAbout(false)} className="mt-4 w-full h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on pressable">Got it</button>
        </div>
      </Modal>

      <Modal open={clearOpen} onClose={() => setClearOpen(false)} width={330}>
        <div className="p-5">
          <div className="text-[14.5px] font-bold text-on">Clear cache</div>
          <p className="text-[12px] text-mut leading-relaxed mt-2">
            Only cover and playlist caches (decrypted images / m3u8) will be cleared. Favorites, watch history, search history and sign-in status will be kept.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setClearOpen(false)} className="flex-1 h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on/80 pressable">Cancel</button>
            <button disabled={clearing} onClick={async () => {
              setClearing(true);
              try { await api.clearCache(); } catch { /* 忽略 */ }
              setClearing(false);
              setClearOpen(false);
              toast("Cache cleared", "ok");
            }} className="flex-1 h-9 rounded-(--r-ctl) bg-primary text-[12.5px] font-semibold text-on-primary pressable disabled:opacity-60">
              {clearing ? "Clearing…" : "Clear cache"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!update?.has_update} onClose={() => setUpdate(null)} width={392}>
        <div className="p-5">
          <div className="text-[15px] font-bold text-on">Update available</div>
          <p className="text-[11.5px] text-mut mt-1.5">
            v{update?.current} → <b className="text-on">v{update?.latest}</b>
            {update?.published_at ? ` · ${update.published_at.slice(0, 10)}` : ""}
          </p>
          {!!update?.notes && (
            <div className="mt-3 max-h-[180px] scroll-y rounded-(--r-sm) bg-s2 p-3 text-[11px] text-mut whitespace-pre-wrap leading-relaxed">{update.notes}</div>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setUpdate(null)} className="flex-1 h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on/80 pressable">Later</button>
            <button onClick={() => {
              if (!update) return;
              api.openUrl(update.url).catch(() => {
                navigator.clipboard?.writeText(update.url).then(() => toast("Download URL copied", "ok")).catch(() => {});
              });
            }} className="flex-1 h-9 rounded-(--r-ctl) bg-primary text-[12.5px] font-semibold text-on-primary pressable">Download</button>
          </div>
          <div className="text-[10px] text-dim mt-2.5 break-all">{update?.url}</div>
        </div>
      </Modal>
    </div>
  );
}
