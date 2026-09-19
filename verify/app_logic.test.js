/* ============================================================
   纯前端逻辑断言（Node vm，无需浏览器）
   被 verify/run_all.sh 调用，也可单独跑：
     node verify/app_logic.test.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP = path.join(__dirname, '..', 'site', 'app.js');

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name); }
}

/* ---------- 最小 DOM 桩：够 boot() 跑完不炸 ---------- */
function fakeEl() {
  const attrs = {};
  return {
    hidden: false, innerHTML: '', textContent: '', style: {}, tagName: 'DIV',
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    removeAttribute: (k) => { delete attrs[k]; },
    hasAttribute: (k) => k in attrs,
    addEventListener: () => {}, removeEventListener: () => {},
    querySelector: () => null, querySelectorAll: () => [],
    closest: () => null, scrollIntoView: () => {}, focus: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    _attrs: attrs
  };
}

function loadApp(hash) {
  const sandbox = {
    console,
    location: { hash: hash || '' },
    document: {
      readyState: 'complete',
      addEventListener: () => {},
      getElementById: () => fakeEl(),
      querySelector: () => fakeEl(),
      querySelectorAll: () => [],
      createElement: () => fakeEl()
    },
    fetch: () => Promise.reject(new Error('测试环境不联网')),
    requestAnimationFrame: () => {},
    setTimeout: () => {}, clearTimeout: () => {},
    addEventListener: () => {},
    scrollTo: () => {}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(APP, 'utf8'), sandbox, { filename: 'app.js' });
  return sandbox;
}

console.log('== 安全层：escapeHTML ==');
const s1 = loadApp('');
const sec = s1.PortfolioSecurity;
ok('PortfolioSecurity 已暴露', !!sec);
ok('尖括号被转义', sec.escapeHTML('<img src=x onerror=alert(1)>').indexOf('&lt;img') === 0);
ok('双引号被转义', sec.escapeHTML('"') === '&quot;');
ok('单引号被转义', sec.escapeHTML("'") === '&#39;');
ok('& 被转义', sec.escapeHTML('a&b') === 'a&amp;b');
ok('null / undefined 返回空串', sec.escapeHTML(null) === '' && sec.escapeHTML(undefined) === '');
ok('数字正常字符串化', sec.escapeHTML(0) === '0');

console.log('== 安全层：safeUrl 白名单 ==');
ok('javascript: 被拒', sec.safeUrl('javascript:alert(1)') === '');
ok('JaVaScRiPt: 大小写绕过被拒', sec.safeUrl('JaVaScRiPt:alert(1)') === '');
ok('data: 被拒', sec.safeUrl('data:text/html,<script>') === '');
ok('vbscript: 被拒', sec.safeUrl('vbscript:msgbox') === '');
ok('https 放行', sec.safeUrl('https://example.com/a.png') === 'https://example.com/a.png');
ok('站内相对路径放行（回归：之前被误杀导致图片永不显示）', sec.safeUrl('assets/img/a.png') === 'assets/img/a.png');
ok('./ 前缀相对路径放行', sec.safeUrl('./assets/a.png') === './assets/a.png');
ok('../ 前缀相对路径放行', sec.safeUrl('../assets/a.png') === '../assets/a.png');
ok('协议相对外链 // 被拒', sec.safeUrl('//evil.com/a.png') === '');
ok('协议头带控制字符的绕过被拒', sec.safeUrl('java\nscript:alert(1)') === '');
ok('大小写混合的协议头绕过被拒', sec.safeUrl('HTTPX:foo') === '');
ok('根路径放行', sec.safeUrl('/assets/a.png') === '/assets/a.png');
ok('锚点放行', sec.safeUrl('#/x') === '#/x');
ok('mailto 放行', sec.safeUrl('mailto:a@b.c') === 'mailto:a@b.c');
ok('空值返回空串', sec.safeUrl('') === '' && sec.safeUrl(null) === '');

console.log('== 路由：parseHash ==');
function routeOf(hash) { return loadApp(hash).PortfolioSecurity.parseHash(); }
ok('#work/room-of-choice → detail', routeOf('#work/room-of-choice').view === 'detail');
ok('作品 id 正确取出', routeOf('#work/room-of-choice').id === 'room-of-choice');
ok('id 中的中文能解码', routeOf('#work/%E4%B8%AD%E6%96%87').id === '中文');
ok('畸形 % 转义不抛异常（回归：之前会 URIError 白屏）', routeOf('#work/%').view === 'notfound');
ok('#works → list + section', (function () { const r = routeOf('#works'); return r.view === 'list' && r.section === 'works'; })());
ok('#/ → 列表', routeOf('#/').view === 'list');
ok('空 hash → 列表', routeOf('').view === 'list');
ok('未知 hash → notfound', routeOf('#nope').view === 'notfound');

console.log('');
console.log('结果：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
