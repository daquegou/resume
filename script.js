// 移动端菜单 + 滚动交互 + 导航高亮 + 炫酷效果
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // 1. 移动端导航菜单开关
  var toggle = document.querySelector(".menu-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 2. 滚动进度条 + Hero 翻页（rAF 节流）
  var bar = document.querySelector(".scroll-progress");
  var heroEl = document.querySelector(".hero");
  if (!reduced && (bar || heroEl)) {
    var ticking = false;
    function onScroll() {
      var sc = window.pageYOffset || document.documentElement.scrollTop || 0;
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;

      if (bar) {
        bar.style.transform = "scaleX(" + (max > 0 ? sc / max : 0) + ")";
      }
      if (heroEl) {
        var vh = window.innerHeight || h.clientHeight;
        var t = Math.min(Math.max(sc / vh, 0), 1);
        heroEl.style.transform =
          "perspective(1200px) rotateX(" + -t * 85 + "deg)";
        heroEl.style.opacity = String(1 - t * 0.85);
      }
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
    onScroll();
  }

  // 3. 章节翻页入场（rotateX 翻转）
  if (hasIO && !reduced) {
    var sections = document.querySelectorAll(".section");
    sections.forEach(function (el) {
      el.classList.add("reveal");
    });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    sections.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // 4. 章节标题下划线绘制
  if (hasIO) {
    var titleSections = document.querySelectorAll(".section");
    var titleObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("title-drawn");
            titleObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    titleSections.forEach(function (s) {
      titleObserver.observe(s);
    });
  }

  // 5. 导航高亮
  if (hasIO) {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href^="#"]')
    );
    var targets = navLinks
      .map(function (a) {
        return document.querySelector(a.getAttribute("href"));
      })
      .filter(Boolean);
    if (targets.length) {
      var sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.getAttribute("id");
              navLinks.forEach(function (a) {
                a.classList.toggle(
                  "active",
                  a.getAttribute("href") === "#" + id
                );
              });
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      targets.forEach(function (s) {
        sectionObserver.observe(s);
      });
    }
  }

  if (reduced) return;

  // 6. 磁吸按钮
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      btn.style.translate = x * 0.2 + "px " + y * 0.3 + "px";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.translate = "";
    });
  });

  // 7. 头像 3D 倾斜
  var avatar = document.querySelector(".avatar");
  if (avatar) {
    avatar.addEventListener("mousemove", function (e) {
      var r = avatar.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      avatar.style.transform =
        "perspective(600px) rotateX(" +
        -y * 14 +
        "deg) rotateY(" +
        x * 14 +
        "deg)";
    });
    avatar.addEventListener("mouseleave", function () {
      avatar.style.transform = "";
    });
  }

  // 8. Hero 鼠标光晕
  var hero = document.querySelector(".hero");
  var glow = document.querySelector(".hero-glow");
  if (hero && glow) {
    var hr = hero.getBoundingClientRect();
    glow.style.translate = hr.width / 2 + "px " + hr.height / 2 + "px";
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.translate =
        e.clientX - r.left + "px " + (e.clientY - r.top) + "px";
    });
  }

  // 9. 技能卡光标高亮
  document.querySelectorAll(".skill").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  // 10. 数字滚动（仅较大的数字）
  if (hasIO) {
    document.querySelectorAll(".fact-num").forEach(function (el) {
      var m = el.textContent.match(/^(\d+)(.*)$/);
      if (!m) return;
      var target = parseInt(m[1], 10);
      var suffix = m[2];
      if (target < 10) return;
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var start = null;
            var dur = 1200;
            function step(ts) {
              if (!start) start = ts;
              var p = Math.min((ts - start) / dur, 1);
              var eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      io.observe(el);
    });
  }
})();
