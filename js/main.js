/* ============================================================
   THE COPPER BEAN — shared interactions
   Lightweight, GPU-friendly. No external libraries.
   ============================================================ */
(function () {
  "use strict";

  /* ----- 1. INTRO LOADER (once per session) ----- */
  var loader = document.getElementById("loader");
  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem("cb_intro") === "1"; } catch (e) {}
    if (seen) {
      loader.remove();
    } else {
      // keep it short so cheap devices aren't blocked
      window.addEventListener("load", function () {
        setTimeout(function () {
          loader.classList.add("hide");
          try { sessionStorage.setItem("cb_intro", "1"); } catch (e) {}
          setTimeout(function () { loader.remove(); }, 850);
        }, 1400);
      });
      // safety: never trap the user if load stalls
      setTimeout(function () { if (loader) { loader.classList.add("hide"); } }, 3500);
    }
  }

  /* ----- 2. HEADER scroll state ----- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----- 3. MOBILE NAV ----- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ----- 4. SCROLL REVEAL ----- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ----- 5. MENU TABS (category + sub-category) ----- */
  function bindTabs(tabSel, panelAttr) {
    var tabs = document.querySelectorAll(tabSel);
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var group = tab.getAttribute("data-group") || "main";
        var target = tab.getAttribute(panelAttr);
        // deactivate siblings in same group
        document.querySelectorAll(tabSel + '[data-group="' + group + '"]').forEach(function (t) {
          t.classList.remove("active");
        });
        if (!tab.getAttribute("data-group")) {
          tabs.forEach(function (t) { t.classList.remove("active"); });
        }
        tab.classList.add("active");
        var panels = document.querySelectorAll("[" + panelAttr.replace("data-target", "data-panel") + "]");
      });
    });
  }

  // Primary menu categories
  var catTabs = document.querySelectorAll(".menu-tab");
  var catPanels = document.querySelectorAll(".menu-panel");
  catTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-target");
      catTabs.forEach(function (t) { t.classList.remove("active"); });
      catPanels.forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      var panel = document.getElementById(id);
      if (panel) {
        panel.classList.add("active");
        // reset sub-tabs within this panel to first
        var subs = panel.querySelectorAll(".sub-tab");
        var groups = panel.querySelectorAll(".menu-group");
        if (subs.length) {
          subs.forEach(function (s, i) { s.classList.toggle("active", i === 0); });
          groups.forEach(function (g, i) { g.classList.toggle("active", i === 0); });
        }
      }
      // smooth scroll to keep menu in view on mobile
      var anchor = document.getElementById("menu-top");
      if (anchor && window.innerWidth < 820) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Sub-category tabs (drinks: beer/gin... | food: seafood/meat...)
  document.querySelectorAll(".sub-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var panel = tab.closest(".menu-panel");
      if (!panel) return;
      var id = tab.getAttribute("data-group-target");
      panel.querySelectorAll(".sub-tab").forEach(function (t) { t.classList.remove("active"); });
      panel.querySelectorAll(".menu-group").forEach(function (g) { g.classList.remove("active"); });
      tab.classList.add("active");
      var group = panel.querySelector('[data-group-id="' + id + '"]');
      if (group) group.classList.add("active");
    });
  });

  /* ----- 6. GALLERY LIGHTBOX ----- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll("[data-lightbox]").forEach(function (fig) {
      fig.addEventListener("click", function () {
        var src = fig.getAttribute("data-full") || fig.querySelector("img").src;
        lbImg.src = src;
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lightbox-close")) closeLb();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ----- 7. CONTACT / NEWSLETTER forms (demo only) ----- */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit], .btn");
      var msg = form.querySelector(".form-note");
      if (btn) { btn.textContent = "Thank you — we'll be in touch ✦"; btn.disabled = true; }
      if (msg) { msg.textContent = "This is a demo form. No message was actually sent."; }
      form.reset();
      setTimeout(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Send message"; }
      }, 3200);
    });
  });

  /* ----- 8. Footer year ----- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
