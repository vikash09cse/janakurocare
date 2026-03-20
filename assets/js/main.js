/**
 * JanakUROCare — mobile drawer, desktop submenu (production)
 */
(function () {
  "use strict";

  function init() {
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
