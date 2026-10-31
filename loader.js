(() => {
if (window.__classDashBusy) return;
const prev = document.getElementById('class-dash-root');
if (prev) { if (prev.__close) prev.__close(); else prev.remove(); return; }
const SRC = 'https://hsoirghfohdj.github.io/yee-new/bookmarklet.js', KEY = 'classdash_code';
const builtin = () => { /*APP*/ };
const run = code => { let f; try { f = new Function(code); } catch (e) { return false; } f(); return true; };
const fallback = () => { let c = null; try { c = localStorage.getItem(KEY); } catch (e) {} if (!c || !run(c)) builtin(); };
const ctl = window.AbortController ? new AbortController() : null;
const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 5000);
window.__classDashBusy = true;
fetch(SRC, { cache: 'no-cache', signal: ctl ? ctl.signal : undefined })
.then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
.then(code => { try { localStorage.setItem(KEY, code); } catch (e) {} return code; }, () => null)
.then(code => { clearTimeout(timer); window.__classDashBusy = false; if (!code || !run(code)) fallback(); });
})();
