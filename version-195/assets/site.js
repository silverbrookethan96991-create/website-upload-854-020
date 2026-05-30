(function () {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  });

  const searchInput = document.querySelector("[data-site-search]");
  const searchPanel = document.querySelector("[data-search-results]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function closeSearch() {
    if (searchPanel) {
      searchPanel.classList.remove("is-open");
      searchPanel.innerHTML = "";
    }
  }

  if (searchInput && searchPanel && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    searchInput.addEventListener("input", function () {
      const query = normalize(searchInput.value);
      if (!query) {
        closeSearch();
        return;
      }

      const results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return normalize(movie.keywords).includes(query);
      }).slice(0, 12);

      if (!results.length) {
        searchPanel.innerHTML = '<div class="search-item"><span><strong>没有找到匹配影片</strong><small>换一个关键词试试</small></span></div>';
        searchPanel.classList.add("is-open");
        return;
      }

      searchPanel.innerHTML = results.map(function (movie) {
        return '<a class="search-item" href="./' + encodeURI(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</small></span>' +
          '</a>';
      }).join("");
      searchPanel.classList.add("is-open");
    });

    document.addEventListener("click", function (event) {
      if (!searchPanel.contains(event.target) && event.target !== searchInput) {
        closeSearch();
      }
    });
  }

  document.querySelectorAll("[data-page-filter]").forEach(function (input) {
    const section = input.closest("section") || document;
    const cards = Array.from(section.querySelectorAll("[data-filter-card]"));
    const empty = section.querySelector("[data-filter-empty]");

    input.addEventListener("input", function () {
      const query = normalize(input.value);
      let visible = 0;

      cards.forEach(function (card) {
        const hit = !query || normalize(card.getAttribute("data-keywords")).includes(query);
        card.hidden = !hit;
        if (hit) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  });
})();
