(() => {
const ID = 'class-dash-root';
const prev = document.getElementById(ID);
if (prev) { if (prev.__close) prev.__close(); else prev.remove(); return; }
const ENV = window.ENV || {};
const isCanvas = !!(ENV.current_user_id || ENV.current_user) || /(^|\.)instructure\.com$/.test(location.hostname);
const LIB = window.__classDashMode === 'library';
const DAY = 864e5;
const REPO = 'hsoirghfohdj/yee-new', BRANCH = 'main', DIR = 'offline/', STUDY = 'study/';
const PAGES = 'https://hsoirghfohdj.github.io/yee-new/';
const rawOf = p => 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' + p.split('/').map(encodeURIComponent).join('/');
const store = {
get(k, d) { try { const v = localStorage.getItem('classdash_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
set(k, v) { try { localStorage.setItem('classdash_' + k, JSON.stringify(v)); } catch (e) {} }
};
// Personal settings (the Settings page). Saved in this browser as classdash_prefs, so updates never reset them.
const PREF_DEFAULT = { theme: 'dark', accent: '', size: 'normal', full: false, motion: true, start: 'home', clock24: false, seconds: false, outside: true, blurGrades: false, gameOpen: 'here', recent: true, tiles: 'medium' };
let P = Object.assign({}, PREF_DEFAULT, store.get('prefs', {}));
const VIEWS = ['home', 'todo', 'grades', 'classes', 'calendar', 'schedule', 'hallpass', 'study', 'games'];
const CANVAS_VIEWS = ['home', 'todo', 'grades', 'classes', 'calendar'];
function startView() {
if (LIB) return 'games';
let v = P.start === 'last' ? store.get('lastView', 'home') : P.start;
if (!VIEWS.includes(v)) v = 'home';
return !isCanvas && CANVAS_VIEWS.includes(v) ? 'games' : v;
}
// What's new in this version (shown in the update prompt). Change it when you publish an update.
const WHATSNEW = 'Games now have a loading screen and a New this week row, plus Sketchbook, a new Settings page and a cleaner Study page.';
// Updates: keep running the version you accepted ("installed") and ask before switching to a newer one.
// The bookmark always downloads the newest bookmarklet.js; if it differs from the installed copy,
// the installed copy runs instead and shows an "Update available" bar.
if (!LIB) {
const pinned = window.__classDashPinned;
window.__classDashPinned = false;
if (!pinned) {
let fresh = null;
try { fresh = localStorage.getItem('classdash_code'); } catch (e) {}
const inst = store.get('installed', null);
if (fresh && (!inst || !inst.code)) store.set('installed', { code: fresh, at: Date.now() });
else if (fresh && inst.code !== fresh) {
let run = null;
try { run = new Function(inst.code); } catch (e) {}
if (run) { window.__classDashUpdate = { code: fresh }; window.__classDashPinned = true; run(); return; }
store.set('installed', { code: fresh, at: Date.now() });
}
}
}
const S = {
view: startView(), back: 'classes', seg: 'all',
loading: false, error: null, loadedAt: null,
me: null, courses: [], work: [], grades: [], ann: [],
done: new Set(store.get('done', [])), courseCache: {}, courseId: null,
game: null,
lib: store.get('lib', null), libLoading: false, libError: null, libTried: 0, q: '', cat: 'All',
lunch: store.get('lunch', 1), schedKey: null,
doc: null, sq: '', scls: 'All', skind: 'all',
periods: store.get('periods', {}),
req: {}, reqMsg: {},
delArm: null,
resetArm: false, setMsg: null
};
const svg = p => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
const I = {
home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
check: svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
chart: svg('<path d="M4 20V11M10 20V5M16 20v-6M22 20H2"/>'),
book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
cal: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
game: svg('<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 14h.01"/>'),
refresh: svg('<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>'),
x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
cap: svg('<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>'),
search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
shuffle: svg('<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
ext: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
study: svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
leaf: svg('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>'),
flask: svg('<path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>'),
atom: svg('<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>'),
math: svg('<path d="M18 4H6l6 8-6 8h12"/>'),
globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
talk: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
code: svg('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>'),
pass: svg('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v2M14 11v2M14 16v2"/>'),
send: svg('<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>'),
star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
bolt: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
rocket: svg('<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M9 12a17 17 0 0 1 11-9 17 17 0 0 1-9 11z"/><path d="M9 12 6 11l3-4h4M12 15l1 3 4-3v-4"/>'),
heart: svg('<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>'),
news: svg('<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/>'),
gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
quiz: svg('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8.5 10 2 2 4-4M8.5 16.5h7"/>'),
doc: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
chain: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
pic: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
file: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
plus: svg('<path d="M12 5v14M5 12h14"/>'),
key: svg('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M16 7l3 3M14 9l2 2"/>'),
tick: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>'
};
const CSS = `
:host{all:initial}
*{box-sizing:border-box;margin:0;padding:0}
.bd{--bg:#0f1218;--p1:#161a22;--p2:#1d222c;--p3:#272d3a;--ln:#262c39;--tx:#e9ecf2;--mu:#8c93a5;--ac:#7c9cff;--act:var(--ac);--gd:#3ecf8e;--wn:#f5b546;--bad:#f2637a;
position:fixed;inset:0;background:rgba(6,8,12,.62);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;
font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--tx);animation:fd .18s ease}
@keyframes fd{from{opacity:0}}
@keyframes pop{from{opacity:0;transform:translateY(8px) scale(.985)}}
@keyframes sp{to{transform:rotate(360deg)}}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.win{zoom:var(--z,1);width:min(1200px,calc((100vw - 32px) / var(--z,1)));height:min(780px,calc((100vh - 32px) / var(--z,1)));background:var(--bg);border:1px solid var(--ln);border-radius:16px;
display:grid;grid-template-columns:208px 1fr;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.55);animation:pop .22s ease}
.sb{background:var(--p1);border-right:1px solid var(--ln);display:flex;flex-direction:column;padding:16px 10px;gap:2px}
.brand{font-weight:700;font-size:16px;padding:2px 10px 18px;display:flex;gap:10px;align-items:center}
.logo{width:30px;height:30px;border-radius:9px;background:var(--ac);display:grid;place-items:center;color:#0f1218}
.nav{display:flex;flex-direction:column;gap:2px}
.nav button{all:unset;display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:9px;color:var(--mu);cursor:pointer;font-weight:550;white-space:nowrap}
.nav button:hover{background:var(--p2);color:var(--tx)}
.nav button.on{background:var(--p3);color:var(--tx)}
.nav button.on svg{color:var(--act)}
.badge{margin-left:auto;background:var(--bad);color:#fff;font-size:11px;font-weight:700;border-radius:10px;padding:0 7px;line-height:18px}
.sbf{margin-top:auto;padding:10px 12px;color:var(--mu);font-size:12px}
.clock{font-size:26px;color:var(--tx);font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.sched{margin:10px -4px 0;padding:9px 11px;border-radius:10px;background:var(--p2);cursor:pointer}
.sched:hover{background:var(--p3)}
.sched .sl{color:var(--tx);font-weight:650;font-size:13px}
.sched .bar{margin-top:7px;height:4px}
.schnow{display:flex;align-items:center;gap:16px;margin-bottom:16px}
.schnow .big{font-size:24px}
.schbar{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between}
.row.past{opacity:.5}
.mn{display:flex;flex-direction:column;min-width:0;min-height:0}
.hd{display:flex;align-items:center;gap:10px;padding:14px 20px 14px 24px;border-bottom:1px solid var(--ln)}
.hd h1{font-size:18px;font-weight:650;flex:0 1 auto;max-width:28%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.omni{position:relative;flex:1;max-width:580px;margin:0 auto;display:flex;align-items:center;gap:8px;height:38px;padding:0 8px 0 12px;border-radius:11px;background:var(--p2);border:1px solid var(--ln);color:var(--mu);transition:border-color .12s,box-shadow .12s}
.omni:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px rgba(124,156,255,.18);background:var(--bg)}
.omni .oi{display:grid}
.omni input{all:unset;flex:1;min-width:0;color:var(--tx);font-size:14px}
.omni input::placeholder{color:var(--mu)}
.omni:not(:focus-within) input{color:var(--mu);font-family:ui-monospace,monospace;font-size:13px}
.omni:focus-within>.kbd{display:none}
.odrop{position:absolute;left:-1px;right:-1px;top:calc(100% + 6px);background:var(--p1);border:1px solid var(--ln);border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,.5);padding:6px;z-index:20;max-height:min(440px,62vh);overflow:auto}
.odrop[hidden]{display:none}
.oit{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;cursor:pointer;color:var(--tx)}
.oit.on{background:var(--p3)}
.oit .oic{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;flex:none;background:var(--p3);color:var(--tx)}
.oit .oic svg{width:16px;height:16px}
.oit .addr{font:12px ui-monospace,monospace;color:var(--mu);white-space:nowrap;max-width:45%;overflow:hidden;text-overflow:ellipsis}
.oit.on .addr{color:var(--act)}
.ohint{padding:8px 10px;color:var(--mu);font-size:12px}
.ohint b{font:12px ui-monospace,monospace;color:var(--tx);background:var(--p3);border-radius:5px;padding:1px 5px}
.bd.lib .omni{display:none}
.ubar{display:flex;align-items:center;gap:12px;margin:12px 24px 0;padding:10px 12px 10px 14px;border-radius:12px;background:rgba(124,156,255,.12);border:1px solid rgba(124,156,255,.35);animation:pop .22s ease}
.ubar[hidden]{display:none}
.ubar .uic{width:32px;height:32px;border-radius:9px;background:var(--ac);color:#0f1218;display:grid;place-items:center;flex:none}
.ubar .sub{white-space:normal}
.pcls{color:var(--act);font-weight:600}
.sched .sl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ver{margin-top:4px;font-size:11px;opacity:.75}
.cupd{all:unset;cursor:pointer;display:inline-flex;align-items:center;margin-top:10px;font-size:11.5px;font-weight:650;color:var(--act)}
.cupd:hover{text-decoration:underline}
.req{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:14px 16px;border-radius:14px;background:var(--p1);border:1px solid var(--ln);margin-bottom:16px}
.req .ric{width:36px;height:36px;border-radius:10px;background:var(--gd);color:#0f1218;display:grid;place-items:center;flex:none}
.rtxt{flex:1 1 230px;min-width:0}
.rtxt .sub{white-space:normal}
.rfields{display:flex;flex-wrap:wrap;gap:8px;flex:2 1 360px}
.rfields input{all:unset;box-sizing:border-box;flex:1 1 150px;min-width:0;height:36px;padding:0 11px;border-radius:9px;background:var(--p2);border:1px solid var(--ln);color:var(--tx);font-size:13px}
.rfields input:focus{border-color:var(--ac)}
.rfields input::placeholder{color:var(--mu)}
.rfields .btn{height:36px;box-sizing:border-box;display:inline-flex;align-items:center}
.rmsg{flex-basis:100%;font-size:12px;color:var(--mu)}
.rmsg:empty{display:none}
.rmsg.ok{color:var(--gd)}
.rmsg.err{color:var(--bad)}
.bnrs{display:flex;flex-direction:column;gap:8px;margin:12px 24px 0}
.bnrs:empty{display:none}
.bnr{display:flex;align-items:center;gap:12px;padding:9px 8px 9px 12px;border-radius:12px;background:color-mix(in srgb,var(--bc) 13%,transparent);border:1px solid color-mix(in srgb,var(--bc) 45%,transparent);animation:pop .22s ease}
.bnr .bic{width:30px;height:30px;border-radius:9px;background:var(--bc);color:#0f1218;display:grid;place-items:center;flex:none}
.bnr .grow{font-size:13.5px}
.bnr .btn{background:var(--bc);color:#0f1218}
.ib.bx{width:28px;height:28px;background:transparent}
.adm{margin-bottom:16px}
.adm select{height:34px;padding:0 8px;border-radius:9px;background:var(--p2);border:1px solid var(--ln);color:var(--tx);font:13px system-ui,sans-serif;color-scheme:dark;min-width:160px}
.adm input[type=file]{font:12px system-ui,sans-serif;color:var(--mu);flex:3 1 260px}
.ares{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--ln)}
.ares .grow{display:flex;gap:8px;align-items:baseline;min-width:0}
.adm input:not([type=checkbox]):not([type=color]):not([type=file]),.adm textarea{all:unset;box-sizing:border-box;height:34px;padding:0 10px;border-radius:9px;background:var(--p2);border:1px solid var(--ln);color:var(--tx);font-size:13px;min-width:0}
.adm input:focus,.adm textarea:focus{border-color:var(--ac)}
.adm textarea{display:block;width:100%;height:240px;padding:10px;font:12px/1.5 ui-monospace,monospace;white-space:pre;overflow:auto}
.adm input[type=datetime-local]{color-scheme:dark;flex:0 1 210px}
.arow{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}
.arow input{flex:1 1 160px}
.arow input.wide{flex:3 1 260px}
.alab{display:block;font-size:12px;font-weight:650;color:var(--mu);margin:14px 0 6px}
.arow .alab{display:inline;margin:0 2px 0 6px}
.icons,.sws{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.icn{all:unset;cursor:pointer;width:34px;height:34px;border-radius:9px;background:var(--p2);display:grid;place-items:center;color:var(--mu);border:1px solid var(--ln)}
.icn.on{color:var(--tx);border-color:var(--ac);background:var(--p3)}
.sw{all:unset;cursor:pointer;width:24px;height:24px;border-radius:50%;border:2px solid transparent;box-sizing:border-box}
.sw.on{border-color:var(--tx)}
.sws input[type=color]{width:34px;height:28px;border:0;background:none;padding:0;cursor:pointer}
.abn{padding:12px;border:1px solid var(--ln);border-radius:12px;margin-top:12px;background:var(--bg)}
.seg.mini{margin:0}
.seg.mini button{padding:4px 10px;font-size:12px}
.chk{display:inline-flex;align-items:center;gap:6px;margin:6px 16px 0 0;font-size:13px;cursor:pointer}
.amsg{font-size:12px;color:var(--mu)}
.amsg.ok{color:var(--gd)}
.amsg.err{color:var(--bad)}
a.pcls{cursor:pointer}
a.pcls:hover{text-decoration:underline}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px 14px;margin-top:4px}
.pset{display:flex;align-items:center;gap:10px}
.pset label{width:92px;flex:none;font-weight:600;font-size:13px;color:var(--mu)}
.pset input{all:unset;box-sizing:border-box;flex:1;min-width:0;height:34px;padding:0 10px;border-radius:9px;background:var(--p2);border:1px solid var(--ln);color:var(--tx);font-size:13px}
.pset input:focus{border-color:var(--ac)}
.pset input::placeholder{color:var(--mu)}
.upd{font-size:12px;color:var(--mu)}
.ib{all:unset;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border-radius:9px;color:var(--mu);background:var(--p2)}
.ib:hover{color:var(--tx);background:var(--p3)}
.ib.spinning svg{animation:sp .8s linear infinite}
.ct{flex:1;overflow:auto;padding:22px 24px}
.ct::-webkit-scrollbar{width:12px}
.ct::-webkit-scrollbar-thumb{background:var(--p3);border-radius:10px;border:3px solid var(--bg)}
.hello{margin-bottom:18px}
.hello .h{font-size:24px;font-weight:700;letter-spacing:-.01em}
.card{background:var(--p1);border:1px solid var(--ln);border-radius:14px;padding:16px 18px}
.card h2{font-size:12px;font-weight:650;color:var(--mu);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
.card h2 a,.card h2 span{text-transform:none;letter-spacing:0;font-weight:550;color:var(--act);cursor:pointer;font-size:13px}
.card h2 span{color:var(--mu);cursor:default}
.tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}
.card{min-width:0}
.tile .k{font-size:12px;color:var(--mu);font-weight:550}
.tile .v{font-size:30px;font-weight:700;margin:2px 0;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.cols{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;align-items:start}
.stack{display:flex;flex-direction:column;gap:16px;min-width:0}
.row{display:flex;align-items:center;gap:12px;padding:10px 8px;margin:0 -8px;border-top:1px solid var(--ln)}
.row:first-of-type{border-top:0}
a.row:hover,.row.click:hover{background:var(--p2);border-radius:10px;border-top-color:transparent}
.row.click{cursor:pointer}
.row a.grow:hover .t{color:var(--act)}
.dot{width:10px;height:10px;border-radius:50%;flex:none}
.grow{flex:1;min-width:0}
.t{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wrap{white-space:normal}
.chip{font-size:11px;font-weight:650;padding:2px 9px;border-radius:20px;white-space:nowrap;background:var(--p3);color:var(--mu)}
.chip.bad{background:rgba(242,99,122,.15);color:var(--bad)}
.chip.wn{background:rgba(245,181,70,.15);color:var(--wn)}
.chip.gd{background:rgba(62,207,142,.15);color:var(--gd)}
.chip.ac{background:rgba(124,156,255,.15);color:var(--act)}
.due{font-size:12px;text-align:right;white-space:nowrap;min-width:118px}
.gr{text-align:right;min-width:64px}
.big{font-size:28px;font-weight:700;letter-spacing:-.02em;line-height:1.1}
.bar{height:6px;background:var(--p3);border-radius:6px;overflow:hidden}
.bar i{display:block;height:100%;border-radius:6px}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.cc{cursor:pointer;padding:0;overflow:hidden;transition:transform .12s,border-color .12s}
.cc:hover{transform:translateY(-2px);border-color:var(--p3)}
.cc .top{height:6px}
.cc .in{padding:14px 16px 16px}
.cg{display:flex;align-items:flex-end;justify-content:space-between;margin:14px 0 10px}
.meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.ch{display:flex;gap:18px;align-items:center;margin:14px 0 16px;padding:18px;border-left:6px solid}
.links{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.btn{all:unset;cursor:pointer;padding:7px 14px;border-radius:9px;background:var(--p2);color:var(--tx);font-weight:600;font-size:13px;white-space:nowrap}
.btn:hover{background:var(--p3)}
.btn.pri{background:var(--ac);color:#0f1218}
.empty{color:var(--mu);padding:22px 8px;text-align:center}
.spin{width:28px;height:28px;border:3px solid var(--p3);border-top-color:var(--ac);border-radius:50%;animation:sp .8s linear infinite;margin:48px auto}
.seg{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
.seg button{all:unset;cursor:pointer;padding:6px 13px;border-radius:20px;background:var(--p2);color:var(--mu);font-size:13px;font-weight:550}
.seg button:hover{color:var(--tx)}
.seg button.on{background:var(--ac);color:#0f1218}
.seg b{font-weight:700;margin-left:4px;opacity:.8}
.grp{font-size:12px;font-weight:650;color:var(--mu);text-transform:uppercase;letter-spacing:.07em;margin:18px 0 4px}
.grp:first-child{margin-top:0}
.cb{all:unset;cursor:pointer;width:18px;height:18px;border-radius:6px;border:2px solid var(--p3);flex:none;display:grid;place-items:center;color:#0f1218}
.cb:hover{border-color:var(--gd)}
.cb.on{background:var(--gd);border-color:var(--gd)}
.cbx{width:18px;flex:none}
.calh,.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}
.calh{font-size:12px;color:var(--mu);font-weight:650;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;padding-left:4px}
.cal{margin-bottom:8px}
.day{background:var(--p1);border:1px solid var(--ln);border-radius:12px;min-height:128px;padding:8px;min-width:0}
.day.past{opacity:.55}
.day.today{border-color:var(--ac)}
.day .dn{font-size:13px;font-weight:650;color:var(--mu);margin:0 0 6px 2px}
.day.today .dn{color:var(--act)}
.ev{display:block;font-size:12px;padding:4px 7px;border-radius:7px;margin-bottom:4px;background:var(--p2);border-left:3px solid;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ev:hover{background:var(--p3)}
.ev.dn2{opacity:.5;text-decoration:line-through}
.ghero{padding:22px;border-radius:18px;border:1px solid var(--ln);margin-bottom:16px;
background:radial-gradient(120% 160% at 0% 0%,rgba(124,156,255,.2),transparent 55%),radial-gradient(120% 160% at 100% 100%,rgba(62,207,142,.12),transparent 55%),var(--p1)}
.ghero .gh{font-size:24px;font-weight:750;letter-spacing:-.02em}
.ghead{display:flex;align-items:flex-start;gap:12px}
.ghead .btn{display:inline-flex;align-items:center;gap:7px;flex:none}
.ghero .sub{margin:2px 0 16px}
.gfind{display:flex;gap:10px;flex-wrap:wrap}
.gsearch{flex:1;min-width:220px;display:flex;align-items:center;gap:10px;height:50px;padding:0 14px;border-radius:14px;background:var(--bg);border:1px solid var(--ln);color:var(--mu);transition:border-color .12s,box-shadow .12s}
.gsearch:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px rgba(124,156,255,.18)}
.gsearch input{all:unset;flex:1;min-width:0;color:var(--tx);font-size:15px}
.gsearch input::placeholder{color:var(--mu)}
.kbd{font:12px ui-monospace,monospace;background:var(--p3);color:var(--mu);border-radius:6px;padding:2px 8px}
.btn.big{height:50px;padding:0 20px;border-radius:14px;display:inline-flex;align-items:center;gap:8px;box-sizing:border-box}
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:14px;margin-bottom:6px}
.gt{all:unset;box-sizing:border-box;display:block;cursor:pointer;position:relative;aspect-ratio:1;border-radius:20px;overflow:hidden;background:var(--p2);box-shadow:0 0 0 1px var(--ln);transition:transform .14s,box-shadow .14s}
.gt[hidden]{display:none}
.gt:hover,.gt:focus-visible{transform:translateY(-3px) scale(1.03);box-shadow:0 0 0 2px var(--ac),0 14px 30px rgba(0,0,0,.45)}
.gt .art{position:absolute;inset:0;display:grid;place-items:center;font-size:36px;font-weight:800;letter-spacing:-.02em;color:rgba(15,18,24,.78)}
.gt .art img{width:100%;height:100%;object-fit:cover;display:block}
.gt .art .aimg{position:absolute;inset:0;z-index:1}
.gt .tn{position:absolute;left:0;right:0;bottom:0;padding:26px 11px 10px;background:linear-gradient(transparent,rgba(6,8,12,.88));color:#fff;font-weight:650;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gt .art.gen{color:#fff}
.art .pat{position:absolute;inset:0;width:100%;height:100%;opacity:.14}
.art .ico{position:absolute;right:-16%;bottom:-16%;width:74%;height:74%;fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:.3;transform:rotate(-14deg)}
.art .gtitle{position:relative;padding:0 12px;max-width:100%;text-align:center;font-weight:850;line-height:1.05;letter-spacing:-.01em;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.4);overflow-wrap:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gbar{display:flex;gap:10px;align-items:center;width:100%;max-width:560px}
.play{display:flex;flex-direction:column;gap:12px;height:100%;min-height:420px}
.gbar.wide{max-width:none}
.frame{flex:1;position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--ln);background:var(--p1)}
.gframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.lic{position:absolute;inset:0;overflow:auto;margin:0;padding:20px;background:var(--p1);color:var(--mu);font:12px/1.5 ui-monospace,monospace;white-space:pre-wrap}
.note{color:var(--mu);font-size:12px;text-align:center}
.nc{max-width:460px;margin:50px auto;text-align:center;padding:30px}
.nc .logo{width:52px;height:52px;border-radius:14px;margin:0 auto 14px}
.nc h3{font-size:18px;margin-bottom:6px}
.nc p{margin-bottom:18px;white-space:normal}
.ann .sub{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.ghero.shero{background:radial-gradient(120% 160% at 0% 0%,rgba(62,207,142,.18),transparent 55%),radial-gradient(120% 160% at 100% 100%,rgba(124,156,255,.14),transparent 55%),var(--p1)}
.shead{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}
.shead .gh{font-size:22px;font-weight:750;letter-spacing:-.02em}
.shead .sub{margin-top:1px}
.shead .gsearch{flex:1 1 300px;height:42px;min-width:220px;max-width:460px;margin-left:auto;background:var(--p1);border-radius:12px}
.sbar{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.sbar button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:20px;background:var(--p1);border:1px solid var(--ln);color:var(--mu);font-size:12.5px;font-weight:550}
.sbar button svg{width:14px;height:14px}
.sbar button:hover{color:var(--tx)}
.sbar button.on{background:var(--ac);border-color:var(--ac);color:#0f1218}
.sbar b{font-weight:700;opacity:.75}
.sbar .sep{width:1px;align-self:stretch;background:var(--ln);margin:2px 4px}
.scont{margin-bottom:16px}
.scont[hidden]{display:none}
.ccards{display:flex;flex-wrap:wrap;gap:8px}
.ccard{display:flex;align-items:center;gap:10px;padding:7px 12px 7px 7px;border-radius:12px;background:var(--p1);border:1px solid var(--ln);cursor:pointer;max-width:280px;min-width:0}
.ccard:hover,.ccard:focus-visible{border-color:var(--ac);outline:none}
.ccard .t{font-size:13px}
.ccard .sub{font-size:11.5px}
.spans{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;align-items:start;margin-bottom:14px}
.cpan{min-width:0;background:var(--p1);border:1px solid var(--ln);border-radius:14px;overflow:hidden}
.cpan[hidden]{display:none}
.cph{display:flex;align-items:center;gap:10px;padding:11px 12px 9px;border-top:3px solid var(--c)}
.cph .ssi{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;color:#0f1218;flex:none;background:var(--c)}
.cph .ssi svg{width:17px;height:17px}
.cph .chip{font-size:10.5px;padding:1px 8px}
.cph .t{white-space:normal;line-height:1.25}
.rr{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;cursor:pointer;border-top:1px solid var(--ln);min-width:0}
.rr:hover,.rr:focus-visible{background:var(--p2);outline:none}
.rr[hidden]{display:none}
.rri{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;flex:none;background:color-mix(in srgb,var(--c) 22%,var(--p2));color:var(--c)}
.rri svg{width:16px;height:16px}
.rr .t,.ccard .t{font-size:13.5px;line-height:1.3}
.rr .sub{font-size:11.5px;display:flex;gap:6px;align-items:center}
.chip.new{background:var(--ac);color:#0f1218;font-size:10px;padding:0 7px}
.rnt{width:28px;height:28px;flex:none;background:transparent;opacity:0;transition:opacity .12s}
.rr:hover .rnt,.rr:focus-within .rnt{opacity:1}
.sneed{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:9px 12px;border-radius:12px;border:1px dashed var(--p3);margin-bottom:14px;font-size:12.5px}
.sneed .t{margin-right:2px;font-size:12.5px}
.sneed button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;background:var(--p2);font-size:12px;font-weight:600}
.sneed button:hover{background:var(--p3)}
.sneed button svg{width:12px;height:12px;color:var(--act)}
.snone{text-align:center;padding:24px 12px;color:var(--mu)}
.snone[hidden]{display:none}
.snone .btn{margin-top:12px;display:inline-flex;gap:6px;align-items:center}
.sreq{margin-top:6px}
.gt .nb{position:absolute;top:8px;left:8px;z-index:1;padding:2px 7px;border-radius:7px;background:var(--ac);color:#0f1218;font-size:10px;font-weight:800;letter-spacing:.06em;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.grp .grpn{margin-left:8px;font-weight:550;text-transform:none;letter-spacing:0;opacity:.8}
.gload{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:var(--p1);transition:opacity .25s}
.gload.done{opacity:0;pointer-events:none}
.gload .gla{width:104px;flex:none;pointer-events:none;margin-bottom:4px;box-shadow:0 12px 30px rgba(0,0,0,.35)}
.gload .gla .gtitle{font-size:15px!important}
.gload .spin{margin:4px 0 0;width:26px;height:26px}
.gload .glt{font-size:17px;font-weight:700}
.gload .gls{max-width:430px;color:var(--mu);font-size:13px;line-height:1.5;white-space:normal}
.gload .gltime{font-size:12px;color:var(--mu);font-variant-numeric:tabular-nums;min-height:1em}
.gload .glb{display:flex;gap:8px;margin-top:2px}
.gload .glb[hidden]{display:none}
.cupd[hidden]{display:none}
.atop{margin-bottom:12px}
.ahd{display:flex;align-items:center;gap:12px}
.ahd .logo{width:40px;height:40px;border-radius:11px;flex:none}
.atop .amsg{margin-top:10px;display:flex;align-items:center;gap:8px;font-size:13px}
.atop .amsg:empty{display:none}
.aspin{width:14px;height:14px;border:2px solid var(--p3);border-top-color:var(--ac);border-radius:50%;animation:sp .8s linear infinite;flex:none}
.atabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.atabs button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:10px;background:var(--p1);border:1px solid var(--ln);color:var(--mu);font-weight:600;font-size:13px}
.atabs button svg{width:15px;height:15px}
.atabs button:hover{color:var(--tx)}
.atabs button.on{background:var(--ac);border-color:var(--ac);color:#0f1218}
.atabs .badge{margin-left:2px}
.adraft{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin-bottom:14px;background:color-mix(in srgb,var(--wn) 14%,transparent);border:1px solid color-mix(in srgb,var(--wn) 45%,transparent)}
.adrop{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:18px;margin-top:12px;border-radius:12px;border:2px dashed var(--p3);text-align:center;cursor:pointer;color:var(--mu)}
.adrop:hover{border-color:var(--ac)}
.adrop.pulse{border-color:var(--ac);box-shadow:0 0 0 4px color-mix(in srgb,var(--ac) 25%,transparent)}
.adm .adrop input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.adrop b{color:var(--tx)}
.adrop svg{width:16px;height:16px;vertical-align:-3px;margin-right:4px}
.afiles{font-size:12px;color:var(--act);font-weight:600}
.acat{border-top:1px solid var(--ln);padding:12px 0 6px}
.acath{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.acath .ssi{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:#0f1218;flex:none}
.acath .ssi svg{width:17px;height:17px}
.acat .ares{margin-left:42px;flex-wrap:wrap}
.aempty{padding:6px 0 4px 42px}
.btn.sm{padding:5px 10px;font-size:12px}
.btn.danger{background:var(--bad);color:#fff}
.btn svg{width:14px;height:14px;vertical-align:-2px;margin-right:4px}
.adm .ares select{height:28px;min-width:0;width:auto;font-size:12px;padding:0 6px}
.adm .ares input.grow:not([type=checkbox]):not([type=color]):not([type=file]),.adm .acath input.grow:not([type=checkbox]):not([type=color]):not([type=file]){flex:1 1 200px;height:30px}
.adm .arow>input:not([type=checkbox]):not([type=color]):not([type=file]):not([type=datetime-local]){flex:1 1 180px}
.adm .arow>input.wide:not([type=checkbox]):not([type=color]):not([type=file]){flex:3 1 280px}
.ares.dim .t{opacity:.55}
.ares .grow .chip{flex:none}
a.ares:hover .t{color:var(--act)}
.gthumb{width:34px;height:34px;border-radius:9px;overflow:hidden;flex:none;display:grid;place-items:center;font-weight:800;color:#fff;font-size:14px}
.gthumb img{width:100%;height:100%;object-fit:cover}
.asteps{margin:10px 0 4px 20px;display:flex;flex-direction:column;gap:6px;font-size:13px}
.asteps a{color:var(--act);text-decoration:underline}
.bd.lib{background:var(--bg);backdrop-filter:none;animation:none}
.bd.lib .win{width:calc(100vw / var(--z,1));height:calc(100vh / var(--z,1));border:0;border-radius:0;box-shadow:none;animation:none;grid-template-columns:1fr;grid-template-rows:1fr}
.bd.lib .sb,.bd.lib [data-act="close"]{display:none}
.sbl{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:10px}
.sbl .cupd{margin-top:0;gap:5px}
.cupd.on{color:var(--tx)}
.ib.sset{display:none}
.bd.cd-full .win{width:calc(100vw / var(--z,1));height:calc(100vh / var(--z,1));border:0;border-radius:0}
.bd.th-light{--bg:#f4f6fa;--p1:#fff;--p2:#eef1f6;--p3:#e1e6ef;--ln:#dde2eb;--tx:#151922;--mu:#5c6476;--gd:#16955a;--wn:#c47f0a;--bad:#d63f5a;--act:color-mix(in srgb,var(--ac) 58%,#000)}
.bd.th-light .win{box-shadow:0 30px 80px rgba(0,0,0,.28)}
.bd.th-light .adm select,.bd.th-light .adm input[type=datetime-local]{color-scheme:light}
.bd.th-mid{--bg:#000;--p1:#0b0c10;--p2:#13151b;--p3:#1d2029;--ln:#1b1e26}
.bd.cd-still,.bd.cd-still *{animation:none!important;transition:none!important}
.bd.cd-blur .gr,.bd.cd-blur .gtile .v,.bd.cd-blur .cg,.bd.cd-blur .row .bar,.bd.cd-blur .cc .bar,.bd.cd-blur .pts{filter:blur(7px);transition:filter .15s}
.bd.cd-blur .gr:hover,.bd.cd-blur .gtile:hover .v,.bd.cd-blur .cg:hover,.bd.cd-blur .row:hover .bar,.bd.cd-blur .cc:hover .bar,.bd.cd-blur .pts:hover{filter:none}
.bd.tl-s .tgrid{grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px}
.bd.tl-l .tgrid{grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:16px}
.sset-c{margin-bottom:16px}
.srow,.stog{display:flex;align-items:center;gap:16px;padding:12px 0;border-top:1px solid var(--ln)}
.card h2+.srow,.card h2+.stog{border-top:0;padding-top:4px}
.srow>.grow .sub,.stog>.grow .sub{display:block;margin-top:1px}
.stog{cursor:pointer}
.stog input{position:absolute;opacity:0;width:1px;height:1px}
.stog i{position:relative;flex:none;width:40px;height:23px;border-radius:12px;background:var(--p3);transition:background .15s}
.stog i::after{content:'';position:absolute;top:3px;left:3px;width:17px;height:17px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .15s}
.stog input:checked+i{background:var(--ac)}
.stog input:checked+i::after{transform:translateX(17px)}
.stog input:focus-visible+i{outline:2px solid var(--ac);outline-offset:2px}
.srow .seg.mini{flex-wrap:wrap;justify-content:flex-end}
.srow .sws{justify-content:flex-end}
.thms{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.thc{all:unset;box-sizing:border-box;cursor:pointer;width:92px;border-radius:12px;border:2px solid var(--ln);overflow:hidden;font-size:12px;font-weight:650;text-align:center;color:var(--tx)}
.thc.on{border-color:var(--ac)}
.thc .pv{display:flex;gap:4px;height:44px;padding:6px}
.thc .pv i{flex:1;border-radius:5px}
.thc .pv i:first-child{flex:.45}
.thc span{display:block;padding:5px 0 6px}
.sacts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
@media (max-width:780px){
.ib.sset{display:grid}
.upd,.sset-c h2 span{display:none}
.srow{flex-wrap:wrap}
.win{grid-template-columns:1fr;grid-template-rows:auto 1fr;width:calc(100vw / var(--z,1));height:calc(100vh / var(--z,1));border-radius:0}
.sb{flex-direction:row;padding:8px;border-right:0;border-bottom:1px solid var(--ln);overflow-x:auto}
.brand,.sbf{display:none}.nav{flex-direction:row}
.tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.cols{grid-template-columns:minmax(0,1fr)}
.calh{display:none}.cal{grid-template-columns:repeat(2,minmax(0,1fr))}
.hd h1,.omni>.kbd{display:none}
.due{min-width:0}.ct{padding:16px}
}`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = html => { try { return new DOMParser().parseFromString(html || '', 'text/html').body.textContent.replace(/\s+/g, ' ').trim(); } catch (e) { return ''; } };
const sod = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const fmtTime = (d, sec) => d.toLocaleTimeString([], Object.assign({ hour: 'numeric', minute: '2-digit', hour12: !P.clock24 }, sec ? { second: '2-digit' } : {}));
const fmtNum = n => Math.round(n * 100) / 100;
const fmtDue = iso => {
if (!iso) return 'No due date';
const d = new Date(iso), diff = Math.round((sod(d) - sod(new Date())) / DAY);
const day = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday'
: diff > 1 && diff < 7 ? d.toLocaleDateString([], { weekday: 'long' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
return day + ', ' + fmtTime(d);
};
const rel = iso => {
if (!iso) return '';
const ms = new Date(iso) - Date.now(), a = Math.abs(ms), h = a / 36e5;
const s = h < 1 ? Math.max(1, Math.round(a / 6e4)) + 'm' : h < 48 ? Math.round(h) + 'h' : Math.round(h / 24) + 'd';
return ms < 0 ? s + ' ago' : 'in ' + s;
};
const link = (url, cls, inner) => url ? `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="${cls}">${inner}</div>`;
const empty = t => `<div class="empty">${t}</div>`;
const LETTERS = [[93, 'A', 4], [90, 'A-', 3.7], [87, 'B+', 3.3], [83, 'B', 3], [80, 'B-', 2.7], [77, 'C+', 2.3], [73, 'C', 2], [70, 'C-', 1.7], [67, 'D+', 1.3], [63, 'D', 1], [60, 'D-', 0.7], [-1e9, 'F', 0]];
const letterOf = s => LETTERS.find(l => s >= l[0]);
const scoreColor = s => s == null ? 'var(--mu)' : s >= 90 ? 'var(--gd)' : s >= 80 ? 'var(--ac)' : s >= 70 ? 'var(--wn)' : 'var(--bad)';
const PAL = ['#7c9cff', '#3ecf8e', '#f5b546', '#f2637a', '#b48cff', '#4cc9f0', '#ff8f5a', '#e46fd0'];
const TYPE = { assignment: 'Assignment', quiz: 'Quiz', discussion_topic: 'Discussion', wiki_page: 'Page', planner_note: 'Note' };
const byId = id => S.courses.find(c => c.id === Number(id));
const sortWork = l => l.slice().sort((a, b) => (a.due ? +new Date(a.due) : 9e15) - (b.due ? +new Date(b.due) : 9e15));
async function api(path, pages = 10) {
let url = path, out = null;
for (let i = 0; i < pages && url; i++) {
const r = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
if (!r.ok) throw new Error(r.status === 401 ? 'You need to be logged in to Canvas.' : 'Canvas returned an error (' + r.status + ').');
const data = JSON.parse((await r.text()).replace(/^while\(1\);/, ''));
if (!Array.isArray(data)) return data;
out = (out || []).concat(data);
const m = (r.headers.get('Link') || '').match(/<([^>]+)>;\s*rel="next"/);
url = m ? m[1] : null;
}
return out || [];
}
function decorate(c, colors) {
const es = c.enrollments || [];
const e = es.find(x => /student/i.test(x.type || '')) || es[0] || {};
let score = e.computed_current_score;
if (score == null) score = e.current_period_computed_current_score;
const grade = e.computed_current_grade || e.current_period_computed_current_grade || (score != null ? letterOf(score)[1] : null);
return {
id: Number(c.id), name: c.name, code: c.course_code, term: c.term && c.term.name && !/default/i.test(c.term.name) ? c.term.name : '',
teachers: (c.teachers || []).map(t => t.display_name), score: score == null ? null : fmtNum(score), grade,
color: colors['course_' + c.id] || PAL[Number(c.id) % PAL.length], hidden: !!c.hide_final_grades
};
}
function refreshOpen() {
S.work.forEach(x => {
x.local = S.done.has(x.key);
x.done = x.cdone || x.local;
x.open = !x.submitted && !x.excused && !x.graded && !x.done;
});
}
async function load() {
if (!isCanvas || S.loading) return;
S.loading = true; S.error = null; paintChrome();
if (!S.loadedAt) renderMain();
try {
const now = Date.now(), iso = d => new Date(now + d * DAY).toISOString();
const [me, courses, colors] = await Promise.all([
api('/api/v1/users/self/profile'),
api('/api/v1/courses?enrollment_state=active&include[]=total_scores&include[]=current_grading_period_scores&include[]=term&include[]=teachers&per_page=100'),
api('/api/v1/users/self/colors').catch(() => ({}))
]);
S.me = me;
S.courses = courses.filter(c => c.name && !c.access_restricted_by_date).map(c => decorate(c, (colors && colors.custom_colors) || {}));
const codes = S.courses.map(c => 'context_codes[]=course_' + c.id).join('&');
const [planner, missing, stream, ann] = await Promise.all([
api('/api/v1/planner/items?start_date=' + iso(-14) + '&end_date=' + iso(42) + '&per_page=100').catch(() => []),
api('/api/v1/users/self/missing_submissions?filter[]=submittable&per_page=100').catch(() => []),
api('/api/v1/users/self/activity_stream?only_active_courses=true&per_page=80', 1).catch(() => []),
codes ? api('/api/v1/announcements?' + codes + '&start_date=' + iso(-21) + '&end_date=' + iso(1) + '&per_page=40', 2).catch(() => []) : []
]);
const work = new Map();
planner.forEach(p => {
if (!TYPE[p.plannable_type]) return;
const pl = p.plannable || {}, sb = p.submissions || {};
if ((p.plannable_type === 'discussion_topic' || p.plannable_type === 'wiki_page') && !pl.due_at && !pl.todo_date) return;
const c = byId(p.course_id);
work.set(p.plannable_type + ':' + p.plannable_id, {
key: p.plannable_type + ':' + p.plannable_id, title: pl.title || pl.name || 'Untitled', type: p.plannable_type,
due: pl.due_at || pl.todo_date || p.plannable_date, url: p.html_url, course: c, courseName: c ? c.name : (p.context_name || 'Personal'),
points: pl.points_possible, submitted: !!sb.submitted, graded: !!sb.graded, missing: !!sb.missing, late: !!sb.late, excused: !!sb.excused,
cdone: !!(p.planner_override && p.planner_override.marked_complete)
});
});
missing.forEach(a => {
const k = 'assignment:' + a.id;
const same = work.get(k) || [...work.values()].find(w => w.title === a.name && w.course && w.course.id === Number(a.course_id));
if (same) { same.missing = true; return; }
const c = byId(a.course_id);
if (c) work.set(k, { key: k, title: a.name, type: 'assignment', due: a.due_at, url: a.html_url, course: c, courseName: c.name, points: a.points_possible, missing: true });
});
S.work = [...work.values()];
refreshOpen();
S.grades = stream.filter(s => s.type === 'Submission' && s.score != null && byId(s.course_id)).map(s => ({
title: (s.assignment && s.assignment.name) || s.title, course: byId(s.course_id), score: s.score,
points: s.assignment && s.assignment.points_possible, grade: s.grade, url: s.html_url, at: s.graded_at || s.updated_at
})).sort((a, b) => new Date(b.at) - new Date(a.at));
S.ann = ann.map(a => ({
title: a.title, text: plain(a.message).slice(0, 220), at: a.posted_at, url: a.html_url,
author: a.author && a.author.display_name, course: byId((a.context_code || '').replace('course_', ''))
})).sort((a, b) => new Date(b.at) - new Date(a.at));
S.loadedAt = new Date();
} catch (e) {
S.error = e.message || String(e);
}
S.loading = false;
paintChrome();
if (!['games', 'play', 'read', 'settings'].includes(S.view)) renderMain(true);
}
function loadCourse(id) {
S.courseCache[id] = { loading: true };
api('/api/v1/courses/' + id + '/assignments?include[]=submission&order_by=due_at&per_page=100')
.then(list => { S.courseCache[id] = { list }; })
.catch(e => { S.courseCache[id] = { error: e.message }; })
.then(() => { if (S.view === 'course' && S.courseId === id) renderMain(true); });
}
const host = document.createElement('div');
host.id = ID;
host.style.cssText = 'position:fixed;inset:0;z-index:2147483647';
const root = host.attachShadow({ mode: 'open' });
root.innerHTML = `<style>${CSS}</style><div class="bd${LIB ? ' lib' : ''}"><div class="win">
<aside class="sb"><div class="brand"><span class="logo">${I.cap}</span><span class="bname">Class Dash</span></div><nav class="nav"></nav><div class="sbf"><div class="clock"></div><div class="date"></div><div class="sched" data-go="schedule" title="Open the bell schedule"></div><div class="sbl"><button class="cupd" data-act="settings" title="Settings (saved in this browser)">${I.gear.replace('width="18" height="18"', 'width="13" height="13"')}Settings</button><button class="cupd" data-act="checkupd">Check for updates</button><button class="cupd" data-act="admin" hidden title="Admin (only shows on your computers)">${I.key.replace('width="18" height="18"', 'width="13" height="13"')}Admin</button></div><div class="ver"></div></div></aside>
<main class="mn"><header class="hd"><h1></h1>
<div class="omni"><span class="oi">${I.search}</span><input data-omni placeholder="Search Class Dash, or go to study.ecology-study" autocomplete="off" spellcheck="false" aria-label="Search or go to"><span class="kbd">Ctrl K</span><div class="odrop" hidden></div></div><span class="upd"></span>
<button class="ib" data-act="refresh" title="Refresh">${I.refresh}</button><button class="ib sset" data-act="settings" title="Settings">${I.gear}</button><button class="ib" data-act="close" title="Close (Esc)">${I.x}</button></header>
<div class="bnrs"></div>
<div class="ubar" hidden><span class="uic">${I.refresh}</span><div class="grow"><div class="t">Update available</div><div class="sub unote"></div></div>
<button class="btn" data-act="later">Later</button><button class="btn pri" data-act="update">Update now</button></div>
<div class="ct"></div></main></div></div>`;
document.body.appendChild(host);
const $ = s => root.querySelector(s);
const NAV = [['home', 'Overview', I.home], ['todo', 'To-Do', I.check], ['grades', 'Grades', I.chart], ['classes', 'Classes', I.book], ['calendar', 'Calendar', I.cal], ['schedule', 'Schedule', I.clock], ['hallpass', 'Hall Pass', I.pass], ['study', 'Study', I.study], ['games', 'Games', I.game]];
const navOf = v => v === 'course' ? 'classes' : v === 'play' ? 'games' : v === 'read' ? 'study' : v;
const usesLib = v => v === 'games' || v === 'study';
function paintChrome() {
const overdue = S.work.filter(x => x.open && x.due && new Date(x.due) < Date.now()).length;
$('.nav').innerHTML = shownNav().map(([v, label, icon]) => `<button data-go="${v}" class="${navOf(S.view) === v ? 'on' : ''}">${icon}${label}${v === 'todo' && overdue ? `<span class="badge">${overdue}</span>` : ''}</button>`).join('');
const c = S.view === 'course' && byId(S.courseId), g = S.view === 'play' && PACK.find(x => x.id === S.game), dc = S.view === 'read' && DOCS.find(x => x.id === S.doc);
$('.hd h1').textContent = c ? c.name : g ? g.name : dc ? dc.name : S.view === 'admin' ? 'Admin' : S.view === 'settings' ? 'Settings' : (NAV.find(n => n[0] === S.view) || [, ''])[1];
root.querySelectorAll('[data-act="settings"]').forEach(b => b.classList.toggle('on', S.view === 'settings'));
root.querySelectorAll('[data-act="admin"]').forEach(b => b.classList.toggle('on', S.view === 'admin'));
$('.upd').textContent = usesLib(S.view) ? (S.libLoading ? 'Checking GitHub…' : S.lib ? 'Updated ' + fmtTime(new Date(S.lib.at)) : '')
: S.loading && S.loadedAt ? 'Refreshing…' : S.loadedAt && isCanvas && S.view !== 'play' && S.view !== 'read' ? 'Updated ' + fmtTime(S.loadedAt) : '';
const rb = $('[data-act="refresh"]');
rb.style.display = isCanvas || usesLib(S.view) ? '' : 'none';
rb.classList.toggle('spinning', usesLib(S.view) ? S.libLoading : S.loading);
paintOmni();
}
function renderMain(keepScroll) {
const ct = $('.ct'), top = ct.scrollTop, v = S.view;
paintChrome();
if (v === 'games' || v === 'study') {
// keep the cursor in the search box or a request box when the list re-renders
const a = root.activeElement, keep = a && a.matches('[data-search],[data-req]') ? (a.matches('[data-search]') ? '[data-search]' : `[data-req="${a.dataset.req}"]`) : null;
ct.innerHTML = v === 'games' ? vGames() : vStudy();
if (v === 'games') filterGames(); else filterStudy();
const box = keep && $(keep);
if (box) { box.focus(); if (box.setSelectionRange) box.setSelectionRange(box.value.length, box.value.length); }
loadLib();
}
else if (v === 'hallpass') ct.innerHTML = vHallPass();
else if (v === 'admin') ct.innerHTML = S.draft ? vAdmin() : empty('Nothing here.');
else if (v === 'settings') ct.innerHTML = vSettings();
else if (v === 'play') { ct.innerHTML = vPlay(); startPack(ct); }
else if (v === 'read') { ct.innerHTML = vRead(); startDoc(ct, S.doc); }
else if (v === 'schedule') ct.innerHTML = vSchedule();
else if (!isCanvas) ct.innerHTML = vNoCanvas();
else if (!S.loadedAt) ct.innerHTML = S.error ? vError() : '<div class="spin"></div>';
else ct.innerHTML = { home: vHome, todo: vTodo, grades: vGrades, classes: vClasses, calendar: vCal, course: vCourse }[v]();
ct.scrollTop = keepScroll ? top : 0;
}
const go = v => { S.view = v; if (VIEWS.includes(v)) store.set('lastView', v); renderMain(); };
const tile = (k, v, s, color, g) => `<div class="card tile${g ? ' gtile' : ''}"><div class="k">${k}</div><div class="v" style="color:${color || 'var(--tx)'}">${v}</div><div class="sub">${s}</div></div>`;
function status(x) {
const now = Date.now(), d = x.due ? new Date(x.due) : null;
if (x.done) return ['gd', 'Done'];
if (x.excused) return ['', 'Excused'];
if (x.graded) return ['gd', 'Graded'];
if (x.submitted) return x.late ? ['wn', 'Late'] : ['ac', 'Submitted'];
if (x.missing) return ['bad', 'Missing'];
if (d && d < now) return ['bad', 'Overdue'];
if (d && d - now < DAY) return ['wn', 'Due soon'];
return ['', TYPE[x.type] || 'Assignment'];
}
function workRow(x, check) {
const st = status(x), canCheck = check && !x.submitted && !x.graded && !x.excused && !x.cdone;
const box = !check ? '' : canCheck ? `<button class="cb ${x.local ? 'on' : ''}" data-done="${esc(x.key)}" title="${x.local ? 'Mark as not done' : 'Mark as done'}">${x.local ? I.tick : ''}</button>` : '<span class="cbx"></span>';
return `<div class="row">${box}<span class="dot" style="background:${x.course ? esc(x.course.color) : 'var(--mu)'}"></span>
${link(x.url, 'grow', `<div class="t">${esc(x.title)}</div><div class="sub">${esc(x.courseName)}${x.points ? ' · ' + fmtNum(x.points) + ' pts' : ''}</div>`)}
<span class="chip ${st[0]}">${st[1]}</span><div class="due">${fmtDue(x.due)}<div class="sub">${rel(x.due)}</div></div></div>`;
}
const gradeRow = g => {
const pct = g.points ? g.score / g.points * 100 : null;
return link(g.url, 'row', `<span class="dot" style="background:${esc(g.course.color)}"></span><div class="grow"><div class="t">${esc(g.title)}</div><div class="sub">${esc(g.course.name)} · ${rel(g.at)}</div></div>
<div class="gr"><div class="t" style="color:${scoreColor(pct)}">${fmtNum(g.score)}${g.points ? '/' + fmtNum(g.points) : ''}</div><div class="sub">${pct == null ? esc(g.grade || '') : Math.round(pct) + '%'}</div></div>`);
};
const annRow = a => link(a.url, 'row ann', `<span class="dot" style="background:${a.course ? esc(a.course.color) : 'var(--mu)'}"></span><div class="grow"><div class="t">${esc(a.title)}</div><div class="sub">${esc(a.course ? a.course.name : '')}${a.author ? ' · ' + esc(a.author) : ''} · ${rel(a.at)}</div><div class="sub" style="margin-top:2px">${esc(a.text)}</div></div>`);
function stats() {
const now = Date.now(), open = S.work.filter(x => x.open);
const overdue = open.filter(x => x.due && new Date(x.due) < now);
const week = open.filter(x => x.due && new Date(x.due) >= now && new Date(x.due) - now < 7 * DAY);
const today = open.filter(x => x.due && new Date(x.due) >= now && sod(x.due).getTime() === sod(now).getTime());
const graded = S.courses.filter(c => c.score != null);
const avg = graded.length ? graded.reduce((a, c) => a + c.score, 0) / graded.length : null;
const gpa = graded.length ? graded.reduce((a, c) => a + letterOf(c.score)[2], 0) / graded.length : null;
return { open, overdue, week, today, graded, avg, gpa };
}
function vHome() {
const s = stats(), hr = new Date().getHours();
const hi = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
const name = S.me ? (S.me.short_name || S.me.name || '').split(' ')[0] : '';
const line = s.overdue.length ? `${s.overdue.length} overdue · ${s.today.length} due today` : s.today.length ? `${s.today.length} thing${s.today.length > 1 ? 's' : ''} due today` : s.week.length ? 'Nothing due today' : "You're all caught up";
const next = sortWork(s.open).slice(0, 7);
const classes = S.courses.map(c => `<div class="row click" data-course="${c.id}"><span class="dot" style="background:${esc(c.color)}"></span><div class="grow"><div class="t">${esc(c.name)}</div><div class="bar" style="margin-top:6px"><i style="width:${c.score == null ? 0 : Math.min(100, c.score)}%;background:${scoreColor(c.score)}"></i></div></div><div class="gr"><div class="t" style="color:${scoreColor(c.score)}">${c.score == null ? '—' : esc(c.grade || '')}</div><div class="sub">${c.score == null ? '' : c.score + '%'}</div></div></div>`).join('');
return `<div class="hello"><div class="h">${hi}${name ? ', ' + esc(name) : ''}</div><div class="sub">${new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} · ${line}</div></div>
<div class="tiles">
${tile('Average grade', s.avg == null ? '—' : s.avg.toFixed(1) + '%', s.graded.length + ' of ' + S.courses.length + ' classes graded', scoreColor(s.avg), 1)}
${tile('Estimated GPA', s.gpa == null ? '—' : s.gpa.toFixed(2), 'unweighted, 4.0 scale', '', 1)}
${tile('Due this week', s.week.length, s.week.length ? 'next: ' + esc(sortWork(s.week)[0].title) : 'nothing due', s.week.length ? 'var(--wn)' : 'var(--tx)')}
${tile('Overdue', s.overdue.length, s.overdue.length ? 'needs your attention' : 'all caught up', s.overdue.length ? 'var(--bad)' : 'var(--gd)')}
</div>
<div class="cols"><div class="stack">
<div class="card"><h2>Up next <a data-go="todo">See all</a></h2>${next.map(x => workRow(x)).join('') || empty('Nothing to do. Nice!')}</div>
<div class="card"><h2>Announcements <span>last 3 weeks</span></h2>${S.ann.slice(0, 4).map(annRow).join('') || empty('No recent announcements')}</div>
</div><div class="stack">
<div class="card"><h2>Classes <a data-go="grades">Grades</a></h2>${classes || empty('No active classes')}</div>
<div class="card"><h2>Recent grades</h2>${S.grades.slice(0, 5).map(gradeRow).join('') || empty('No recent grades')}</div>
</div></div>`;
}
function vTodo() {
const now = Date.now(), t0 = sod(now).getTime();
const open = sortWork(S.work.filter(x => x.open));
const due = x => x.due ? +new Date(x.due) : null;
const groups = {
overdue: ['Overdue', open.filter(x => due(x) != null && due(x) < now)],
today: ['Today', open.filter(x => due(x) >= now && due(x) < t0 + DAY)],
week: ['Next 7 days', open.filter(x => due(x) >= t0 + DAY && due(x) < t0 + 7 * DAY)],
later: ['Later', open.filter(x => due(x) >= t0 + 7 * DAY || due(x) == null)],
done: ['Done & submitted', sortWork(S.work.filter(x => !x.open)).reverse()]
};
const segs = [['all', 'All', open.length]].concat(Object.keys(groups).map(k => [k, groups[k][0], groups[k][1].length]));
const show = S.seg === 'all' ? ['overdue', 'today', 'week', 'later'] : [S.seg];
const body = show.filter(k => groups[k][1].length).map(k => `<div class="grp">${groups[k][0]}</div><div>${groups[k][1].map(x => workRow(x, true)).join('')}</div>`).join('');
return `<div class="seg">${segs.map(([k, l, n]) => `<button data-seg="${k}" class="${S.seg === k ? 'on' : ''}">${l}<b>${n}</b></button>`).join('')}</div>
<div class="card">${body || empty(S.seg === 'done' ? 'Nothing finished yet' : 'Nothing here. Enjoy the free time!')}</div>
<p class="note" style="margin-top:12px">Checking something off only hides it on this dashboard. It doesn't submit anything in Canvas.</p>`;
}
function vGrades() {
const s = stats();
const rows = S.courses.map(c => `<div class="row click" data-course="${c.id}"><span class="dot" style="background:${esc(c.color)}"></span><div class="grow"><div class="t">${esc(c.name)}</div><div class="sub">${esc(c.teachers.join(', ') || c.code || '')}</div><div class="bar" style="margin-top:8px"><i style="width:${c.score == null ? 0 : Math.min(100, c.score)}%;background:${scoreColor(c.score)}"></i></div></div>
<div class="gr"><div class="big" style="color:${scoreColor(c.score)}">${c.score == null ? '—' : esc(c.grade || '')}</div><div class="sub">${c.score == null ? (c.hidden ? 'hidden' : 'no grade yet') : c.score + '%'}</div></div></div>`).join('');
return `<div class="tiles">
${tile('Average', s.avg == null ? '—' : s.avg.toFixed(1) + '%', 'across graded classes', scoreColor(s.avg), 1)}
${tile('Estimated GPA', s.gpa == null ? '—' : s.gpa.toFixed(2), 'unweighted, 4.0 scale', '', 1)}
${tile('Highest', s.graded.length ? Math.max(...s.graded.map(c => c.score)) + '%' : '—', s.graded.length ? esc(s.graded.reduce((a, c) => c.score > a.score ? c : a).name) : '', 'var(--gd)', 1)}
${tile('Lowest', s.graded.length ? Math.min(...s.graded.map(c => c.score)) + '%' : '—', s.graded.length ? esc(s.graded.reduce((a, c) => c.score < a.score ? c : a).name) : '', s.graded.length ? scoreColor(Math.min(...s.graded.map(c => c.score))) : '', 1)}
</div>
<div class="cols"><div class="card"><h2>Current grades <span>click a class for details</span></h2>${rows || empty('No active classes')}</div>
<div class="card"><h2>Recently graded</h2>${S.grades.slice(0, 12).map(gradeRow).join('') || empty('No recent grades')}</div></div>`;
}
function vClasses() {
const now = Date.now();
return `<div class="cgrid">${S.courses.map(c => {
const mine = S.work.filter(x => x.open && x.course === c);
const late = mine.filter(x => x.due && new Date(x.due) < now).length;
const soon = mine.filter(x => x.due && new Date(x.due) >= now && new Date(x.due) - now < 7 * DAY).length;
return `<div class="card cc" data-course="${c.id}"><div class="top" style="background:${esc(c.color)}"></div><div class="in">
<div class="t">${esc(c.name)}</div><div class="sub">${esc([c.code, c.term].filter(Boolean).join(' · '))}</div>
<div class="cg"><div class="big" style="color:${scoreColor(c.score)}">${c.score == null ? '—' : esc(c.grade || '')}</div><div class="sub">${c.score == null ? 'no grade yet' : c.score + '%'}</div></div>
<div class="bar"><i style="width:${c.score == null ? 0 : Math.min(100, c.score)}%;background:${scoreColor(c.score)}"></i></div>
<div class="meta">${c.teachers[0] ? `<span class="chip">${esc(c.teachers[0])}</span>` : ''}${soon ? `<span class="chip wn">${soon} due this week</span>` : ''}${late ? `<span class="chip bad">${late} overdue</span>` : ''}${!soon && !late ? '<span class="chip gd">caught up</span>' : ''}</div>
</div></div>`;
}).join('') || empty('No active classes')}</div>`;
}
function vCourse() {
const c = byId(S.courseId);
if (!c) return empty('Class not found');
const base = '/courses/' + c.id;
const links = [['Home', ''], ['Modules', '/modules'], ['Assignments', '/assignments'], ['Grades', '/grades'], ['Announcements', '/announcements'], ['Discussions', '/discussion_topics'], ['Files', '/files'], ['Syllabus', '/assignments/syllabus'], ['People', '/users']]
.map(([l, p]) => `<a class="btn" href="${base + p}" target="_blank" rel="noopener">${l}</a>`).join('');
const cache = S.courseCache[c.id];
if (!cache) loadCourse(c.id);
let list = '<div class="spin"></div>', extra = '';
if (cache && cache.error) list = empty(esc(cache.error));
else if (cache && cache.list) {
const now = Date.now(), A = cache.list.filter(a => a.published !== false);
const graded = A.filter(a => a.submission && a.submission.score != null && a.points_possible);
const earned = graded.reduce((t, a) => t + a.submission.score, 0), possible = graded.reduce((t, a) => t + a.points_possible, 0);
const offline = a => (a.submission_types || []).some(t => t === 'none' || t === 'on_paper' || t === 'not_graded');
const row = a => {
const s = a.submission || {}, pct = s.score != null && a.points_possible ? s.score / a.points_possible * 100 : null, d = a.due_at ? new Date(a.due_at) : null;
const st = s.excused ? ['', 'Excused'] : s.score != null && s.workflow_state === 'graded' ? ['gd', 'Graded'] : s.missing ? ['bad', 'Missing']
: s.submitted_at ? (s.late ? ['wn', 'Late'] : ['ac', 'Submitted']) : offline(a) ? ['', 'In class'] : d && d < now ? ['bad', 'Overdue'] : ['', 'To do'];
return `<div class="row">${link(a.html_url, 'grow', `<div class="t">${esc(a.name)}</div><div class="sub">${fmtDue(a.due_at)}${a.points_possible ? ' · ' + fmtNum(a.points_possible) + ' pts' : ''}</div>`)}
<span class="chip ${st[0]}">${st[1]}</span><div class="gr"><div class="t" style="color:${scoreColor(pct)}">${s.score != null ? fmtNum(s.score) + (a.points_possible ? '/' + fmtNum(a.points_possible) : '') : '—'}</div><div class="sub">${pct == null ? '' : Math.round(pct) + '%'}</div></div></div>`;
};
const up = A.filter(a => !a.due_at || new Date(a.due_at) >= now).sort((a, b) => (a.due_at ? +new Date(a.due_at) : 9e15) - (b.due_at ? +new Date(b.due_at) : 9e15));
const past = A.filter(a => a.due_at && new Date(a.due_at) < now).sort((a, b) => new Date(b.due_at) - new Date(a.due_at));
list = (up.length ? `<div class="grp">Upcoming</div><div>${up.map(row).join('')}</div>` : '') + (past.length ? `<div class="grp">Past</div><div>${past.map(row).join('')}</div>` : '') || empty('No assignments posted');
extra = `<div class="sub">${graded.length} of ${A.length} assignments graded${possible ? ' · <span class="pts">' + fmtNum(earned) + ' / ' + fmtNum(possible) + ' points</span>' : ''}</div>`;
}
const ann = S.ann.filter(a => a.course === c).slice(0, 5);
const todo = sortWork(S.work.filter(x => x.open && x.course === c)).slice(0, 6);
return `<button class="btn" data-go="${S.back}">← Back</button>
<div class="card ch" style="border-left-color:${esc(c.color)}"><div class="grow"><div class="t" style="font-size:20px">${esc(c.name)}</div>
<div class="sub">${esc([c.code, c.term, c.teachers.join(', ')].filter(Boolean).join(' · '))}</div>${extra}</div>
<div class="gr"><div class="big" style="font-size:38px;color:${scoreColor(c.score)}">${c.score == null ? '—' : esc(c.grade || '')}</div><div class="sub">${c.score == null ? 'no grade yet' : c.score + '%'}</div></div></div>
<div class="links">${links}</div>
<div class="cols"><div class="card"><h2>Assignments</h2>${list}</div><div class="stack">
<div class="card"><h2>Needs work</h2>${todo.map(x => workRow(x)).join('') || empty('Nothing due for this class')}</div>
<div class="card"><h2>Announcements</h2>${ann.map(annRow).join('') || empty('No recent announcements')}</div></div></div>`;
}
function vCal() {
const start = sod(new Date());
start.setDate(start.getDate() - start.getDay());
const t0 = sod(new Date()).getTime(), byDay = {};
S.work.forEach(x => { if (x.due) (byDay[sod(x.due).getTime()] = byDay[sod(x.due).getTime()] || []).push(x); });
const days = [];
for (let i = 0; i < 21; i++) {
const d = new Date(start); d.setDate(start.getDate() + i);
const k = d.getTime(), items = sortWork(byDay[k] || []);
days.push(`<div class="day ${k === t0 ? 'today' : k < t0 ? 'past' : ''}"><div class="dn">${d.getDate() === 1 || i === 0 ? d.toLocaleDateString([], { month: 'short' }) + ' ' : ''}${d.getDate()}${k === t0 ? ' · Today' : ''}</div>
${items.map(x => link(x.url, 'ev' + (x.open ? '' : ' dn2'), esc(x.title)).replace('class="ev', `title="${esc(x.title + ' — ' + x.courseName + ', ' + fmtDue(x.due))}" style="border-left-color:${x.course ? esc(x.course.color) : 'var(--mu)'}" class="ev`)).join('')}</div>`);
}
return `<div class="calh">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div>${d}</div>`).join('')}</div><div class="cal">${days.join('')}</div>
<p class="note" style="margin-top:8px">Faded and crossed out = already done. Hover an item for details.</p>`;
}
const vNoCanvas = () => `<div class="card nc"><div class="logo">${I.cap}</div><h3>Open Canvas to see your classes</h3>
<p class="sub wrap">Class Dash reads your grades, to-dos and announcements straight from Canvas while you're logged in. Go to your school's Canvas site, then click the bookmark again.</p>
<button class="btn pri" data-go="games">Play games instead</button></div>`;
const vError = () => `<div class="card nc"><div class="logo" style="background:var(--bad)">${I.x}</div><h3>Couldn't load Canvas</h3><p class="sub wrap">${esc(S.error)}</p><button class="btn pri" data-act="refresh">Try again</button></div>`;
const IMG = /\.(png|jpe?g|webp|gif|svg)$/i;
const THEMES = [
['Cooking', /papa|burger|pizz|cook|chef|bake|donut|taco|sushi|cupcake|pancake|chees|pasta|scoop|freez|wing|hot dog|fruit/, '<path d="M6 13a4 4 0 1 1 2.6-7A4.5 4.5 0 0 1 16 5.2 4 4 0 1 1 18 13v7H6z"/><path d="M6 16.5h12"/>'],
['Fighting', /fight|stick|ninja|sword|knight|karate|wrestl|ragdoll|boxing|punch|hit|chaos|madness|vikings|orc/, '<path d="M20 4 9.5 14.5M20 4v5M20 4h-5M7.5 12.5l4 4M5.5 18.5l3-3M3.5 20.5l2-2"/>'],
['Sports', /soccer|football|basket|ball|tennis|pong|golf|volley|bowl|kick|goal|hockey|sport|ping|archer/, '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l4 2.9-1.5 4.6h-5L8 10.4z"/><path d="M12 3v4.5M20.6 9.5 16 10.4M17.5 19.5 14.5 15M6.5 19.5 9.5 15M3.4 9.5 8 10.4"/>'],
['Racing', /\bcars?\b|race|racer|racing|drift|moto|bike|road|drive|traffic|kart|truck|wheel|highway|parking|derby|rider|tracks|slope|tunnel/, '<path d="M3 16v-3l2.2-5h13.6L21 13v3z"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><path d="M4 13h16"/>'],
['Shooting', /shoot|sniper|gun|war|tank|bow|battle|zombie|defen|bloons|\btd\b|army|1v1|bullet|getaway|coming/, '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>'],
['Flying', /space|rocket|plane|flight|fly|jet|bird|galaxy|ufo|eagle|bison|planes/, '<path d="M12 2.5c4 3 5.2 8 3.2 12.5H8.8C6.8 10.5 8 5.5 12 2.5z"/><circle cx="12" cy="9" r="2"/><path d="M8.8 15 6 18l1 3 3-3M15.2 15 18 18l-1 3-3-3"/>'],
['Puzzle', /2048|tetr|block|cube|stack|puzzle|match|tile|candy|sudoku|minesweeper|chess|quiz|riddle|wordle|alchemy|rope|bloxorz|trivia|guess|level|maze|cat|9007/, '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>']
];
const ARCADE = ['Arcade', null, '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 14h.01"/>'];
const themeOf = name => THEMES.find(t => t[1].test(name.toLowerCase())) || ARCADE;
const PATTERNS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<pattern id="cdp0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="14" fill="#fff"/></pattern>
<pattern id="cdp1" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2.4" fill="#fff"/></pattern>
<pattern id="cdp2" width="24" height="16" patternUnits="userSpaceOnUse"><path d="M0 11 6 5 12 11 18 5 24 11" fill="none" stroke="#fff" stroke-width="2.5"/></pattern>
<pattern id="cdp3" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-width="1.6"/></pattern>
<pattern id="cdp4" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="9" fill="none" stroke="#fff" stroke-width="2"/><circle cx="20" cy="20" r="16" fill="none" stroke="#fff" stroke-width="2"/></pattern>
</defs></svg>`;
const gameUrl = p => PAGES + p.split('/').map(encodeURIComponent).join('/');
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
const pretty = s => s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
const isGame = p => {
if (!p.startsWith(DIR) || !/\.html?$/i.test(p)) return false;
const parts = p.slice(DIR.length).split('/');
return parts.length === 1 || (parts.length === 2 && /^index\.html?$/i.test(parts[1]));
};
// A game loads straight from the repo (raw.githubusercontent.com) instead of GitHub Pages when it has a
// LOAD-FROM-REPO.txt next to it: offline/<game>/LOAD-FROM-REPO.txt, or offline/<game>.LOAD-FROM-REPO.txt
const repoMarker = p => /\/index\.html?$/i.test(p) ? p.replace(/index\.html?$/i, 'LOAD-FROM-REPO.txt') : p.replace(/\.html?$/i, '.LOAD-FROM-REPO.txt');
const repoGame = id => !!(S.lib && (S.lib.fromRepo || []).includes(id));
const toPack = path => {
const rel = path.slice(DIR.length), parts = rel.split('/');
const base = parts.length === 2 ? parts[0] : parts[0].replace(/\.html?$/i, '');
const pic = S.lib && S.lib.art && S.lib.art[path];
const name = pretty(base);
return { id: path, name, desc: rel, img: pic ? (repoGame(path) ? rawOf(pic) : gameUrl(pic)) : null, theme: themeOf(name), repo: repoGame(path) };
};
const artFor = (path, imgs) => {
const stem = path.replace(/\.html?$/i, '').toLowerCase();
const dir = stem.replace(/\/index$/, '');
return [stem, dir + '/preview', dir + '/cover', dir].map(s => imgs[s]).find(Boolean) || null;
};
const art = p => {
const h = hash(p.name), c1 = PAL[h % PAL.length], c2 = PAL[(h >>> 3) % PAL.length], deg = 100 + (h >>> 6) % 140;
const longest = Math.max(...p.name.split(' ').map(w => w.length));
const size = Math.max(12, Math.min(p.name.length <= 6 ? 27 : p.name.length <= 12 ? 21 : 17, Math.floor(150 / longest)));
return `<div class="art gen" style="background:linear-gradient(rgba(6,8,12,0),rgba(6,8,12,.38)),linear-gradient(${deg}deg,${c1},${c2})">
<svg class="pat" aria-hidden="true"><rect width="100%" height="100%" fill="url(#cdp${(h >>> 9) % 5})"/></svg>
<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p.theme[2]}</svg>
<span class="gtitle" style="font-size:${size}px">${esc(p.name)}</span>${p.img ? `<img class="aimg" src="${esc(p.img)}" alt="" loading="lazy">` : ''}</div>`;
};
// Study resources: any file in study/<Class>/ (HTML pages, PDFs, images, .url links, or other files),
// or a folder study/<Class>/<name>/index.html for a page with its own assets.
const isDoc = p => {
if (!p.startsWith(STUDY)) return false;
const parts = p.slice(STUDY.length).split('/'), last = parts[parts.length - 1];
if (!last || last.startsWith('.') || /^readme(\.md)?$/i.test(last)) return false;
return parts.length <= 2 || (parts.length === 3 && /^index\.html?$/i.test(parts[2]));
};
const extOf = p => ((p.match(/\.([a-z0-9]+)$/i) || [])[1] || '').toLowerCase();
const kindOf = p => { const e = extOf(p); return /^html?$/.test(e) ? 'html' : e === 'pdf' ? 'pdf' : /^(png|jpe?g|gif|webp|svg)$/.test(e) ? 'image' : e === 'url' ? 'link' : 'file'; };
const KIND_LABEL = { html: 'Interactive', pdf: 'PDF', image: 'Image', link: 'Link' };
const kindLabel = p => KIND_LABEL[p.kind] || (p.ext ? p.ext.toUpperCase() + ' file' : 'File');
const SUBJECTS = [
[/bio|life|anatom|ecolog|zoo|botan|health/i, I.leaf],
[/chem/i, I.flask],
[/phys|science|earth|environ|astro|geolog/i, I.atom],
[/math|algebra|geometr|calc|stat|trig/i, I.math],
[/hist|gov|civic|econ|geograph|social|psych|socio/i, I.globe],
[/spanish|french|german|chinese|latin|japanese|language|asl/i, I.talk],
[/english|lit|writ|read|lang/i, I.book],
[/comput|code|program|cs\b|tech/i, I.code]
];
const toDoc = path => {
const parts = path.slice(STUDY.length).split('/');
const cls = parts.length === 1 ? 'Other' : pretty(parts[0]);
const file = parts.length === 3 ? parts[1] : parts[parts.length - 1];
const h = hash(cls.toLowerCase());
return { id: path, dir: parts.length === 1 ? '' : parts[0], name: pretty(file.replace(/\.[a-z0-9]+$/i, '')), cls, file: parts.slice(1).join('/') || parts[0], kind: kindOf(path), ext: extOf(path),
color: PAL[h % PAL.length], icon: (SUBJECTS.find(s => s[0].test(cls)) || [, I.study])[1] };
};
const clsMatch = (cls, name) => { const n = (name || '').toLowerCase(), k = cls.toLowerCase(); return n.includes(k) || k.split(/[^a-z0-9]+/).some(w => w.length > 3 && n.includes(w)); };
const myClass = cls => S.courses.some(c => clsMatch(cls, c.name));
// "AP HUMAN GEOGRAPHY A_Hakes_S1" -> "AP Human Geography"
const KEEP_CAPS = /^(AP|IB|US|UK|PE|CS|ELA|ESL|STEM|JROTC|AVID|CTE|II|III|IV)$/;
const niceCourse = name => {
let s = String(name || '').replace(/\s+\S*_\S*$/, '').replace(/\s+(S|SEM|T|Q)\d$/i, '').trim() || String(name || '');
if (s === s.toUpperCase()) s = s.toLowerCase().replace(/[a-z0-9]+/g, w => KEEP_CAPS.test(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1));
return s;
};
// Remembers when each study resource first showed up in this browser, for the "New" badge
let SEEN = store.get('seenDocs', null);
function noteSeen(paths) {
const first = !SEEN, map = SEEN || {};
let changed = first;
paths.forEach(p => { if (!(p in map)) { map[p] = first ? 0 : Date.now(); changed = true; } });
SEEN = map;
if (changed) store.set('seenDocs', map);
}
const isNewDoc = p => !!SEEN && SEEN[p.id] > Date.now() - 7 * DAY;
let PACK = [], DOCS = [];
const setPack = () => {
const hiddenG = new Set(((S.draft || SITE || {}).hiddenGames) || []);
PACK = (S.lib ? S.lib.paths : []).filter(p => !hiddenG.has(p)).map(toPack).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
DOCS = (S.lib && S.lib.study || []).map(toDoc).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
};
setPack();
function libFrom(files) {
files = files.filter(p => p.startsWith(DIR) || p.startsWith(STUDY));
const imgs = {}, pics = {};
files.filter(p => IMG.test(p)).forEach(p => { imgs[p.replace(IMG, '').toLowerCase()] = p; });
const paths = files.filter(isGame);
paths.forEach(p => { const a = artFor(p, imgs); if (a) pics[p] = a; });
const dirs = [...new Set(files.filter(p => p.startsWith(STUDY)).map(p => p.slice(STUDY.length).split('/')).filter(a => a.length > 1).map(a => a[0]))];
const fromRepo = paths.filter(p => files.includes(repoMarker(p)));
return { at: Date.now(), paths, art: pics, study: files.filter(isDoc), dirs, fromRepo };
}
// Games added to the repo in the last 7 days, worked out from GitHub (compare last week's commit with now). Cached for an hour.
let NEWG = store.get('newGames', null);
const newSet = () => new Set(NEWG && Array.isArray(NEWG.ids) ? NEWG.ids : []);
async function loadNewGames(force) {
if (!force && NEWG && Date.now() - NEWG.at < 36e5) return;
try {
const api = 'https://api.github.com/repos/' + REPO;
const before = await fetch(api + '/commits?sha=' + BRANCH + '&per_page=1&until=' + new Date(Date.now() - 7 * DAY).toISOString()).then(r => r.ok ? r.json() : Promise.reject(r.status));
let ids = [];
if (before.length) {
const cmp = await fetch(api + '/compare/' + before[0].sha + '...' + BRANCH).then(r => r.ok ? r.json() : Promise.reject(r.status));
ids = (cmp.files || []).filter(f => f.status === 'added' || f.status === 'copied').map(f => f.filename).filter(isGame);
}
NEWG = { at: Date.now(), ids };
store.set('newGames', NEWG);
if (S.view === 'games') renderMain(true);
} catch (e) {}
}
async function loadLib(force) {
if (S.lib && !S.lib.study && !S.libTried) force = true;
if (S.libLoading || (!force && Date.now() - Math.max(S.libTried, S.lib ? S.lib.at : 0) < 5 * 6e4)) return;
S.libLoading = true; S.libError = null; S.libTried = Date.now();
paintChrome();
try {
const r = await fetch('https://api.github.com/repos/' + REPO + '/git/trees/' + BRANCH + '?recursive=1');
let files = [];
if (r.status !== 409 && r.status !== 404) {
if (!r.ok) throw new Error(r.status === 403 || r.status === 429 ? 'GitHub is rate-limiting this network. Try again in a few minutes.' : 'GitHub returned an error (' + r.status + ').');
files = ((await r.json()).tree || []).filter(t => t.type === 'blob' && (t.path.startsWith(DIR) || t.path.startsWith(STUDY))).map(t => t.path);
}
S.lib = libFrom(files);
store.set('lib', S.lib);
noteSeen(S.lib.study);
setPack();
loadNewGames(force);
} catch (e) {
S.libError = e.message === 'Failed to fetch' ? "Couldn't reach GitHub. Check you're online, then refresh." : e.message || String(e);
}
S.libLoading = false;
paintChrome();
if (usesLib(S.view) || (S.view === 'admin' && !(root.activeElement && root.activeElement.matches('input,textarea,select')))) renderMain(true);
}
const vPlay = () => {
const p = PACK.find(x => x.id === S.game);
if (!p) return `<div class="gbar"><button class="btn" data-go="games">← Games</button></div>` + empty('That game is no longer in the repo.');
return `<div class="play"><div class="gbar wide"><button class="btn" data-go="games">← Games</button>
<div class="grow"><div class="t">${esc(p.name)}</div><div class="sub">${esc(p.desc)} · ${p.repo ? 'straight from the repo' : 'from GitHub Pages'}</div></div>
<button class="btn" data-act="license">License</button><button class="btn" data-act="newtab">New tab</button><button class="btn" data-act="full">Full screen</button><button class="btn" data-act="reload">Restart</button></div>
<div class="frame"><div class="spin"></div></div></div>`;
};
// Loading screen shown over a game until its page has finished downloading
const LOAD_TIPS = [
[0, "Getting it ready. Keep this open and it'll start by itself."],
[6, 'Some games are big downloads (3D games can be 30 MB or more), so the first time can take up to a minute. After that they open much faster.'],
[20, "Still downloading. School Wi-Fi can be slow with big games, so hang tight. It's working."],
[45, "This one's taking a while. You can keep waiting, or try Restart or New tab."]
];
const gameLoader = (p, buttons) => `<div class="gload">${p.img !== undefined ? `<div class="gt gla">${art(p)}</div>` : ''}<div class="spin"></div><div class="glt">Loading ${esc(p.name)}</div><div class="gls"></div><div class="gltime"></div>${buttons ? '<div class="glb" hidden><button class="btn" data-act="reload">Restart</button><button class="btn" data-act="newtab">New tab</button></div>' : ''}</div>`;
function watchLoad(f, ov, w) {
w = w || window;
const t0 = Date.now();
const tick = () => {
if (!ov.isConnected) return w.clearInterval(iv);
const sec = Math.floor((Date.now() - t0) / 1000);
const tip = LOAD_TIPS.filter(x => sec >= x[0]).pop()[1], el = ov.querySelector('.gls');
if (el.textContent !== tip) el.textContent = tip;
ov.querySelector('.gltime').textContent = sec < 3 ? '' : sec + ' seconds';
const b = ov.querySelector('.glb');
if (b) b.hidden = sec < 45;
};
const iv = w.setInterval(tick, 1000);
tick();
f.addEventListener('load', () => { w.clearInterval(iv); ov.classList.add('done'); w.setTimeout(() => ov.remove(), 300); }, { once: true });
}
// Points the frame at the game: GitHub Pages normally, or the repo itself (fetched and shown in a sandbox) for LOAD-FROM-REPO games
const GAME_SANDBOX = 'allow-scripts allow-pointer-lock allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-orientation-lock';
function frameGame(f, path) {
if (!repoGame(path)) { f.src = gameUrl(path); return Promise.resolve(); }
const raw = rawOf(path);
return fetch(raw + '?t=' + Date.now(), { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(html => {
const base = '<base href="' + esc(raw.replace(/[^/]*$/, '')) + '">';
f.setAttribute('sandbox', GAME_SANDBOX);
f.srcdoc = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + base) : base + html;
}).catch(() => { f.src = gameUrl(path); });
}
function startFrame(ct, path) {
const box = ct.querySelector('.frame');
if (!box) return;
const p = PACK.find(x => x.id === path) || toPack(path);
const f = document.createElement('iframe');
f.className = 'gframe';
f.setAttribute('allow', 'fullscreen; autoplay; gamepad');
f.addEventListener('load', () => { try { f.contentWindow.focus(); } catch (e) {} });
box.innerHTML = gameLoader(p, true);
watchLoad(f, box.querySelector('.gload'));
frameGame(f, path).then(() => { if (box.isConnected) box.appendChild(f); });
}
const startPack = ct => startFrame(ct, S.game);
// Study pages load straight from the repo (raw.githubusercontent.com), so a new upload shows up
// without waiting for GitHub Pages. Raw GitHub serves them as plain text, so the HTML is fetched
// and shown in a sandboxed frame; relative images/scripts resolve against GitHub Pages.
const RAW = 'https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/';
const DOC_SANDBOX = 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads';
const docCache = {};
function docHtml(path) {
if (docCache[path]) return Promise.resolve(docCache[path]);
return fetch(RAW + path.split('/').map(encodeURIComponent).join('/') + '?t=' + Date.now(), { cache: 'no-store' })
.then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
.then(html => {
const base = '<base href="' + esc(gameUrl(path).replace(/[^/]*$/, '')) + '">';
html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + base) : base + html;
return (docCache[path] = html);
});
}
function fillDoc(f, path) {
return docHtml(path)
.then(html => { f.setAttribute('sandbox', DOC_SANDBOX); f.srcdoc = html; })
.catch(() => { f.src = gameUrl(path); });
}
// PDFs and images: raw GitHub serves them as downloads, so fetch the bytes and show them from a blob URL
const MIME = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' };
const rawUrl = p => RAW + p.split('/').map(encodeURIComponent).join('/');
const blobCache = {};
function docBlob(p) {
if (blobCache[p]) return Promise.resolve(blobCache[p]);
return fetch(rawUrl(p) + '?t=' + Date.now(), { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
.then(buf => (blobCache[p] = URL.createObjectURL(new Blob([buf], { type: MIME[extOf(p)] || 'application/octet-stream' }))));
}
function docLinkUrl(p) {
return fetch(rawUrl(p) + '?t=' + Date.now(), { cache: 'no-store' }).then(r => r.text()).then(t => {
const m = t.match(/^\s*URL\s*=\s*(\S+)/mi) || t.match(/https?:\/\/\S+/);
const u = m && (m[1] || m[0]);
return /^https?:\/\//i.test(u || '') ? u : null;
});
}
// Builds the viewer for a study resource inside document `d` (the dashboard, or an about:blank tab)
function docView(d, p) {
const FILL = 'position:absolute;inset:0;width:100%;height:100%;border:0;';
const mk = (tag, css) => { const e = d.createElement(tag); e.className = 'gframe'; e.style.cssText = FILL + (css || ''); return e; };
const panel = (title, sub, href, label, dl) => {
const box = mk('div', 'display:grid;place-items:center;background:#0f1218;color:#e9ecf2;font:15px system-ui,sans-serif;text-align:center;padding:20px;box-sizing:border-box');
box.innerHTML = `<div><div style="font-size:18px;font-weight:700;margin-bottom:6px">${esc(title)}</div><div style="color:#8c93a5;margin-bottom:16px">${esc(sub)}</div></div>`;
if (href) {
const a = d.createElement('a');
a.style.cssText = 'display:inline-block;padding:10px 18px;border-radius:10px;background:#7c9cff;color:#0f1218;font-weight:700;text-decoration:none';
a.href = href; a.textContent = label;
if (dl) a.download = dl; else { a.target = '_blank'; a.rel = 'noopener'; }
box.firstChild.appendChild(a);
}
return box;
};
if (p.kind === 'html') { const f = mk('iframe', 'background:#fff'); f.setAttribute('allow', 'fullscreen; autoplay'); return fillDoc(f, p.id).then(() => f); }
if (p.kind === 'link') return docLinkUrl(p.id).then(u => u ? panel(p.name, 'This study resource is a link to another website.', u, 'Open link') : panel(p.name, "This link doesn't have a web address in it.", ''));
return docBlob(p.id).then(url => {
if (p.kind === 'pdf') { const f = mk('iframe', 'background:#fff'); f.src = url; return f; }
if (p.kind === 'image') { const box = mk('div', 'overflow:auto;display:grid;place-items:center;background:#0f1218'); const img = d.createElement('img'); img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain'; img.src = url; box.appendChild(img); return box; }
return panel(p.name, (p.ext ? p.ext.toUpperCase() + ' files' : 'These files') + " can't be shown here, but you can download it.", url, 'Download', p.id.split('/').pop());
});
}
function startDoc(ct, path) {
const box = ct.querySelector('.frame'), p = DOCS.find(x => x.id === path);
if (!box || !p) return;
docView(document, p).then(el => { if (S.view === 'read' && S.doc === path && box.isConnected) { box.innerHTML = ''; box.appendChild(el); } })
.catch(() => { if (box.isConnected) box.innerHTML = empty("Couldn't load this resource. Check your connection and try again."); });
}
const vRead = () => {
const p = DOCS.find(x => x.id === S.doc);
if (!p) return `<div class="gbar"><button class="btn" data-go="study">← Study</button></div>` + empty('That study resource is no longer in the repo.');
return `<div class="play"><div class="gbar wide"><button class="btn" data-go="study">← Study</button>
<div class="grow"><div class="t">${esc(p.name)}</div><div class="sub">${esc(p.cls)}</div></div>
<button class="btn" data-act="newtab">New tab</button><button class="btn" data-act="full">Full screen</button></div>
<div class="frame"><div class="spin"></div></div></div>`;
};
// ---- Study page layout ----
const STUDY_KINDS = [['all', 'All', null], ['html', 'Practice & quizzes', I.quiz], ['pdf', 'PDFs', I.doc], ['link', 'Links', I.chain], ['image', 'Images', I.pic], ['file', 'Files', I.file]];
const kindIcon = p => ({ html: I.quiz, pdf: I.doc, link: I.chain, image: I.pic })[p.kind] || I.file;
const docLabel = p => p.kind === 'html' ? (/test|quiz|exam|practice|study|review/i.test(p.name) ? 'Practice & quizzes' : 'Interactive page')
: p.kind === 'pdf' ? 'PDF' : p.kind === 'link' ? 'Website link' : p.kind === 'image' ? 'Image' : (p.ext ? p.ext.toUpperCase() + ' file' : 'File');
const recentDocs = () => store.get('recentDocs', []).map(r => ({ r, p: DOCS.find(d => d.id === r.id) })).filter(x => x.p);
function openDoc(id) {
store.set('recentDocs', [{ id, at: Date.now() }, ...store.get('recentDocs', []).filter(x => x.id !== id)].slice(0, 6));
S.doc = id;
go('read');
}
const docAttrs = p => `tabindex="0" role="button" data-doc="${esc(p.id)}" data-kind="${p.kind}" data-name="${esc((p.name + ' ' + p.cls + ' ' + docLabel(p)).toLowerCase())}" title="Open ${esc(p.name)}"`;
const resRow = p => `<div class="rr" ${docAttrs(p)}><span class="rri" style="--c:${p.color}">${kindIcon(p)}</span>
<span class="grow"><span class="t" style="display:block">${esc(p.name)}</span><span class="sub">${isNewDoc(p) ? '<span class="chip new">New</span>' : ''}${esc(docLabel(p))}</span></span>
<button class="ib rnt" data-docnew="${esc(p.id)}" title="Open in a new tab">${I.ext}</button></div>`;
const contCard = (p, at) => `<div class="ccard" ${docAttrs(p)}><span class="rri" style="--c:${p.color}">${kindIcon(p)}</span>
<span class="grow"><span class="t" style="display:block">${esc(p.name)}</span><span class="sub" style="display:block">${esc(p.cls)} · ${esc(rel(new Date(at).toISOString()))}</span></span></div>`;
const vStudy = () => {
const groups = {};
DOCS.forEach(p => { (groups[p.cls] = groups[p.cls] || []).push(p); });
const list = Object.keys(groups).map(cls => ({ cls, docs: groups[cls], mine: isCanvas && cls !== 'Other' && myClass(cls), color: groups[cls][0].color, icon: groups[cls][0].icon }))
.sort((a, b) => (b.mine - a.mine) || ((a.cls === 'Other') - (b.cls === 'Other')) || a.cls.toLowerCase().localeCompare(b.cls.toLowerCase()));
if (S.scls !== 'All' && !groups[S.scls]) S.scls = 'All';
const kinds = STUDY_KINDS.filter(k => k[0] === 'all' || DOCS.some(p => p.kind === k[0]));
if (!kinds.some(k => k[0] === S.skind)) S.skind = 'all';
const n = DOCS.length, mineCount = list.filter(g => g.mine).length;
const recent = recentDocs().slice(0, 4);
const missing = isCanvas ? S.courses.filter(c => !list.some(g => g.cls !== 'Other' && clsMatch(g.cls, c.name))).slice(0, 10) : [];
const state = n ? '' : S.libError ? empty(esc(S.libError)) : S.lib && !S.libLoading ? empty('No study resources yet. Add files to study/&lt;class name&gt;/ in the repo, then hit refresh.') : '<div class="spin"></div>';
const kindBtns = kinds.length > 2 ? kinds.map(([k, l, ic]) => `<button data-skind="${k}" class="${S.skind === k ? 'on' : ''}">${ic || ''}${l}<b>${k === 'all' ? n : DOCS.filter(p => p.kind === k).length}</b></button>`).join('') : '';
const clsBtns = list.length > 3 ? [['All', 'All classes', n], ...list.map(g => [g.cls, g.cls, g.docs.length])].map(([v, l, c]) => `<button data-scls="${esc(v)}" class="${S.scls === v ? 'on' : ''}">${esc(l)}<b>${c}</b></button>`).join('') : '';
const sortDocs = d => d.slice().sort((a, b) => (isNewDoc(b) - isNewDoc(a)) || a.name.localeCompare(b.name, undefined, { numeric: true }));
return `<div class="shead"><div><div class="gh">Study</div>
<div class="sub">${n} ${n === 1 ? 'resource' : 'resources'} · ${list.length} ${list.length === 1 ? 'class' : 'classes'}${mineCount ? ` · ${mineCount} yours` : ''}</div></div>
<label class="gsearch">${I.search}<input data-search placeholder="Search by class, unit or topic…" value="${esc(S.sq)}" autocomplete="off" spellcheck="false"><span class="kbd">/</span></label></div>
${kindBtns || clsBtns ? `<div class="sbar">${kindBtns}${kindBtns && clsBtns ? '<span class="sep"></span>' : ''}${clsBtns}</div>` : ''}
${S.libError && n ? `<p class="note" style="margin-bottom:10px">${esc(S.libError)} Showing the last list.</p>` : ''}
${recent.length ? `<div class="scont"><div class="grp">Continue studying</div><div class="ccards">${recent.map(x => contCard(x.p, x.r.at)).join('')}</div></div>` : ''}
${missing.length && n ? `<div class="sneed"><span class="t">Nothing yet for</span>${missing.map(c => `<button data-reqcls="${esc(niceCourse(c.name))}" title="Request study help for ${esc(niceCourse(c.name))}">${I.plus}${esc(niceCourse(c.name))}</button>`).join('')}</div>` : ''}
${state}${n ? `<div class="spans">${list.map(g => `<section class="cpan" data-sec="${esc(g.cls)}" style="--c:${g.color}"><div class="cph"><span class="ssi">${g.icon}</span>
<div class="grow"><div class="t">${esc(g.cls)}</div><div class="sub">${g.docs.length} ${g.docs.length === 1 ? 'resource' : 'resources'}</div></div>${g.mine ? '<span class="chip ac" title="You take this class">Yours</span>' : ''}</div>
${sortDocs(g.docs).map(resRow).join('')}</section>`).join('')}</div>
<div class="snone" hidden><div class="t">Nothing matches</div><div class="sub wrap nmtxt"></div><button class="btn pri" data-reqtopic="1">${I.send}Request it</button></div>` : ''}
<div class="sreq"><div class="grp">Can't find what you need?</div>${reqCard('study')}</div>`;
};
function filterStudy() {
const ct = $('.ct'), q = S.sq.trim().toLowerCase();
let shown = 0;
ct.querySelectorAll('.cpan').forEach(sec => {
const inCls = !!q || S.scls === 'All' || sec.dataset.sec === S.scls;
let inSec = 0;
sec.querySelectorAll('.rr').forEach(t => {
t.hidden = !inCls || (S.skind !== 'all' && t.dataset.kind !== S.skind) || (!!q && !q.split(/\s+/).every(w => t.dataset.name.includes(w)));
if (!t.hidden) inSec++;
});
sec.hidden = !inSec; shown += inSec;
});
const cont = ct.querySelector('.scont');
if (cont) cont.hidden = !!q || S.skind !== 'all' || S.scls !== 'All';
const nm = ct.querySelector('.snone');
if (nm) {
nm.hidden = shown > 0 || !ct.querySelector('.cpan');
const what = [q && '"' + S.sq.trim() + '"', S.skind !== 'all' && (STUDY_KINDS.find(k => k[0] === S.skind) || [])[1], S.scls !== 'All' && !q && S.scls].filter(Boolean).join(' · ');
nm.querySelector('.nmtxt').textContent = what ? 'No study resources for ' + what + ' yet. Ask for it and we\'ll most likely add it.' : '';
}
}
const visibleDocs = () => [...$('.ct').querySelectorAll('.cpan .rr')].filter(t => !t.hidden);
async function showLicense(ct) {
const box = ct.querySelector('.frame');
const open = box.querySelector('.lic');
if (open) { open.remove(); return; }
const pre = document.createElement('pre');
pre.className = 'lic';
pre.textContent = 'Loading…';
box.appendChild(pre);
try {
const r = await fetch('https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/' + S.game.replace(/\.html?$/i, '.LICENSE.txt'));
if (!r.ok) throw 0;
pre.textContent = await r.text();
} catch (e) {
pre.textContent = 'No license file next to this game in the repo.';
}
}
// New-tab pages open as about:blank#N: #1 on Nov 5 2026, going up by one each day.
const BLANK_START = new Date(2026, 10, 5);
const blankUrl = () => 'about:blank#' + (Math.round((sod(new Date()) - BLANK_START) / DAY) + 1);
// ---- Hall pass (Securly Pass blocks being shown inside other sites, so it opens in its own window) ----
const PASS = 'https://pass.securly.com/';
const vHallPass = () => `<div class="card nc"><div class="logo" style="background:var(--gd)">${I.pass}</div><h3>Hall Pass</h3>
<p class="sub">Opens Securly Pass in its own window. Securly doesn't let other sites show it inside them, so it can't load right here.</p>
<button class="btn pri big" data-act="hallpass">${I.ext}Open Hall Pass</button></div>`;
function openHallPass() {
const w = Math.min(520, screen.availWidth), h = Math.min(820, screen.availHeight);
const url = /^https?:\/\//.test(SITE.hallpass || '') ? SITE.hallpass : PASS;
const win = window.open(url, 'classdash-hallpass', `popup=yes,width=${w},height=${h},left=${Math.max(0, Math.round((screen.availWidth - w) / 2))},top=${Math.max(0, Math.round((screen.availHeight - h) / 2))}`);
if (!win) window.open(url, '_blank');
}
// ---- Request boxes on the Study and Games pages (emailed through web3forms.com) ----
const W3F_KEY = '45efbf44-2e20-4802-8882-7b3ba4b1b3cf';
const reqCard = kind => {
const r = S.req, m = S.reqMsg[kind] || { text: '', cls: '' }, study = kind === 'study';
const classes = [...new Set([...S.courses.map(c => c.name), ...DOCS.map(d => d.cls).filter(c => c !== 'Other')])];
return `<form class="req" data-reqform="${kind}" novalidate><span class="ric">${I.send}</span>
<div class="rtxt"><div class="t">${study ? 'Need study help for a class?' : 'Want a game added?'}</div>
<div class="sub">${study ? "Request practice tests or notes for any class. We'll most likely add it, usually within a few days." : "Tell us the game and we'll most likely add it to the library, usually within a few days."}</div></div>
<div class="rfields">${study
? `<input data-req="scls" list="cdreqcls" maxlength="60" placeholder="Class (e.g. Biology)" value="${esc(r.scls || '')}" autocomplete="off" spellcheck="false"><datalist id="cdreqcls">${classes.map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>
<input data-req="stopic" maxlength="100" placeholder="Unit or topic (optional)" value="${esc(r.stopic || '')}" autocomplete="off">`
: `<input data-req="game" maxlength="80" placeholder="Game name (e.g. Retro Bowl)" value="${esc(r.game || '')}" autocomplete="off" spellcheck="false">`}
<button class="btn pri" type="submit">Request</button></div>
<div class="rmsg ${m.cls}">${esc(m.text)}</div></form>`;
};
function reqSay(kind, text, cls) {
S.reqMsg[kind] = { text, cls };
const el = root.querySelector(`[data-reqform="${kind}"] .rmsg`);
if (el) { el.textContent = text; el.className = 'rmsg ' + cls; }
}
function sendReq(kind) {
const r = S.req;
let fields, subject;
if (kind === 'games') {
const g = (r.game || '').trim();
if (!g) return reqSay(kind, 'Type the name of the game first.', 'err');
fields = { Request: 'Game', Game: g, Details: 'Sent from the Class Dash games page' }; subject = 'Class Dash request: ' + g;
} else {
const c = (r.scls || '').trim();
if (!c) return reqSay(kind, "Type which class it's for first.", 'err');
fields = { Request: 'Study resource', Class: c, Topic: (r.stopic || '').trim() || '-', Details: 'Sent from the Class Dash study page' }; subject = 'Class Dash request: ' + c;
}
if (Date.now() - store.get('reqAt', 0) < 30000) return reqSay(kind, 'Thanks! Give it a few seconds before sending another.', 'err');
reqSay(kind, 'Sending…', '');
fetch('https://api.web3forms.com/submit', {
method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
body: JSON.stringify(Object.assign({ access_key: W3F_KEY, subject, from_name: 'Class Dash' }, fields))
}).then(res => res.json()).then(j => {
if (String(j.success) !== 'true') throw new Error(j.message || 'failed');
store.set('reqAt', Date.now());
if (kind === 'games') r.game = ''; else { r.scls = ''; r.stopic = ''; }
root.querySelectorAll(`[data-reqform="${kind}"] [data-req]`).forEach(i => { i.value = ''; });
reqSay(kind, kind === 'games' ? "Sent! We'll most likely add it soon, so check back in a few days." : "Sent! We'll most likely add study stuff for it soon, so check back in a few days.", 'ok');
}).catch(() => reqSay(kind, "Couldn't send right now. Try again in a bit.", 'err'));
}
function openBlank(item) {
const read = item ? !!item.cls : S.view === 'read';
const p = item || (read ? DOCS.find(x => x.id === S.doc) : PACK.find(x => x.id === S.game));
const w = p && window.open(blankUrl(), '_blank');
if (!w) return false;
w.opener = null;
const d = w.document;
d.title = p.name;
d.body.style.cssText = 'margin:0;height:100vh;overflow:hidden;background:#000';
if (read) {
d.body.style.position = 'relative';
docView(d, p).then(el => d.body.appendChild(el)).catch(() => { d.body.style.color = '#fff'; d.body.textContent = "Couldn't load this resource."; });
return true;
}
const st = d.createElement('style');
st.textContent = '@keyframes cdsp{to{transform:rotate(360deg)}}.gload{position:fixed;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;background:#0f1218;color:#e9ecf2;font:14px/1.45 system-ui,sans-serif;transition:opacity .25s}.gload.done{opacity:0;pointer-events:none}.spin{width:30px;height:30px;border:3px solid #272d3a;border-top-color:#7c9cff;border-radius:50%;animation:cdsp .8s linear infinite}.glt{font-size:18px;font-weight:700}.gls{max-width:420px;color:#8c93a5}.gltime{font-size:12px;color:#8c93a5;min-height:1em}';
d.head.appendChild(st);
const f = d.createElement('iframe');
f.setAttribute('allow', 'fullscreen; autoplay; gamepad');
f.style.cssText = 'border:0;width:100%;height:100%;display:block';
d.body.insertAdjacentHTML('beforeend', gameLoader({ name: p.name }));
watchLoad(f, d.body.querySelector('.gload'), w);
frameGame(f, p.id).then(() => { d.body.appendChild(f); f.focus(); });
return true;
}
// Opens a game inside Class Dash, or in a new about:blank tab if that's picked in Settings
function playGame(id) {
addRecent('pack:' + id);
S.game = id;
const p = PACK.find(x => x.id === id);
if (P.gameOpen === 'tab' && !LIB && p && openBlank(p)) { if (S.view === 'games') renderMain(true); return; }
go('play');
}
function openLibraryTab() {
const w = window.open(blankUrl(), '_blank');
if (!w) return;
w.opener = null;
const d = w.document;
d.title = 'Class Games';
d.body.style.cssText = 'margin:0;height:100vh;display:grid;place-items:center;background:#0f1218;color:#8c93a5;font:15px system-ui,sans-serif';
d.body.textContent = 'Loading games…';
const get = url => fetch(url + '?t=' + Date.now(), { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
let saved = (store.get('installed', null) || {}).code || null;
if (!saved) try { saved = localStorage.getItem('classdash_code'); } catch (e) {}
(saved ? Promise.resolve(saved) : get('https://raw.githubusercontent.com/' + REPO + '/' + BRANCH + '/bookmarklet.js').catch(() => get(PAGES + 'bookmarklet.js')))
.then(code => { d.body.removeAttribute('style'); d.body.textContent = ''; w.__classDashMode = 'library'; new w.Function(code)(); })
.catch(() => { d.body.textContent = "Couldn't load the games library. Try again from Class Dash."; });
}
const findItem = key => key.startsWith('pack:') ? PACK.find(p => p.id === key.slice(5)) : null;
const addRecent = key => store.set('recent', [key, ...store.get('recent', []).filter(x => x !== key)].slice(0, 7));
const gameTile = p => `<button class="gt" data-pack="${esc(p.id)}" data-name="${esc(p.name.toLowerCase())}" title="${esc(p.name)}">${art(p)}${newSet().has(p.id) ? '<span class="nb">NEW</span>' : ''}${p.img ? `<div class="tn">${esc(p.name)}</div>` : ''}</button>`;
const vGames = () => {
const cats = [['All', PACK.length], ...[...THEMES, ARCADE].map(t => [t[0], PACK.filter(p => p.theme === t).length]).filter(c => c[1])];
if (!cats.some(c => c[0] === S.cat)) S.cat = 'All';
const list = S.cat === 'All' ? PACK : PACK.filter(p => p.theme[0] === S.cat);
const recent = P.recent ? store.get('recent', []).map(findItem).filter(Boolean) : [];
const featured = (curSite().featured || []).map(id => PACK.find(p => p.id === id)).filter(Boolean);
const fresh = [...newSet()].map(id => PACK.find(p => p.id === id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
const libState = PACK.length ? '' : S.libError ? empty(esc(S.libError)) : S.lib && !S.libLoading ? empty('No games yet. Add an .html file to the offline folder, then hit refresh.') : '<div class="spin"></div>';
return `${PATTERNS}<div class="ghero"><div class="ghead"><div class="grow"><div class="gh">Game library</div>
<div class="sub">${PACK.length} ${PACK.length === 1 ? 'game' : 'games'} · press <span class="kbd">/</span> to search</div></div>
${LIB ? '' : `<button class="btn" data-act="libtab" title="Open the games library in a new about:blank tab">${I.ext}Open in new tab</button>`}</div>
<div class="gfind"><label class="gsearch">${I.search}<input data-search placeholder="Search games…" value="${esc(S.q)}" autocomplete="off" spellcheck="false"><span class="kbd">/</span></label>
<button class="btn pri big" data-act="random">${I.shuffle}Random</button></div></div>
${reqCard('games')}
${cats.length > 2 ? `<div class="seg">${cats.map(([l, n]) => `<button data-cat="${l}" class="${S.cat === l ? 'on' : ''}">${l}<b>${n}</b></button>`).join('')}</div>` : ''}
${S.libError && PACK.length ? `<p class="note" style="margin-bottom:10px">${esc(S.libError)} Showing the last list.</p>` : ''}
${featured.length ? `<div class="rec"><div class="grp">Featured</div><div class="tgrid">${featured.map(gameTile).join('')}</div></div>` : ''}
${fresh.length ? `<div class="rec"><div class="grp">New this week<span class="grpn">added in the last 7 days</span></div><div class="tgrid">${fresh.map(gameTile).join('')}</div></div>` : ''}
${recent.length ? `<div class="rec"><div class="grp">Jump back in</div><div class="tgrid">${recent.map(gameTile).join('')}</div></div>` : ''}
<div class="grp">${S.cat === 'All' ? 'All games' : esc(S.cat)}</div>
${libState}<div class="tgrid all">${list.map(gameTile).join('')}</div><div class="empty nomatch" hidden></div>`;
};
function filterGames() {
const ct = $('.ct'), q = S.q.trim().toLowerCase();
let shown = 0;
ct.querySelectorAll('.tgrid.all .gt').forEach(t => { t.hidden = !!q && !t.dataset.name.includes(q); if (!t.hidden) shown++; });
ct.querySelectorAll('.rec').forEach(rec => { rec.hidden = !!q; });
const nm = ct.querySelector('.nomatch');
if (nm) { nm.hidden = !q || shown > 0; nm.textContent = 'No games match "' + S.q.trim() + '".'; }
}
const visibleTiles = () => [...$('.ct').querySelectorAll('.tgrid.all .gt')].filter(t => !t.hidden);
const SCHEDULES = {
reg: { name: 'Non-block schedule', days: 'Monday · Thursday · Friday',
first: [['Period 1', '8:00', '8:50'], ['Period 2', '8:55', '9:45'], ['Period 3', '9:50', '10:40']],
l1: [['1st Lunch', '10:40', '11:15'], ['Period 4A', '11:20', '12:10']], l2: [['Period 4B', '10:45', '11:35'], ['2nd Lunch', '11:35', '12:10']],
last: [['Period 5', '12:15', '1:05'], ['Period 6', '1:10', '2:00'], ['Period 7', '2:05', '2:52']] },
tue: { name: 'Block schedule', days: 'Tuesday',
first: [['Period 1', '8:00', '9:20'], ['Homeroom', '9:25', '9:55'], ['Period 3', '10:00', '11:20']],
l1: [['1st Lunch', '11:20', '11:55'], ['Period 5A', '12:00', '1:20']], l2: [['Period 5B', '11:25', '12:45'], ['2nd Lunch', '12:45', '1:20']],
last: [['Period 7', '1:25', '2:52']] },
wed: { name: 'Block schedule · late start', days: 'Wednesday',
first: [['Period 2', '10:10', '11:30']],
l1: [['1st Lunch', '11:30', '12:05'], ['Period 4A', '12:10', '1:30']], l2: [['Period 4B', '11:35', '12:55'], ['2nd Lunch', '12:55', '1:30']],
last: [['Period 6', '1:35', '2:55'], ['iVision/Flex', '2:55', '3:45']] }
};
const DAY_SCHED = [null, 'reg', 'tue', 'wed', 'reg', 'reg', null];
const toMin = t => { const [h, m] = t.split(':').map(Number); return (h < 7 ? h + 12 : h) * 60 + m; };
const hm = m => { const h = Math.floor(m / 60); return (P.clock24 ? h : h % 12 || 12) + ':' + String(m % 60).padStart(2, '0'); };
const ampm = m => P.clock24 ? hm(m) : hm(m) + (m < 720 ? ' a.m.' : ' p.m.');
const span = mins => { const t = Math.ceil(mins); return t >= 60 ? Math.floor(t / 60) + 'h ' + (t % 60) + 'm' : t + 'm'; };
const periodsFor = key => { const s = SCHEDULES[key]; return [...s.first, ...s[S.lunch === 2 ? 'l2' : 'l1'], ...s.last].map(([name, a, b]) => ({ name, a: toMin(a), b: toMin(b) })); };
const nowMin = d => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
// Which class each period is. Saved in this browser (classdash_periods), so updates never reset it.
const PERIOD_KEYS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Homeroom', 'iVision/Flex'];
const pkey = name => name.replace(/^(Period \d)[AB]$/, '$1');
const classFor = name => /lunch/i.test(name) ? '' : String(S.periods[pkey(name)] || '').trim();
const courseFor = cls => { const k = cls.toLowerCase(); return k ? S.courses.find(c => c.name.toLowerCase() === k) || S.courses.find(c => c.name.toLowerCase().includes(k)) : null; };
const withClass = name => { const c = classFor(name); return c ? name + ' · ' + c : name; };
function dayStatus(d) {
const key = DAY_SCHED[d.getDay()];
if (!key) return { label: 'No school today', sub: 'See you Monday' };
const list = periodsFor(key), m = nowMin(d);
const cur = list.find(p => m >= p.a && m < p.b), next = list.find(p => p.a > m);
if (cur) return { label: withClass(cur.name), sub: span(cur.b - m) + ' left · ends ' + hm(cur.b), pct: (m - cur.a) / (cur.b - cur.a) };
if (!next) return { label: "School's out", sub: d.getDay() === 5 ? 'Have a good weekend' : 'See you tomorrow' };
if (m < list[0].a) return { label: 'Before school', sub: withClass(next.name) + ' starts in ' + span(next.a - m) };
return { label: 'Passing period', sub: withClass(next.name) + ' in ' + span(next.a - m) };
}
let schedHtml = '';
function paintSched() {
const st = dayStatus(new Date());
const html = `<div class="sl">${esc(st.label)}</div><div>${esc(st.sub)}</div>${st.pct == null ? '' : `<div class="bar"><i style="width:${Math.round(st.pct * 100)}%;background:var(--ac)"></i></div>`}`;
if (html !== schedHtml) { schedHtml = html; $('.sched').innerHTML = html; }
}
const vSchedule = () => {
const now = new Date(), today = DAY_SCHED[now.getDay()], key = S.schedKey || today || 'reg', m = nowMin(now);
const st = dayStatus(now), live = key === today;
return `<div class="card schnow"><span class="logo" style="width:46px;height:46px;border-radius:13px;background:var(--ac);color:var(--bg);display:grid;place-items:center;flex:none">${I.clock}</span>
<div class="grow"><div class="big">${esc(st.label)}</div><div class="sub">${esc(st.sub)}</div>${st.pct == null ? '' : `<div class="bar" style="margin-top:8px"><i style="width:${Math.round(st.pct * 100)}%;background:var(--ac)"></i></div>`}</div></div>
<div class="schbar"><div class="seg">${[['reg', 'Mon · Thu · Fri'], ['tue', 'Tuesday'], ['wed', 'Wednesday']].map(([k, l]) => `<button data-sched="${k}" class="${key === k ? 'on' : ''}">${l}${today === k ? '<b>today</b>' : ''}</button>`).join('')}</div>
<div class="seg">${[[1, '1st lunch'], [2, '2nd lunch']].map(([v, l]) => `<button data-lunch="${v}" class="${S.lunch === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
<div class="card"><h2>${esc(SCHEDULES[key].name)}<span>${esc(SCHEDULES[key].days)}</span></h2>
${periodsFor(key).map(p => {
const on = live && m >= p.a && m < p.b, done = live && m >= p.b;
const cls = classFor(p.name), crs = cls && courseFor(cls);
const clsHtml = !cls ? '' : crs ? ` <a class="pcls" data-course="${crs.id}" title="Open ${esc(crs.name)}">· ${esc(cls)}</a>` : ` <span class="pcls">· ${esc(cls)}</span>`;
return `<div class="row${done ? ' past' : ''}"><span class="dot" style="background:${on ? 'var(--ac)' : /lunch/i.test(p.name) ? 'var(--wn)' : crs ? esc(crs.color) : 'var(--p3)'}"></span>
<div class="grow"><div class="t">${esc(p.name)}${clsHtml}</div><div class="sub">${hm(p.a)} – ${ampm(p.b)}</div></div>
${on ? `<span class="chip ac">Now · ${span(p.b - m)} left</span>` : done ? '<span class="chip">Done</span>' : `<span class="chip">${p.b - p.a} min</span>`}</div>`;
}).join('')}</div>
<div class="card" style="margin-top:16px"><h2>My periods<span>Saved on this computer · stays when Class Dash updates</span></h2>
<datalist id="cdcourses">${S.courses.map(c => `<option value="${esc(c.name)}"></option>`).join('')}</datalist>
<div class="pgrid">${PERIOD_KEYS.map(k => `<div class="pset"><label for="cdp-${slug(k)}">${esc(k)}</label><input id="cdp-${slug(k)}" data-period="${esc(k)}" list="cdcourses" value="${esc(S.periods[k] || '')}" placeholder="${/Period/.test(k) ? 'e.g. Biology' : 'Optional'}" autocomplete="off" spellcheck="false"></div>`).join('')}</div></div>`;
};
// ---- Site settings: site.json in the repo (name, icon, colour, banners, hidden pages, hall pass link) ----
const ICON_CHOICES = ['cap', 'book', 'study', 'star', 'bolt', 'rocket', 'heart', 'news', 'leaf', 'flask', 'atom', 'math', 'globe', 'talk', 'code', 'game', 'cal', 'clock', 'pass', 'chart'];
const COLOR_CHOICES = ['#7c9cff', '#3ecf8e', '#f5b546', '#f2637a', '#b48cff', '#4cc9f0', '#ff8f5a', '#e46fd0'];
const SITE_DEFAULT = { name: 'Class Dash', icon: 'cap', accent: '#7c9cff', banners: [], hidden: [], hallpass: PASS, featured: [], hiddenGames: [] };
const clone = o => JSON.parse(JSON.stringify(o));
const hexOk = c => /^#[0-9a-f]{6}$/i.test(c || '');
function fixSite(j) {
const s = Object.assign(clone(SITE_DEFAULT), j && typeof j === 'object' && !Array.isArray(j) ? j : {});
if (!Array.isArray(s.banners)) s.banners = [];
if (!Array.isArray(s.hidden)) s.hidden = [];
if (!Array.isArray(s.featured)) s.featured = [];
if (!Array.isArray(s.hiddenGames)) s.hiddenGames = [];
s.banners = s.banners.filter(b => b && typeof b === 'object').map(b => Object.assign({ id: 'b' + Math.random().toString(36).slice(2, 8), title: '', text: '', button: '', link: '', color: '#3ecf8e', icon: 'news', where: 'both', start: '', end: '' }, b));
return s;
}
var SITE = fixSite(store.get('site', null));
const curSite = () => S.draft || SITE;
function shownNav() { const h = curSite().hidden || []; return NAV.filter(n => !h.includes(n[0])); }
const inWindow = b => { const now = Date.now(), a = b.start ? new Date(b.start).getTime() : -Infinity, z = b.end ? new Date(b.end).getTime() : Infinity; return now >= a && now < z; };
function paintBanners() {
const s = curSite(), gone = store.get('bannersClosed', []);
const list = LIB ? [] : s.banners.filter(b => (b.title || b.text) && b.where !== 'website' && inWindow(b) && (S.draft || !gone.includes(b.id)));
$('.bnrs').innerHTML = list.map(b => `<div class="bnr" style="--bc:${hexOk(b.color) ? b.color : '#3ecf8e'}"><span class="bic">${I[b.icon] || I.news}</span>
<div class="grow wrap">${b.title ? `<b>${esc(b.title)}</b> ` : ''}${esc(b.text)}</div>
${b.button && b.link ? `<button class="btn" data-banner="${esc(b.id)}">${esc(b.button)}</button>` : ''}<button class="ib bx" data-bclose="${esc(b.id)}" title="Hide this">${I.x}</button></div>`).join('');
}
function applySite() {
const s = curSite();
setPack();
$('.bd').style.setProperty('--ac', !S.draft && hexOk(P.accent) ? P.accent : hexOk(s.accent) ? s.accent : '#7c9cff');
$('.brand .logo').innerHTML = I[s.icon] || I.cap;
$('.bname').textContent = s.name || 'Class Dash';
$('[data-omni]').placeholder = 'Search ' + (s.name || 'Class Dash') + ', or go to study.ecology-study';
paintBanners();
}
function loadSite() {
fetch(RAW + 'site.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
if (!j) return;
const s = fixSite(j);
if (JSON.stringify(s) === JSON.stringify(SITE)) return;
SITE = s; store.set('site', j);
if (!S.draft) { applySite(); paintChrome(); if (usesLib(S.view)) renderMain(true); }
}).catch(() => {});
}
// A banner button can point at a study page or game in the repo, a web address, or a dashboard address like study.biology
function openLink(link) {
link = String(link || '').trim();
if (!link) return;
const doc = DOCS.find(d => d.id === link || d.id === 'study/' + link);
if (doc) return openDoc(doc.id);
const pk = PACK.find(p => p.id === link || p.id === 'offline/' + link);
if (pk) return playGame(pk.id);
if (/^https?:\/\//i.test(link)) return void window.open(link, '_blank', 'noopener');
if (/\//.test(link) || /\.html?$/i.test(link)) return void window.open(PAGES + link.replace(/^\/+/, ''), '_blank', 'noopener');
const hit = omniSearch(link).find(x => x.s >= 1000);
if (hit) hit.open(); else if (NAV.some(n => n[0] === link)) go(link);
}
// ---- Admin (hidden page: type the passphrase in the search bar once, then use the Admin button) ----
const SEAL = 'b1b303b405163284c0f00b8e4bd9e1e85816f6e6b882e11d49dab44868b39375';
async function sealed(v) {
try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('') === SEAL; } catch (e) { return false; }
}
const A = { tab: 'study', msg: null, busy: '', arm: null, edit: null, vals: {}, gq: '', gshow: 80, up: { kind: 'file', cat: '' }, log: null, logErr: '', coverFor: null };
const hasKey = () => !!store.get('admintoken', '');
const dirty = () => !!S.draft && JSON.stringify(S.draft) !== JSON.stringify(SITE);
function paintAdminLink() { const b = $('.sbl [data-act="admin"]'); if (b) b.hidden = !store.get('admin', false); }
function openAdmin() { store.set('admin', true); paintAdminLink(); S.draft = clone(SITE); A.msg = null; A.arm = null; A.edit = null; go('admin'); applySite(); loadLib(); }
const NEW_BANNER = () => ({ id: 'b' + Date.now().toString(36), title: '', text: '', button: '', link: '', color: '#3ecf8e', icon: 'news', where: 'both', start: '', end: '' });
const ATABS = [['study', 'Study', I.study], ['games', 'Games', I.game], ['look', 'Look', I.star], ['banners', 'Banners', I.news], ['pages', 'Pages & links', I.book], ['activity', 'Activity', I.clock], ['advanced', 'Advanced', I.code], ['key', 'GitHub key', I.key]];
function aSay(text, cls) {
A.msg = { text, cls };
const el = root.querySelector('.atop .amsg');
if (el) { el.className = 'amsg ' + (cls || ''); el.innerHTML = (A.busy ? '<span class="aspin"></span>' : '') + esc(text); }
}
// ---- GitHub: every Study/Games change is one commit made with the Git Data API ----
const GH = 'https://api.github.com/repos/' + REPO;
const b64enc = t => btoa(unescape(encodeURIComponent(t)));
const b64dec = b => decodeURIComponent(escape(atob(String(b || '').replace(/\s/g, ''))));
const fileB64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(new Error("Couldn't read " + f.name + '.')); r.readAsDataURL(f); });
const ghErr = st => st === 401 ? 'GitHub rejected the key. Check it in the GitHub key tab, or make a new one.' : st === 403 || st === 404 ? "That key can't change the repo. It needs Contents: Read and write on yee-new." : st === 409 ? 'GitHub was busy. Try again.' : st === 422 ? "GitHub didn't accept that (a file may be too big)." : 'GitHub error ' + st + '.';
async function ghJ(path, opt = {}) {
const tok = store.get('admintoken', '');
const r = await fetch(GH + path, Object.assign({ cache: 'no-store' }, opt, { headers: Object.assign({ Accept: 'application/vnd.github+json' }, tok ? { Authorization: 'Bearer ' + tok } : {}, opt.body ? { 'Content-Type': 'application/json' } : {}) }));
if (!r.ok) { const e = new Error(ghErr(r.status)); e.status = r.status; throw e; }
return r.status === 204 ? null : r.json();
}
async function ghHead() { const ref = await ghJ('/git/ref/heads/' + BRANCH); const c = await ghJ('/git/commits/' + ref.object.sha); return { commit: ref.object.sha, tree: c.tree.sha }; }
async function ghFiles(tree) { return ((await ghJ('/git/trees/' + tree + '?recursive=1')).tree || []).filter(x => x.type === 'blob'); }
// plan(files) returns tree entries: { path, sha } to keep a blob at a new path, { path, sha: null } to delete, { path, b64 } for new content
async function ghChange(message, plan, retry) {
const head = await ghHead();
const files = await ghFiles(head.tree);
const entries = await plan(files);
if (!entries.length) throw new Error('Nothing to change.');
const tree = [];
for (const e of entries) {
const sha = e.b64 != null ? (await ghJ('/git/blobs', { method: 'POST', body: JSON.stringify({ content: e.b64, encoding: 'base64' }) })).sha : e.sha;
tree.push({ path: e.path, mode: e.mode || '100644', type: 'blob', sha });
}
const nt = await ghJ('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree, tree }) });
const nc = await ghJ('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: nt.sha, parents: [head.commit] }) });
try { await ghJ('/git/refs/heads/' + BRANCH, { method: 'PATCH', body: JSON.stringify({ sha: nc.sha }) }); }
catch (e) { if (e.status === 422 && !retry) return ghChange(message, plan, true); throw e; }
const after = await ghFiles(nt.sha);
S.lib = libFrom(after.map(f => f.path)); store.set('lib', S.lib); noteSeen(S.lib.study); setPack();
Object.keys(docCache).forEach(k => delete docCache[k]); Object.keys(blobCache).forEach(k => delete blobCache[k]);
A.log = null;
return after;
}
const taken = (files, p) => files.some(f => f.path === p || f.path.startsWith(p + '/'));
function moveFiles(files, from, to, exact) {
const out = [];
files.forEach(f => {
const np = f.path === from ? to : !exact && f.path.startsWith(from + '/') ? to + f.path.slice(from.length) : null;
if (np && np !== f.path) out.push({ path: np, sha: f.sha, mode: f.mode }, { path: f.path, sha: null });
});
return out;
}
const dropFiles = (files, from, exact) => files.filter(f => f.path === from || (!exact && f.path.startsWith(from + '/'))).map(f => ({ path: f.path, sha: null }));
// Runs one admin action: shows progress, then the result
async function aRun(label, fn) {
if (A.busy) return;
if (!hasKey()) { A.tab = 'key'; A.msg = { text: 'Add your GitHub key first. It only takes a minute.', cls: 'err' }; return renderMain(true); }
A.busy = label; A.arm = null; A.msg = { text: label + '…', cls: '' };
renderMain(true);
try { const ok = await fn(); A.edit = null; A.msg = { text: ok || 'Done.', cls: 'ok' }; }
catch (e) { A.msg = { text: e.message || 'Something went wrong.', cls: 'err' }; }
A.busy = '';
if (S.view === 'admin') renderMain(true);
}
function armed(key) { if (A.arm === key) { A.arm = null; return true; } A.arm = key; renderMain(true); return false; }
const delBtn = (key, act, attrs, label, ask) => `<button class="btn sm${A.arm === key ? ' danger' : ''}" data-act="${act}" ${attrs}>${A.arm === key ? ask : label}</button>`;
// Updates site.json on GitHub straight away (used for hiding and featuring games)
async function quickSite(fn, message) {
let next;
await ghChange(message, async files => {
const f = files.find(x => x.path === 'site.json');
let cur = {};
if (f) { try { cur = JSON.parse(b64dec((await ghJ('/git/blobs/' + f.sha)).content)); } catch (e) { cur = {}; } }
next = fixSite(cur); fn(next);
return [{ path: 'site.json', b64: b64enc(JSON.stringify(next, null, 2) + '\n') }];
});
SITE = fixSite(next); store.set('site', SITE);
if (S.draft) fn(S.draft);
applySite();
}
async function publishSite() {
const draft = clone(S.draft);
await ghChange('Update site settings', async () => [{ path: 'site.json', b64: b64enc(JSON.stringify(draft, null, 2) + '\n') }]);
SITE = fixSite(draft); store.set('site', SITE);
return 'Published! Everyone gets it within about 5 minutes.';
}
// ---- Admin page ----
function vAdmin() {
const m = A.msg || { text: '', cls: '' }, key = hasKey();
const head = `<div class="card adm atop"><div class="ahd"><span class="logo">${I.gear}</span><div class="grow"><div class="t" style="font-size:17px">Admin</div>
<div class="sub wrap">Changes here are for everyone. Study and Games changes save to GitHub as soon as you make them.</div></div>
${key ? '<span class="chip gd">GitHub key saved</span>' : '<button class="btn pri" data-act="adm-tab" data-t="key">Add GitHub key</button>'}</div>
<div class="amsg ${m.cls}">${A.busy ? '<span class="aspin"></span>' : ''}${esc(m.text)}</div></div>`;
const tabs = `<div class="atabs">${ATABS.map(([k, l, ic]) => `<button data-act="adm-tab" data-t="${k}" class="${A.tab === k ? 'on' : ''}">${ic}${l}${k === 'key' && !key ? ' <span class="badge">!</span>' : ''}</button>`).join('')}</div>`;
const draftBar = dirty() ? `<div class="adraft"><span class="grow wrap"><b>Unpublished changes</b> to the look, banners or pages. Only you can see them until you publish.</span><button class="btn" data-act="adm-discard">Discard</button><button class="btn pri" data-act="adm-publish">Publish for everyone</button></div>` : '';
const body = { study: aStudy, games: aGames, look: aLook, banners: aBanners, pages: aPages, activity: aActivity, advanced: aAdvanced, key: aKey }[A.tab] || aStudy;
return head + tabs + draftBar + body();
}
const cleanSeg = s => String(s || '').trim().replace(/[\\/:*?"<>|#%[\]\u0000-\u001f]+/g, '').replace(/\s+/g, '-').replace(/^[.-]+/, '').slice(0, 60);
function studyCats() {
const dirs = new Set([...((S.lib && S.lib.dirs) || []), ...DOCS.map(d => d.dir).filter(Boolean)]);
const cats = [...dirs].map(dir => { const name = pretty(dir), h = hash(name.toLowerCase()); return { dir, name, docs: DOCS.filter(d => d.dir === dir), color: PAL[h % PAL.length], icon: (SUBJECTS.find(s => s[0].test(name)) || [, I.study])[1] }; })
.sort((a, b) => a.name.localeCompare(b.name));
const other = DOCS.filter(d => !d.dir);
if (other.length) cats.push({ dir: '', name: 'Not in a category', docs: other, color: '#8c93a5', icon: I.study });
return cats;
}
const editRow = (save, attrs, ph, saveLabel) => `<input class="grow" data-av="edit" value="${esc(A.vals.edit || '')}" placeholder="${esc(ph || '')}" maxlength="120"><button class="btn sm pri" data-act="${save}" ${attrs}>${saveLabel || 'Save'}</button><button class="btn sm" data-act="adm-cancel">Cancel</button>`;
function docRowA(p, cats) {
const at = `data-path="${esc(p.id)}"`, ek = 'doc:' + p.id;
if (A.edit === ek) return `<div class="ares"><span class="chip">${esc(docLabel(p))}</span>${editRow('adm-docsave', at, 'New name')}</div>`;
if (A.edit === 'link:' + p.id) return `<div class="ares"><span class="chip">Link</span>${editRow('adm-linksave', at, 'https://…', 'Save link')}</div>`;
const moves = cats.filter(c => c.dir && c.dir !== p.dir);
return `<div class="ares"><span class="chip">${esc(docLabel(p))}</span><span class="grow"><span class="t">${esc(p.name)}</span>${isNewDoc(p) ? '<span class="chip new">New</span>' : ''}</span>
<button class="btn sm" data-act="adm-docopen" ${at}>Open</button><button class="btn sm" data-act="adm-docedit" ${at}>Rename</button>
${p.kind === 'link' ? `<button class="btn sm" data-act="adm-linkedit" ${at}>Edit link</button>` : ''}
${moves.length ? `<select data-amove="${esc(p.id)}" title="Move to another category"><option value="">Move to…</option>${moves.map(c => `<option value="${esc(c.dir)}">${esc(c.name)}</option>`).join('')}</select>` : ''}
${delBtn(ek, 'adm-docdel', at, 'Delete', 'Click again to delete')}</div>`;
}
function aStudy() {
const cats = studyCats(), up = A.up;
const sel = up.cat && (up.cat === '__new' || cats.some(c => c.dir === up.cat)) ? up.cat : (cats.find(c => c.dir) || { dir: '__new' }).dir;
const add = `<div class="card adm sset-c"><h2>Add to Study<span>shows up for everyone right away</span></h2>
<div class="arow" style="margin-top:0"><span class="alab">Category</span><select data-upcat>${cats.filter(c => c.dir).map(c => `<option value="${esc(c.dir)}"${sel === c.dir ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="__new"${sel === '__new' ? ' selected' : ''}>+ New category…</option></select>
${sel === '__new' ? `<input data-up="newcat" value="${esc(up.newcat || '')}" placeholder="New category name (e.g. Chemistry)" maxlength="40">` : ''}
<div class="seg mini"><button data-upkind="file" class="${up.kind !== 'link' ? 'on' : ''}">Files</button><button data-upkind="link" class="${up.kind === 'link' ? 'on' : ''}">A web link</button></div></div>
${up.kind === 'link' ? `<div class="arow"><input class="wide" data-up="url" value="${esc(up.url || '')}" placeholder="https://quizlet.com/…"><input data-up="name" value="${esc(up.name || '')}" placeholder="Name shown in Study" maxlength="80"></div>`
: `<label class="adrop"><input type="file" data-upfile multiple><span>${I.plus}<b>Choose files</b> or drop them here</span><span class="sub wrap">PDFs, practice tests (.html), images or any file, up to 25 MB each. The file name becomes the title, and you can rename it after.</span><span class="afiles"></span></label>`}
<div class="arow"><button class="btn pri" data-act="adm-upload">Add to Study</button></div></div>`;
const list = cats.map(c => {
const ek = 'cat:' + c.dir, at = `data-dir="${esc(c.dir)}"`;
const headRow = A.edit === ek ? `<span class="ssi" style="background:${c.color}">${c.icon}</span>${editRow('adm-catsave', at, 'Category name')}`
: `<span class="ssi" style="background:${c.color}">${c.icon}</span><div class="grow"><div class="t">${esc(c.name)}</div><div class="sub">${c.docs.length} ${c.docs.length === 1 ? 'resource' : 'resources'}</div></div>
${c.dir ? `<button class="btn sm" data-act="adm-addto" ${at}>Add files</button><button class="btn sm" data-act="adm-catedit" ${at}>Rename</button>${delBtn(ek, 'adm-catdel', at, 'Delete', c.docs.length ? 'Delete it and ' + c.docs.length + ' file' + (c.docs.length === 1 ? '' : 's') + '?' : 'Click again to delete')}` : ''}`;
return `<div class="acat"><div class="acath">${headRow}</div>${c.docs.map(p => docRowA(p, cats)).join('') || '<div class="sub aempty">Empty. Use "Add files" to put something in it.</div>'}</div>`;
}).join('');
return add + `<div class="card adm"><h2>Categories<span>${cats.filter(c => c.dir).length} categories · ${DOCS.length} resources</span></h2>
<div class="arow" style="margin-top:0"><input data-av="newcat" value="${esc(A.vals.newcat || '')}" placeholder="New category name (e.g. Chemistry)" maxlength="40"><button class="btn" data-act="adm-newcat">${I.plus}Create category</button></div>
${list || '<p class="sub">No study resources yet.</p>'}</div>`;
}
const gameFiles = (files, id) => {
if (/\/index\.html?$/i.test(id)) { const dir = id.replace(/\/index\.html?$/i, ''); return { dir, list: files.filter(f => f.path.startsWith(dir + '/')) }; }
const stem = id.replace(/\.html?$/i, '');
return { stem, list: files.filter(f => f.path === id || (f.path.startsWith(stem + '.') && /^(license\.txt|load-from-repo\.txt|png|jpe?g|webp|gif|svg)$/i.test(f.path.slice(stem.length + 1)))) };
};
function gameRowA(p, hid, fea) {
const at = `data-id="${esc(p.id)}"`, ek = 'game:' + p.id, h = hash(p.name);
const thumb = `<span class="gthumb" style="background:linear-gradient(135deg,${PAL[h % PAL.length]},${PAL[(h >>> 3) % PAL.length]})">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : esc(p.name.charAt(0))}</span>`;
if (A.edit === ek) return `<div class="ares">${thumb}${editRow('adm-gsave', at, 'Game name')}</div>`;
return `<div class="ares${hid ? ' dim' : ''}">${thumb}<span class="grow"><span class="t">${esc(p.name)}</span>${fea ? '<span class="chip ac">Featured</span>' : ''}${hid ? '<span class="chip">Hidden</span>' : ''}${p.repo ? '<span class="chip gd" title="Loads straight from the repo, not GitHub Pages">From repo</span>' : ''}</span>
<button class="btn sm" data-act="adm-gplay" ${at}>Play</button><button class="btn sm" data-act="adm-grepo" ${at} title="${p.repo ? 'Load it from GitHub Pages again' : 'Load it straight from the repo, so changes work right away'}">${p.repo ? 'Use Pages' : 'Use repo'}</button><button class="btn sm" data-act="adm-gedit" ${at}>Rename</button><button class="btn sm" data-act="adm-gcover" ${at}>${p.img ? 'Change cover' : 'Add cover'}</button>
<button class="btn sm" data-act="adm-gfeat" ${at}>${fea ? 'Unfeature' : 'Feature'}</button><button class="btn sm" data-act="adm-ghide" ${at}>${hid ? 'Show' : 'Hide'}</button>
${delBtn(ek, 'adm-gdel', at, 'Delete', 'Click again to delete')}</div>`;
}
function aGames() {
const all = (S.lib ? S.lib.paths : []).map(toPack).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
const s = curSite(), hid = new Set(s.hiddenGames), fea = new Set(s.featured), q = A.gq.trim().toLowerCase();
const list = q ? all.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) : all.slice().sort((a, b) => (fea.has(b.id) - fea.has(a.id)) || (hid.has(b.id) - hid.has(a.id)));
const shown = list.slice(0, q ? 200 : A.gshow);
return `<div class="card adm sset-c"><h2>Add games</h2>
<label class="adrop"><input type="file" data-gfile multiple accept=".html,.htm"><span>${I.plus}<b>Choose game files</b> or drop them here</span><span class="sub wrap">Single-file .html games. The file name becomes the game's name. A brand-new game can take a few minutes to start working while GitHub Pages updates.</span><span class="afiles"></span></label>
<div class="arow"><button class="btn pri" data-act="adm-gupload">Add games</button></div></div>
<div class="card adm"><h2>All games<span>${all.length} games · ${fea.size} featured · ${hid.size} hidden</span></h2>
<p class="sub wrap" style="margin-bottom:10px"><b>Feature</b> pins a game to the top of the library. <b>Hide</b> takes it out of the library without deleting it. <b>Use repo</b> loads a game straight from the repo, so it works without waiting for GitHub Pages.</p>
<div class="arow" style="margin-top:0"><input class="wide" data-agq value="${esc(A.gq)}" placeholder="Search games to rename, hide or delete…" autocomplete="off"></div>
${shown.map(p => gameRowA(p, hid.has(p.id), fea.has(p.id))).join('') || '<p class="sub" style="padding:10px 0">No games match.</p>'}
${list.length > shown.length ? `<div class="arow"><button class="btn" data-act="adm-gmore">Show more</button><span class="sub">${list.length - shown.length} more</span></div>` : ''}
<input type="file" data-acover accept="image/*" hidden></div>`;
}
function aLook() {
const s = S.draft;
const sw = (cur, attr) => COLOR_CHOICES.map(c => `<button class="sw${(cur || '').toLowerCase() === c ? ' on' : ''}" style="background:${c}" ${attr(c)} title="${c}"></button>`).join('');
const icons = (cur, attr) => ICON_CHOICES.map(k => `<button class="icn${cur === k ? ' on' : ''}" ${attr(k)} title="${k}">${I[k]}</button>`).join('');
return `<div class="card adm"><h2>Look<span>preview right away · publish to save</span></h2>
<label class="alab" style="margin-top:0">Name</label><input data-site="name" value="${esc(s.name)}" maxlength="40" style="width:100%;max-width:360px">
<label class="alab">Icon</label><div class="icons">${icons(s.icon, k => `data-sicon="${k}"`)}</div>
<label class="alab">Accent colour</label><div class="sws">${sw(s.accent, c => `data-saccent="${c}"`)}<input type="color" data-site="accent" value="${hexOk(s.accent) ? s.accent : '#7c9cff'}" title="Pick any colour"></div>
<p class="sub wrap" style="margin-top:12px">People who picked their own accent colour in Settings keep theirs.</p></div>`;
}
function aBanners() {
const s = S.draft;
const sw = (cur, attr) => COLOR_CHOICES.map(c => `<button class="sw${(cur || '').toLowerCase() === c ? ' on' : ''}" style="background:${c}" ${attr(c)} title="${c}"></button>`).join('');
const icons = (cur, attr) => ICON_CHOICES.map(k => `<button class="icn${cur === k ? ' on' : ''}" ${attr(k)} title="${k}">${I[k]}</button>`).join('');
const when = b => { const now = Date.now(); if (b.end && new Date(b.end) <= now) return '<span class="chip">Ended</span>'; if (b.start && new Date(b.start) > now) return '<span class="chip wn">Scheduled</span>'; return '<span class="chip gd">Showing now</span>'; };
return `<div class="card adm"><h2>Banners<span>shown at the top of the dashboard and/or the website</span></h2>
${s.banners.map((b, i) => `<div class="abn"><div class="arow" style="margin-top:0">${when(b)}<span class="grow"></span>${i ? `<button class="btn sm" data-act="adm-bup" data-i="${i}" title="Move up">↑</button>` : ''}<button class="btn sm" data-act="adm-bdup" data-i="${i}">Duplicate</button>${delBtn('ban:' + b.id, 'adm-rmb', `data-i="${i}"`, 'Delete', 'Click again to delete')}</div>
<div class="arow"><input data-bf="${i}:title" value="${esc(b.title)}" placeholder="Bold start (e.g. Taking Bio?)" maxlength="60"><input class="wide" data-bf="${i}:text" value="${esc(b.text)}" placeholder="Message" maxlength="240"></div>
<div class="arow"><input data-bf="${i}:button" value="${esc(b.button)}" placeholder="Button text (optional)" maxlength="40"><input class="wide" data-bf="${i}:link" value="${esc(b.link)}" placeholder="Button link: https://…, study/Biology/file.html, or study.biology"></div>
<div class="arow"><span class="alab">Show on</span><div class="seg mini">${[['dashboard', 'Dashboard'], ['website', 'Website'], ['both', 'Both']].map(([k, l]) => `<button data-bwhere="${i}:${k}" class="${b.where === k ? 'on' : ''}">${l}</button>`).join('')}</div>
<span class="alab">From</span><input type="datetime-local" data-bf="${i}:start" value="${esc(b.start)}"><span class="alab">Until</span><input type="datetime-local" data-bf="${i}:end" value="${esc(b.end)}"></div>
<div class="arow"><span class="alab">Colour</span><div class="sws">${sw(b.color, c => `data-bcolor="${i}:${c}"`)}</div></div>
<div class="arow"><span class="alab">Icon</span><div class="icons">${icons(b.icon, k => `data-bicon="${i}:${k}"`)}</div></div></div>`).join('') || '<p class="sub">No banners yet.</p>'}
<div class="arow"><button class="btn" data-act="adm-addb">${I.plus}Add banner</button></div></div>`;
}
function aPages() {
const s = S.draft;
return `<div class="card adm"><h2>Pages<span>untick to hide a page from the sidebar</span></h2>
${NAV.map(([v, label]) => `<label class="chk"><input type="checkbox" data-shide="${v}"${(s.hidden || []).includes(v) ? '' : ' checked'}>${esc(label)}</label>`).join('')}</div>
<div class="card adm" style="margin-top:16px"><h2>Links</h2><label class="alab" style="margin-top:0">Hall pass link</label><input data-site="hallpass" value="${esc(s.hallpass)}" style="width:100%;max-width:460px"></div>`;
}
function aActivity() {
if (!A.log && !A.logErr) loadLog();
return `<div class="card adm"><h2>Recent changes<span>the last 20 saves to the repo</span></h2>
${A.logErr ? `<p class="sub">${esc(A.logErr)}</p>` : !A.log ? '<div class="spin"></div>' : A.log.map(c => `<a class="ares" href="${esc(c.url)}" target="_blank" rel="noopener"><span class="grow"><span class="t">${esc(c.msg)}</span><span class="sub">${esc(c.who)} · ${esc(rel(c.at))}</span></span><span class="sub">${I.ext}</span></a>`).join('')}
<div class="arow"><button class="btn" data-act="adm-logrefresh">Refresh</button><a class="btn" href="https://github.com/${REPO}" target="_blank" rel="noopener">Open the repo on GitHub</a></div></div>`;
}
async function loadLog() {
A.log = null; A.logErr = '';
try { A.log = (await ghJ('/commits?sha=' + BRANCH + '&per_page=20')).map(c => ({ msg: c.commit.message.split('\n')[0], who: (c.author && c.author.login) || c.commit.author.name, at: c.commit.author.date, url: c.html_url })); }
catch (e) { A.logErr = e.message || "Couldn't load recent changes."; }
if (S.view === 'admin' && A.tab === 'activity') renderMain(true);
}
function aAdvanced() {
return `<div class="card adm"><h2>Everything (advanced)<span>edit the raw site settings, then Apply</span></h2>
<textarea data-sitejson spellcheck="false">${esc(JSON.stringify(S.draft, null, 2))}</textarea><div class="arow"><button class="btn" data-act="adm-json">Apply</button></div></div>`;
}
function aKey() {
const key = hasKey();
return `<div class="card adm"><h2>GitHub key<span>${key ? 'saved on this computer' : 'not set up yet'}</span></h2>
<p class="sub wrap">Admin needs a GitHub key to save changes to the yee-new repo. It's stored only on this computer.</p>
<ol class="asteps"><li><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Open GitHub's new key page</a> (signed in as you).</li>
<li>Name it <b>Class Dash</b>. Under <b>Repository access</b>, pick <b>Only select repositories</b>, then <b>yee-new</b>.</li>
<li>Under <b>Permissions</b>, set <b>Contents</b> to <b>Read and write</b>. Click <b>Generate token</b> and copy it.</li>
<li>Paste it below and click <b>Save key</b>.</li></ol>
${key ? '<div class="arow"><button class="btn" data-act="adm-testkey">Test the key</button><button class="btn" data-act="adm-forget">Remove key from this computer</button></div>'
: '<div class="arow"><input type="password" data-tok class="wide" placeholder="Paste your key (starts with github_pat_)" autocomplete="off"><button class="btn pri" data-act="adm-savetok">Save key</button></div>'}</div>
<div class="card adm" style="margin-top:16px"><h2>This computer</h2><p class="sub wrap">The Admin button shows in the sidebar on computers where you've opened Admin.</p>
<div class="arow"><button class="btn" data-act="adm-lock">Hide the Admin button here</button></div></div>`;
}
// ---- Admin actions ----
function docMove(files, p, toDir, toBase) {
const parts = p.id.slice(STUDY.length).split('/');
const folder = parts.length === 3 && /^index\.html?$/i.test(parts[2]);
const fromDir = parts.length > 1 ? parts[0] : '';
const base = toBase || (folder ? parts[1] : parts[parts.length - 1]);
const toDirPath = STUDY + (toDir == null ? fromDir : toDir) + ((toDir == null ? fromDir : toDir) ? '/' : '');
const from = folder ? STUDY + parts.slice(0, 2).join('/') : p.id;
const to = toDirPath + base;
if (from === to) throw new Error("That's already its name.");
if (taken(files, to)) throw new Error('Something with that name is already there.');
return moveFiles(files, from, to, !folder);
}
function keepFolder(files, dir, removing) {
if (!dir) return [];
const gone = new Set(removing.filter(e => e.sha === null).map(e => e.path));
const left = files.filter(f => f.path.startsWith(STUDY + dir + '/') && !gone.has(f.path));
return left.length ? [] : [{ path: STUDY + dir + '/.keep', b64: b64enc('Class Dash study category\n') }];
}
const aOnStudy = () => { if (S.view === 'admin') renderMain(true); };
async function adminAct(d, t) {
const doc = d.path && DOCS.find(x => x.id === d.path);
const game = d.id && toPack(d.id);
switch (d.act) {
case 'adm-tab': A.tab = d.t; A.arm = null; A.edit = null; if (d.t === 'activity') A.log = null, A.logErr = ''; return renderMain(true);
case 'adm-cancel': A.edit = null; A.arm = null; return renderMain(true);
case 'adm-publish': return aRun('Publishing', publishSite);
case 'adm-discard': S.draft = clone(SITE); A.msg = { text: 'Changes discarded.', cls: '' }; applySite(); return renderMain(true);
case 'adm-savetok': { const v = ((root.querySelector('[data-tok]') || {}).value || '').trim(); if (!v) return aSay('Paste the key first.', 'err'); store.set('admintoken', v); A.msg = { text: 'Key saved on this computer. Click "Test the key" to check it.', cls: 'ok' }; return renderMain(true); }
case 'adm-forget': try { localStorage.removeItem('classdash_admintoken'); } catch (err) {} A.msg = { text: 'Key removed from this computer.', cls: '' }; return renderMain(true);
case 'adm-testkey': return aRun('Testing the key', async () => { await ghHead(); return 'The key works and can see the repo.'; });
case 'adm-lock': store.set('admin', false); paintAdminLink(); S.draft = null; applySite(); return go(isCanvas ? 'home' : 'games');
case 'adm-json': try { S.draft = fixSite(JSON.parse(root.querySelector('[data-sitejson]').value)); A.msg = { text: 'Applied. Publish to save it for everyone.', cls: 'ok' }; } catch (err) { return aSay("That isn't valid JSON: " + err.message, 'err'); } applySite(); return renderMain(true);
case 'adm-logrefresh': A.log = null; A.logErr = ''; return renderMain(true);
// Study
case 'adm-addto': A.up = Object.assign({}, A.up, { cat: d.dir, kind: 'file' }); renderMain(true); { const z = root.querySelector('.adrop'); if (z) { z.scrollIntoView({ block: 'center', behavior: P.motion ? 'smooth' : 'auto' }); z.classList.add('pulse'); } } return;
case 'adm-upload': {
const up = A.up, cats = studyCats().filter(c => c.dir);
const pick = up.cat && (up.cat === '__new' || cats.some(c => c.dir === up.cat)) ? up.cat : (cats[0] ? cats[0].dir : '__new');
const cat = cleanSeg(pick === '__new' ? up.newcat : pick);
if (!cat) return aSay('Pick a category, or type a name for the new one.', 'err');
let entries = [];
if (up.kind === 'link') {
const url = (up.url || '').trim();
if (!/^https?:\/\/\S+$/i.test(url)) return aSay('Paste a full web address starting with https://', 'err');
let name = (up.name || '').trim(); if (!name) { try { name = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { name = 'Link'; } }
entries.push({ path: STUDY + cat + '/' + cleanSeg(name) + '.url', b64: b64enc('[InternetShortcut]\r\nURL=' + url + '\r\n'), name });
} else {
const input = root.querySelector('[data-upfile]'), files = input && input.files ? [...input.files] : [];
if (!files.length) return aSay('Choose at least one file first.', 'err');
const big = files.find(f => f.size > 25 * 1024 * 1024);
if (big) return aSay('"' + big.name + '" is over 25 MB, which is too big.', 'err');
aSay('Reading ' + (files.length === 1 ? 'the file' : files.length + ' files') + '…', '');
try { for (const f of files) entries.push({ path: STUDY + cat + '/' + (cleanSeg(f.name.replace(/\.[^.]+$/, '')) || 'file') + '.' + (extOf(f.name) || 'bin'), b64: await fileB64(f), name: f.name.replace(/\.[^.]+$/, '') }); }
catch (e) { return aSay(e.message, 'err'); }
}
return aRun('Adding to Study', async () => {
await ghChange((entries.length === 1 ? 'Add study resource: ' + cat + '/' + entries[0].path.split('/').pop() : 'Add ' + entries.length + ' study resources to ' + cat),
async files => entries.map(e => ({ path: e.path, b64: e.b64 })).concat(files.filter(f => f.path === STUDY + cat + '/.keep').map(f => ({ path: f.path, sha: null }))));
A.up = { kind: up.kind, cat };
return (entries.length === 1 ? 'Added "' + pretty(entries[0].path.split('/').pop().replace(/\.[^.]+$/, '')) + '"' : 'Added ' + entries.length + ' files') + ' to ' + pretty(cat) + '. Everyone can see it in Study now.';
});
}
case 'adm-newcat': {
const cat = cleanSeg(A.vals.newcat);
if (!cat) return aSay('Type a name for the new category first.', 'err');
return aRun('Creating category', async () => {
await ghChange('Add study category: ' + cat, async files => { if (taken(files, STUDY + cat)) throw new Error('There is already a category called ' + pretty(cat) + '.'); return [{ path: STUDY + cat + '/.keep', b64: b64enc('Class Dash study category\n') }]; });
A.vals.newcat = ''; A.up = { kind: 'file', cat };
return 'Created ' + pretty(cat) + '. Add files to it whenever you like.';
});
}
case 'adm-catedit': A.edit = 'cat:' + d.dir; A.vals.edit = pretty(d.dir); A.arm = null; return renderMain(true);
case 'adm-catsave': {
const to = cleanSeg(A.vals.edit);
if (!to) return aSay('Type a name first.', 'err');
return aRun('Renaming category', async () => {
await ghChange('Rename study category: ' + d.dir + ' to ' + to, async files => { if (to !== d.dir && taken(files, STUDY + to)) throw new Error('There is already a category called ' + pretty(to) + '.'); return moveFiles(files, STUDY + d.dir, STUDY + to); });
if (S.scls === pretty(d.dir)) S.scls = 'All';
return 'Renamed to ' + pretty(to) + '.';
});
}
case 'adm-catdel':
if (!armed('cat:' + d.dir)) return;
return aRun('Deleting category', async () => { await ghChange('Delete study category: ' + d.dir, async files => dropFiles(files, STUDY + d.dir)); return 'Deleted ' + pretty(d.dir) + '.'; });
case 'adm-docopen': if (doc) openDoc(doc.id); return;
case 'adm-docedit': A.edit = 'doc:' + d.path; A.vals.edit = doc ? doc.name : ''; A.arm = null; return renderMain(true);
case 'adm-docsave': {
if (!doc) return;
const name = cleanSeg(A.vals.edit);
if (!name) return aSay('Type a name first.', 'err');
const folder = /\/index\.html?$/i.test(doc.id) && doc.id.slice(STUDY.length).split('/').length === 3;
return aRun('Renaming', async () => { await ghChange('Rename study resource: ' + doc.name + ' to ' + pretty(name), async files => docMove(files, doc, null, folder ? name : name + (doc.ext ? '.' + doc.ext : ''))); return 'Renamed to ' + pretty(name) + '.'; });
}
case 'adm-linkedit':
A.edit = 'link:' + d.path; A.vals.edit = ''; A.arm = null; renderMain(true);
docLinkUrl(d.path).then(u => { if (A.edit === 'link:' + d.path) { A.vals.edit = u || ''; const i = root.querySelector('[data-av="edit"]'); if (i && !i.value) i.value = A.vals.edit; } }).catch(() => {});
return;
case 'adm-linksave': {
const url = (A.vals.edit || '').trim();
if (!/^https?:\/\/\S+$/i.test(url)) return aSay('Paste a full web address starting with https://', 'err');
return aRun('Saving link', async () => { await ghChange('Update study link: ' + d.path.slice(STUDY.length), async () => [{ path: d.path, b64: b64enc('[InternetShortcut]\r\nURL=' + url + '\r\n') }]); return 'Link updated.'; });
}
case 'adm-docdel':
if (!doc || !armed('doc:' + d.path)) return;
return aRun('Deleting', async () => {
await ghChange('Remove study resource: ' + d.path.slice(STUDY.length), async files => {
const folder = /\/index\.html?$/i.test(doc.id) && doc.id.slice(STUDY.length).split('/').length === 3;
const out = folder ? dropFiles(files, doc.id.replace(/\/index\.html?$/i, '')) : dropFiles(files, doc.id, true);
return out.concat(keepFolder(files, doc.dir, out));
});
return 'Deleted "' + doc.name + '".';
});
// Games
case 'adm-gmore': A.gshow += 100; return renderMain(true);
case 'adm-gplay': return playGame(d.id);
case 'adm-gedit': A.edit = 'game:' + d.id; A.vals.edit = game ? game.name : ''; A.arm = null; return renderMain(true);
case 'adm-gsave': {
const name = cleanSeg(A.vals.edit);
if (!name) return aSay('Type a name first.', 'err');
return aRun('Renaming game', async () => {
let newId = '';
await ghChange('Rename game: ' + game.name + ' to ' + pretty(name), async files => {
const g = gameFiles(files, d.id);
if (g.dir) { const to = DIR + name; if (taken(files, to)) throw new Error('A game with that name already exists.'); newId = to + '/index.html'; return moveFiles(files, g.dir, to); }
const to = DIR + name;
if (files.some(f => f.path === to + '.html' || f.path === to + '.htm')) throw new Error('A game with that name already exists.');
newId = to + d.id.slice(g.stem.length);
return g.list.flatMap(f => [{ path: to + f.path.slice(g.stem.length), sha: f.sha, mode: f.mode }, { path: f.path, sha: null }]);
});
const s = curSite();
if (s.featured.includes(d.id) || s.hiddenGames.includes(d.id)) await quickSite(x => { x.featured = x.featured.map(i => i === d.id ? newId : i); x.hiddenGames = x.hiddenGames.map(i => i === d.id ? newId : i); }, 'Keep game settings after rename');
store.set('recent', store.get('recent', []).map(k => k === 'pack:' + d.id ? 'pack:' + newId : k));
return 'Renamed to ' + pretty(name) + '. It can take a few minutes to start working under the new name.';
});
}
case 'adm-grepo': {
const on = repoGame(d.id), mk = repoMarker(d.id);
return aRun(on ? 'Switching to GitHub Pages' : 'Switching to the repo', async () => {
await ghChange((on ? 'Load from GitHub Pages: ' : 'Load from the repo: ') + game.name, async files => on ? files.filter(f => f.path === mk).map(f => ({ path: f.path, sha: null }))
: [{ path: mk, b64: b64enc('This game loads straight from the repo (raw.githubusercontent.com) instead of GitHub Pages,\nso changes work right away. Delete this file to load it from GitHub Pages again.\n') }]);
return on ? game.name + ' loads from GitHub Pages again.' : game.name + ' now loads straight from the repo. Games with separate script files may need a small change to work this way.';
});
}
case 'adm-gcover': { A.coverFor = d.id; const inp = root.querySelector('[data-acover]'); if (inp) { inp.value = ''; inp.click(); } return; }
case 'adm-gfeat': {
const on = curSite().featured.includes(d.id);
return aRun(on ? 'Unfeaturing' : 'Featuring', async () => { await quickSite(x => { x.featured = on ? x.featured.filter(i => i !== d.id) : [d.id, ...x.featured.filter(i => i !== d.id)]; }, (on ? 'Unfeature game: ' : 'Feature game: ') + game.name); return on ? game.name + ' is no longer featured.' : game.name + ' is now featured at the top of the library.'; });
}
case 'adm-ghide': {
const on = curSite().hiddenGames.includes(d.id);
return aRun(on ? 'Showing' : 'Hiding', async () => { await quickSite(x => { x.hiddenGames = on ? x.hiddenGames.filter(i => i !== d.id) : [...x.hiddenGames.filter(i => i !== d.id), d.id]; }, (on ? 'Show game: ' : 'Hide game: ') + game.name); return on ? game.name + ' is back in the library.' : game.name + ' is hidden. It stays in the repo, so you can show it again anytime.'; });
}
case 'adm-gdel':
if (!armed('game:' + d.id)) return;
return aRun('Deleting game', async () => {
await ghChange('Remove game: ' + game.name, async files => { const g = gameFiles(files, d.id); return g.dir ? dropFiles(files, g.dir) : g.list.map(f => ({ path: f.path, sha: null })); });
const s = curSite();
if (s.featured.includes(d.id) || s.hiddenGames.includes(d.id)) await quickSite(x => { x.featured = x.featured.filter(i => i !== d.id); x.hiddenGames = x.hiddenGames.filter(i => i !== d.id); }, 'Clean up game settings');
return 'Deleted ' + game.name + '.';
});
case 'adm-gupload': {
const input = root.querySelector('[data-gfile]'), files = input && input.files ? [...input.files] : [];
if (!files.length) return aSay('Choose at least one .html game file first.', 'err');
const bad = files.find(f => !/\.html?$/i.test(f.name));
if (bad) return aSay('"' + bad.name + '" isn\'t an .html file.', 'err');
const big = files.find(f => f.size > 50 * 1024 * 1024);
if (big) return aSay('"' + big.name + '" is over 50 MB, which is too big to add from here.', 'err');
aSay('Reading ' + (files.length === 1 ? 'the file' : files.length + ' files') + '…', '');
const entries = [];
try { for (const f of files) entries.push({ path: DIR + (cleanSeg(f.name.replace(/\.html?$/i, '')) || 'game') + '.html', b64: await fileB64(f) }); }
catch (e) { return aSay(e.message, 'err'); }
return aRun('Adding games', async () => {
await ghChange(entries.length === 1 ? 'Add game: ' + entries[0].path.slice(DIR.length) : 'Add ' + entries.length + ' games', async () => entries);
NEWG = { at: Date.now(), ids: [...new Set([...newSet(), ...entries.map(e => e.path)])] }; store.set('newGames', NEWG);
return (entries.length === 1 ? 'Added ' + pretty(entries[0].path.slice(DIR.length).replace(/\.html$/, '')) : 'Added ' + entries.length + ' games') + '. Give GitHub Pages a few minutes before playing.';
});
}
}
}
async function uploadCover(file) {
const id = A.coverFor; A.coverFor = null;
if (!id || !file) return;
if (!/^image\//.test(file.type)) return aSay('Pick an image file (PNG, JPG, WebP or GIF).', 'err');
if (file.size > 5 * 1024 * 1024) return aSay('That image is over 5 MB. Pick a smaller one.', 'err');
const ext = (extOf(file.name) || 'png').replace('jpeg', 'jpg');
let b64;
try { b64 = await fileB64(file); } catch (e) { return aSay(e.message, 'err'); }
const g0 = toPack(id);
return aRun('Saving cover', async () => {
await ghChange('Set cover image: ' + g0.name, async files => {
const g = gameFiles(files, id);
const base = g.dir ? g.dir + '/cover' : g.stem;
const old = files.filter(f => IMG.test(f.path) && (g.dir ? new RegExp('^' + g.dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/(cover|preview)\\.', 'i').test(f.path) : f.path.replace(IMG, '') === g.stem));
return old.filter(f => f.path !== base + '.' + ext).map(f => ({ path: f.path, sha: null })).concat([{ path: base + '.' + ext, b64 }]);
});
return 'Cover saved for ' + g0.name + '.';
});
}
root.addEventListener('input', e => {
const t = e.target;
if (t.matches('[data-av]')) { A.vals[t.dataset.av] = t.value; return; }
if (t.matches('[data-agq]')) { A.gq = t.value; A.gshow = 80; renderMain(true); const b = root.querySelector('[data-agq]'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } return; }
const s = S.draft;
if (!s) return;
if (t.matches('[data-site]')) { s[t.dataset.site] = t.value; applySite(); paintDraftBar(); }
else if (t.matches('[data-bf]')) { const [i, f] = t.dataset.bf.split(':'); if (s.banners[i]) s.banners[i][f] = t.value; paintBanners(); paintDraftBar(); }
else if (t.matches('[data-shide]')) { const v = t.dataset.shide; s.hidden = s.hidden.filter(x => x !== v); if (!t.checked) s.hidden.push(v); paintChrome(); paintDraftBar(); }
else if (t.matches('[data-upcat]')) { A.up.cat = t.value; renderMain(true); }
else if (t.matches('[data-up]')) A.up[t.dataset.up] = t.value;
});
// The "Unpublished changes" bar appears without re-rendering (so typing isn't interrupted)
function paintDraftBar() {
if (S.view !== 'admin') return;
const has = !!root.querySelector('.adraft');
if (has === dirty()) return;
if (has) root.querySelector('.adraft').remove();
else { const tabs = root.querySelector('.atabs'); if (tabs) tabs.insertAdjacentHTML('afterend', `<div class="adraft"><span class="grow wrap"><b>Unpublished changes</b> to the look, banners or pages. Only you can see them until you publish.</span><button class="btn" data-act="adm-discard">Discard</button><button class="btn pri" data-act="adm-publish">Publish for everyone</button></div>`); }
}
root.addEventListener('change', e => {
const t = e.target;
if (t.matches('[data-amove]') && t.value) {
const p = DOCS.find(x => x.id === t.dataset.amove), dir = t.value;
if (p) aRun('Moving', async () => { await ghChange('Move study resource: ' + p.name + ' to ' + dir, async files => { const out = docMove(files, p, dir); return out.concat(keepFolder(files, p.dir, out)); }); return 'Moved "' + p.name + '" to ' + pretty(dir) + '.'; });
}
else if (t.matches('[data-upfile],[data-gfile]')) { const n = [...(t.files || [])].map(f => f.name); const out = t.closest('.adrop') && t.closest('.adrop').querySelector('.afiles'); if (out) out.textContent = n.length ? n.length + ' chosen: ' + n.slice(0, 4).join(', ') + (n.length > 4 ? '…' : '') : ''; }
else if (t.matches('[data-acover]')) uploadCover(t.files && t.files[0]);
});
root.addEventListener('click', e => {
const t = e.target.closest('[data-sicon],[data-saccent],[data-bwhere],[data-bcolor],[data-bicon],[data-upkind],[data-banner],[data-bclose],[data-act^="adm-"]');
if (!t) return;
const d = t.dataset, s = S.draft;
if (d.banner) { const b = curSite().banners.find(x => x.id === d.banner); if (b) openLink(b.link); return; }
if (d.bclose) { if (!S.draft) store.set('bannersClosed', [...store.get('bannersClosed', []).filter(x => x !== d.bclose), d.bclose].slice(-50)); t.closest('.bnr').remove(); return; }
if (d.act && d.act.startsWith('adm-') && !['adm-addb', 'adm-rmb', 'adm-bup', 'adm-bdup'].includes(d.act)) { if (!/del$/.test(d.act)) A.arm = null; adminAct(d, t); return; }
if (!s) return;
const pair = v => { const k = v.indexOf(':'); return [Number(v.slice(0, k)), v.slice(k + 1)]; };
if (d.sicon) s.icon = d.sicon;
else if (d.saccent) s.accent = d.saccent;
else if (d.bwhere) { const [i, v] = pair(d.bwhere); s.banners[i].where = v; }
else if (d.bcolor) { const [i, v] = pair(d.bcolor); s.banners[i].color = v; }
else if (d.bicon) { const [i, v] = pair(d.bicon); s.banners[i].icon = v; }
else if (d.upkind) A.up.kind = d.upkind;
else if (d.act === 'adm-addb') s.banners.push(NEW_BANNER());
else if (d.act === 'adm-bdup') { const b = s.banners[Number(d.i)]; if (b) s.banners.splice(Number(d.i) + 1, 0, Object.assign(clone(b), { id: 'b' + Date.now().toString(36) })); }
else if (d.act === 'adm-bup') { const i = Number(d.i); if (i > 0) { const b = s.banners.splice(i, 1)[0]; s.banners.splice(i - 1, 0, b); } }
else if (d.act === 'adm-rmb') { const b = s.banners[Number(d.i)]; if (!b || !armed('ban:' + b.id)) return; s.banners.splice(Number(d.i), 1); }
applySite(); renderMain(true);
});
// ---- Update prompt ----
let pendingUpdate = !LIB && window.__classDashUpdate;
window.__classDashUpdate = null;
function showUpdate(code) {
pendingUpdate = { code };
const m = code.match(/const WHATSNEW = (['"])(.*?)\1;/);
$('.unote').textContent = m && m[2] ? "What's new: " + m[2] : 'A newer version of Class Dash is on GitHub.';
$('.ubar').hidden = false;
}
if (pendingUpdate) showUpdate(pendingUpdate.code);
// "Check for updates" in the sidebar: download the newest bookmarklet.js and compare it with the installed copy
async function checkUpdates() {
const btn = $('[data-act="checkupd"]');
if (btn.dataset.busy) return;
btn.dataset.busy = '1'; btn.textContent = 'Checking…';
const get = u => fetch(u + '?t=' + Date.now(), { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
const inst = store.get('installed', null);
let msg;
try {
const code = await get(RAW + 'bookmarklet.js').catch(() => get(PAGES + 'bookmarklet.js'));
if (!inst || !inst.code) msg = "Can't check on this page";
else if (code === inst.code) msg = "You're up to date";
else {
try { new Function(code); showUpdate(code); msg = 'Update found!'; } catch (e) { msg = 'The newest version has an error'; }
}
} catch (e) { msg = "Couldn't check right now"; }
btn.textContent = msg;
setTimeout(() => { btn.textContent = 'Check for updates'; delete btn.dataset.busy; }, 3500);
}
{
const inst = store.get('installed', null);
$('.ver').textContent = inst && inst.at ? 'Version installed ' + new Date(inst.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "Can't check for updates on this page";
}
function applyUpdate() {
if (!pendingUpdate) return;
let run;
try { run = new Function(pendingUpdate.code); } catch (e) { $('.unote').textContent = "The new version has an error, so you're staying on this one."; return; }
store.set('installed', { code: pendingUpdate.code, at: Date.now() });
close();
window.__classDashPinned = true;
run();
}
// ---- Address bar: search everything, or type an address like study.ecology-study / games.2048 ----
const slug = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const ALIAS = { overview: 'home', 'to-do': 'todo', todos: 'todo', class: 'classes', game: 'games', calender: 'calendar', bell: 'schedule', 'hall-pass': 'hallpass', pass: 'hallpass', securly: 'hallpass', request: 'games', setting: 'settings', options: 'settings', preferences: 'settings', prefs: 'settings', theme: 'settings' };
function currentAddr() {
const v = S.view;
if (v === 'course') { const c = byId(S.courseId); return c ? 'classes.' + slug(c.name) : 'classes'; }
if (v === 'play') { const g = PACK.find(x => x.id === S.game); return g ? 'games.' + slug(g.name) : 'games'; }
if (v === 'read') { const d = DOCS.find(x => x.id === S.doc); return d ? 'study.' + slug(d.cls) + '.' + slug(d.name) : 'study'; }
if (v === 'study' && S.scls !== 'All') return 'study.' + slug(S.scls);
return v === 'admin' ? '' : v;
}
// ---- Settings page (personal, saved in this browser) ----
const SIZES = { small: 0.9, normal: 1, large: 1.12 };
function applyPrefs() {
const bd = $('.bd');
bd.classList.toggle('th-light', P.theme === 'light');
bd.classList.toggle('th-mid', P.theme === 'midnight');
bd.classList.toggle('cd-full', !!P.full);
bd.classList.toggle('cd-still', !P.motion);
bd.classList.toggle('cd-blur', !!P.blurGrades);
bd.classList.toggle('tl-s', P.tiles === 'small');
bd.classList.toggle('tl-l', P.tiles === 'large');
bd.style.setProperty('--z', SIZES[P.size] || 1);
applySite();
}
function setPref(k, v) {
P[k] = v;
store.set('prefs', P);
S.setMsg = null; S.resetArm = false;
applyPrefs();
tick();
paintChrome();
renderMain(true);
}
function vSettings() {
const seg = (k, opts) => `<div class="seg mini">${opts.map(([v, l]) => `<button type="button" data-pref="${k}" data-val="${esc(v)}" class="${P[k] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
const row = (label, sub, ctl) => `<div class="srow"><div class="grow"><div class="t">${label}</div>${sub ? `<div class="sub wrap">${sub}</div>` : ''}</div>${ctl}</div>`;
const tog = (k, label, sub) => `<label class="stog"><span class="grow"><span class="t">${label}</span>${sub ? `<span class="sub wrap">${sub}</span>` : ''}</span><input type="checkbox" data-ptog="${k}"${P[k] ? ' checked' : ''}><i></i></label>`;
const themes = [['dark', 'Dark', ['#161a22', '#1d222c', '#272d3a']], ['light', 'Light', ['#ffffff', '#eef1f6', '#e1e6ef']], ['midnight', 'Midnight', ['#0b0c10', '#13151b', '#000000']]];
const ac = hexOk(P.accent) ? P.accent.toLowerCase() : '';
const siteAc = hexOk(SITE.accent) ? SITE.accent : '#7c9cff';
const starts = shownNav().filter(n => n[0] !== 'hallpass').map(n => [n[0], n[1]]).concat([['last', 'Last page I had open']]);
const m = S.setMsg;
return `<div class="card adm sset-c"><h2>Appearance<span>saved in this browser · stays when Class Dash updates</span></h2>
${row('Theme', '', `<div class="thms">${themes.map(([k, l, c]) => `<button type="button" class="thc${P.theme === k ? ' on' : ''}" data-pref="theme" data-val="${k}"><div class="pv" style="background:${c[2]}">${c.slice(0, 2).map(x => `<i style="background:${x}"></i>`).join('')}<i style="background:${ac || siteAc};flex:.3"></i></div><span>${l}</span></button>`).join('')}</div>`)}
${row('Accent colour', 'Buttons, highlights and links', `<div class="sws"><button type="button" class="btn${ac ? '' : ' pri'}" data-pacc="" style="padding:4px 10px;font-size:12px">Default</button>${COLOR_CHOICES.map(c => `<button type="button" class="sw${ac === c ? ' on' : ''}" style="background:${c}" data-pacc="${c}" title="${c}"></button>`).join('')}<input type="color" data-pcolor value="${ac || siteAc}" title="Pick any colour"></div>`)}
${row('Text size', 'Makes everything in Class Dash bigger or smaller', seg('size', [['small', 'Small'], ['normal', 'Normal'], ['large', 'Large']]))}
${tog('full', 'Fill the whole screen', 'Use the full browser window instead of a floating box')}
${tog('motion', 'Animations', 'Turn off to stop things sliding and fading')}</div>
<div class="card adm sset-c"><h2>General</h2>
${row('Start page', 'What opens when you click the bookmark' + (isCanvas ? '' : '. Canvas pages only work on Canvas.'), `<select data-pstart>${starts.map(([v, l]) => `<option value="${v}"${P.start === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`)}
${row('Clock', '', seg('clock24', [[false, '12-hour'], [true, '24-hour']]))}
${tog('seconds', 'Show seconds on the clock')}
${tog('blurGrades', 'Hide grades', 'Blurs scores and GPA until you hover over them, so people walking by can\'t see')}
${tog('outside', 'Close when clicking outside', 'Turn off so a stray click outside the box doesn\'t close Class Dash')}</div>
<div class="card adm sset-c"><h2>Games</h2>
${row('Open games', '', seg('gameOpen', [['here', 'Inside Class Dash'], ['tab', 'In a new tab']]))}
${row('Game tile size', '', seg('tiles', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]))}
${tog('recent', 'Show "Jump back in"', 'Your recently played games at the top of the library')}</div>
<div class="card adm sset-c"><h2>Reset</h2><div class="sacts">
<button type="button" class="btn" data-act="pclear">Clear recently played</button>
<button type="button" class="btn" data-act="preset">${S.resetArm ? 'Click again to reset everything' : 'Reset all settings'}</button>
<span class="amsg ${m ? m.cls : ''}">${m ? esc(m.text) : ''}</span></div></div>`;
}
function omniItems() {
const out = shownNav().map(([v, label, icon]) => ({ kind: 'Page', name: label, addr: v, icon, w: 40, open: () => go(v) }));
if (!LIB) out.push({ kind: 'Page', name: 'Settings', addr: 'settings', icon: I.gear, w: 35, open: () => go('settings') });
const classes = {};
DOCS.forEach(p => { classes[p.cls] = classes[p.cls] || p; });
Object.keys(classes).forEach(cls => out.push({ kind: 'Study class', name: cls, addr: 'study.' + slug(cls), icon: classes[cls].icon, color: classes[cls].color, w: 30,
open: () => { S.scls = cls; S.sq = ''; go('study'); } }));
DOCS.forEach(p => out.push({ kind: 'Study · ' + p.cls, name: p.name, addr: 'study.' + slug(p.cls) + '.' + slug(p.name), alt: 'study.' + slug(p.name), icon: p.icon, color: p.color, w: 25,
open: () => openDoc(p.id) }));
PACK.forEach(p => out.push({ kind: 'Game', name: p.name, addr: 'games.' + slug(p.name), icon: (p.theme && p.theme[2] ? svg(p.theme[2]) : I.game), w: 20,
open: () => playGame(p.id) }));
if (isCanvas) {
S.courses.forEach(c => out.push({ kind: 'Class', name: c.name, addr: 'classes.' + slug(c.name), icon: I.book, color: c.color, w: 25,
open: () => { S.back = 'classes'; S.courseId = c.id; go('course'); } }));
S.work.forEach(x => x.url && out.push({ kind: (x.done || x.submitted ? 'Done · ' : 'Assignment · ') + x.courseName, name: x.title, icon: I.check, w: x.open ? 10 : 0,
open: () => window.open(x.url, '_blank', 'noopener') }));
}
return out;
}
function omniSearch(raw) {
let q = raw.trim().toLowerCase();
if (!q) return omniItems().filter(x => x.kind === 'Page');
const head = q.split('.')[0];
if (ALIAS[head]) q = q.replace(head, ALIAS[head]);
const words = q.split(/[\s.]+/).filter(Boolean);
const qs = slug(q.replace(/\./g, ' ')).replace(/-/g, ' ');
return omniItems().map(x => {
const addrs = [x.addr, x.alt].filter(Boolean);
const name = x.name.toLowerCase(), hay = (name + ' ' + x.kind + ' ' + addrs.join(' ')).toLowerCase();
let s = 0;
if (addrs.includes(q)) s = 1000;
else if (addrs.some(a => a.startsWith(q))) s = 600;
else if (words.every(w => hay.includes(w))) s = 100 + (name.startsWith(qs) ? 200 : name.includes(qs) ? 80 : 0);
return s ? Object.assign({ s: s + x.w }, x) : null;
}).filter(Boolean).sort((a, b) => b.s - a.s || a.name.localeCompare(b.name)).slice(0, 9);
}
function paintOmni() {
const box = $('[data-omni]');
if (!box) return;
if (root.activeElement !== box) { box.value = currentAddr(); return; }
const drop = $('.odrop'), q = box.value;
S.omni = omniSearch(q === S.omniFrom ? '' : q);
if (S.omniSel >= S.omni.length) S.omniSel = 0;
drop.hidden = false;
drop.innerHTML = S.omni.map((x, i) => `<div class="oit${i === S.omniSel ? ' on' : ''}" data-oi="${i}"><span class="oic"${x.color ? ` style="background:${esc(x.color)};color:#0f1218"` : ''}>${x.icon || I.search}</span>
<div class="grow"><div class="t">${esc(x.name)}</div><div class="sub">${esc(x.kind)}</div></div>${x.addr ? `<span class="addr">${esc(x.addr)}</span>` : ''}</div>`).join('')
+ (S.omni.length ? '' : `<div class="ohint">Nothing matches “${esc(q.trim())}”.</div>`)
+ (q === S.omniFrom || !q.trim() ? `<div class="ohint">Type to search everything, or jump straight there with <b>study.</b> <b>games.</b> <b>classes.</b></div>` : '');
}
function omniOpen(i) {
const x = S.omni && S.omni[i];
const box = $('[data-omni]');
if (!x) return;
box.blur();
$('.odrop').hidden = true;
x.open();
}
function omniClose() { $('.odrop').hidden = true; }
const omniBox = $('[data-omni]');
omniBox.addEventListener('focus', () => { S.omniFrom = omniBox.value; S.omniSel = 0; omniBox.select(); loadLib(); paintOmni(); });
omniBox.addEventListener('blur', () => { omniClose(); omniBox.value = currentAddr(); });
omniBox.addEventListener('input', () => { S.omniFrom = null; S.omniSel = 0; paintOmni(); });
$('.odrop').addEventListener('mousedown', e => e.preventDefault());
$('.odrop').addEventListener('click', e => { const it = e.target.closest('[data-oi]'); if (it) omniOpen(Number(it.dataset.oi)); });
$('.odrop').addEventListener('mousemove', e => {
const it = e.target.closest('[data-oi]');
if (it && Number(it.dataset.oi) !== S.omniSel) { S.omniSel = Number(it.dataset.oi); root.querySelectorAll('.oit').forEach((el, i) => el.classList.toggle('on', i === S.omniSel)); }
});
function omniKey(e) {
if (e.type !== 'keydown') return;
const n = (S.omni || []).length;
if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
e.preventDefault();
if (n) { S.omniSel = (S.omniSel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; paintOmni(); const on = root.querySelector('.oit.on'); if (on) on.scrollIntoView({ block: 'nearest' }); }
} else if (e.key === 'Enter') {
e.preventDefault();
const v = omniBox.value, sel = S.omniSel || 0;
sealed(v).then(ok => { if (ok) { omniBox.blur(); omniClose(); openAdmin(); } else omniOpen(sel); });
}
else if (e.key === 'Escape') { e.preventDefault(); omniBox.blur(); omniClose(); omniBox.value = currentAddr(); }
}
root.addEventListener('click', e => {
if (e.target === $('.bd')) return LIB || !P.outside ? null : close();
const t = e.target.closest('[data-go],[data-course],[data-done],[data-seg],[data-cat],[data-scls],[data-skind],[data-reqcls],[data-reqtopic],[data-sched],[data-lunch],[data-pack],[data-docnew],[data-doc],[data-pref],[data-pacc],[data-act]');
if (!t) return;
const d = t.dataset;
const toReq = sel => { const el = root.querySelector(sel) || root.querySelector('[data-req="scls"]'); if (el) { el.scrollIntoView({ block: 'center', behavior: P.motion ? 'smooth' : 'auto' }); el.focus({ preventScroll: true }); } };
if (d.docnew) {
const p = DOCS.find(x => x.id === d.docnew);
store.set('recentDocs', [{ id: d.docnew, at: Date.now() }, ...store.get('recentDocs', []).filter(x => x.id !== d.docnew)].slice(0, 6));
if (!p || !openBlank(p)) openDoc(d.docnew);
}
else if (d.skind) { S.skind = d.skind; renderMain(true); }
else if (d.reqcls) { S.req.scls = d.reqcls; S.reqMsg.study = null; renderMain(true); toReq('[data-req="stopic"]'); }
else if (d.reqtopic) { S.req.stopic = S.sq.trim(); if (S.scls !== 'All') S.req.scls = S.scls; S.reqMsg.study = null; renderMain(true); toReq(S.req.scls ? '[data-req="stopic"]' : '[data-req="scls"]'); }
else if (d.pref) setPref(d.pref, d.val === 'true' ? true : d.val === 'false' ? false : d.val);
else if (d.pacc != null) setPref('accent', d.pacc);
else if (d.act === 'settings') go('settings');
else if (d.act === 'admin') openAdmin();
else if (d.act === 'pclear') { store.set('recent', []); S.setMsg = { text: 'Recently played cleared.', cls: 'ok' }; renderMain(true); }
else if (d.act === 'preset') {
if (!S.resetArm) { S.resetArm = true; S.setMsg = null; renderMain(true); return; }
P = Object.assign({}, PREF_DEFAULT); store.set('prefs', P);
applyPrefs(); tick(); paintChrome();
S.resetArm = false; S.setMsg = { text: 'Settings reset to the defaults.', cls: 'ok' }; renderMain(true);
}
else if (d.go) go(d.go);
else if (d.course) { S.back = navOf(S.view); S.courseId = Number(d.course); go('course'); }
else if (d.done) {
if (S.done.has(d.done)) S.done.delete(d.done); else S.done.add(d.done);
store.set('done', [...S.done]);
refreshOpen();
renderMain(true);
}
else if (d.seg) { S.seg = d.seg; renderMain(true); }
else if (d.cat) { S.cat = d.cat; renderMain(true); }
else if (d.scls) { S.scls = d.scls; renderMain(true); }
else if (d.doc) openDoc(d.doc);
else if (d.sched) { S.schedKey = d.sched; renderMain(true); }
else if (d.lunch) { S.lunch = Number(d.lunch); store.set('lunch', S.lunch); paintSched(); renderMain(true); }
else if (d.pack) playGame(d.pack);
else if (d.act === 'random') { const v = visibleTiles(); if (v.length) v[Math.floor(Math.random() * v.length)].click(); }
else if (d.act === 'license') showLicense($('.ct'));
else if (d.act === 'newtab') openBlank();
else if (d.act === 'libtab') openLibraryTab();
else if (d.act === 'full') { const f = root.querySelector('.gframe'); if (f && f.requestFullscreen) f.requestFullscreen(); }
else if (d.act === 'reload') renderMain();
else if (d.act === 'close') close();
else if (d.act === 'later') $('.ubar').hidden = true;
else if (d.act === 'hallpass') openHallPass();
else if (d.act === 'checkupd') checkUpdates();
else if (d.act === 'update') applyUpdate();
else if (d.act === 'refresh') { if (usesLib(S.view)) loadLib(true); else { S.courseCache = {}; load(); } }
});
root.addEventListener('change', e => {
const t = e.target;
if (t.matches('[data-ptog]')) setPref(t.dataset.ptog, t.checked);
else if (t.matches('[data-pstart]')) setPref('start', t.value);
else if (t.matches('[data-pcolor]') && hexOk(t.value)) setPref('accent', t.value.toLowerCase());
});
root.addEventListener('input', e => {
if (e.target.matches('[data-pcolor]') && hexOk(e.target.value)) $('.bd').style.setProperty('--ac', e.target.value);
});
root.addEventListener('submit', e => {
const f = e.target.closest && e.target.closest('[data-reqform]');
if (!f) return;
e.preventDefault();
sendReq(f.dataset.reqform);
});
root.addEventListener('input', e => {
if (e.target.matches('[data-req]')) { S.req[e.target.dataset.req] = e.target.value; return; }
if (e.target.matches('[data-period]')) {
const k = e.target.dataset.period, v = e.target.value.trim();
if (v) S.periods[k] = v; else delete S.periods[k];
store.set('periods', S.periods);
paintSched();
return;
}
if (!e.target.matches('[data-search]')) return;
if (S.view === 'study') { S.sq = e.target.value; filterStudy(); } else { S.q = e.target.value; filterGames(); }
});
function onKey(e) {
const down = e.type === 'keydown', study = S.view === 'study';
if (root.activeElement === omniBox) { omniKey(e); e.stopPropagation(); return; }
if (down && !LIB && (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); e.stopPropagation(); omniBox.focus(); return; }
if (down && (e.key === 'Enter' || e.key === ' ') && root.activeElement && root.activeElement.matches('.rr,.ccard')) { e.preventDefault(); e.stopPropagation(); root.activeElement.click(); return; }
const box = usesLib(S.view) && $('[data-search]'), typing = box && root.activeElement === box;
const q = study ? S.sq : S.q;
const inField = root.activeElement && root.activeElement.matches('input,textarea,select');
if (down && inField && !typing && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); root.activeElement.blur(); return; }
if (down && box && e.key === '/' && !typing && !inField) { e.preventDefault(); e.stopPropagation(); box.focus(); return; }
if (down && typing && e.key === 'Enter') {
const v = study ? visibleDocs() : visibleTiles(), k = q.trim().toLowerCase();
const pick = v.find(t => t.dataset.name === k) || v.find(t => t.dataset.name.startsWith(k)) || v[0];
if (pick) pick.click();
e.stopPropagation(); return;
}
if (down && typing && e.key === 'Escape' && q) {
e.preventDefault(); e.stopPropagation(); box.value = '';
if (study) { S.sq = ''; filterStudy(); } else { S.q = ''; filterGames(); }
return;
}
if (down && e.key === 'Escape') {
e.preventDefault(); e.stopPropagation();
if (S.view === 'play') go('games'); else if (S.view === 'read') go('study'); else if (!LIB) close();
return;
}
e.stopPropagation();
}
const tick = () => {
const n = new Date();
$('.clock').textContent = fmtTime(n, P.seconds);
$('.date').textContent = n.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
paintSched();
if (S.view === 'schedule' && n.getSeconds() === 0 && !(root.activeElement && root.activeElement.matches('[data-period]'))) renderMain(true);
};
const clockT = setInterval(tick, 1000);
const oldOverflow = document.documentElement.style.overflow;
document.documentElement.style.overflow = 'hidden';
window.addEventListener('keydown', onKey, true);
window.addEventListener('keyup', onKey, true);
function close() {
clearInterval(clockT);
window.removeEventListener('keydown', onKey, true);
window.removeEventListener('keyup', onKey, true);
document.documentElement.style.overflow = oldOverflow;
host.remove();
}
host.__close = close;
if (S.view !== 'games' && !shownNav().some(n => n[0] === S.view)) S.view = isCanvas && !LIB ? 'home' : 'games';
tick();
applyPrefs();
paintAdminLink();
loadSite();
renderMain();
load();
})();
