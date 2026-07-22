/* ============================================
   暮光大陆 - 交互逻辑
   ============================================ */

(function () {
  'use strict';

  /* ============ 1. 滚动渐入动画 ============ */
  function initScrollReveal() {
    var elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ============ 2. 导航栏滚动压缩 ============ */
  function initHeaderScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    var onScroll = function () {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============ 3. 移动端汉堡菜单 ============ */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileNav = document.getElementById('mobileNav');
    var mobileBackdrop = document.getElementById('mobileBackdrop');
    if (!hamburger || !mobileNav || !mobileBackdrop) return;

    var isOpen = false;

    function toggleMenu(open) {
      isOpen = open !== undefined ? open : !isOpen;
      hamburger.classList.toggle('active', isOpen);
      mobileNav.classList.toggle('open', isOpen);
      mobileBackdrop.classList.toggle('open', isOpen);
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      mobileBackdrop.setAttribute('aria-hidden', String(!isOpen));
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', function () { toggleMenu(); });
    mobileBackdrop.addEventListener('click', function () { toggleMenu(false); });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { toggleMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) toggleMenu(false);
    });
  }

  /* ============ 4. 年份计数器 3D 翻转动画 ============ */
  function initYearCounter() {
    var counter = document.getElementById('yearCounter');
    var display = document.getElementById('yearDisplay');
    if (!counter || !display) return;

    var startYear = 2022;
    var currentYear = new Date().getFullYear();
    var hasAnimated = false;

    function animateYear() {
      if (hasAnimated) return;
      hasAnimated = true;

      var year = startYear;
      display.textContent = String(year);

      function nextYear() {
        year++;
        if (year > currentYear) return;

        // 离场动画
        display.classList.add('is-leaving');
        setTimeout(function () {
          display.classList.remove('is-leaving');
          display.textContent = String(year);
          display.classList.add('is-flipping');
          setTimeout(function () {
            display.classList.remove('is-flipping');
          }, 150);
        }, 150);

        setTimeout(nextYear, 195);
      }

      setTimeout(nextYear, 400);
    }

    if (!('IntersectionObserver' in window)) {
      animateYear();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateYear();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    observer.observe(counter);
  }

  /* ============ 5. 图片灯箱 ============ */
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    var placeholder = document.getElementById('lightboxPlaceholder');
    var counter = document.getElementById('lightboxCounter');
    var nameEl = document.getElementById('lightboxName');

    // 收集所有可点击的图片
    var triggers = document.querySelectorAll('[data-scene]');
    var currentImages = [];
    var currentIndex = 0;

    function getImagesFromContainer(container) {
      // 从同一区块收集所有图片名称
      var section = container.closest('section');
      if (!section) return [{ name: container.getAttribute('data-scene') }];

      var imgs = section.querySelectorAll('[data-scene]');
      return Array.from(imgs).map(function (el) {
        return el.getAttribute('data-scene');
      });
    }

    function updateLightbox() {
      var img = currentImages[currentIndex];
      if (!img) return;

      // 更新占位图
      var placeholders = ['placeholder-1', 'placeholder-2', 'placeholder-3', 'placeholder-4', 'placeholder-5', 'placeholder-6'];
      placeholder.className = 'lightbox-placeholder ' + placeholders[currentIndex % placeholders.length];
      placeholder.textContent = img;

      // 更新计数和名称
      counter.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(currentImages.length).padStart(2, '0');
      nameEl.textContent = img;
    }

    function openLightbox(images, startIndex) {
      currentImages = images;
      currentIndex = startIndex;
      updateLightbox();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function navigate(direction) {
      currentIndex += direction;
      if (currentIndex < 0) currentIndex = currentImages.length - 1;
      if (currentIndex >= currentImages.length) currentIndex = 0;
      updateLightbox();
    }

    // 绑定点击事件
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var images = getImagesFromContainer(trigger);
        var sceneName = trigger.getAttribute('data-scene');
        var startIndex = images.indexOf(sceneName);
        if (startIndex < 0) startIndex = 0;
        openLightbox(images, startIndex);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', function () { navigate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { navigate(1); });

    // 点击背景关闭
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // 键盘导航
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  /* ============ 6. 加入确认弹窗 ============ */
  function initJoinDialog() {
    var joinBtn = document.getElementById('joinBtn');
    var overlay = document.getElementById('joinDialogOverlay');
    var dialog = document.getElementById('joinDialog');
    var cancelBtn = document.getElementById('dialogCancel');
    var closeBtn = document.getElementById('dialogClose');
    var confirmLink = document.getElementById('dialogConfirm');
    if (!joinBtn || !overlay) return;

    function openDialog() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeDialog() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    joinBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openDialog();
    });

    if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
    if (closeBtn) closeBtn.addEventListener('click', closeDialog);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDialog();
    });

    if (confirmLink) {
      confirmLink.addEventListener('click', function () {
        setTimeout(closeDialog, 100);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeDialog();
    });
  }

  /* ============ 7. 服务器亮点 Mock 数据 ============ */
  var features = [
    { name: '零门槛自定义称号', desc: '自由设置内容与颜色', color: '#22c55e' },
    { name: 'AMD RYZEN 9950X', desc: '旗舰性能核心加持', color: '#3c87f7' },
    { name: '联合封禁 UniteBan', desc: '不良记录玩家拦截', color: '#f59e0b' },
    { name: 'Xbox 成就系统', desc: '原版成就全开启', color: '#ec4899' },
    { name: '即时背包回档', desc: '完美避免吞物品', color: '#8b5cf6' },
    { name: '即时区域回档', desc: '建筑回档保护', color: '#06b6d4' },
    { name: '经验飞行', desc: '像创造一样飞', color: '#10b981' },
    { name: '自动钓鱼', desc: '解放双手挂机', color: '#f97316' },
    { name: '移动光源', desc: '动态光照效果', color: '#6366f1' },
    { name: '假人系统', desc: '挂刷铁机等机器', color: '#ef4444' },
    { name: '节日福利活动', desc: '节假日丰富道具', color: '#14b8a6' },
    { name: '每月免费送游戏', desc: '活跃玩家专属', color: '#a855f7' },
    { name: '原创侧边栏 3.0', desc: '简洁不遮挡视野', color: '#f43f5e' },
    { name: '新手教程系统', desc: '快速上手服务器', color: '#0ea5e9' },
    { name: '玩家合影传统', desc: '第七次合影已至', color: '#84cc16' },
    { name: '3000+ 玩家社区', desc: '活跃友善的大家庭', color: '#eab308' },
  ];

  function getAvatarText(name) {
    return name.charAt(0);
  }

  function initSupportMarquee() {
    var track = document.getElementById('supportTrack');
    if (!track) return;

    // 生成两轮卡片以实现无缝循环
    var html = '';
    for (var round = 0; round < 2; round++) {
      features.forEach(function (f, i) {
        html += '<div class="support-card">' +
          '<span class="support-rank">No.' + (i + 1) + '</span>' +
          '<div class="support-avatar" style="background:' + f.color + '">' + getAvatarText(f.name) + '</div>' +
          '<span class="support-name">' + f.name + '</span>' +
          '<span class="support-amount">' + f.desc + '</span>' +
          '</div>';
      });
    }
    track.innerHTML = html;
  }

  function initSupportModal() {
    var viewAllBtn = document.getElementById('viewAllBtn');
    var overlay = document.getElementById('supportModalOverlay');
    var closeBtn = document.getElementById('supportModalClose');
    var list = document.getElementById('supportModalList');
    if (!viewAllBtn || !overlay || !list) return;

    // 生成完整列表
    var html = '';
    features.forEach(function (f, i) {
      html += '<div class="support-modal-item">' +
        '<span class="support-modal-rank">' + (i + 1) + '</span>' +
        '<div class="support-modal-avatar" style="background:' + f.color + '">' + getAvatarText(f.name) + '</div>' +
        '<span class="support-modal-name">' + f.name + '</span>' +
        '<span class="support-modal-amount">' + f.desc + '</span>' +
        '</div>';
    });
    list.innerHTML = html;

    function openModal() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    viewAllBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }

  /* ============ 8. 胶片轮播拖拽 ============ */
  function initFilmDrag() {
    var marquee = document.getElementById('filmMarquee');
    if (!marquee) return;

    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;
    var track = marquee.querySelector('.film-track');

    if (!track) return;

    marquee.addEventListener('mousedown', function (e) {
      isDown = true;
      marquee.style.cursor = 'grabbing';
      startX = e.pageX;
      scrollLeft = parseFloat(getComputedStyle(track).animationDuration) || 0;
      track.style.animationPlayState = 'paused';
    });

    marquee.addEventListener('mouseleave', function () {
      if (isDown) {
        isDown = false;
        marquee.style.cursor = '';
        track.style.animationPlayState = '';
      }
    });

    marquee.addEventListener('mouseup', function () {
      isDown = false;
      marquee.style.cursor = '';
      track.style.animationPlayState = '';
    });

    marquee.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX;
      var walk = (x - startX) * 1.5;
      track.style.transform = 'translateX(' + (-walk) + 'px)';
    });
  }

  /* ============ 9. 占位图文字注入 ============ */
  function initPlaceholderLabels() {
    // 为 Bento 卡片图片添加场景名
    var bentoImgs = document.querySelectorAll('.bento-img');
    var bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(function (card, i) {
      var img = card.querySelector('.bento-img');
      var name = card.getAttribute('data-scene');
      if (img && name) {
        img.setAttribute('data-name', name);
      }
    });

    // 为胶片图片添加编号
    var filmImgs = document.querySelectorAll('.film-img');
    var sceneNames = ['主城全景', '玩家基地', '刷铁机农场', '守卫者农场', '圣诞合影', '怪物乐队'];
    filmImgs.forEach(function (img, i) {
      img.setAttribute('data-name', sceneNames[i % sceneNames.length]);
    });

    // 为生活区域图片添加名称
    var lifeImgs = document.querySelectorAll('.life-img-wrap');
    lifeImgs.forEach(function (wrap) {
      var name = wrap.getAttribute('data-scene');
      var img = wrap.querySelector('.life-img');
      if (img && name) {
        img.setAttribute('data-name', name);
      }
    });
  }

  /* ============ 10. 平滑滚动 ============ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href === '#' || href === '') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============ 初始化 ============ */
  function init() {
    initScrollReveal();
    initHeaderScroll();
    initMobileMenu();
    initYearCounter();
    initLightbox();
    initJoinDialog();
    initSupportMarquee();
    initSupportModal();
    initFilmDrag();
    initPlaceholderLabels();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
