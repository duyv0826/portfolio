/* ============================================================
   洪兄作品集 · 前端逻辑（零依赖原生 JS）
   - 数据驱动：fetch projects.json / gallery.json
   - 安全层：escapeHTML / escapeAttr / safeUrl（防 XSS 与属性逃逸，C7）
   - 路由：hash 路由 #work/<id>（同页渲染，刷新可定位）
   - 渲染：列表 / 详情（优雅降级）/ 图库 / 灯箱
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 安全层（C7 硬约束） ---------------- */
  function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  // 属性值统一用双引号包裹，escapeHTML 已转义双引号，可直接安全插值
  function escapeAttr(value) { return escapeHTML(value); }

  // 仅放行 http(s) / 同源相对路径 / 锚点 / mailto；拒绝 javascript:/data: 等
  function safeUrl(value) {
    if (!value) return '';
    var u = String(value).trim();
    if (/^(https?:\/\/|\/|#|\.\/|\.\.\/)/i.test(u)) return u;
    if (/^mailto:/i.test(u)) return u;
    return '';
  }

  /* ---------------- 状态 ---------------- */
  var projects = [];
  var gallery = [];
  var listView, detailView, notFoundView, worksGrid, heroPreview, galleryGrid;

  /* ---------------- 图标辅助 ---------------- */
  function icon(name, size) {
    size = size || 'md';
    var cls = 'icon' + (size === 'sm' ? ' icon--sm' : size === 'lg' ? ' icon--lg' : '');
    return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<use href="#icon-' + name + '"/></svg>';
  }

  /* ---------------- 封面 / 占位（含 data-artist / data-source 接口，AC-04） ---------------- */
  function coverInner(p, wrapperClasses, imgClass) {
    var artist = escapeAttr(p && p.artist ? p.artist : '');
    var source = escapeAttr(p && p.source ? p.source : '');
    var imgTag = '';
    if (p && p.img) {
      var safe = safeUrl(p.img);
      if (safe) {
        imgTag = '<img class="' + imgClass + '" src="' + escapeAttr(safe) + '" alt="' +
          escapeAttr(p.title) + ' 封面" loading="lazy" onerror="this.style.display=\'none\'">';
      }
    }
    return '<span class="' + wrapperClasses + '" data-artist="' + artist + '" data-source="' + source + '">' + imgTag + '</span>';
  }

  /* ---------------- 渲染：Hero 预览（取 featured 前 3，AC-01 ≥3） ---------------- */
  function renderHeroPreview() {
    if (!heroPreview) return;
    var featured = projects.filter(function (p) { return p.featured; });
    var rest = projects.filter(function (p) { return !p.featured; });
    var picks = featured.concat(rest).slice(0, 3);
    if (!picks.length) { heroPreview.innerHTML = ''; return; }
    heroPreview.innerHTML = picks.map(function (p) {
      return '<li><a class="hero-thumb" href="#work/' + escapeAttr(p.id) + '" ' +
        'aria-label="查看作品 ' + escapeAttr(p.title) + '">' +
        coverInner(p, 'thumb-ph', 'thumb-img') +
        '<span class="thumb-cap">' + escapeHTML(p.title) + '</span></a></li>';
    }).join('');
  }

  /* ---------------- 渲染：精选作品网格 ---------------- */
  function renderWorks() {
    if (!worksGrid) return;
    if (!projects.length) {
      worksGrid.innerHTML = '<li class="state-msg">暂无精选作品，去 projects.json 添加吧。</li>';
      return;
    }
    worksGrid.innerHTML = projects.map(function (p) {
      var href = '#work/' + escapeAttr(p.id);
      var aria = '查看作品 ' + escapeAttr(p.title);
      var rel = p.relation ? '<p class="work-relation">' + escapeHTML(p.relation) + '</p>' : '';
      var year = p.year ? '<span class="meta-year">' + escapeHTML(p.year) + '</span>' : '';
      return '<li class="work-card"><a class="work-link" href="' + href + '" aria-label="' + aria + '">' +
        coverInner(p, 'work-cover thumb-ph', 'work-img') +
        '<span class="work-info">' +
        '<h3 class="work-title">' + icon('gamepad') + '<span>' + escapeHTML(p.title) + '</span></h3>' +
        (p.desc ? '<p class="work-desc">' + escapeHTML(p.desc) + '</p>' : '') +
        '<p class="work-meta">' +
        (p.tag ? '<span class="mono-tag">' + icon('tag', 'sm') + escapeHTML(p.tag) + '</span>' : '') +
        year +
        '</p></span>' + rel + '</a></li>';
    }).join('');
  }

  /* ---------------- 渲染：图库 ---------------- */
  function renderGallery() {
    if (!galleryGrid) return;
    if (!gallery.length) {
      galleryGrid.innerHTML = '<li class="state-msg">图库即将上线。</li>';
      return;
    }
    galleryGrid.innerHTML = gallery.map(function (g) {
      var url = escapeAttr(safeUrl(g.url || ''));
      var name = escapeHTML(g.name || '图片');
      var artist = escapeAttr(g.artist || '');
      var source = escapeAttr(g.source || '');
      var imgTag = url
        ? '<img class="gallery-img" src="' + url + '" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\'">'
        : '';
      var credit = (g.artist || g.source)
        ? '<span class="cap-credit">作品：' + (g.artist || '自绘') + (g.source ? ' · 来源：' + escapeHTML(g.source) : '') + '</span>'
        : '';
      return '<li class="gallery-item">' +
        '<button class="gallery-trigger" type="button" aria-label="放大查看 ' + name + '" ' +
        'data-full="' + url + '" data-artist="' + artist + '" data-source="' + source + '">' +
        '<span class="gallery-ph thumb-ph" data-artist="' + artist + '" data-source="' + source + '">' + imgTag + '</span>' +
        '</button>' +
        '<p class="gallery-cap"><span class="cap-name">' + name + '</span>' + credit + '</p></li>';
    }).join('');
  }

  /* ---------------- 渲染：剧情树（递归，AC-04 缺字段优雅降级） ---------------- */
  function renderStoryTree(nodes) {
    if (!nodes || !nodes.length) return '';
    return '<ul class="story-tree" role="list">' + nodes.map(function (n) {
      var kids = n.children && n.children.length ? renderStoryTree(n.children) : '';
      return '<li class="story-node"><span class="story-label">' + escapeHTML(n.label) + '</span>' + kids + '</li>';
    }).join('') + '</ul>';
  }

  /* ---------------- 渲染：作品详情（hash 路由视图） ---------------- */
  function renderDetail(id) {
    var p = null;
    for (var i = 0; i < projects.length; i++) { if (projects[i].id === id) { p = projects[i]; break; } }
    if (!p) { renderNotFound(); return; }

    var d = p.detail || {};

    // 概述
    var overviewHtml = '';
    if (d.overview) {
      if (typeof d.overview === 'string') {
        overviewHtml = '<p>' + escapeHTML(d.overview) + '</p>';
      } else if (Array.isArray(d.overview)) {
        overviewHtml = d.overview.map(function (t) { return '<p>' + escapeHTML(t) + '</p>'; }).join('');
      }
    }

    // 剧情树
    var storyHtml = (d.storyTree && d.storyTree.length)
      ? '<section class="detail-story"><h2 class="block-title">剧情树</h2>' + renderStoryTree(d.storyTree) + '</section>'
      : '';

    // 开发笔记
    var notesHtml = (d.devNotes && d.devNotes.length)
      ? '<section class="detail-notes"><h2 class="block-title">开发笔记</h2><ul class="notes-list">' +
        d.devNotes.map(function (n) { return '<li>' + escapeHTML(n) + '</li>'; }).join('') + '</ul></section>'
      : '';

    // 媒体
    var mediaHtml = '';
    if (d.media && d.media.length) {
      mediaHtml = '<section class="detail-media-block"><h2 class="block-title">媒体</h2><div class="media-grid">' +
        d.media.map(function (m) {
          var u = escapeAttr(safeUrl(m.url || ''));
          var cap = escapeHTML(m.caption || '');
          var inner = u
            ? '<img class="media-img" src="' + u + '" alt="' + cap + '" loading="lazy" onerror="this.style.display=\'none\'">'
            : '<span class="thumb-ph media-ph"></span>';
          return '<figure class="media-item">' + inner + (cap ? '<figcaption class="cap-credit">' + cap + '</figcaption>' : '') + '</figure>';
        }).join('') + '</div></section>';
    }

    // 外链
    var linksHtml = '';
    if (d.links && d.links.length) {
      linksHtml = d.links.map(function (l) {
        var u = escapeAttr(safeUrl(l.url || ''));
        if (!u) return '';
        var ic = l.kind === 'play' ? 'play' : l.kind === 'doc' ? 'external' : 'link';
        return '<li><a class="detail-link" href="' + u + '" target="_blank" rel="noopener noreferrer">' +
          icon(ic) + escapeHTML(l.label) + '</a></li>';
      }).join('');
    }
    if (!linksHtml && p.link) {
      var lu = safeUrl(p.link);
      if (lu) linksHtml = '<li><a class="detail-link" href="' + escapeAttr(lu) +
        '" target="_blank" rel="noopener noreferrer">' + icon('external') + '访问作品</a></li>';
    }

    // 关系 / 标签
    var relation = p.relation ? '<p class="detail-relation">' + escapeHTML(p.relation) + '</p>' : '';
    var tag = p.tag ? '<p class="detail-tag mono-tag">' + icon('tag', 'sm') + escapeHTML(p.tag) + '</p>' : '';

    // 上一件 / 下一件
    var idx = projects.indexOf(p);
    var prev = projects[idx - 1];
    var next = projects[idx + 1];
    var nav = '<nav class="detail-nav" aria-label="作品间导航">';
    nav += prev
      ? '<a class="detail-prev" href="#work/' + escapeAttr(prev.id) + '">' + icon('arrow-left', 'sm') + '<span>上一件</span></a>'
      : '<span></span>';
    nav += next
      ? '<a class="detail-next" href="#work/' + escapeAttr(next.id) + '"><span>下一件</span>' + icon('arrow-right', 'sm') + '</a>'
      : '<span></span>';
    nav += '</nav>';

    // 主图
    var artist = escapeAttr(p.artist || '');
    var source = escapeAttr(p.source || '');
    var heroImg = '';
    if (p.img) {
      var s = safeUrl(p.img);
      if (s) heroImg = '<img class="detail-img" src="' + escapeAttr(s) + '" alt="' +
        escapeAttr(p.title) + ' 主图" loading="lazy" onerror="this.style.display=\'none\'">';
    }

    // 元信息
    var meta = '<dl class="meta-list">';
    if (p.role) meta += '<div class="meta-row"><dt>角色贡献</dt><dd>' + escapeHTML(p.role) + '</dd></div>';
    if (p.year) meta += '<div class="meta-row"><dt>年份</dt><dd>' + escapeHTML(p.year) + '</dd></div>';
    if (p.medium) meta += '<div class="meta-row"><dt>媒介</dt><dd>' + escapeHTML(p.medium) + '</dd></div>';
    meta += '</dl>';

    detailView.innerHTML =
      '<article class="detail container" aria-labelledby="detail-title">' +
      '<nav class="detail-crumbs" aria-label="返回"><a class="crumb" href="#/">' +
      '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-arrow-left"/></svg>返回作品</a></nav>' +
      '<header class="detail-head">' + tag + '<h1 class="detail-title" id="detail-title">' + escapeHTML(p.title) + '</h1>' + relation + '</header>' +
      '<div class="detail-media"><span class="detail-hero thumb-ph" data-artist="' + artist + '" data-source="' + source + '">' + heroImg + '</span></div>' +
      '<div class="detail-body">' +
      '<div class="detail-overview"><h2 class="block-title">概述</h2>' + overviewHtml + '</div>' +
      '<aside class="detail-meta">' + meta +
      (linksHtml ? '<ul class="detail-links" role="list">' + linksHtml + '</ul>' : '') +
      '</aside></div>' +
      storyHtml + notesHtml + mediaHtml + nav +
      '</article>';

    listView.hidden = true;
    notFoundView.hidden = true;
    detailView.hidden = false;
    window.scrollTo(0, 0);
  }

  /* ---------------- 渲染：404 / 未知 hash ---------------- */
  function renderNotFound() {
    detailView.hidden = true;
    listView.hidden = true;
    notFoundView.hidden = false;
  }

  /* ---------------- 路由解析 ---------------- */
  function parseHash() {
    var h = location.hash || '';
    var m = h.match(/^#work\/(.+)$/);
    if (m) return { view: 'detail', id: decodeURIComponent(m[1]) };
    if (h === '' || h === '#' || h === '#/') return { view: 'list', section: '' };
    var known = ['#about', '#works', '#gallery', '#contact'];
    if (known.indexOf(h) >= 0) return { view: 'list', section: h.slice(1) };
    return { view: 'notfound' };
  }

  function router() {
    var r = parseHash();
    if (r.view === 'detail') { renderDetail(r.id); return; }
    if (r.view === 'notfound') { renderNotFound(); return; }
    // 列表视图
    detailView.hidden = true;
    notFoundView.hidden = true;
    listView.hidden = false;
    if (r.section) {
      var el = document.getElementById(r.section);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
    // 当前导航高亮
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      if (r.section && links[i].getAttribute('href') === '#' + r.section) {
        links[i].setAttribute('aria-current', 'page');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
  }

  /* ---------------- 数据加载（每 fetch 独立 catch + 空态，C7 #2） ---------------- */
  function loadProjects() {
    fetch('projects.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (list) {
        projects = Array.isArray(list) ? list : [];
        renderHeroPreview();
        renderWorks();
      })
      .catch(function (err) {
        if (worksGrid) worksGrid.innerHTML = '<li class="state-msg">作品加载失败，请稍后重试。(' + escapeHTML(err.message) + ')</li>';
        if (heroPreview) heroPreview.innerHTML = '';
      });
  }
  function loadGallery() {
    fetch('gallery.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (list) { gallery = Array.isArray(list) ? list : []; renderGallery(); })
      .catch(function () {
        if (galleryGrid) galleryGrid.innerHTML = '<li class="state-msg">图库加载失败，请稍后重试。</li>';
      });
  }

  /* ---------------- 交互：移动导航 / 灯箱 / 返回顶部 / Header 滚动 ---------------- */
  function openLightbox(full, artist, source) {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var img = lb.querySelector('.lightbox-img');
    var cap = lb.querySelector('.lightbox-cap');
    if (full) {
      img.style.display = '';
      img.src = full;
      img.alt = '作品大图';
    } else {
      img.style.display = 'none';
      img.removeAttribute('src');
    }
    cap.textContent = (artist ? '作品：' + artist : '') + (source ? ' · 来源：' + source : '') ||
      (full ? '' : '图片暂未提供');
    lb.removeAttribute('hidden');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
  }
  function closeLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    setTimeout(function () { lb.setAttribute('hidden', ''); }, 200);
  }

  function initInteractions() {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.getElementById('mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        if (mobileNav.hasAttribute('hidden')) {
          mobileNav.removeAttribute('hidden');
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          mobileNav.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      mobileNav.addEventListener('click', function (e) {
        if (e.target.closest('.mobile-link')) {
          mobileNav.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { mobileNav.setAttribute('hidden', ''); toggle.setAttribute('aria-expanded', 'false'); }
      });
    }

    if (galleryGrid) {
      galleryGrid.addEventListener('click', function (e) {
        var btn = e.target.closest('.gallery-trigger');
        if (!btn) return;
        openLightbox(btn.getAttribute('data-full'), btn.getAttribute('data-artist'), btn.getAttribute('data-source'));
      });
    }

    var lb = document.getElementById('lightbox');
    if (lb) {
      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.closest('.lightbox-close')) closeLightbox();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
    }

    var toTop = document.querySelector('.to-top');
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    var header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 8) header.setAttribute('data-scrolled', 'true');
        else header.setAttribute('data-scrolled', 'false');
      }, { passive: true });
    }
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    listView = document.getElementById('list-view');
    detailView = document.getElementById('detail-view');
    notFoundView = document.getElementById('notfound-view');
    worksGrid = document.getElementById('works-grid');
    heroPreview = document.getElementById('hero-preview');
    galleryGrid = document.getElementById('gallery-grid');
    initInteractions();
    loadProjects();
    loadGallery();
    window.addEventListener('hashchange', router);
    router();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 暴露纯函数供自动化测试（XSS / 路由断言），不影响生产逻辑
  if (typeof window !== 'undefined') {
    window.PortfolioSecurity = {
      escapeHTML: escapeHTML,
      escapeAttr: escapeAttr,
      safeUrl: safeUrl,
      parseHash: parseHash
    };
  }
})();
