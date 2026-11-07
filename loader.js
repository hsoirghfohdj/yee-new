(() => {
if (window.__classDashBusy) return;
const prev = document.getElementById('class-dash-root');
if (prev) { if (prev.__close) prev.__close(); else prev.remove(); return; }
const RAW = 'https://raw.githubusercontent.com/hsoirghfohdj/yee-new/main/bookmarklet.js';
const PAGES = 'https://hsoirghfohdj.github.io/yee-new/bookmarklet.js';
const KEY = 'classdash_code', bust = '?t=' + Date.now();
const toast = msg => {
const d = document.createElement('div');
d.textContent = msg;
d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;max-width:90vw;background:#121018;color:#f1eef5;border:1px solid #24202d;border-radius:12px;padding:12px 18px;font:14px/1.4 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45)';
document.body.appendChild(d);
setTimeout(() => d.remove(), 6000);
};
const get = url => fetch(url + bust, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
const compile = code => { try { return new Function(code); } catch (e) { return e; } };
const cached = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
const viaTag = () => {
const s = document.createElement('script');
s.src = PAGES + bust;
s.onerror = () => toast("Classboard couldn't load on this page.");
document.head.appendChild(s);
};
window.__classDashBusy = true;
get(RAW).catch(() => get(PAGES)).catch(() => null).then(code => {
window.__classDashBusy = false;
let run = code ? compile(code) : null;
if (typeof run === 'function') { try { localStorage.setItem(KEY, code); } catch (e) {} }
else if (!(run instanceof EvalError)) {
const old = cached();
if (old) { if (code) toast('bookmarklet.js on GitHub has an error, so the last working version was used.'); run = compile(old); }
}
if (!run) return toast("Classboard couldn't reach GitHub. Check your connection and try again.");
if (run instanceof EvalError) return viaTag();
if (run instanceof Error) return toast('bookmarklet.js on GitHub has an error: ' + run.message);
run();
});
})();
