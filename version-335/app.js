(function () {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.slider-dot'));

    if (slides.length > 1) {
        let active = 0;

        function showSlide(index) {
            active = index;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        setInterval(function () {
            showSlide((active + 1) % slides.length);
        }, 5200);
    }

    const filterRoot = document.querySelector('[data-filter-page]');

    if (filterRoot) {
        const searchInput = filterRoot.querySelector('[data-card-search]');
        const regionSelect = filterRoot.querySelector('[data-region-select]');
        const typeSelect = filterRoot.querySelector('[data-type-select]');
        const cards = Array.from(filterRoot.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            const query = normalize(searchInput ? searchInput.value : '');
            const region = regionSelect ? regionSelect.value : 'all';
            const type = typeSelect ? typeSelect.value : 'all';

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const regionOk = region === 'all' || card.dataset.region === region;
                const typeOk = type === 'all' || card.dataset.type === type;
                const queryOk = !query || haystack.includes(query);
                card.hidden = !(regionOk && typeOk && queryOk);
            });
        }

        [searchInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }

    const searchForm = document.querySelector('[data-search-form]');
    const searchInput = document.querySelector('[data-search-input]');
    const searchResults = document.querySelector('[data-search-results]');

    if (searchForm && searchInput && searchResults && Array.isArray(window.MOVIES)) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        searchInput.value = initial;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardTemplate(movie) {
            return `
                <article class="movie-card">
                    <a class="movie-cover" href="${movie.detail}" aria-label="${movie.title}">
                        <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
                        <span class="cover-glow"></span>
                        <span class="play-mark">▶</span>
                        <span class="badge badge-left">${movie.region}</span>
                        <span class="badge badge-right">${movie.year}</span>
                    </a>
                    <div class="movie-body">
                        <h2><a href="${movie.detail}">${movie.title}</a></h2>
                        <p>${movie.oneLine}</p>
                        <div class="movie-meta">
                            <span>${movie.type}</span>
                            <span>${movie.genre}</span>
                        </div>
                    </div>
                </article>`;
        }

        function render(query) {
            const q = normalize(query);
            const list = (q ? window.MOVIES.filter(function (movie) {
                const haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(' '));
                return haystack.includes(q);
            }) : window.MOVIES.slice(0, 60)).slice(0, 120);

            searchResults.innerHTML = list.length ? list.map(cardTemplate).join('') : '<p class="empty-state">没有找到相关影片</p>';
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            const target = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
            window.history.replaceState(null, '', target);
            render(query);
        });

        searchInput.addEventListener('input', function () {
            render(searchInput.value);
        });

        render(initial);
    }
}());
