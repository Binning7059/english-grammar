(function () {
  var KEY = 'grammar-reader-v1';
  var st = { fs: 18, lh: 1.9, theme: 'auto', hl: true };
  try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); for (var k in o) st[k] = o[k]; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function apply() {
    var r = document.documentElement;
    r.style.setProperty('--fs', st.fs + 'px');
    r.style.setProperty('--lh', st.lh);
    if (st.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', st.theme);
    document.body.classList.toggle('hl', !!st.hl);
    var v = document.getElementById('rd-fsval'); if (v) v.textContent = st.fs + 'px';
    [].forEach.call(document.querySelectorAll('#rd-panel [data-theme]'), function (b) { b.classList.toggle('on', b.dataset.theme === st.theme); });
    [].forEach.call(document.querySelectorAll('#rd-panel [data-lh]'), function (b) { b.classList.toggle('on', parseFloat(b.dataset.lh) === st.lh); });
    var h = document.getElementById('rd-hl'); if (h) { h.classList.toggle('on', !!st.hl); h.textContent = st.hl ? '重点着色：开' : '重点着色：关'; }
  }

  function buildUI() {
    if (document.getElementById('rd-fab')) return;
    var bar = document.createElement('div'); bar.id = 'rd-progress'; document.body.appendChild(bar);
    var fab = document.createElement('button'); fab.id = 'rd-fab'; fab.title = '阅读设置'; fab.textContent = 'Aa'; document.body.appendChild(fab);
    var p = document.createElement('div'); p.id = 'rd-panel';
    p.innerHTML =
      '<div class="row"><div class="lab">字号</div><div class="btns">' +
      '<button data-act="fs-" aria-label="减小字号">A−</button><span class="val" id="rd-fsval"></span><button data-act="fs+" aria-label="增大字号">A+</button></div></div>' +
      '<div class="row"><div class="lab">行距</div><div class="btns">' +
      '<button data-lh="1.6">紧凑</button><button data-lh="1.9">标准</button><button data-lh="2.2">宽松</button></div></div>' +
      '<div class="row"><div class="lab">配色 / 对比度</div><div class="btns">' +
      '<button class="sw" data-theme="auto">跟随系统</button><button class="sw" data-theme="light">浅色</button>' +
      '<button class="sw" data-theme="sepia">护眼</button><button class="sw" data-theme="dark">深色</button>' +
      '<button class="sw" data-theme="hc">高对比·白底</button><button class="sw" data-theme="hcdark">高对比·黑底</button></div></div>' +
      '<div class="row"><div class="btns"><button id="rd-hl"></button><button data-act="reset">重置</button></div></div>';
    document.body.appendChild(p);
    fab.onclick = function () { p.classList.toggle('open'); };
    p.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act === 'fs+') st.fs = Math.min(32, st.fs + 1);
      else if (b.dataset.act === 'fs-') st.fs = Math.max(13, st.fs - 1);
      else if (b.dataset.act === 'reset') st = { fs: 18, lh: 1.9, theme: 'auto', hl: true };
      else if (b.dataset.lh) st.lh = parseFloat(b.dataset.lh);
      else if (b.dataset.theme) st.theme = b.dataset.theme;
      else if (b.id === 'rd-hl') st.hl = !st.hl;
      save(); apply();
    });
    document.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === '+' || e.key === '=') { st.fs = Math.min(32, st.fs + 1); save(); apply(); }
      if (e.key === '-') { st.fs = Math.max(13, st.fs - 1); save(); apply(); }
    });
    window.addEventListener('scroll', function () {
      var d = document.documentElement, h = d.scrollHeight - d.clientHeight;
      bar.style.width = (h > 0 ? (d.scrollTop / h * 100) : 0) + '%';
    }, { passive: true });
    apply();
  }

  /* 把 ✗ / ✓ 标成红/绿，紧随其后的英文斜体句子同色底纹 */
  function markExamples(root) {
    var nodes = root.querySelectorAll('p, li, td');
    [].forEach.call(nodes, function (n) {
      if (n.closest('pre')) return;
      if (n.innerHTML.indexOf('✗') < 0 && n.innerHTML.indexOf('✓') < 0 && n.innerHTML.indexOf('✔') < 0) return;
      n.innerHTML = n.innerHTML
        .replace(/✗/g, '<span class="bad">✗</span>')
        .replace(/(✓|✔)/g, '<span class="good">$1</span>');
      [].forEach.call(n.querySelectorAll('.bad, .good'), function (m) {
        var cls = m.classList.contains('bad') ? 'wrong-ex' : 'right-ex';
        var x = m.nextSibling;
        while (x && x.nodeType === 3 && !x.textContent.trim()) x = x.nextSibling;
        if (x && x.nodeType === 1 && x.tagName === 'EM') x.classList.add(cls);
      });
    });
  }

  window.$docsify = window.$docsify || {};
  var plugin = function (hook) {
    hook.mounted(buildUI);
    hook.doneEach(function () {
      var s = document.querySelector('.markdown-section'); if (s) markExamples(s);
      buildUI(); apply();
    });
  };
  window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins || []);
})();
