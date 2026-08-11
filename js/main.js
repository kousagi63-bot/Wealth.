(function () {
  "use strict";

  var HEADER_SEL = "[data-header]";
  var NAV_WRAP_SEL = "#nav-wrap";
  var TOGGLE_SEL = "#nav-toggle";

  function revealMessage(el) {
    if (!el) return;
    el.classList.remove("is-hidden");
  }

  function clearFormErrors(form) {
    if (!form) return;
    form.classList.remove("was-validated");
    form.querySelectorAll(".has-error").forEach(function (el) {
      el.classList.remove("has-error");
    });
    form.querySelectorAll(".field-error").forEach(function (err) {
      err.removeAttribute("style");
    });
  }

  function currentPageFile() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop() || "";
    if (!file || file === "") return "index.html";
    return file.split("?")[0].split("#")[0].toLowerCase();
  }

  function highlightNav() {
    var page = currentPageFile();
    if (page === "" || page === "/") page = "index.html";

    document.querySelectorAll("[data-nav-file]").forEach(function (link) {
      var target = (link.getAttribute("data-nav-file") || "").toLowerCase();
      var match = target === page;
      if (link.classList.contains("nav-link")) {
        link.classList.toggle("is-active", match);
      }
      if (match) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function initPreloader() {
    var preloader = document.getElementById("preloader");
    if (!preloader) return;

    var progressBar = preloader.querySelector(".preloader__progress-fill");
    var progressWrap = preloader.querySelector(".preloader__progress");
    var tagline = preloader.querySelector("[data-boot-messages]");
    var bootTimer = null;

    if (tagline) {
      var msgs = (tagline.getAttribute("data-boot-messages") || "").split("|").filter(Boolean);
      var bootIndex = 0;
      tagline.classList.add("is-booting");
      if (msgs.length) {
        tagline.textContent = msgs[0];
        bootTimer = setInterval(function () {
          bootIndex = (bootIndex + 1) % msgs.length;
          tagline.textContent = msgs[bootIndex];
        }, 420);
      }
    }

    window.addEventListener("load", function () {
      setTimeout(function () {
        if (bootTimer) clearInterval(bootTimer);
        if (progressBar) {
          progressBar.style.animation = "none";
          progressBar.style.width = "100%";
        }
        if (progressWrap) {
          progressWrap.setAttribute("aria-valuenow", "100");
        }
        if (tagline && tagline.getAttribute("data-boot-messages")) {
          tagline.textContent = "Care platform ready";
        }

        setTimeout(function () {
          preloader.classList.add("preloader--hide");
        }, 500);
      }, 1400);
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector(HEADER_SEL);
    var body = document.body;
    if (!header || (!body.classList.contains("page-home") && !body.classList.contains("page-hero-overlay"))) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 48);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var wrap = document.querySelector(NAV_WRAP_SEL);
    var toggle = document.querySelector(TOGGLE_SEL);
    if (!wrap || !toggle) return;

    var mq = window.matchMedia("(max-width: 768px)");
    var navHome = { parent: wrap.parentNode, next: wrap.nextSibling };

    function syncNavPlacement() {
      if (mq.matches) {
        if (wrap.parentNode !== document.body) {
          document.body.appendChild(wrap);
        }
        return;
      }

      setOpen(false);
      if (wrap.parentNode === document.body && navHome.parent) {
        if (navHome.next && navHome.next.parentNode === navHome.parent) {
          navHome.parent.insertBefore(wrap, navHome.next);
        } else {
          navHome.parent.appendChild(wrap);
        }
      }
    }

    function setOpen(open) {
      if (!mq.matches) {
        wrap.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("is-nav-open");
        document.body.style.overflow = "";
        return;
      }

      wrap.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("is-nav-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }

    syncNavPlacement();
    if (mq.addEventListener) {
      mq.addEventListener("change", syncNavPlacement);
    } else if (mq.addListener) {
      mq.addListener(syncNavPlacement);
    }

    toggle.addEventListener("click", function () {
      if (!mq.matches) return;
      setOpen(!wrap.classList.contains("is-open"));
    });

    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    wrap.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener("click", function () {
        if (mq.matches) setOpen(false);
      });
    });
  }

  function initSmoothScroll() {
    var header = document.querySelector(HEADER_SEL);
    var offset = header ? header.offsetHeight : 0;

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || !a.getAttribute("href") || a.getAttribute("href") === "#") return;
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - offset - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }

  function getCounterFormatter(el) {
    var fmt = (el.getAttribute("data-format") || "").trim().toLowerCase();
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(decimals) || decimals < 0) decimals = 0;

    if (fmt === "kplus" || fmt === "k+") {
      return function (n) {
        if (n < 1000) return String(n);
        var v = n / 1000;
        var s = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
        return s + "K+";
      };
    }

    if (fmt === "mplus" || fmt === "m+") {
      return function (n) {
        if (n < 1000000) return String(n);
        var v = n / 1000000;
        var s = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
        return s + "M+";
      };
    }

    if (fmt === "percent" || fmt === "%") {
      return function (n) {
        return String(n) + "%";
      };
    }

    if (fmt === "plus" || fmt === "+") {
      return function (n) {
        return String(n) + "+";
      };
    }

    if (fmt === "decimal") {
      return function (n) {
        return decimals > 0 ? n.toFixed(decimals) : String(n);
      };
    }

    return function (n) {
      return String(n);
    };
  }

  function animateCounter(el, target, duration) {
    var start = 0;
    var startTime = null;
    var format = getCounterFormatter(el);
    var isDecimal = (el.getAttribute("data-format") || "").toLowerCase() === "decimal";
    var existing = parseFloat((el.textContent || "").replace(/[^\d.-]/g, ""));
    if (!isNaN(existing)) start = Math.max(0, Math.min(existing, target));

    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = start + (target - start) * eased;
      el.textContent = format(isDecimal ? val : Math.floor(val));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }

    requestAnimationFrame(step);
  }

  function isHeroCounter(el) {
    if (!el.closest) return false;
    return !!(
      el.closest(".hero-premium__stats-card") ||
      el.closest(".hero-stats") ||
      el.closest(".hero-health-stats") ||
      el.closest("[data-hero-stats]")
    );
  }

  function initCounters() {
    var counters = Array.prototype.slice.call(document.querySelectorAll(".stat-counter[data-target]"));
    if (!counters.length) return;

    function parseTarget(el) {
      var t = parseFloat(el.getAttribute("data-target"));
      return isNaN(t) ? null : t;
    }

    function runOne(el, duration, delayMs) {
      if (el._counterDone) return;
      var t = parseTarget(el);
      if (t === null) return;
      el._counterDone = true;
      var d = typeof duration === "number" ? duration : 1600;
      var delay = typeof delayMs === "number" ? delayMs : 0;
      if (delay > 0) {
        setTimeout(function () {
          animateCounter(el, t, d);
        }, delay);
      } else {
        animateCounter(el, t, d);
      }
    }

    counters.forEach(function (el) {
      if (isHeroCounter(el)) {
        el._counterDone = false;
        el.textContent = "0";
        runOne(el, 2200, 450);
      }
    });

    var remaining = counters.filter(function (el) {
      return !el._counterDone;
    });
    if (!remaining.length) return;

    if (!("IntersectionObserver" in window)) {
      remaining.forEach(function (el) {
        runOne(el);
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          runOne(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.35 }
    );

    remaining.forEach(function (el) {
      io.observe(el);
    });
  }

  function initHeroVideo() {
    var hero = document.querySelector(".hero-premium--video");
    if (!hero) return;

    var video = hero.querySelector(".hero-premium__video");
    if (!video || video.tagName !== "VIDEO") return;

    var prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }

    function markReady() {
      hero.classList.add("is-video-ready");
    }

    video.addEventListener("canplay", markReady, { once: true });

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        hero.classList.remove("is-video-ready");
      });
    }
  }

  function initTestimonialSlider() {
    var root = document.querySelector("[data-testimonial-slider]");
    if (!root) return;

    var track = root.querySelector("[data-testimonial-track]");
    var dotsWrap = root.querySelector("[data-testimonial-dots]");
    var prevBtn = root.querySelector("[data-testimonial-prev]");
    var nextBtn = root.querySelector("[data-testimonial-next]");
    if (!track) return;

    var slides = track.querySelectorAll(".testimonial-slide");
    var n = slides.length;
    if (!n) return;

    var i = 0;
    var timer = null;

    function go(index) {
      i = (index + n) % n;
      track.style.transform = "translate3d(-" + i * 100 + "%, 0, 0)";
      slides.forEach(function (slide, j) {
        slide.setAttribute("aria-hidden", j === i ? "false" : "true");
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (btn, j) {
          btn.classList.toggle("is-active", j === i);
          btn.setAttribute("aria-selected", j === i ? "true" : "false");
        });
      }
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      for (var d = 0; d < n; d++) {
        (function (index) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("role", "tab");
          b.setAttribute("aria-label", "Show testimonial " + (index + 1));
          b.addEventListener("click", function () {
            go(index);
            restart();
          });
          dotsWrap.appendChild(b);
        })(d);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        go(i - 1);
        restart();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        go(i + 1);
        restart();
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        go(i + 1);
      }, 6000);
    }

    go(0);
    restart();
  }

  function initFaq() {
    document.querySelectorAll("[data-faq]").forEach(function (root) {
      root.querySelectorAll("[data-faq-trigger]").forEach(function (btn) {
        var item = btn.closest(".faq-item");
        var panel = item ? item.querySelector("[data-faq-panel]") : null;
        if (!item || !panel) return;

        panel.style.maxHeight = "";

        btn.addEventListener("click", function () {
          var open = item.classList.contains("is-open");

          root.querySelectorAll(".faq-item.is-open").forEach(function (other) {
            if (other !== item) {
              other.classList.remove("is-open");
              var t = other.querySelector("[data-faq-trigger]");
              var p = other.querySelector("[data-faq-panel]");
              if (t) t.setAttribute("aria-expanded", "false");
              if (p) p.style.maxHeight = "";
            }
          });

          item.classList.toggle("is-open", !open);
          btn.setAttribute("aria-expanded", !open ? "true" : "false");
          panel.style.maxHeight = "";
        });
      });
    });
  }

  function initPasswordToggles() {
    var eyeOpenSvg =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    var eyeClosedSvg =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"></path><path d="M10.6 10.6a3 3 0 0 0 4.24 4.24"></path><path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.76 18.76 0 0 1-3.06 3.83"></path><path d="M6.61 6.61C3.76 8.13 2 12 2 12a18.84 18.84 0 0 0 5.39 5.39"></path></svg>';

    document.querySelectorAll('input[type="password"]').forEach(function (input) {
      if (input.dataset.passwordToggleInit === "true" || input.closest(".form-password")) return;
      input.dataset.passwordToggleInit = "true";

      input.type = "password";
      input.value = "";
      input.defaultValue = "";
      input.setAttribute("autocomplete", "off");

      function clearPasswordValue() {
        if (document.activeElement === input) return;
        input.value = "";
      }

      clearPasswordValue();
      requestAnimationFrame(clearPasswordValue);
      setTimeout(clearPasswordValue, 120);
      setTimeout(clearPasswordValue, 400);

      var wrapper = document.createElement("div");
      wrapper.className = "form-password";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      input.classList.add("form-password__input");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "form-password__toggle";
      btn.setAttribute("aria-label", "Show password");
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML =
        '<span class="form-password__icon form-password__icon--show">' + eyeClosedSvg + "</span>" +
        '<span class="form-password__icon form-password__icon--hide">' + eyeOpenSvg + "</span>";

      btn.addEventListener("click", function () {
        var reveal = input.type === "password";
        input.type = reveal ? "text" : "password";
        btn.classList.toggle("is-visible", reveal);
        btn.setAttribute("aria-pressed", reveal ? "true" : "false");
        btn.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
      });

      wrapper.appendChild(btn);
    });
  }

  function validateField(input) {
    var wrap = input.closest(".form-field") || input.parentElement;
    if (!wrap) return true;
    var err = wrap.querySelector(".field-error");
    var ok = true;
    var val = input.tagName === "SELECT" ? String(input.value || "") : String(input.value || "").trim();

    if (input.type === "checkbox") {
      if (input.hasAttribute("required") && !input.checked) ok = false;
    } else if (input.type === "radio") {
      if (input.hasAttribute("required")) {
        var form = input.form || input.closest("form");
        var groupOk = false;
        if (form && input.name) {
          groupOk = !!form.querySelector('input[type="radio"][name="' + input.name + '"]:checked');
        } else {
          groupOk = input.checked;
        }
        if (!groupOk) ok = false;
      }
    } else {
      if (input.hasAttribute("required") && !val) ok = false;
    }
    if (input.type === "email" && val) {
      ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }
    if (input.type === "password" && input.hasAttribute("minlength")) {
      var min = parseInt(input.getAttribute("minlength"), 10);
      if (String(input.value || "").length < min) ok = false;
    }
    if (ok && input.hasAttribute("data-match")) {
      var sel = (input.getAttribute("data-match") || "").trim();
      var root = input.form || document;
      var other = sel ? root.querySelector(sel) : null;
      if (other && String(input.value || "") !== String(other.value || "")) ok = false;
    }

    wrap.classList.toggle("has-error", !ok);
    if (err) err.setAttribute("role", "alert");
    return ok;
  }

  function handleDemoFormSuccess(form, successId, redirectUrl, shouldReset, redirectDelay) {
    clearFormErrors(form);
    if (shouldReset) {
      form.reset();
    }
    if (form) {
      form.classList.add("is-submitted");
    }
    var msg = document.getElementById(successId);
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (msg) {
      if (msg._redirectTimer) {
        clearTimeout(msg._redirectTimer);
        msg._redirectTimer = null;
      }
      revealMessage(msg);
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Redirecting...";
    }
    if (redirectUrl) {
      var delay = typeof redirectDelay === "number" ? redirectDelay : 3000;
      var redirectTimer = setTimeout(function () {
        window.location.href = redirectUrl;
      }, delay);
      if (msg) {
        msg._redirectTimer = redirectTimer;
      }
    }
  }

  function initFormValidation() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var inputs = form.querySelectorAll("input[required], textarea[required], input[type='email'], select[required]");
        var allOk = true;
        inputs.forEach(function (inp) {
          if (!validateField(inp)) allOk = false;
        });
        if (!allOk) {
          form.classList.add("was-validated");
          return;
        }
        var action = (form.getAttribute("action") || "").trim();
        if (action && action !== "#") {
          form.submit();
          return;
        }
        if (form.id === "register-form") {
          var roleInput = form.querySelector('input[name="role"]:checked');
          var nameInput = form.querySelector("#reg-name");
          var emailInput = form.querySelector("#reg-email");
          sessionStorage.setItem(
            "stacklyUser",
            JSON.stringify({
              name: nameInput ? nameInput.value.trim() : "",
              email: emailInput ? emailInput.value.trim() : "",
              role: roleInput ? roleInput.value : "client",
            })
          );
          handleDemoFormSuccess(form, "register-success", "login.html");
          return;
        }
        if (form.id === "contact-form") {
          handleDemoFormSuccess(form, "contact-success", "404.html", true);
          return;
        }
        if (form.id === "newsletter-form") {
          clearFormErrors(form);
          form.reset();
          var newsletterMsg = document.getElementById("newsletter-success");
          if (newsletterMsg) {
            if (newsletterMsg._redirectTimer) {
              clearTimeout(newsletterMsg._redirectTimer);
              newsletterMsg._redirectTimer = null;
            }
            revealMessage(newsletterMsg);
            newsletterMsg._redirectTimer = setTimeout(function () {
              window.location.href = "404.html";
            }, 1000);
          }
          return;
        }
        if (form.id === "reservation-form") {
          handleDemoFormSuccess(form, "reservation-success");
          return;
        }
      });

      form.querySelectorAll("input, textarea, select").forEach(function (inp) {
        inp.addEventListener("blur", function () {
          if (form.classList.contains("was-validated") || inp.value) {
            validateField(inp);
          }
        });
        inp.addEventListener("input", function () {
          if (!form.classList.contains("was-validated")) return;
          validateField(inp);
          if (inp.type === "password" && inp.id === "reg-password") {
            var confirm = form.querySelector("#reg-confirm");
            if (confirm) validateField(confirm);
          }
        });
        if (inp.type === "checkbox" || inp.type === "radio") {
          inp.addEventListener("change", function () {
            if (form.classList.contains("was-validated")) {
              validateField(inp);
            }
          });
        }
      });
    });
  }

  function initAuthFormDefaults() {
    document.querySelectorAll("#login-form, #register-form").forEach(function (form) {
      form.setAttribute("autocomplete", "off");

      form.querySelectorAll('input[type="text"], input[type="email"]').forEach(function (input) {
        input.value = "";
        input.defaultValue = "";
        input.setAttribute("autocomplete", "off");
        input.setAttribute("readonly", "readonly");
        input.addEventListener("focus", function unlockAuthField() {
          input.removeAttribute("readonly");
          input.removeEventListener("focus", unlockAuthField);
        });
      });

      form.querySelectorAll('input[type="password"]').forEach(function (input) {
        input.value = "";
        input.defaultValue = "";
        input.setAttribute("autocomplete", "off");
      });

      form.querySelectorAll(".form-field.has-error, .role-fieldset.has-error").forEach(function (field) {
        field.classList.remove("has-error");
      });

      form.classList.remove("was-validated");
      clearFormErrors(form);
    });

    [150, 500].forEach(function (delay) {
      setTimeout(function () {
        document.querySelectorAll("#login-form, #register-form").forEach(function (form) {
          form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(function (input) {
            if (document.activeElement !== input) input.value = "";
          });
        });
      }, delay);
    });
  }

  function initLoginRedirect() {
    var form = document.getElementById("login-form");
    if (!form) return;

    form.querySelectorAll('input[name="role"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var fs = form.querySelector(".role-fieldset");
        if (fs) fs.classList.remove("has-error");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#login-name");
      var email = form.querySelector("#login-email");
      var password = form.querySelector("#login-password");
      var role = form.querySelector('input[name="role"]:checked');
      var ok = true;
      form.classList.add("was-validated");
      if (name && !validateField(name)) ok = false;
      if (email && !validateField(email)) ok = false;
      if (password && !validateField(password)) ok = false;
      if (!role) {
        ok = false;
        var rs = form.querySelector(".role-fieldset");
        if (rs) rs.classList.add("has-error");
      } else {
        var fs = form.querySelector(".role-fieldset");
        if (fs) fs.classList.remove("has-error");
      }
      if (!ok) return;

      clearFormErrors(form);

      sessionStorage.setItem(
        "stacklyUser",
        JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          role: role.value,
        })
      );

      var nextUrl = role.value === "admin" ? "admin-dashboard.html" : "client-dashboard.html";
      var lmsg = document.getElementById("login-success");
      var submitBtn = form.querySelector('button[type="submit"]');
      if (lmsg) {
        if (lmsg._redirectTimer) {
          clearTimeout(lmsg._redirectTimer);
          lmsg._redirectTimer = null;
        }
        revealMessage(lmsg);
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Redirecting...";
      }

      var loginRedirectTimer = setTimeout(function () {
        window.location.href = nextUrl;
      }, 3000);

      if (lmsg) {
        lmsg._redirectTimer = loginRedirectTimer;
      }
    });
  }

  function initYear() {
    var y = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(y);
    });
  }

  function navigateToPreviousPage(fallbackUrl) {
    var fallback = fallbackUrl || "index.html";
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = fallback;
  }

  function initGoBackButtons() {
    document.querySelectorAll("#error-go-back, [data-go-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigateToPreviousPage("index.html");
      });
    });
  }

  function initScrollSpyHome() {
    if (!document.body.classList.contains("page-home")) return;

    var header = document.querySelector(HEADER_SEL);
    var links = document.querySelectorAll(".nav-link[data-section]");
    if (!links.length) return;

    var byId = {};
    links.forEach(function (link) {
      var sid = link.getAttribute("data-section");
      if (sid) byId[sid] = link;
    });

    var sectionEls = Object.keys(byId)
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean)
      .sort(function (a, b) {
        return a.offsetTop - b.offsetTop;
      });

    if (!sectionEls.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var pad = (header ? header.offsetHeight : 0) + 32;
      var y = window.scrollY + pad;
      var currentId = sectionEls[0].id;
      for (var i = 0; i < sectionEls.length; i++) {
        var sec = sectionEls[i];
        if (sec.offsetTop <= y) currentId = sec.id;
      }
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-section") === currentId);
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  function initReservationDateMin() {
    var dateInput = document.getElementById("reservation-date");
    if (!dateInput) return;
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = yyyy + "-" + mm + "-" + dd;
  }

  function initMenuFilter() {
    var container = document.querySelector("[data-menu-filter]");
    var board = document.querySelector("[data-menu-board]");
    if (!container || !board) return;

    var items = board.querySelectorAll(".menu-item[data-category]");
    var sections = board.querySelectorAll(".menu-section[data-menu-section]");
    var emptyState = board.querySelector("[data-menu-empty]");
    if (!items.length) return;

    function applyFilter(filter) {
      var key = String(filter || "all").toLowerCase().trim();
      var visibleTotal = 0;

      items.forEach(function (item) {
        var cat = (item.getAttribute("data-category") || "").toLowerCase();
        var match = key === "all" || cat === key;
        item.classList.toggle("is-hidden", !match);
        item.classList.toggle("menu-item--hidden", !match);
        item.hidden = !match;
        item.setAttribute("aria-hidden", match ? "false" : "true");
        if (match) visibleTotal += 1;
      });

      sections.forEach(function (section) {
        var sectionKey = (section.getAttribute("data-menu-section") || "").toLowerCase();
        var showSection = key === "all" || sectionKey === key;
        section.classList.toggle("is-hidden", !showSection);
        section.hidden = !showSection;
        section.setAttribute("aria-hidden", showSection ? "false" : "true");

        var countEl = section.querySelector("[data-menu-count]");
        if (countEl) {
          var count =
            key === "all"
              ? section.querySelectorAll(".menu-item[data-category]").length
              : section.querySelectorAll(".menu-item[data-category]:not(.is-hidden)").length;
          countEl.textContent = count + (count === 1 ? " item" : " items");
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleTotal > 0;
      }

      board.classList.toggle("is-filtered", key !== "all");
      board.setAttribute("data-active-filter", key);
    }

    container.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-menu-tab]");
      if (!tab || !container.contains(tab)) return;

      e.preventDefault();

      var filter = tab.getAttribute("data-menu-tab") || "all";
      var tabs = container.querySelectorAll("[data-menu-tab]");

      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      applyFilter(filter);
    });

    applyFilter("all");
  }

  function initFlightDeckChrome() {
    if (!document.body.classList.contains("premium-theme")) return;
    if (document.body.classList.contains("dashboard-page")) return;
    if (document.body.classList.contains("page-home")) return;

    if (!document.getElementById("flight-ambient")) {
      var ambient = document.createElement("div");
      ambient.id = "flight-ambient";
      ambient.className = "flight-ambient";
      ambient.setAttribute("aria-hidden", "true");
      ambient.innerHTML =
        '<div class="flight-ambient__scan"></div><div class="flight-ambient__vignette"></div>';
      document.body.prepend(ambient);
    }

    var headerActions = document.querySelector(".site-header__actions");
    if (headerActions && !headerActions.querySelector(".flight-status")) {
      var status = document.createElement("span");
      status.className = "flight-status";
      status.setAttribute("aria-hidden", "true");
      status.innerHTML = '<span class="flight-status__dot"></span>MARKETS OPEN';
      headerActions.insertBefore(status, headerActions.firstChild);
    }
  }

  function initHomeCareStatus() {
    if (!document.body.classList.contains("page-home")) return;
    var headerActions = document.querySelector(".site-header__actions");
    if (!headerActions || headerActions.querySelector(".flight-status")) return;
    var status = document.createElement("span");
    status.className = "flight-status";
    status.setAttribute("aria-hidden", "true");
    status.innerHTML = '<span class="flight-status__dot"></span>MARKETS OPEN';
    headerActions.insertBefore(status, headerActions.firstChild);
  }

  function initHeroRotate() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll("[data-hero-rotate]").forEach(function (el) {
      var words = (el.getAttribute("data-hero-words") || "")
        .split("|")
        .map(function (w) {
          return w.trim();
        })
        .filter(Boolean);
      if (words.length < 2) return;

      var index = 0;
      el.textContent = words[0];

      setInterval(function () {
        el.classList.add("is-swapping");
        setTimeout(function () {
          index = (index + 1) % words.length;
          el.textContent = words[index];
          el.classList.remove("is-swapping");
        }, 280);
      }, 3400);
    });
  }

  function initHeroTelemetry() {
    var panel = document.querySelector("[data-hero-telemetry]");
    if (!panel) return;

    var alt = panel.querySelector('[data-telemetry="alt"]');
    var spd = panel.querySelector('[data-telemetry="spd"]');
    var hdg = panel.querySelector('[data-telemetry="hdg"]');
    var sat = panel.querySelector('[data-telemetry="sat"]');
    var clock = panel.querySelector('[data-telemetry="clock"]');

    var hero = document.querySelector(".hero-premium");
    if (hero && !document.body.classList.contains("page-home") && !hero.querySelector(".flight-crosshair")) {
      var crosshair = document.createElement("div");
      crosshair.className = "flight-crosshair";
      crosshair.setAttribute("aria-hidden", "true");
      hero.appendChild(crosshair);

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hero.addEventListener(
          "mousemove",
          function (e) {
            var rect = hero.getBoundingClientRect();
            crosshair.style.left = e.clientX - rect.left + "px";
            crosshair.style.top = e.clientY - rect.top + "px";
          },
          { passive: true }
        );
      }
    }

    var hr = panel.querySelector('[data-telemetry="hr"]');
    var spo2 = panel.querySelector('[data-telemetry="spo2"]');
    var bp = panel.querySelector('[data-telemetry="bp"]');
    var temp = panel.querySelector('[data-telemetry="temp"]');

    function tick() {
      if (hr) hr.textContent = String(60 + Math.floor(Math.random() * 5));
      if (spo2) spo2.textContent = String(23 + Math.floor(Math.random() * 3));
      if (bp) bp.textContent = String(8 + Math.floor(Math.random() * 3));
      if (temp) temp.textContent = String(4 + Math.floor(Math.random() * 3));
      if (alt) alt.textContent = String(128 + Math.floor(Math.random() * 28));
      if (spd) spd.textContent = (11 + Math.random() * 3).toFixed(1);
      if (hdg) hdg.textContent = String(260 + Math.floor(Math.random() * 30));
      if (sat) sat.textContent = String(16 + Math.floor(Math.random() * 5));
      if (clock) {
        var now = new Date();
        clock.textContent =
          String(now.getHours()).padStart(2, "0") +
          ":" +
          String(now.getMinutes()).padStart(2, "0") +
          ":" +
          String(now.getSeconds()).padStart(2, "0") +
          " EST";
      }
    }

    tick();
    setInterval(tick, 2200);
  }

  function initStatBars() {
    if (!("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll(".stat-item");
    if (!items.length) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  function initSignalDividers() {
    if (!document.body.classList.contains("page-home")) return;
    var sections = document.querySelectorAll(
      "#featured, #about-teaser, #why-us, #testimonials, #gallery-preview, #blog-preview, #reserve-cta"
    );
    sections.forEach(function (sec) {
      if (sec.previousElementSibling && sec.previousElementSibling.classList.contains("signal-divider")) {
        return;
      }
      var div = document.createElement("div");
      div.className = "signal-divider";
      div.setAttribute("aria-hidden", "true");
      sec.parentNode.insertBefore(div, sec);
    });
  }

  function initAos() {
    if (!("AOS" in window)) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.AOS.init({ disable: true });
      return;
    }

    var commonTargets = document.querySelectorAll(
      "main section, main article, .card-surface, .dish-card, .why-card, .stat-item, .hero-stat, .faq-item, .dashboard-card, .menu-item, .blog-card, .gallery-item, .team-card"
    );

    commonTargets.forEach(function (el, index) {
      if (el.hasAttribute("data-aos")) return;
      if (el.closest("[data-menu-board]")) return;
      el.setAttribute("data-aos", "fade-up");
      el.setAttribute("data-aos-duration", "700");
      el.setAttribute("data-aos-delay", String((index % 5) * 60));
    });

    window.AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPreloader();
    highlightNav();
    initHeaderScroll();
    initMobileNav();
    initSmoothScroll();
    initScrollSpyHome();
    initCounters();
    initHeroVideo();
    initTestimonialSlider();
    initFaq();
    initPasswordToggles();
    initAuthFormDefaults();
    initFormValidation();
    initLoginRedirect();
    initGoBackButtons();
    initYear();
    initFlightDeckChrome();
    initHomeCareStatus();
    initHeroRotate();
    initHeroTelemetry();
    initStatBars();
    initSignalDividers();
    initMenuFilter();
    initReservationDateMin();
    initAos();
  });

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) initAuthFormDefaults();
  });
})();
