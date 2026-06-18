(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');

  if (header && menuButton) {
    menuButton.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startHero();
    });
  });

  startHero();

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var input = document.querySelector('.js-filter-input');
  var yearSelect = document.querySelector('.js-year-filter');
  var clearButton = document.querySelector('.js-clear-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-card-grid [data-search]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(input ? input.value : '');
    var year = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var blob = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !query || blob.indexOf(query) !== -1;
      var matchYear = !year || cardYear === year;
      card.classList.toggle('is-filter-hidden', !(matchQuery && matchYear));
    });
  }

  if (input) {
    input.value = queryFromUrl;
    input.addEventListener('input', applyFilter);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (input) {
        input.value = '';
      }

      if (yearSelect) {
        yearSelect.value = '';
      }

      applyFilter();
    });
  }

  applyFilter();
})();
