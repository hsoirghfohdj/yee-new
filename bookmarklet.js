(() => {
const ID = 'class-dash-root';
const prev = document.getElementById(ID);
if (prev) { if (prev.__close) prev.__close(); else prev.remove(); return; }
const ENV = window.ENV || {};
const isCanvas = !!(ENV.current_user_id || ENV.current_user) || /(^|\.)instructure\.com$/.test(location.hostname);
const DAY = 864e5;
const REPO = 'hsoirghfohdj/yee-new', BRANCH = 'main', DIR = 'offline/';
const PAGES = 'https://hsoirghfohdj.github.io/yee-new/';
const store = {
get(k, d) { try { const v = localStorage.getItem('classdash_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
set(k, v) { try { localStorage.setItem('classdash_' + k, JSON.stringify(v)); } catch (e) {} }
};
const S = {
view: isCanvas ? 'home' : 'games', back: 'classes', seg: 'all',
loading: false, error: null, loadedAt: null,
me: null, courses: [], work: [], grades: [], ann: [],
done: new Set(store.get('done', [])), courseCache: {}, courseId: null,
game: null, stopGame: null, gameKey: null,
lib: store.get('lib', null), libLoading: false, libError: null, libTried: 0, q: '', gseg: 'all'
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
.mn{display:flex;flex-direction:column;min-width:0;min-height:0}
.hd{display:flex;align-items:center;gap:10px;padding:14px 20px 14px 24px;border-bottom:1px solid var(--ln)}
.hd h1{font-size:18px;font-weight:650;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
.gt .tag{position:absolute;top:9px;right:9px;background:rgba(6,8,12,.72);backdrop-filter:blur(4px);color:#fff;font-size:10px;font-weight:700;letter-spacing:.03em;padding:3px 8px;border-radius:20px}
.stage{display:flex;flex-direction:column;align-items:center;gap:12px}
.gbar{display:flex;gap:10px;align-items:center;width:100%;max-width:560px}
.gs{background:var(--p1);border:1px solid var(--ln);border-radius:9px;padding:5px 12px;font-size:12px;color:var(--mu)}
.gs b{color:var(--tx);font-size:14px;margin-left:4px;font-variant-numeric:tabular-nums}
.area canvas{display:block;background:var(--p1);border:1px solid var(--ln);border-radius:14px;max-width:100%;max-height:calc(100vh - 250px)}
.gmsg{font-weight:600;min-height:20px}
.play{display:flex;flex-direction:column;gap:12px;height:100%;min-height:420px}
.gbar.wide{max-width:none}
.frame{flex:1;position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--ln);background:var(--p1)}
.gframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.lic{position:absolute;inset:0;overflow:auto;margin:0;padding:20px;background:var(--p1);color:var(--mu);font:12px/1.5 ui-monospace,monospace;white-space:pre-wrap}
.mem{display:grid;grid-template-columns:repeat(4,86px);gap:10px}
.mem button{all:unset;cursor:pointer;width:86px;height:86px;border-radius:14px;background:var(--p3);display:grid;place-items:center;font-size:38px;transition:background .15s}
.mem button:hover{background:#2f3646}
.mem button.up{background:var(--p2)}
.mem button.ok{background:rgba(62,207,142,.16);cursor:default}
.mem .hid{opacity:0}
.mines{display:grid;grid-template-columns:repeat(10,34px);gap:3px;padding:10px;background:var(--p1);border:1px solid var(--ln);border-radius:14px}
.mines button{all:unset;cursor:pointer;width:34px;height:34px;border-radius:7px;background:var(--p3);display:grid;place-items:center;font-weight:800;font-size:15px}
.mines button:hover{background:#323a4b}
.mines button.o{background:var(--bg);cursor:default}
.mines button.x{background:rgba(242,99,122,.35)}
.note{color:var(--mu);font-size:12px;text-align:center}
.nc{max-width:460px;margin:50px auto;text-align:center;padding:30px}
.nc .logo{width:52px;height:52px;border-radius:14px;margin:0 auto 14px}
.nc h3{font-size:18px;margin-bottom:6px}
.nc p{margin-bottom:18px;white-space:normal}
.ann .sub{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
@media (max-width:780px){
.win{grid-template-columns:1fr;grid-template-rows:auto 1fr;width:100vw;height:100vh;border-radius:0}
.sb{flex-direction:row;padding:8px;border-right:0;border-bottom:1px solid var(--ln);overflow-x:auto}
.brand,.sbf{display:none}.nav{flex-direction:row}
.tiles{grid-template-columns:repeat(2,1fr)}.cols{grid-template-columns:1fr}
.calh{display:none}.cal{grid-template-columns:repeat(2,minmax(0,1fr))}
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
if (!['game', 'games', 'play'].includes(S.view)) renderMain(true);
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
root.innerHTML = `<style>${CSS}</style><div class="bd"><div class="win">
<aside class="sb"><div class="brand"><span class="logo">${I.cap}</span>Class Dash</div><nav class="nav"></nav><div class="sbf"><div class="clock"></div><div class="date"></div></div></aside>
<main class="mn"><header class="hd"><h1></h1><span class="upd"></span>
<button class="ib" data-act="refresh" title="Refresh">${I.refresh}</button><button class="ib" data-act="close" title="Close (Esc)">${I.x}</button></header>
<div class="ct"></div></main></div></div>`;
document.body.appendChild(host);
const $ = s => root.querySelector(s);
const NAV = [['home', 'Overview', I.home], ['todo', 'To-Do', I.check], ['grades', 'Grades', I.chart], ['classes', 'Classes', I.book], ['calendar', 'Calendar', I.cal], ['games', 'Games', I.game]];
const navOf = v => v === 'course' ? 'classes' : v === 'game' || v === 'play' ? 'games' : v;
function paintChrome() {
const overdue = S.work.filter(x => x.open && x.due && new Date(x.due) < Date.now()).length;
$('.nav').innerHTML = NAV.map(([v, label, icon]) => `<button data-go="${v}" class="${navOf(S.view) === v ? 'on' : ''}">${icon}${label}${v === 'todo' && overdue ? `<span class="badge">${overdue}</span>` : ''}</button>`).join('');
const c = S.view === 'course' && byId(S.courseId), g = (S.view === 'game' ? GAMES : S.view === 'play' ? PACK : []).find(x => x.id === S.game);
$('.hd h1').textContent = c ? c.name : g ? g.name : (NAV.find(n => n[0] === S.view) || [, ''])[1];
$('.upd').textContent = S.view === 'games' ? (S.libLoading ? 'Checking GitHub…' : S.lib ? 'Updated ' + fmtTime(new Date(S.lib.at)) : '')
: S.loading && S.loadedAt ? 'Refreshing…' : S.loadedAt && isCanvas && S.view !== 'game' && S.view !== 'play' ?'Updated ' + fmtTime(S.loadedAt) : '';
const rb = $('[data-act="refresh"]');
rb.style.display = isCanvas || S.view === 'games' ? '' : 'none';
rb.classList.toggle('spinning', S.view === 'games' ? S.libLoading : S.loading);
}
function renderMain(keepScroll) {
if (S.stopGame) { S.stopGame(); S.stopGame = null; }
const ct = $('.ct'), top = ct.scrollTop, v = S.view;
paintChrome();
if (v === 'games') {
const focused = root.activeElement && root.activeElement.matches('[data-search]');
ct.innerHTML = vGames();
filterGames();
if (focused) { const box = $('[data-search]'); box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
loadLib();
}
else if (v === 'game') { ct.innerHTML = vGame(); S.stopGame = startGame(GAMES.find(x => x.id === S.game), ct); }
else if (v === 'play') { ct.innerHTML = vPlay(); startPack(ct); }
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
const rand = n => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rr = (x, X, Y, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h); x.fill(); };
const banner = (x, W, H, a, b) => {
x.fillStyle = 'rgba(15,18,24,.78)'; x.fillRect(0, 0, W, H);
x.textAlign = 'center'; x.fillStyle = '#e9ecf2'; x.font = '700 30px system-ui,sans-serif'; x.fillText(a, W / 2, H / 2 - 4);
x.fillStyle = '#8c93a5'; x.font = '15px system-ui,sans-serif'; x.fillText(b, W / 2, H / 2 + 26);
};
const canvasIn = (g, w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; g.area.appendChild(cv); return cv; };
const steer = (held, e, down) => {
const k = e.key.toLowerCase();
if (k === 'arrowleft' || k === 'a') { held.l = down ? 1 : 0; return true; }
if (k === 'arrowright' || k === 'd') { held.r = down ? 1 : 0; return true; }
return false;
};
function snake(g) {
const N = 20, C = 24, W = N * C, cv = canvasIn(g, W, W), x = cv.getContext('2d');
const DIR = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
let body = [{ x: 6, y: 10 }, { x: 5, y: 10 }, { x: 4, y: 10 }], food = { x: 14, y: 10 }, dir = [1, 0], queue = [], score = 0, speed = 130, acc = 0, state = 'ready', msg = '';
const place = () => { do food = { x: rand(N), y: rand(N) }; while (body.some(p => p.x === food.x && p.y === food.y)); };
const reset = () => { body = [{ x: 6, y: 10 }, { x: 5, y: 10 }, { x: 4, y: 10 }]; dir = [1, 0]; queue = []; score = 0; speed = 130; acc = 0; g.score(0); place(); state = 'play'; };
g.key((e, down) => {
const k = e.key.toLowerCase();
if (k === ' ' || k === 'enter') { if (down && state !== 'play') reset(); return true; }
const d = DIR[k];
if (!d) return false;
if (down && state === 'ready') reset();
if (down && state === 'play' && queue.length < 3) {
const last = queue[queue.length - 1] || dir;
if (d[0] !== -last[0] || d[1] !== -last[1]) queue.push(d);
}
return true;
});
const step = () => {
if (queue.length) dir = queue.shift();
const h = { x: body[0].x + dir[0], y: body[0].y + dir[1] };
const eat = h.x === food.x && h.y === food.y;
const hit = body.slice(0, eat ? body.length : -1).some(p => p.x === h.x && p.y === h.y);
if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || hit) { state = 'over'; msg = g.end(score) ? 'New best: ' + score + '!' : 'Score: ' + score; return; }
body.unshift(h);
if (eat) { score++; g.score(score); speed = Math.max(65, speed - 3); place(); } else body.pop();
};
const draw = () => {
x.fillStyle = '#161a22'; x.fillRect(0, 0, W, W);
x.fillStyle = '#1a1f29';
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) x.fillRect(i * C, j * C, C, C);
x.fillStyle = '#f2637a'; x.beginPath(); x.arc(food.x * C + C / 2, food.y * C + C / 2, C * 0.34, 0, 7); x.fill();
body.forEach((p, i) => { x.fillStyle = i ? '#3ecf8e' : '#8ef5c4'; rr(x, p.x * C + 2, p.y * C + 2, C - 4, C - 4, 6); });
if (state === 'ready') banner(x, W, W, 'Snake', 'Press Space or an arrow key to start');
if (state === 'over') banner(x, W, W, msg, 'Press Space to play again');
};
g.loop(dt => {
if (state === 'play') { acc += dt; while (acc >= speed && state === 'play') { acc -= speed; step(); } }
draw();
});
}
function bricks(g) {
const W = 480, H = 540, cv = canvasIn(g, W, H), x = cv.getContext('2d');
const COLS = 8, ROWS = 6, GAP = 6, BW = (W - 32 - GAP * (COLS - 1)) / COLS, BH = 18, R = 7, PY = H - 36;
const CL = ['#f2637a', '#ff8f5a', '#f5b546', '#3ecf8e', '#4cc9f0', '#7c9cff'];
const pw = 92, held = { l: 0, r: 0 };
let px = W / 2 - pw / 2, ball, blocks, score = 0, lives = 3, level = 1, state = 'ready', msg = '';
const build = () => { blocks = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) blocks.push({ x: 16 + c * (BW + GAP), y: 64 + r * (BH + GAP), c: CL[r], on: 1 }); };
const dock = () => { ball = { x: px + pw / 2, y: PY - R - 1, vx: 0, vy: 0, stuck: 1 }; };
const launch = () => {
if (!ball.stuck) return;
const a = (Math.random() - 0.5) * 0.9, v = 0.3 + level * 0.04;
ball.vx = v * Math.sin(a); ball.vy = -v * Math.cos(a); ball.stuck = 0;
};
const start = () => { score = 0; lives = 3; level = 1; g.score(0); build(); dock(); state = 'play'; };
const act = () => { if (state !== 'play') start(); else launch(); };
build(); dock();
g.key((e, down) => {
if (steer(held, e, down)) return true;
if (e.key === ' ') { if (down) act(); return true; }
return false;
});
cv.addEventListener('mousemove', e => { px = clamp(e.offsetX * W / cv.clientWidth - pw / 2, 0, W - pw); });
cv.addEventListener('click', act);
const update = dt => {
px = clamp(px + (held.r - held.l) * 0.6 * dt, 0, W - pw);
if (ball.stuck) { ball.x = px + pw / 2; ball.y = PY - R - 1; return; }
const n = Math.ceil(dt / 4);
for (let s = 0; s < n; s++) {
const t = dt / n;
ball.x += ball.vx * t; ball.y += ball.vy * t;
if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx); }
if (ball.y < R) { ball.y = R; ball.vy = Math.abs(ball.vy); }
if (ball.vy > 0 && ball.y + R >= PY && ball.y + R <= PY + 14 && ball.x >= px - R && ball.x <= px + pw + R) {
const a = clamp((ball.x - (px + pw / 2)) / (pw / 2), -1, 1) * 1.05, v = Math.hypot(ball.vx, ball.vy);
ball.vx = v * Math.sin(a); ball.vy = -v * Math.cos(a); ball.y = PY - R;
}
for (const b of blocks) {
if (!b.on) continue;
const nx = clamp(ball.x, b.x, b.x + BW), ny = clamp(ball.y, b.y, b.y + BH);
if ((ball.x - nx) ** 2 + (ball.y - ny) ** 2 < R * R) {
b.on = 0; score += 10 * level; g.score(score);
const ox = Math.min(Math.abs(ball.x - b.x), Math.abs(ball.x - b.x - BW)), oy = Math.min(Math.abs(ball.y - b.y), Math.abs(ball.y - b.y - BH));
if (ox < oy) ball.vx = -ball.vx; else ball.vy = -ball.vy;
break;
}
}
if (ball.y > H + R) {
lives--;
if (lives <= 0) { state = 'over'; msg = g.end(score) ? 'New best: ' + score + '!' : 'Score: ' + score; }
dock(); return;
}
}
if (blocks.every(b => !b.on)) { level++; build(); dock(); }
};
const draw = () => {
x.fillStyle = '#161a22'; x.fillRect(0, 0, W, H);
blocks.forEach(b => { if (b.on) { x.fillStyle = b.c; rr(x, b.x, b.y, BW, BH, 5); } });
x.fillStyle = '#e9ecf2'; rr(x, px, PY, pw, 12, 6);
x.beginPath(); x.arc(ball.x, ball.y, R, 0, 7); x.fill();
x.fillStyle = '#8c93a5'; x.font = '600 14px system-ui,sans-serif';
x.textAlign = 'left'; x.fillText('Level ' + level, 16, 36);
x.textAlign = 'right'; x.fillStyle = '#f2637a'; x.fillText('♥ '.repeat(Math.max(0, lives)).trim(), W - 16, 36);
if (state === 'play' && ball.stuck) { x.textAlign = 'center'; x.fillStyle = '#8c93a5'; x.fillText('Space or click to launch', W / 2, PY - 40); }
if (state === 'ready') banner(x, W, H, 'Brick Breaker', 'Click or press Space to start');
if (state === 'over') banner(x, W, H, msg, 'Click or press Space to play again');
};
g.loop(dt => { if (state === 'play') update(dt); draw(); });
}
function dodge(g) {
const W = 480, H = 540, PS = 32, PY = H - 52, cv = canvasIn(g, W, H), x = cv.getContext('2d'), held = { l: 0, r: 0 };
let px = W / 2 - PS / 2, rocks = [], coins = [], t = 0, spawn = 0, bonus = 0, score = 0, state = 'ready', msg = '';
const start = () => { px = W / 2 - PS / 2; rocks = []; coins = []; t = 0; spawn = 0; bonus = 0; score = 0; g.score(0); state = 'play'; };
g.key((e, down) => {
if (steer(held, e, down)) { if (down && state === 'ready') start(); return true; }
if (e.key === ' ') { if (down && state !== 'play') start(); return true; }
return false;
});
cv.addEventListener('mousemove', e => { if (state === 'play') px = clamp(e.offsetX * W / cv.clientWidth - PS / 2, 0, W - PS); });
cv.addEventListener('click', () => { if (state !== 'play') start(); });
const update = dt => {
t += dt; spawn -= dt;
const hard = 1 + t / 18000;
px = clamp(px + (held.r - held.l) * 0.5 * dt, 0, W - PS);
if (spawn <= 0) {
const s = 18 + rand(38);
rocks.push({ x: rand(W - s), y: -s, s, v: (0.12 + Math.random() * 0.13) * hard, a: Math.random() * 6, spin: (Math.random() - 0.5) * 0.004 });
if (Math.random() < 0.2) coins.push({ x: 14 + rand(W - 28), y: -14, v: 0.16 * hard });
spawn = Math.max(120, 520 / hard);
}
rocks.forEach(r => { r.y += r.v * dt; r.a += r.spin * dt; });
coins.forEach(c => { c.y += c.v * dt; });
rocks = rocks.filter(r => r.y < H);
coins = coins.filter(c => {
if (Math.abs(c.x - (px + PS / 2)) < 24 && Math.abs(c.y - (PY + PS / 2)) < 24) { bonus += 25; return false; }
return c.y < H + 14;
});
if (rocks.some(r => r.x + 3 < px + PS && r.x + r.s - 3 > px && r.y + 3 < PY + PS && r.y + r.s - 3 > PY)) {
state = 'over'; msg = g.end(score) ? 'New best: ' + score + '!' : 'Score: ' + score;
}
const s = Math.floor(t / 100) + bonus;
if (s !== score) { score = s; g.score(score); }
};
const draw = () => {
x.fillStyle = '#161a22'; x.fillRect(0, 0, W, H);
x.fillStyle = '#232938';
for (let i = 0; i < 40; i++) x.fillRect((i * 97) % W, ((i * 53 + t * 0.03 * (1 + i % 3)) % H), 2, 2);
rocks.forEach(r => {
x.save(); x.translate(r.x + r.s / 2, r.y + r.s / 2); x.rotate(r.a);
x.fillStyle = '#8c93a5'; rr(x, -r.s / 2, -r.s / 2, r.s, r.s, r.s / 4);
x.fillStyle = '#6d7386'; rr(x, -r.s / 5, -r.s / 4, r.s / 3, r.s / 3, r.s / 8);
x.restore();
});
coins.forEach(c => { x.fillStyle = '#f5b546'; x.beginPath(); x.arc(c.x, c.y, 9, 0, 7); x.fill(); x.fillStyle = '#ffd68a'; x.beginPath(); x.arc(c.x - 2, c.y - 2, 3, 0, 7); x.fill(); });
x.fillStyle = '#7c9cff'; rr(x, px, PY, PS, PS, 9);
x.fillStyle = '#0f1218'; x.fillRect(px + 8, PY + 11, 5, 5); x.fillRect(px + 19, PY + 11, 5, 5);
if (state === 'ready') banner(x, W, H, 'Meteor Dodge', 'Click, Space or ←/→ to start');
if (state === 'over') banner(x, W, H, msg, 'Click or press Space to try again');
};
g.loop(dt => { if (state === 'play') update(dt); draw(); });
}
function memory(g) {
const SYM = ['🍕', '🚀', '🎧', '🌵', '🐙', '⚽', '🍩', '🦊'];
const deck = SYM.concat(SYM).map(s => ({ s, up: 0, ok: 0 }));
for (let i = deck.length - 1; i > 0; i--) { const j = rand(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
const grid = document.createElement('div');
grid.className = 'mem'; g.area.appendChild(grid);
let open = [], moves = 0, lock = false;
const draw = () => { grid.innerHTML = deck.map((c, i) => `<button data-i="${i}" class="${c.ok ? 'ok' : c.up ? 'up' : ''}"><span class="${c.up || c.ok ? '' : 'hid'}">${c.s}</span></button>`).join(''); };
grid.addEventListener('click', e => {
const b = e.target.closest('button');
if (!b || lock) return;
const c = deck[+b.dataset.i];
if (c.up || c.ok) return;
c.up = 1; open.push(c);
if (open.length === 2) {
moves++; g.score(moves);
const [a, b2] = open;
if (a.s === b2.s) {
a.ok = b2.ok = 1; open = [];
if (deck.every(d => d.ok)) g.msg(g.end(moves) ? 'All pairs in ' + moves + ' moves. New best!' : 'All pairs in ' + moves + ' moves.');
} else {
lock = true;
setTimeout(() => { a.up = b2.up = 0; open = []; lock = false; draw(); }, 750);
}
}
draw();
});
g.msg('Find all 8 pairs');
draw();
}
function mines(g) {
const N = 10, M = 15, NC = ['', '#7c9cff', '#3ecf8e', '#f2637a', '#b48cff', '#ff8f5a', '#4cc9f0', '#e9ecf2', '#8c93a5'];
const grid = document.createElement('div');
grid.className = 'mines'; g.area.appendChild(grid);
const cells = Array.from({ length: N * N }, (_, i) => ({ i, m: 0, n: 0, o: 0, f: 0 }));
let started = false, over = false, time = 0;
const nbrs = i => {
const r = Math.floor(i / N), c = i % N, out = [];
for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
const a = r + dr, b = c + dc;
if ((dr || dc) && a >= 0 && a < N && b >= 0 && b < N) out.push(a * N + b);
}
return out;
};
const lay = safe => {
const ban = new Set([safe].concat(nbrs(safe)));
for (let k = 0; k < M;) { const j = rand(N * N); if (!cells[j].m && !ban.has(j)) { cells[j].m = 1; k++; } }
cells.forEach(c => { c.n = nbrs(c.i).filter(j => cells[j].m).length; });
};
const reveal = i => {
const st = [i];
while (st.length) {
const c = cells[st.pop()];
if (c.o || c.f) continue;
c.o = 1;
if (!c.n && !c.m) nbrs(c.i).forEach(j => { if (!cells[j].o) st.push(j); });
}
};
const flags = () => cells.filter(c => c.f).length;
const draw = () => {
grid.innerHTML = cells.map(c => `<button data-i="${c.i}" class="${c.o ? (c.m ? 'x' : 'o') : ''}" style="color:${NC[c.n]}">${c.o ? (c.m ? '💣' : c.n || '') : c.f ? '🚩' : ''}</button>`).join('');
if (!over) g.msg((M - flags()) + ' mines left');
};
const flag = c => { if (!c.o && !over) { c.f = c.f ? 0 : 1; draw(); } };
g.every(() => { if (started && !over) { time++; g.score(time); } }, 1000);
grid.addEventListener('click', e => {
const b = e.target.closest('button');
if (!b || over) return;
const c = cells[+b.dataset.i];
if (e.shiftKey) return flag(c);
if (c.f || c.o) return;
if (!started) { lay(c.i); started = true; }
if (c.m) {
over = true; cells.forEach(d => { if (d.m) d.o = 1; });
g.msg('Boom! Hit Restart to try again.');
} else {
reveal(c.i);
if (cells.every(d => d.m || d.o)) { over = true; g.msg(g.end(time) ? 'Cleared in ' + time + 's. New best!' : 'Cleared in ' + time + 's'); }
}
draw();
});
grid.addEventListener('contextmenu', e => {
e.preventDefault();
const b = e.target.closest('button');
if (b) flag(cells[+b.dataset.i]);
});
draw();
}
const GAMES = [
{ id: 'snake', name: 'Snake', icon: '🐍', bg: 'rgba(62,207,142,.16)', desc: "Eat, grow longer, and don't hit the walls or yourself.", help: 'Arrow keys or WASD to steer · Space to start · Esc to go back', label: 'Score', run: snake },
{ id: 'bricks', name: 'Brick Breaker', icon: '🧱', bg: 'rgba(242,99,122,.16)', desc: 'Bounce the ball and smash every brick. It speeds up each level.', help: 'Mouse or ←/→ to move · Space or click to launch · Esc to go back', label: 'Score', run: bricks },
{ id: 'dodge', name: 'Meteor Dodge', icon: '☄️', bg: 'rgba(124,156,255,.16)', desc: 'Dodge the falling rocks and grab coins for bonus points.', help: 'Mouse or ←/→ to move · Space to start · Esc to go back', label: 'Score', run: dodge },
{ id: 'memory', name: 'Memory Match', icon: '🃏', bg: 'rgba(245,181,70,.16)', desc: 'Flip cards and find all 8 pairs in as few moves as you can.', help: 'Click two cards to flip them · lower is better', label: 'Moves', low: 1, run: memory },
{ id: 'mines', name: 'Mines', icon: '💣', bg: 'rgba(180,140,255,.16)', desc: 'Clear the board without digging up a mine.', help: 'Click to dig · right-click or Shift-click to flag · faster is better', label: 'Time', unit: 's', low: 1, run: mines }
];
const IMG = /\.(png|jpe?g|webp|gif)$/i;
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
return { id: path, name: pretty(base), desc: rel, img: pic ? gameUrl(pic) : null };
};
const artFor = (path, imgs) => {
const stem = path.replace(/\.html?$/i, '').toLowerCase();
const dir = stem.replace(/\/index$/, '');
return [stem, dir + '/preview', dir + '/cover', dir].map(s => imgs[s]).find(Boolean) || null;
};
const art = (name, img) => {
if (img) return `<div class="art"><img src="${esc(img)}" alt="" loading="lazy"></div>`;
const words = name.match(/[A-Za-z][A-Za-z0-9]*/g);
const label = words ? words.slice(0, 2).map(w => w[0]).join('').toUpperCase() : name.slice(0, 4);
return `<div class="art" style="background:linear-gradient(135deg,${PAL[hash(name) % PAL.length]},${PAL[hash(name + 'x') % PAL.length]})">${esc(label)}</div>`;
};
let PACK = [];
const setPack = () => { PACK = (S.lib ? S.lib.paths : []).map(toPack).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); };
setPack();
async function loadLib(force) {
if (S.libLoading || (!force && Date.now() - Math.max(S.libTried, S.lib ? S.lib.at : 0) < 5 * 6e4)) return;
S.libLoading = true; S.libError = null; S.libTried = Date.now();
paintChrome();
try {
const r = await fetch('https://api.github.com/repos/' + REPO + '/git/trees/' + BRANCH + '?recursive=1');
let files = [];
if (r.status !== 409 && r.status !== 404) {
if (!r.ok) throw new Error(r.status === 403 || r.status === 429 ? 'GitHub is rate-limiting this network. Try again in a few minutes.' : 'GitHub returned an error (' + r.status + ').');
files = ((await r.json()).tree || []).filter(t => t.type === 'blob' && t.path.startsWith(DIR)).map(t => t.path);
}
const imgs = {}, pics = {};
files.filter(p => IMG.test(p)).forEach(p => { imgs[p.replace(IMG, '').toLowerCase()] = p; });
const paths = files.filter(isGame);
paths.forEach(p => { const a = artFor(p, imgs); if (a) pics[p] = a; });
S.lib = { at: Date.now(), paths, art: pics };
store.set('lib', S.lib);
setPack();
} catch (e) {
S.libError = e.message === 'Failed to fetch' ? "Couldn't reach GitHub. Check you're online, then refresh." : e.message || String(e);
}
S.libLoading = false;
paintChrome();
if (S.view === 'games') renderMain(true);
}
const vPlay = () => {
const p = PACK.find(x => x.id === S.game);
if (!p) return `<div class="gbar"><button class="btn" data-go="games">← Games</button></div>` + empty('That game is no longer in the repo.');
return `<div class="play"><div class="gbar wide"><button class="btn" data-go="games">← Games</button>
<div class="grow"><div class="t">${esc(p.name)}</div><div class="sub">${esc(p.desc)} · from GitHub</div></div>
<button class="btn" data-act="license">License</button><button class="btn" data-act="newtab">New tab</button><button class="btn" data-act="full">Full screen</button><button class="btn" data-act="reload">Restart</button></div>
<div class="frame"><div class="spin"></div></div></div>`;
};
function startPack(ct) {
const box = ct.querySelector('.frame');
if (!box) return;
const f = document.createElement('iframe');
f.className = 'gframe';
f.setAttribute('allow', 'fullscreen; autoplay; gamepad');
f.addEventListener('load', () => { try { f.contentWindow.focus(); } catch (e) {} });
f.src = gameUrl(S.game);
box.innerHTML = '';
box.appendChild(f);
}
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
function openBlank() {
const p = PACK.find(x => x.id === S.game);
const w = p && window.open('about:blank', '_blank');
if (!w) return;
w.opener = null;
const d = w.document;
d.title = p.name;
d.body.style.cssText = 'margin:0;height:100vh;overflow:hidden;background:#000';
const f = d.createElement('iframe');
f.setAttribute('allow', 'fullscreen; autoplay; gamepad');
f.style.cssText = 'border:0;width:100%;height:100%;display:block';
f.src = gameUrl(p.id);
d.body.appendChild(f);
f.focus();
}
const bestOf = def => { const b = store.get('best_' + def.id, null); return b == null ? '—' : b + (def.unit || ''); };
const packItem = p => ({ k: 'pack', id: p.id, name: p.name, img: p.img });
const gameItem = g => ({ k: 'game', id: g.id, name: g.name, tag: store.get('best_' + g.id, null) == null ? 'BUILT IN' : 'BEST ' + bestOf(g) });
const findItem = key => {
const i = key.indexOf(':'), k = key.slice(0, i), id = key.slice(i + 1);
const x = k === 'pack' ? PACK.find(p => p.id === id) : GAMES.find(g => g.id === id);
return x ? (k === 'pack' ? packItem(x) : gameItem(x)) : null;
};
const addRecent = key => store.set('recent', [key, ...store.get('recent', []).filter(x => x !== key)].slice(0, 7));
const gameTile = it => `<button class="gt" data-${it.k}="${esc(it.id)}" data-name="${esc(it.name.toLowerCase())}" title="${esc(it.name)}">${art(it.name, it.img)}${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : ''}<div class="tn">${esc(it.name)}</div></button>`;
const vGames = () => {
const segs = [['all', 'All', PACK.length + GAMES.length], ['lib', 'Library', PACK.length], ['built', 'Built in', GAMES.length]];
const list = [...(S.gseg !== 'built' ? PACK.map(packItem) : []), ...(S.gseg !== 'lib' ? GAMES.map(gameItem) : [])]
.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
const recent = store.get('recent', []).map(findItem).filter(Boolean);
const libState = S.gseg === 'built' || PACK.length ? '' : S.libError ? empty(esc(S.libError)) : S.lib && !S.libLoading ? empty('No library games yet. Add an .html file to the offline folder, then hit refresh.') : '<div class="spin"></div>';
return `<div class="ghero"><div class="gh">Game library</div>
<div class="sub">${PACK.length} from GitHub · ${GAMES.length} built in · press <span class="kbd">/</span> to search</div>
<div class="gfind"><label class="gsearch">${I.search}<input data-search placeholder="Search games…" value="${esc(S.q)}" autocomplete="off" spellcheck="false"><span class="kbd">/</span></label>
<button class="btn pri big" data-act="random">${I.shuffle}Random</button></div></div>
<div class="seg">${segs.map(([k, l, n]) => `<button data-gseg="${k}" class="${S.gseg === k ? 'on' : ''}">${l}<b>${n}</b></button>`).join('')}</div>
${S.libError && PACK.length ? `<p class="note" style="margin-bottom:10px">${esc(S.libError)} Showing the last list.</p>` : ''}
${recent.length ? `<div class="rec"><div class="grp">Jump back in</div><div class="tgrid">${recent.map(gameTile).join('')}</div></div>` : ''}
<div class="grp">${S.gseg === 'lib' ? 'Library' : S.gseg === 'built' ? 'Built in' : 'All games'}</div>
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
const vGame = () => {
const g = GAMES.find(x => x.id === S.game);
return `<div class="stage"><div class="gbar"><button class="btn" data-go="games">← Games</button><div class="grow"></div>
<div class="gs">${g.label}<b data-score>0</b></div><div class="gs">Best<b data-best>${bestOf(g)}</b></div><button class="btn" data-act="restart">Restart</button></div>
<div class="area"></div><div class="gmsg"></div><div class="note">${g.help}</div></div>`;
};
function startGame(def, wrap) {
let raf = 0;
const timers = [];
const g = {
area: wrap.querySelector('.area'),
score: n => { wrap.querySelector('[data-score]').textContent = n + (def.unit || ''); },
msg: t => { wrap.querySelector('.gmsg').textContent = t; },
end: n => {
const b = store.get('best_' + def.id, null);
if (b == null || (def.low ? n < b : n > b)) { store.set('best_' + def.id, n); wrap.querySelector('[data-best]').textContent = n + (def.unit || ''); return true; }
return false;
},
key: fn => { S.gameKey = fn; },
loop: fn => {
let last = performance.now();
const step = t => { fn(Math.min(50, t - last)); last = t; raf = requestAnimationFrame(step); };
raf = requestAnimationFrame(step);
},
every: (fn, ms) => { timers.push(setInterval(fn, ms)); }
};
def.run(g);
return () => { cancelAnimationFrame(raf); timers.forEach(clearInterval); S.gameKey = null; };
}
root.addEventListener('click', e => {
if (e.target === $('.bd')) return close();
const t = e.target.closest('[data-go],[data-course],[data-done],[data-seg],[data-gseg],[data-game],[data-pack],[data-act]');
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
else if (d.gseg) { S.gseg = d.gseg; renderMain(true); }
else if (d.game) { addRecent('game:' + d.game); S.game = d.game; go('game'); }
else if (d.pack) { addRecent('pack:' + d.pack); S.game = d.pack; go('play'); }
else if (d.act === 'random') { const v = visibleTiles(); if (v.length) v[Math.floor(Math.random() * v.length)].click(); }
else if (d.act === 'license') showLicense($('.ct'));
else if (d.act === 'newtab') openBlank();
else if (d.act === 'full') { const f = root.querySelector('.gframe'); if (f && f.requestFullscreen) f.requestFullscreen(); }
else if (d.act === 'reload') renderMain();
else if (d.act === 'close') close();
else if (d.act === 'refresh') { if (S.view === 'games') loadLib(true); else { S.courseCache = {}; load(); } }
else if (d.act === 'restart') renderMain();
});
root.addEventListener('input', e => { if (e.target.matches('[data-search]')) { S.q = e.target.value; filterGames(); } });
function onKey(e) {
const down = e.type === 'keydown';
const box = S.view === 'games' && $('[data-search]'), typing = box && root.activeElement === box;
if (down && box && e.key === '/' && !typing) { e.preventDefault(); e.stopPropagation(); box.focus(); return; }
if (down && typing && e.key === 'Enter') {
const v = visibleTiles(), q = S.q.trim().toLowerCase();
const pick = v.find(t => t.dataset.name === q) || v.find(t => t.dataset.name.startsWith(q)) || v[0];
if (pick) pick.click();
e.stopPropagation(); return;
}
if (down && typing && e.key === 'Escape' && S.q) { e.preventDefault(); e.stopPropagation(); box.value = S.q = ''; filterGames(); return; }
if (down && e.key === 'Escape') {
e.preventDefault(); e.stopPropagation();
if (S.view === 'game') go('games'); else close();
return;
}
if (S.gameKey && S.gameKey(e, down)) e.preventDefault();
e.stopPropagation();
}
const tick = () => {
const n = new Date();
$('.clock').textContent = fmtTime(n);
$('.date').textContent = n.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};
const clockT = setInterval(tick, 1000);
const oldOverflow = document.documentElement.style.overflow;
document.documentElement.style.overflow = 'hidden';
window.addEventListener('keydown', onKey, true);
window.addEventListener('keyup', onKey, true);
function close() {
if (S.stopGame) S.stopGame();
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