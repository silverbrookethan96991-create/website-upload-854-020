(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startSlider() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startSlider();
            });
        });

        startSlider();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function setupCardFilters(scope) {
        var search = scope.querySelector('.js-card-search');
        var typeFilter = scope.querySelector('.js-type-filter');
        var yearFilter = scope.querySelector('.js-year-filter');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-empty-state]');

        function applyFilters() {
            var keyword = normalize(search && search.value);
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var show = matchKeyword && matchType && matchYear;
                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, typeFilter, yearFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(setupCardFilters);

    function makeSearchResult(item) {
        var link = document.createElement('a');
        link.className = 'search-result';
        link.href = item.url;

        var image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title + ' 海报';
        image.loading = 'lazy';

        var text = document.createElement('span');
        var title = document.createElement('strong');
        var meta = document.createElement('em');
        title.textContent = item.title;
        meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
        text.appendChild(title);
        text.appendChild(meta);
        link.appendChild(image);
        link.appendChild(text);
        return link;
    }

    function setupSiteSearch(input) {
        var holder = input.parentElement ? input.parentElement.querySelector('.search-dropdown') : null;
        if (!holder || !window.SEARCH_INDEX) {
            return;
        }

        function close() {
            holder.classList.remove('is-open');
            holder.innerHTML = '';
        }

        function render() {
            var keyword = normalize(input.value);
            holder.innerHTML = '';
            if (!keyword) {
                close();
                return;
            }

            var results = window.SEARCH_INDEX.filter(function (item) {
                var haystack = normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.year);
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 8);

            if (!results.length) {
                close();
                return;
            }

            results.forEach(function (item) {
                holder.appendChild(makeSearchResult(item));
            });
            holder.classList.add('is-open');
        }

        input.addEventListener('input', render);
        input.addEventListener('focus', render);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                var first = holder.querySelector('a');
                if (first) {
                    event.preventDefault();
                    window.location.href = first.href;
                }
            }
        });
        document.addEventListener('click', function (event) {
            if (!holder.contains(event.target) && event.target !== input) {
                close();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.js-site-search')).forEach(setupSiteSearch);
})();
