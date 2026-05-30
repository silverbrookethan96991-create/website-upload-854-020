(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });

      if (slides.length > 1) {
        restart();
      }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function (panel) {
      var root = panel.parentElement;
      var list = root ? root.querySelector("[data-filter-list]") : null;
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var keyword = panel.querySelector("[data-filter-keyword]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var term = normalize(keyword ? keyword.value : "");
        var active = {};
        selects.forEach(function (select) {
          active[select.getAttribute("data-filter-field")] = normalize(select.value);
        });
        cards.forEach(function (card) {
          var text = normalize(card.textContent + " " + (card.getAttribute("data-title") || ""));
          var ok = !term || text.indexOf(term) !== -1;
          Object.keys(active).forEach(function (field) {
            var value = active[field];
            if (value && normalize(card.getAttribute("data-" + field)) !== value) {
              ok = false;
            }
          });
          card.setAttribute("data-filter-hidden", ok ? "false" : "true");
        });
      }

      if (keyword) {
        keyword.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && keyword) {
        keyword.value = q;
        apply();
      }
    });
  });
})();
