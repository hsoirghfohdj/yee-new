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
const store = {
get(k, d) { try { const v = localStorage.getItem('classdash_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
set(k, v) { try { localStorage.setItem('classdash_' + k, JSON.stringify(v)); } catch (e) {} }
};
// What's new in this version (shown in the update prompt). Change it when you publish an update.
const WHATSNEW = 'Hall Pass button · request games and study help right from the Games and Study pages · new tabs are numbered by day';
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
view: isCanvas && !LIB ? 'home' : 'games', back: 'classes', seg: 'all',
loading: false, error: null, loadedAt: null,
me: null, courses: [], work: [], grades: [], ann: [],
done: new Set(store.get('done', [])), courseCache: {}, courseId: null,
game: null,
lib: store.get('lib', null), libLoading: false, libError: null, libTried: 0, q: '', cat: 'All',
lunch: store.get('lunch', 1), schedKey: null,
doc: null, sq: '', scls: 'All',
periods: store.get('periods', {}),
req: {}, reqMsg: {}
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
tick: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>'
};
const CSS = `
:host{all:initial}
*{box-sizing:border-box;margin:0;padding:0}
.bd{--bg:#0f1218;--p1:#161a22;--p2:#1d222c;--p3:#272d3a;--ln:#262c39;--tx:#e9ecf2;--mu:#8c93a5;--ac:#7c9cff;--gd:#3ecf8e;--wn:#f5b546;--bad:#f2637a;
position:fixed;inset:0;background:rgba(6,8,12,.62);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;
font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--tx);animation:fd .18s ease}
@keyframes fd{from{opacity:0}}
@keyframes pop{from{opacity:0;transform:translateY(8px) scale(.985)}}
@keyframes sp{to{transform:rotate(360deg)}}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.win{width:min(1200px,calc(100vw - 32px));height:min(780px,calc(100vh - 32px));background:var(--bg);border:1px solid var(--ln);border-radius:16px;
display:grid;grid-template-columns:208px 1fr;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.55);animation:pop .22s ease}
.sb{background:var(--p1);border-right:1px solid var(--ln);display:flex;flex-direction:column;padding:16px 10px;gap:2px}
.brand{font-weight:700;font-size:16px;padding:2px 10px 18px;display:flex;gap:10px;align-items:center}
.logo{width:30px;height:30px;border-radius:9px;background:var(--ac);display:grid;place-items:center;color:#0f1218}
.nav{display:flex;flex-direction:column;gap:2px}
.nav button{all:unset;display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:9px;color:var(--mu);cursor:pointer;font-weight:550;white-space:nowrap}
.nav button:hover{background:var(--p2);color:var(--tx)}
.nav button.on{background:var(--p3);color:var(--tx)}
.nav button.on svg{color:var(--ac)}
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
.oit.on .addr{color:var(--ac)}
.ohint{padding:8px 10px;color:var(--mu);font-size:12px}
.ohint b{font:12px ui-monospace,monospace;color:var(--tx);background:var(--p3);border-radius:5px;padding:1px 5px}
.bd.lib .omni{display:none}
.ubar{display:flex;align-items:center;gap:12px;margin:12px 24px 0;padding:10px 12px 10px 14px;border-radius:12px;background:rgba(124,156,255,.12);border:1px solid rgba(124,156,255,.35);animation:pop .22s ease}
.ubar[hidden]{display:none}
.ubar .uic{width:32px;height:32px;border-radius:9px;background:var(--ac);color:#0f1218;display:grid;place-items:center;flex:none}
.ubar .sub{white-space:normal}
.pcls{color:var(--ac);font-weight:600}
.sched .sl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ver{margin-top:10px;font-size:11px;opacity:.75}
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
.card h2 a,.card h2 span{text-transform:none;letter-spacing:0;font-weight:550;color:var(--ac);cursor:pointer;font-size:13px}
.card h2 span{color:var(--mu);cursor:default}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
.tile .k{font-size:12px;color:var(--mu);font-weight:550}
.tile .v{font-size:30px;font-weight:700;margin:2px 0;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.cols{display:grid;grid-template-columns:1.35fr 1fr;gap:16px;align-items:start}
.stack{display:flex;flex-direction:column;gap:16px;min-width:0}
.row{display:flex;align-items:center;gap:12px;padding:10px 8px;margin:0 -8px;border-top:1px solid var(--ln)}
.row:first-of-type{border-top:0}
a.row:hover,.row.click:hover{background:var(--p2);border-radius:10px;border-top-color:transparent}
.row.click{cursor:pointer}
.row a.grow:hover .t{color:var(--ac)}
.dot{width:10px;height:10px;border-radius:50%;flex:none}
.grow{flex:1;min-width:0}
.t{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wrap{white-space:normal}
.chip{font-size:11px;font-weight:650;padding:2px 9px;border-radius:20px;white-space:nowrap;background:var(--p3);color:var(--mu)}
.chip.bad{background:rgba(242,99,122,.15);color:var(--bad)}
.chip.wn{background:rgba(245,181,70,.15);color:var(--wn)}
.chip.gd{background:rgba(62,207,142,.15);color:var(--gd)}
.chip.ac{background:rgba(124,156,255,.15);color:var(--ac)}
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
.day.today .dn{color:var(--ac)}
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
.sgrp{margin-bottom:8px}
.sgrp[hidden]{display:none}
.sgrp .grp{display:flex;align-items:center;gap:8px;margin:18px 0 8px}
.sgrp .grp .chip{text-transform:none;letter-spacing:0}
.sgrp .grp b{font-weight:650;font-size:11px;background:var(--p3);border-radius:10px;padding:0 7px;letter-spacing:0}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.sdoc{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:var(--p1);border:1px solid var(--ln);min-width:0;transition:border-color .12s,transform .12s}
.sdoc[hidden]{display:none}
.sdoc:hover,.sdoc:focus-visible{border-color:var(--ac);transform:translateY(-2px)}
.sdoc .sic{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;color:#0f1218;flex:none}
.sdoc .go{color:var(--mu);flex:none}
.sdoc:hover .go{color:var(--ac)}
.bd.lib{background:var(--bg);backdrop-filter:none;animation:none}
.bd.lib .win{width:100vw;height:100vh;border:0;border-radius:0;box-shadow:none;animation:none;grid-template-columns:1fr;grid-template-rows:1fr}
.bd.lib .sb,.bd.lib [data-act="close"]{display:none}
@media (max-width:780px){
.win{grid-template-columns:1fr;grid-template-rows:auto 1fr;width:100vw;height:100vh;border-radius:0}
.sb{flex-direction:row;padding:8px;border-right:0;border-bottom:1px solid var(--ln);overflow-x:auto}
.brand,.sbf{display:none}.nav{flex-direction:row}
.tiles{grid-template-columns:repeat(2,1fr)}.cols{grid-template-columns:1fr}
.calh{display:none}.cal{grid-template-columns:repeat(2,minmax(0,1fr))}
.hd h1,.omni>.kbd{display:none}
.due{min-width:0}.ct{padding:16px}
}`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = html => { try { return new DOMParser().parseFromString(html || '', 'text/html').body.textContent.replace(/\s+/g, ' ').trim(); } catch (e) { return ''; } };
const sod = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const fmtTime = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
if (!['games', 'play', 'read'].includes(S.view)) renderMain(true);
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
<aside class="sb"><div class="brand"><span class="logo">${I.cap}</span>Class Dash</div><nav class="nav"></nav><div class="sbf"><div class="clock"></div><div class="date"></div><div class="sched" data-go="schedule" title="Open the bell schedule"></div><div class="ver"></div></div></aside>
<main class="mn"><header class="hd"><h1></h1>
<div class="omni"><span class="oi">${I.search}</span><input data-omni placeholder="Search Class Dash, or go to study.ecology-study" autocomplete="off" spellcheck="false" aria-label="Search or go to"><span class="kbd">Ctrl K</span><div class="odrop" hidden></div></div><span class="upd"></span>
<button class="ib" data-act="refresh" title="Refresh">${I.refresh}</button><button class="ib" data-act="close" title="Close (Esc)">${I.x}</button></header>
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
$('.nav').innerHTML = NAV.map(([v, label, icon]) => `<button data-go="${v}" class="${navOf(S.view) === v ? 'on' : ''}">${icon}${label}${v === 'todo' && overdue ? `<span class="badge">${overdue}</span>` : ''}</button>`).join('');
const c = S.view === 'course' && byId(S.courseId), g = S.view === 'play' && PACK.find(x => x.id === S.game), dc = S.view === 'read' && DOCS.find(x => x.id === S.doc);
$('.hd h1').textContent = c ? c.name : g ? g.name : dc ? dc.name : (NAV.find(n => n[0] === S.view) || [, ''])[1];
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
else if (v === 'play') { ct.innerHTML = vPlay(); startPack(ct); }
else if (v === 'read') { ct.innerHTML = vRead(); startDoc(ct, S.doc); }
else if (v === 'schedule') ct.innerHTML = vSchedule();
else if (!isCanvas) ct.innerHTML = vNoCanvas();
else if (!S.loadedAt) ct.innerHTML = S.error ? vError() : '<div class="spin"></div>';
else ct.innerHTML = { home: vHome, todo: vTodo, grades: vGrades, classes: vClasses, calendar: vCal, course: vCourse }[v]();
ct.scrollTop = keepScroll ? top : 0;
}
const go = v => { S.view = v; renderMain(); };
const tile = (k, v, s, color) => `<div class="card tile"><div class="k">${k}</div><div class="v" style="color:${color || 'var(--tx)'}">${v}</div><div class="sub">${s}</div></div>`;
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
${tile('Average grade', s.avg == null ? '—' : s.avg.toFixed(1) + '%', s.graded.length + ' of ' + S.courses.length + ' classes graded', scoreColor(s.avg))}
${tile('Estimated GPA', s.gpa == null ? '—' : s.gpa.toFixed(2), 'unweighted, 4.0 scale')}
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
${tile('Average', s.avg == null ? '—' : s.avg.toFixed(1) + '%', 'across graded classes', scoreColor(s.avg))}
${tile('Estimated GPA', s.gpa == null ? '—' : s.gpa.toFixed(2), 'unweighted, 4.0 scale')}
${tile('Highest', s.graded.length ? Math.max(...s.graded.map(c => c.score)) + '%' : '—', s.graded.length ? esc(s.graded.reduce((a, c) => c.score > a.score ? c : a).name) : '', 'var(--gd)')}
${tile('Lowest', s.graded.length ? Math.min(...s.graded.map(c => c.score)) + '%' : '—', s.graded.length ? esc(s.graded.reduce((a, c) => c.score < a.score ? c : a).name) : '', s.graded.length ? scoreColor(Math.min(...s.graded.map(c => c.score))) : '')}
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
extra = `<div class="sub">${graded.length} of ${A.length} assignments graded${possible ? ' · ' + fmtNum(earned) + ' / ' + fmtNum(possible) + ' points' : ''}</div>`;
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
const toPack = path => {
const rel = path.slice(DIR.length), parts = rel.split('/');
const base = parts.length === 2 ? parts[0] : parts[0].replace(/\.html?$/i, '');
const pic = S.lib && S.lib.art && S.lib.art[path];
const name = pretty(base);
return { id: path, name, desc: rel, img: pic ? gameUrl(pic) : null, theme: themeOf(name) };
};
const artFor = (path, imgs) => {
const stem = path.replace(/\.html?$/i, '').toLowerCase();
const dir = stem.replace(/\/index$/, '');
return [stem, dir + '/preview', dir + '/cover', dir].map(s => imgs[s]).find(Boolean) || null;
};
const art = p => {
if (p.img) return `<div class="art"><img src="${esc(p.img)}" alt="" loading="lazy"></div>`;
const h = hash(p.name), c1 = PAL[h % PAL.length], c2 = PAL[(h >>> 3) % PAL.length], deg = 100 + (h >>> 6) % 140;
const longest = Math.max(...p.name.split(' ').map(w => w.length));
const size = Math.max(12, Math.min(p.name.length <= 6 ? 27 : p.name.length <= 12 ? 21 : 17, Math.floor(150 / longest)));
return `<div class="art gen" style="background:linear-gradient(rgba(6,8,12,0),rgba(6,8,12,.38)),linear-gradient(${deg}deg,${c1},${c2})">
<svg class="pat" aria-hidden="true"><rect width="100%" height="100%" fill="url(#cdp${(h >>> 9) % 5})"/></svg>
<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p.theme[2]}</svg>
<span class="gtitle" style="font-size:${size}px">${esc(p.name)}</span></div>`;
};
const isDoc = p => {
if (!p.startsWith(STUDY) || !/\.html?$/i.test(p)) return false;
const parts = p.slice(STUDY.length).split('/');
return parts.length <= 2 || (parts.length === 3 && /^index\.html?$/i.test(parts[2]));
};
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
return { id: path, name: pretty(file.replace(/\.html?$/i, '')), cls, file: parts.slice(1).join('/') || parts[0],
color: PAL[h % PAL.length], icon: (SUBJECTS.find(s => s[0].test(cls)) || [, I.study])[1] };
};
const myClass = cls => S.courses.some(c => { const n = (c.name || '').toLowerCase(), k = cls.toLowerCase(); return n.includes(k) || k.split(' ').some(w => w.length > 3 && n.includes(w)); });
let PACK = [], DOCS = [];
const setPack = () => {
PACK = (S.lib ? S.lib.paths : []).map(toPack).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
DOCS = (S.lib && S.lib.study || []).map(toDoc).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
};
setPack();
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
const imgs = {}, pics = {};
files.filter(p => IMG.test(p)).forEach(p => { imgs[p.replace(IMG, '').toLowerCase()] = p; });
const paths = files.filter(isGame);
paths.forEach(p => { const a = artFor(p, imgs); if (a) pics[p] = a; });
S.lib = { at: Date.now(), paths, art: pics, study: files.filter(isDoc) };
store.set('lib', S.lib);
setPack();
} catch (e) {
S.libError = e.message === 'Failed to fetch' ? "Couldn't reach GitHub. Check you're online, then refresh." : e.message || String(e);
}
S.libLoading = false;
paintChrome();
if (usesLib(S.view)) renderMain(true);
}
const vPlay = () => {
const p = PACK.find(x => x.id === S.game);
if (!p) return `<div class="gbar"><button class="btn" data-go="games">← Games</button></div>` + empty('That game is no longer in the repo.');
return `<div class="play"><div class="gbar wide"><button class="btn" data-go="games">← Games</button>
<div class="grow"><div class="t">${esc(p.name)}</div><div class="sub">${esc(p.desc)} · from GitHub</div></div>
<button class="btn" data-act="license">License</button><button class="btn" data-act="newtab">New tab</button><button class="btn" data-act="full">Full screen</button><button class="btn" data-act="reload">Restart</button></div>
<div class="frame"><div class="spin"></div></div></div>`;
};
function startFrame(ct, path) {
const box = ct.querySelector('.frame');
if (!box) return;
const f = document.createElement('iframe');
f.className = 'gframe';
f.setAttribute('allow', 'fullscreen; autoplay; gamepad');
f.addEventListener('load', () => { try { f.contentWindow.focus(); } catch (e) {} });
f.src = gameUrl(path);
box.innerHTML = '';
box.appendChild(f);
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
function startDoc(ct, path) {
const box = ct.querySelector('.frame');
if (!box) return;
const f = document.createElement('iframe');
f.className = 'gframe';
f.setAttribute('allow', 'fullscreen; autoplay');
fillDoc(f, path).then(() => { if (S.view === 'read' && S.doc === path && box.isConnected) { box.innerHTML = ''; box.appendChild(f); } });
}
const vRead = () => {
const p = DOCS.find(x => x.id === S.doc);
if (!p) return `<div class="gbar"><button class="btn" data-go="study">← Study</button></div>` + empty('That study resource is no longer in the repo.');
return `<div class="play"><div class="gbar wide"><button class="btn" data-go="study">← Study</button>
<div class="grow"><div class="t">${esc(p.name)}</div><div class="sub">${esc(p.cls)}</div></div>
<button class="btn" data-act="newtab">New tab</button><button class="btn" data-act="full">Full screen</button></div>
<div class="frame"><div class="spin"></div></div></div>`;
};
const docCard = p => `<button class="sdoc" data-doc="${esc(p.id)}" data-name="${esc((p.name + ' ' + p.cls).toLowerCase())}" title="${esc(p.name)}">
<span class="sic" style="background:${p.color}">${p.icon}</span><span class="grow"><span class="t" style="display:block">${esc(p.name)}</span><span class="sub" style="display:block">${esc(p.file)}</span></span><span class="go">${I.ext}</span></button>`;
const vStudy = () => {
const groups = {};
DOCS.forEach(p => { (groups[p.cls] = groups[p.cls] || []).push(p); });
const list = Object.keys(groups).map(cls => ({ cls, docs: groups[cls], mine: isCanvas && cls !== 'Other' && myClass(cls) }))
.sort((a, b) => (b.mine - a.mine) || ((a.cls === 'Other') - (b.cls === 'Other')) || a.cls.toLowerCase().localeCompare(b.cls.toLowerCase()));
if (S.scls !== 'All' && !groups[S.scls]) S.scls = 'All';
const n = DOCS.length;
const state = n ? '' : S.libError ? empty(esc(S.libError)) : S.lib && !S.libLoading ? empty('No study resources yet. Add .html files to study/&lt;class name&gt;/ in the repo, then hit refresh.') : '<div class="spin"></div>';
return `<div class="ghero shero"><div class="ghead"><div class="grow"><div class="gh">Study resources</div>
<div class="sub">${n} ${n === 1 ? 'resource' : 'resources'} · ${list.length} ${list.length === 1 ? 'class' : 'classes'} · press <span class="kbd">/</span> to search</div></div></div>
<div class="gfind"><label class="gsearch">${I.search}<input data-search placeholder="Search study resources…" value="${esc(S.sq)}" autocomplete="off" spellcheck="false"><span class="kbd">/</span></label></div></div>
${reqCard('study')}
${list.length > 1 ? `<div class="seg">${[['All', n], ...list.map(g => [g.cls, g.docs.length])].map(([l, c]) => `<button data-scls="${esc(l)}" class="${S.scls === l ? 'on' : ''}">${esc(l)}<b>${c}</b></button>`).join('')}</div>` : ''}
${S.libError && n ? `<p class="note" style="margin-bottom:10px">${esc(S.libError)} Showing the last list.</p>` : ''}
${state}${list.filter(g => S.scls === 'All' || g.cls === S.scls).map(g => `<div class="sgrp"><div class="grp">${esc(g.cls)}<b>${g.docs.length}</b>${g.mine ? '<span class="chip ac">Your class</span>' : ''}</div>
<div class="sgrid">${g.docs.map(docCard).join('')}</div></div>`).join('')}<div class="empty nomatch" hidden></div>`;
};
function filterStudy() {
const ct = $('.ct'), q = S.sq.trim().toLowerCase();
let shown = 0;
ct.querySelectorAll('.sgrp').forEach(g => {
let inGroup = 0;
g.querySelectorAll('.sdoc').forEach(t => { t.hidden = !!q && !t.dataset.name.includes(q); if (!t.hidden) inGroup++; });
g.hidden = !inGroup; shown += inGroup;
});
const nm = ct.querySelector('.nomatch');
if (nm) { nm.hidden = !q || shown > 0; nm.textContent = 'No study resources match "' + S.sq.trim() + '".'; }
}
const visibleDocs = () => [...$('.ct').querySelectorAll('.sdoc')].filter(t => !t.hidden);
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
const win = window.open(PASS, 'classdash-hallpass', `popup=yes,width=${w},height=${h},left=${Math.max(0, Math.round((screen.availWidth - w) / 2))},top=${Math.max(0, Math.round((screen.availHeight - h) / 2))}`);
if (!win) window.open(PASS, '_blank');
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
function openBlank() {
const p = S.view === 'read' ? DOCS.find(x => x.id === S.doc) : PACK.find(x => x.id === S.game);
const w = p && window.open(blankUrl(), '_blank');
if (!w) return;
w.opener = null;
const d = w.document;
d.title = p.name;
d.body.style.cssText = 'margin:0;height:100vh;overflow:hidden;background:#000';
const f = d.createElement('iframe');
f.setAttribute('allow', 'fullscreen; autoplay; gamepad');
f.style.cssText = 'border:0;width:100%;height:100%;display:block';
if (S.view === 'read') { d.body.style.background = '#fff'; fillDoc(f, p.id); } else f.src = gameUrl(p.id);
d.body.appendChild(f);
f.focus();
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
const gameTile = p => `<button class="gt" data-pack="${esc(p.id)}" data-name="${esc(p.name.toLowerCase())}" title="${esc(p.name)}">${art(p)}${p.img ? `<div class="tn">${esc(p.name)}</div>` : ''}</button>`;
const vGames = () => {
const cats = [['All', PACK.length], ...[...THEMES, ARCADE].map(t => [t[0], PACK.filter(p => p.theme === t).length]).filter(c => c[1])];
if (!cats.some(c => c[0] === S.cat)) S.cat = 'All';
const list = S.cat === 'All' ? PACK : PACK.filter(p => p.theme[0] === S.cat);
const recent = store.get('recent', []).map(findItem).filter(Boolean);
const libState = PACK.length ? '' : S.libError ? empty(esc(S.libError)) : S.lib && !S.libLoading ? empty('No games yet. Add an .html file to the offline folder, then hit refresh.') : '<div class="spin"></div>';
return `${PATTERNS}<div class="ghero"><div class="ghead"><div class="grow"><div class="gh">Game library</div>
<div class="sub">${PACK.length} ${PACK.length === 1 ? 'game' : 'games'} · press <span class="kbd">/</span> to search</div></div>
${LIB ? '' : `<button class="btn" data-act="libtab" title="Open the games library in a new about:blank tab">${I.ext}Open in new tab</button>`}</div>
<div class="gfind"><label class="gsearch">${I.search}<input data-search placeholder="Search games…" value="${esc(S.q)}" autocomplete="off" spellcheck="false"><span class="kbd">/</span></label>
<button class="btn pri big" data-act="random">${I.shuffle}Random</button></div></div>
${reqCard('games')}
${cats.length > 2 ? `<div class="seg">${cats.map(([l, n]) => `<button data-cat="${l}" class="${S.cat === l ? 'on' : ''}">${l}<b>${n}</b></button>`).join('')}</div>` : ''}
${S.libError && PACK.length ? `<p class="note" style="margin-bottom:10px">${esc(S.libError)} Showing the last list.</p>` : ''}
${recent.length ? `<div class="rec"><div class="grp">Jump back in</div><div class="tgrid">${recent.map(gameTile).join('')}</div></div>` : ''}
<div class="grp">${S.cat === 'All' ? 'All games' : esc(S.cat)}</div>
${libState}<div class="tgrid all">${list.map(gameTile).join('')}</div><div class="empty nomatch" hidden></div>`;
};
function filterGames() {
const ct = $('.ct'), q = S.q.trim().toLowerCase();
let shown = 0;
ct.querySelectorAll('.tgrid.all .gt').forEach(t => { t.hidden = !!q && !t.dataset.name.includes(q); if (!t.hidden) shown++; });
const rec = ct.querySelector('.rec');
if (rec) rec.hidden = !!q;
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
const hm = m => { const h = Math.floor(m / 60); return (h % 12 || 12) + ':' + String(m % 60).padStart(2, '0'); };
const ampm = m => hm(m) + (m < 720 ? ' a.m.' : ' p.m.');
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
// ---- Update prompt ----
const pendingUpdate = !LIB && window.__classDashUpdate;
window.__classDashUpdate = null;
if (pendingUpdate) {
const m = pendingUpdate.code.match(/const WHATSNEW = (['"])(.*?)\1;/);
$('.unote').textContent = m && m[2] ? "What's new: " + m[2] : 'A newer version of Class Dash is on GitHub.';
$('.ubar').hidden = false;
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
const ALIAS = { overview: 'home', 'to-do': 'todo', todos: 'todo', class: 'classes', game: 'games', calender: 'calendar', bell: 'schedule', 'hall-pass': 'hallpass', pass: 'hallpass', securly: 'hallpass', request: 'games' };
function currentAddr() {
const v = S.view;
if (v === 'course') { const c = byId(S.courseId); return c ? 'classes.' + slug(c.name) : 'classes'; }
if (v === 'play') { const g = PACK.find(x => x.id === S.game); return g ? 'games.' + slug(g.name) : 'games'; }
if (v === 'read') { const d = DOCS.find(x => x.id === S.doc); return d ? 'study.' + slug(d.cls) + '.' + slug(d.name) : 'study'; }
if (v === 'study' && S.scls !== 'All') return 'study.' + slug(S.scls);
return v;
}
function omniItems() {
const out = NAV.map(([v, label, icon]) => ({ kind: 'Page', name: label, addr: v, icon, w: 40, open: () => go(v) }));
const classes = {};
DOCS.forEach(p => { classes[p.cls] = classes[p.cls] || p; });
Object.keys(classes).forEach(cls => out.push({ kind: 'Study class', name: cls, addr: 'study.' + slug(cls), icon: classes[cls].icon, color: classes[cls].color, w: 30,
open: () => { S.scls = cls; S.sq = ''; go('study'); } }));
DOCS.forEach(p => out.push({ kind: 'Study · ' + p.cls, name: p.name, addr: 'study.' + slug(p.cls) + '.' + slug(p.name), alt: 'study.' + slug(p.name), icon: p.icon, color: p.color, w: 25,
open: () => { S.doc = p.id; go('read'); } }));
PACK.forEach(p => out.push({ kind: 'Game', name: p.name, addr: 'games.' + slug(p.name), icon: (p.theme && p.theme[2] ? svg(p.theme[2]) : I.game), w: 20,
open: () => { addRecent('pack:' + p.id); S.game = p.id; go('play'); } }));
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
} else if (e.key === 'Enter') { e.preventDefault(); omniOpen(S.omniSel || 0); }
else if (e.key === 'Escape') { e.preventDefault(); omniBox.blur(); omniClose(); omniBox.value = currentAddr(); }
}
root.addEventListener('click', e => {
if (e.target === $('.bd')) return LIB ? null : close();
const t = e.target.closest('[data-go],[data-course],[data-done],[data-seg],[data-cat],[data-scls],[data-sched],[data-lunch],[data-pack],[data-doc],[data-act]');
if (!t) return;
const d = t.dataset;
if (d.go) go(d.go);
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
else if (d.doc) { S.doc = d.doc; go('read'); }
else if (d.sched) { S.schedKey = d.sched; renderMain(true); }
else if (d.lunch) { S.lunch = Number(d.lunch); store.set('lunch', S.lunch); paintSched(); renderMain(true); }
else if (d.pack) { addRecent('pack:' + d.pack); S.game = d.pack; go('play'); }
else if (d.act === 'random') { const v = visibleTiles(); if (v.length) v[Math.floor(Math.random() * v.length)].click(); }
else if (d.act === 'license') showLicense($('.ct'));
else if (d.act === 'newtab') openBlank();
else if (d.act === 'libtab') openLibraryTab();
else if (d.act === 'full') { const f = root.querySelector('.gframe'); if (f && f.requestFullscreen) f.requestFullscreen(); }
else if (d.act === 'reload') renderMain();
else if (d.act === 'close') close();
else if (d.act === 'later') $('.ubar').hidden = true;
else if (d.act === 'hallpass') openHallPass();
else if (d.act === 'update') applyUpdate();
else if (d.act === 'refresh') { if (usesLib(S.view)) loadLib(true); else { S.courseCache = {}; load(); } }
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
$('.clock').textContent = fmtTime(n);
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
tick();
renderMain();
load();
})();
