/* Portofolio Zianarah Zihan — interaksi & animasi
   Semua selector memakai prefix "zianarah_" */
(function () {
    'use strict';

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header, progress, parallax ---------- */
    var header = $('#zianarah_header');
    var bar = $('#zianarah_progress');
    var parallax = $$('[data-speed]');
    var ticking = false;

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('zianarah_scrolled', y > 30);
        bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
        if (!reduce && y < window.innerHeight * 1.2) {
            parallax.forEach(function (el) {
                var s = parseFloat(el.getAttribute('data-speed')) || 0;
                el.style.translate = '0 ' + (y * s).toFixed(1) + 'px';
            });
        }
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- Link email ----------
       HP: mailto membuka aplikasi email/Gmail langsung.
       Laptop/PC: membuka jendela tulis email Gmail (tanpa perlu aplikasi email). */
    var desktopMail = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (desktopMail) {
        $$('.zianarah_mail').forEach(function (a) {
            a.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=zihanzianara@gmail.com&su=' +
                     encodeURIComponent('Halo Zianarah, saya ingin berdiskusi');
            a.target = '_blank';
            a.rel = 'noopener';
        });
    }

    /* ---------- Mobile menu ---------- */
    var toggle = $('#zianarah_menu_toggle');
    var menu = $('#zianarah_menu');
    function setMenu(open) {
        toggle.classList.toggle('zianarah_open', open);
        menu.classList.toggle('zianarah_open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    }
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('zianarah_open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

    /* ---------- Active nav link ---------- */
    var links = $$('.zianarah_menu_link');
    var sections = links.map(function (l) { return $(l.getAttribute('href')); }).filter(Boolean);
    if ('IntersectionObserver' in window) {
        var navObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    links.forEach(function (l) {
                        l.classList.toggle('zianarah_active', l.getAttribute('href') === '#' + e.target.id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (s) { navObs.observe(s); });
    }

    /* ---------- Scroll reveal + count up ---------- */
    function countUp(el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        if (reduce) { el.textContent = target; return; }
        var start = null, dur = 1200;
        function step(t) {
            if (!start) start = t;
            var p = Math.min((t - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    var revealEls = $$('.zianarah_reveal');
    if ('IntersectionObserver' in window && !reduce) {
        var revObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('zianarah_in');
                    $$('.zianarah_count', e.target).forEach(countUp);
                    if (e.target.classList.contains('zianarah_count')) countUp(e.target);
                    revObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
        revealEls.forEach(function (el) { revObs.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('zianarah_in'); });
        $$('.zianarah_count').forEach(countUp);
    }

    /* ---------- Gallery slider ---------- */
    var slides = $$('.zianarah_slide');
    var total = slides.length;
    var dotsBox = $('#zianarah_dots');
    var capEl = $('#zianarah_slide_caption');
    var cntEl = $('#zianarah_slide_count');
    var prevBtn = $('#zianarah_prev');
    var nextBtn = $('#zianarah_next');
    var current = 0;
    var dots = [];

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Foto ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); });
        dotsBox.appendChild(b);
        dots.push(b);
    });

    function goTo(i) {
        if (i < 0 || i > total - 1) return;
        current = i;
        slides.forEach(function (s, k) {
            s.classList.toggle('zianarah_is_active', k === i);
            s.classList.toggle('zianarah_before', k < i);
            s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
            var img = $('img', s);
            if (k === i && img.loading === 'lazy') img.loading = 'eager';
        });
        dots.forEach(function (d, k) {
            d.classList.toggle('zianarah_on', k === i);
            d.setAttribute('aria-selected', k === i ? 'true' : 'false');
        });
        capEl.textContent = slides[i].getAttribute('data-caption');
        cntEl.textContent = pad(i + 1) + ' / ' + pad(total);
        prevBtn.disabled = i === 0;
        nextBtn.disabled = i === total - 1;
    }
    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });
    goTo(0);

    /* swipe (geser) — klik biasa membuka lightbox */
    var view = $('#zianarah_slider_view');
    var openBtn = $('#zianarah_slide_open');
    var startX = null, moved = 0;
    view.addEventListener('pointerdown', function (e) { startX = e.clientX; moved = 0; });
    view.addEventListener('pointermove', function (e) { if (startX !== null) moved = e.clientX - startX; });
    function endSwipe() {
        if (startX === null) return;
        if (Math.abs(moved) > 50) goTo(current + (moved < 0 ? 1 : -1));
        startX = null;
    }
    view.addEventListener('pointerup', endSwipe);
    view.addEventListener('pointercancel', function () { startX = null; });
    openBtn.addEventListener('click', function () { if (Math.abs(moved) < 8) openLightbox(current); moved = 0; });

    /* ---------- Lightbox (ukuran asli / portrait) ---------- */
    var lb = $('#zianarah_lightbox');
    var lbImg = $('#zianarah_lb_img');
    var lbCap = $('#zianarah_lb_caption');
    var lbPrev = $('#zianarah_lb_prev');
    var lbNext = $('#zianarah_lb_next');
    var lbClose = $('#zianarah_lb_close');
    var lbIndex = 0;
    var lastFocus = null;

    function showLb(i) {
        lbIndex = i;
        var s = slides[i];
        var img = $('img', s);
        lbImg.src = img.getAttribute('src');
        lbImg.alt = img.getAttribute('alt');
        lbCap.textContent = s.getAttribute('data-caption') + '  •  ' + pad(i + 1) + ' / ' + pad(total);
        lbPrev.disabled = i === 0;
        lbNext.disabled = i === total - 1;
    }
    function openLightbox(i) {
        lastFocus = document.activeElement;
        showLb(i);
        lb.hidden = false;
        document.documentElement.classList.add('zianarah_lock');
        requestAnimationFrame(function () { lb.classList.add('zianarah_show'); });
        lbClose.focus();
    }
    function closeLightbox() {
        lb.classList.remove('zianarah_show');
        document.documentElement.classList.remove('zianarah_lock');
        setTimeout(function () { lb.hidden = true; }, 350);
        goTo(lbIndex);
        if (lastFocus) lastFocus.focus();
    }
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    lbPrev.addEventListener('click', function () { showLb(lbIndex - 1); });
    lbNext.addEventListener('click', function () { showLb(lbIndex + 1); });

    document.addEventListener('keydown', function (e) {
        if (!lb.hidden) {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft' && lbIndex > 0) showLb(lbIndex - 1);
            else if (e.key === 'ArrowRight' && lbIndex < total - 1) showLb(lbIndex + 1);
        }
    });

    var lbStart = null;
    lb.addEventListener('pointerdown', function (e) { lbStart = e.clientX; });
    lb.addEventListener('pointerup', function (e) {
        if (lbStart === null) return;
        var d = e.clientX - lbStart; lbStart = null;
        if (Math.abs(d) > 60) {
            if (d < 0 && lbIndex < total - 1) showLb(lbIndex + 1);
            else if (d > 0 && lbIndex > 0) showLb(lbIndex - 1);
        }
    });
})();
