/**
 * JanakUROCare — mobile drawer, desktop submenu (production)
 */
(function () {
  "use strict";

  function init() {
    function normalizeText(value) {
      return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
    }

    function getBadgeIconFromText(badgeText) {
      const iconRules = [
        { icon: "male", keywords: ["for men", "services for men", "men"] },
        { icon: "female", keywords: ["for women", "services for women", "women"] },
        { icon: "rate_review", keywords: ["testimonial"] },
        { icon: "help", keywords: ["faq", "frequently asked"] },
        { icon: "phone_in_talk", keywords: ["contact", "appointment", "consultation"] },
        { icon: "policy", keywords: ["privacy", "policy"] },
        { icon: "gavel", keywords: ["terms", "conditions"] },
        { icon: "article", keywords: ["blog"] },
        { icon: "health_and_safety", keywords: ["safety", "follow-up", "follow up"] },
        { icon: "task_alt", keywords: ["conditions we treat"] },
        { icon: "thumb_up", keywords: ["why choose"] },
        { icon: "local_hospital", keywords: ["advanced urology centre"] },
        { icon: "biotech", keywords: ["advanced technology"] },
        { icon: "stethoscope", keywords: ["meet your doctor", "specialist", "specialists"] },
        { icon: "water_drop", keywords: ["urine", "urinary", "kidney", "bladder", "uti"] },
        { icon: "medical_services", keywords: ["urology", "laser", "treat", "care"] }
      ];

      for (const rule of iconRules) {
        if (rule.keywords.some(function (keyword) { return badgeText.includes(keyword); })) {
          return rule.icon;
        }
      }
      return null;
    }

    function syncBadgeIcons() {
      document.querySelectorAll(".c-badge").forEach(function (badge) {
        const iconEl = badge.querySelector(".material-symbols-outlined");
        if (!iconEl) return;
        const iconText = normalizeText(iconEl.textContent);
        const badgeText = normalizeText(badge.textContent.replace(iconText, ""));
        const nextIcon = getBadgeIconFromText(badgeText);
        if (nextIcon) {
          iconEl.textContent = nextIcon;
        }
      });
    }

    function initScrollAnimations() {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealSelectors = [
        ".hero .hero__content > *",
        ".c-section-heading",
        ".stats__item",
        ".c-card",
        ".laser-procedures__card",
        ".faq__item",
        ".for-men-conditions__item",
        ".for-men-trust__item",
        ".contact-section__card",
        ".about-intro__box",
        ".about-cards__card",
        ".expertise-section__item"
      ];

      const revealTargets = Array.from(
        new Set(
          revealSelectors.flatMap(function (selector) {
            return Array.from(document.querySelectorAll(selector));
          })
        )
      );

      if (!revealTargets.length) return;

      revealTargets.forEach(function (el, index) {
        el.classList.add("reveal-on-scroll");
        el.style.setProperty("--reveal-delay", String((index % 6) * 60) + "ms");
      });

      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach(function (el) {
          el.classList.add("is-inview");
        });
        return;
      }

      const observer = new IntersectionObserver(
        function (entries, io) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          });
        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      revealTargets.forEach(function (el) {
        observer.observe(el);
      });
    }

    function normalizePathname(pathname) {
      const cleaned = (pathname || "").replace(/\\/g, "/").trim().toLowerCase();
      if (!cleaned || cleaned === "/") return "/index.html";
      if (cleaned.endsWith("/")) return cleaned + "index.html";
      return cleaned;
    }

    function resolveLinkPath(href) {
      if (!href) return "";
      try {
        const resolved = new URL(href, window.location.href);
        return normalizePathname(resolved.pathname);
      } catch (error) {
        return "";
      }
    }

    function getCurrentPath() {
      const pathname = (window.location && window.location.pathname) || "";
      return normalizePathname(pathname);
    }

    function markActiveNavigation() {
      const currentPath = getCurrentPath();

      document.querySelectorAll(".c-header__menu > .c-header__item.is-active").forEach(function (item) {
        item.classList.remove("is-active");
      });
      document.querySelectorAll(".c-header__submenu-link.is-active").forEach(function (link) {
        link.classList.remove("is-active");
      });
      document.querySelectorAll(".c-drawer__item.is-active").forEach(function (item) {
        item.classList.remove("is-active");
      });
      document.querySelectorAll(".c-drawer__link.is-active").forEach(function (link) {
        link.classList.remove("is-active");
      });

      document.querySelectorAll("a.c-header__link[href], .c-header__submenu-link[href]").forEach(function (link) {
        const targetPath = resolveLinkPath(link.getAttribute("href"));
        if (!targetPath || targetPath !== currentPath) return;

        link.classList.add("is-active");

        const topLevelItem = link.closest(".c-header__item");
        if (topLevelItem) {
          topLevelItem.classList.add("is-active");
        }

        const submenuHost = link.closest(".c-header__item--has-submenu");
        if (submenuHost) {
          submenuHost.classList.add("is-active");
        }
      });

      document.querySelectorAll("a.c-drawer__link[href]").forEach(function (link) {
        const targetPath = resolveLinkPath(link.getAttribute("href"));
        if (!targetPath || targetPath !== currentPath) return;

        link.classList.add("is-active");

        const drawerItem = link.closest(".c-drawer__item");
        if (drawerItem) {
          drawerItem.classList.add("is-active");
        }

        const drawerSubmenu = link.closest(".c-drawer__submenu");
        if (!drawerSubmenu) return;
        const drawerParentItem = drawerSubmenu.closest(".c-drawer__item--submenu");
        if (!drawerParentItem) return;
        drawerParentItem.classList.add("is-active", "is-open");
        const toggle = drawerParentItem.querySelector(".c-drawer__toggle");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    }

    syncBadgeIcons();
    initScrollAnimations();
    markActiveNavigation();

    const menuToggle = document.getElementById("menuToggle");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const overlay = document.getElementById("overlay");
    const closeDrawer = document.getElementById("closeDrawer");

    // Accessibility: track last focused element and keep keyboard focus inside the dialog.
    let lastFocusedElement = null;
    let trapFocusKeydownHandler = null;

    function getFocusableElements(container) {
      if (!container) return [];
      return Array.from(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(function (el) {
        // Avoid focusing elements that are not visible.
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      });
    }

    function addFocusTrap() {
      if (!mobileDrawer) return;
      if (trapFocusKeydownHandler) return;

      trapFocusKeydownHandler = function (e) {
        if (e.key !== "Tab") return;
        const focusable = getFocusableElements(mobileDrawer);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", trapFocusKeydownHandler);
    }

    function removeFocusTrap() {
      if (trapFocusKeydownHandler) {
        document.removeEventListener("keydown", trapFocusKeydownHandler);
        trapFocusKeydownHandler = null;
      }
    }

    function openMenu() {
      lastFocusedElement = document.activeElement;
      if (mobileDrawer) {
        mobileDrawer.classList.add("is-open");
        mobileDrawer.setAttribute("aria-hidden", "false");
      }
      if (overlay) {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
      }
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close menu");
      }
      document.body.classList.add("is-lock");

      if (closeDrawer) closeDrawer.focus();
      addFocusTrap();
    }

    function closeMenu() {
      if (mobileDrawer) {
        mobileDrawer.classList.remove("is-open");
        mobileDrawer.setAttribute("aria-hidden", "true");
      }
      if (overlay) {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
      }
      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        menuToggle.focus();
      }
      document.body.classList.remove("is-lock");
      document.querySelectorAll(".c-drawer__item.is-open").forEach(function (el) {
        el.classList.remove("is-open");
      });

      removeFocusTrap();
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    }

    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        const isOpen = mobileDrawer && mobileDrawer.classList.contains("is-open");
        if (isOpen) closeMenu();
        else openMenu();
      });
    }

    if (closeDrawer) closeDrawer.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    document.querySelectorAll(".c-header__submenu-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const parent = this.closest(".c-header__item--has-submenu");
        if (!parent) return;
        const wasOpen = parent.classList.contains("is-open");
        document.querySelectorAll(".c-header__item--has-submenu.is-open").forEach(function (openItem) {
          openItem.classList.remove("is-open");
          const openBtn = openItem.querySelector(".c-header__submenu-toggle");
          if (openBtn) openBtn.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          parent.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest(".c-header")) return;
      document.querySelectorAll(".c-header__item--has-submenu.is-open").forEach(function (openItem) {
        openItem.classList.remove("is-open");
        const btn = openItem.querySelector(".c-header__submenu-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    });

    document.querySelectorAll(".c-drawer__toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const parent = this.closest(".c-drawer__item");
        if (!parent) return;
        const isOpen = parent.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileDrawer && mobileDrawer.classList.contains("is-open")) {
        closeMenu();
      }
    });

    // Performance + reliability: if a service image fails, hide it and reveal the text placeholder.
    document
      .querySelectorAll(".services-men__card-image img, .services-women__card-image img")
      .forEach(function (img) {
        img.addEventListener("error", function () {
          img.classList.add("u-hidden");
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
