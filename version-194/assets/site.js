(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const primaryNav = document.querySelector('[data-primary-nav]');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', function () {
            primaryNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const root = form.getAttribute('data-root') || './';
            const query = input ? input.value.trim() : '';
            const target = root + 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
            window.location.href = target;
        });
    });

    const carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                const active = slideIndex === current;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(current + 1);
            }, 5800);
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const container = scope.parentElement || document;
        const input = scope.querySelector('[data-filter-input]');
        const yearSelect = scope.querySelector('[data-year-filter]');
        const typeSelect = scope.querySelector('[data-type-filter]');
        const cards = Array.from(container.querySelectorAll('[data-card]'));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            const query = normalize(input ? input.value : '');
            const year = yearSelect ? yearSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const matchQuery = !query || haystack.indexOf(query) !== -1;
                const matchYear = !year || card.dataset.year === year;
                const matchType = !type || normalize(card.dataset.type).indexOf(normalize(type)) !== -1;
                card.hidden = !(matchQuery && matchYear && matchType);
            });
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();
