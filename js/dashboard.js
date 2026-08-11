(function () {
  "use strict";

  var fontFamily = "'Inter', system-ui, sans-serif";
  var tickColor = "#8A97A8";
  var gridColor = "rgba(169, 128, 38, 0.08)";
  var accent = "#A98026";
  var accentSoft = "rgba(169, 128, 38, 0.15)";

  function getStacklyUser() {
    try {
      var raw = sessionStorage.getItem("stacklyUser");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function getUserInitials(name) {
    var parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function formatRoleLabel(role) {
    if (role === "admin") return "Admin";
    if (role === "client" || role === "customer") return "Client";
    return "User";
  }

  function initDashboardUser() {
    if (!document.body.classList.contains("dashboard-page")) return;

    var user = getStacklyUser();
    var displayName = user && user.name ? user.name : "";
    var displayEmail = user && user.email ? user.email : "";
    var displayRole = user && user.role ? formatRoleLabel(user.role) : "";

    document.querySelectorAll("[data-dash-user-name]").forEach(function (el) {
      if (displayName) el.textContent = displayName;
    });

    document.querySelectorAll("[data-dash-user-email]").forEach(function (el) {
      if (displayEmail) el.textContent = displayEmail;
    });

    document.querySelectorAll("[data-dash-user-role]").forEach(function (el) {
      if (displayRole) el.textContent = displayRole;
    });

    document.querySelectorAll("[data-dash-avatar]").forEach(function (el) {
      if (displayName) el.textContent = getUserInitials(displayName);
    });

    document.querySelectorAll("[data-dash-greeting]").forEach(function (el) {
      if (!displayName) return;
      el.textContent = "Welcome back, " + displayName + ".";
    });

    var profileContact = document.querySelector("[data-dash-profile-contact]");
    if (profileContact && displayName && displayEmail) {
      profileContact.textContent = displayName + " \u00B7 " + displayEmail;
    }

    var orgLabel = document.querySelector("[data-dash-org-label]");
    if (orgLabel && !document.body.classList.contains("dashboard-page--client") && !document.body.classList.contains("dashboard-page--customer")) {
      orgLabel.textContent = "Stackly Wealth";
    }

    document.querySelectorAll("[data-dash-signout]").forEach(function (el) {
      el.addEventListener("click", function () {
        sessionStorage.removeItem("stacklyUser");
      });
    });
  }

  function initDashNav() {
    var main = document.querySelector("[data-dash-main]");
    var navLinks = document.querySelectorAll("[data-dash-nav]");
    var sections = document.querySelectorAll("[data-dash-section]");
    if (!navLinks.length || !sections.length) return;

    function setActive(id) {
      navLinks.forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var match = href === "#" + id;
        link.classList.toggle("is-active", match);
        if (match) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    function scrollToSection(id) {
      var target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
      if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
      } else {
        location.hash = id;
      }
    }

    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        if (href.charAt(0) !== "#") return;
        var id = href.slice(1);
        if (!document.getElementById(id)) return;
        e.preventDefault();
        scrollToSection(id);
      });
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          var visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            });
          if (visible.length && visible[0].target.id) {
            setActive(visible[0].target.id);
          }
        },
        {
          root: null,
          rootMargin: "-20% 0px -55% 0px",
          threshold: [0.15, 0.35, 0.55],
        }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }

    if (location.hash) {
      var hashId = location.hash.replace("#", "");
      if (document.getElementById(hashId)) {
        window.setTimeout(function () {
          scrollToSection(hashId);
        }, 100);
      }
    }
  }

  function initSidebar() {
    var toggle = document.querySelector("[data-dash-sidebar-toggle]");
    var sidebar = document.querySelector("[data-dash-sidebar]");
    var backdrop = document.querySelector("[data-dash-backdrop]");
    if (!toggle || !sidebar) return;

    function setOpen(open) {
      sidebar.classList.toggle("is-open", open);
      if (backdrop) backdrop.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      window.dispatchEvent(new Event("resize"));
    }

    toggle.addEventListener("click", function () {
      setOpen(!sidebar.classList.contains("is-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    sidebar.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 1024px)").matches) setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function initAdminCharts() {
    if (typeof Chart === "undefined") return;

    var elRevenue = document.getElementById("admin-chart-revenue");
    if (!elRevenue) return;

    new Chart(elRevenue, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Advisor-led inflows ($M)",
            data: [12.4, 15.8, 14.2, 17.6, 19.3, 22.1, 20.7],
            borderColor: accent,
            backgroundColor: accentSoft,
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: accent,
            pointBorderColor: "#0B1F3A",
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            titleFont: { family: fontFamily },
            bodyFont: { family: fontFamily },
            callbacks: {
              label: function (ctx) {
                return " $" + ctx.raw.toFixed(1) + "M";
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { font: { family: fontFamily, size: 11 }, color: tickColor },
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              font: { family: fontFamily, size: 11 },
              color: tickColor,
              callback: function (v) {
                return "$" + v + "M";
              },
            },
          },
        },
      },
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initDashboardUser();
    initSidebar();
    initDashNav();
    if (document.body.classList.contains("dashboard-page--admin")) {
      initAdminCharts();
    }
  });
})();
