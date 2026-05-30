(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function() {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
    if (!lists.length) {
      return;
    }
    var input = document.querySelector('[data-search-input]');
    var category = document.querySelector('[data-category-filter]');
    var year = document.querySelector('[data-year-filter]');
    var empty = document.querySelector('[data-empty-state]');

    function apply() {
      var query = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      lists.forEach(function(list) {
        Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function(card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-category'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
          var matchesYear = !selectedYear || cardYear === selectedYear;
          var keep = matchesQuery && matchesCategory && matchesYear;
          card.style.display = keep ? '' : 'none';
          if (keep) {
            visible += 1;
          }
        });
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  }

  window.createMoviePlayer = function(videoId, overlayId, statusId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var status = document.getElementById(statusId);
    var started = false;
    var hls = null;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function bindStream() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setStatus('播放暂时不可用');
          }
        });
      } else {
        setStatus('播放暂时不可用');
      }
    }

    function begin() {
      bindStream();
      overlay.classList.add('hidden');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          overlay.classList.remove('hidden');
        });
      }
    }

    overlay.addEventListener('click', begin);
    video.addEventListener('click', function() {
      if (!started || video.paused) {
        begin();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
