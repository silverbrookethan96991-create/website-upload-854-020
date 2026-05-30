(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".js-menu-toggle");
    var panel = document.querySelector(".js-mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
      document.body.classList.toggle("menu-open", panel.classList.contains("open"));
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll(".js-site-search");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        input.value = input.value.trim();
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    var panels = document.querySelectorAll(".js-filter-panel");
    panels.forEach(function (panel) {
      var input = panel.querySelector(".js-filter-input");
      var list = document.querySelector(".js-filter-list");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-select"));
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);
      var initialQuery = getQueryValue("q");
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var filters = {};
        selects.forEach(function (select) {
          var field = select.getAttribute("data-filter");
          if (field && select.value) {
            filters[field] = select.value;
          }
        });
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var visible = !query || haystack.indexOf(query) !== -1;
          Object.keys(filters).forEach(function (field) {
            visible = visible && (card.getAttribute("data-" + field) || "") === filters[field];
          });
          card.classList.toggle("is-hidden-card", !visible);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function initPlayer() {
    var boxes = document.querySelectorAll(".js-player");
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".js-play-button");
      var overlay = box.querySelector(".player-overlay");
      if (!video || !button || !overlay) {
        return;
      }
      var stream = button.getAttribute("data-stream");

      function fail() {
        box.classList.remove("is-loading");
        box.classList.add("has-error");
      }

      function startPlayback() {
        box.classList.add("is-loading");
        box.classList.remove("has-error");
        attachVideo(video, stream, function () {
          box.classList.remove("is-loading");
          overlay.classList.add("is-hidden");
          video.controls = true;
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
              overlay.classList.remove("is-hidden");
            });
          }
        }, fail);
      }

      button.addEventListener("click", startPlayback);
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          startPlayback();
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    });
  }

  function attachVideo(video, stream, done, fail) {
    if (!stream) {
      fail();
      return;
    }
    if (video.getAttribute("data-loaded-stream") === stream) {
      done();
      return;
    }
    video.setAttribute("data-loaded-stream", stream);
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video._hlsInstance = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          fail();
        }
      });
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", done, { once: true });
      video.addEventListener("error", fail, { once: true });
      return;
    }
    fail();
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayer();
  });
})();
