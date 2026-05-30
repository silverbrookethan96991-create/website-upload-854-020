(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    if (menuButton) {
        menuButton.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        restart();
    }

    function initGlobalSearch() {
        var form = document.querySelector('[data-global-form]');
        var input = document.querySelector('[data-global-search]');
        var panel = document.querySelector('[data-search-panel]');
        var data = window.movieSearchData || [];

        if (!form || !input || !panel || !data.length) {
            return;
        }

        function render(query) {
            var q = normalize(query);
            if (!q) {
                panel.classList.remove('open');
                panel.innerHTML = '';
                return;
            }

            var results = data.filter(function (item) {
                return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.tags).indexOf(q) !== -1;
            }).slice(0, 8);

            if (!results.length) {
                panel.classList.remove('open');
                panel.innerHTML = '';
                return;
            }

            panel.innerHTML = results.map(function (item) {
                return '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '"><span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.genre + '</em></span></a>';
            }).join('');
            panel.classList.add('open');
        }

        input.addEventListener('input', function () {
            render(input.value);
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var q = normalize(input.value);
            if (!q) {
                return;
            }
            var match = data.find(function (item) {
                return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.tags).indexOf(q) !== -1;
            });
            if (match) {
                window.location.href = match.url;
            }
        });

        document.addEventListener('click', function (event) {
            if (!form.contains(event.target)) {
                panel.classList.remove('open');
            }
        });
    }

    function initPageFilter() {
        var input = document.querySelector('[data-page-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
        var activeChip = '';

        if (!cards.length) {
            return;
        }

        function apply() {
            var q = normalize(input ? input.value : '');
            var chip = normalize(activeChip);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var visible = (!q || haystack.indexOf(q) !== -1) && (!chip || haystack.indexOf(chip) !== -1);
                card.classList.toggle('card-hidden', !visible);
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeChip = chip.getAttribute('data-filter-chip') || '';
                apply();
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-overlay');
            var stream = player.getAttribute('data-stream');
            var attached = false;
            var hls;

            if (!video || !button || !stream) {
                return;
            }

            function attachAndPlay() {
                if (!attached) {
                    attached = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                }
                player.classList.add('is-playing');
                video.controls = true;
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            }

            button.addEventListener('click', attachAndPlay);
            video.addEventListener('click', function () {
                if (!attached) {
                    attachAndPlay();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    initHero();
    initGlobalSearch();
    initPageFilter();
    initPlayers();
})();
