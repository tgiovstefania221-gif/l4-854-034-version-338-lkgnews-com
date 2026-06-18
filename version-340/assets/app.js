(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(position);
        start();
      });
    });
    start();
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initFiltering() {
    qsa('.filter-scope').forEach(function (scope) {
      var cards = qsa('.movie-card', scope);
      var search = qs('.content-search', scope);
      var empty = qs('[data-empty-state]', scope);
      var activeFilters = {};
      function matches(card) {
        var term = search ? search.value.trim().toLowerCase() : '';
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        if (term && text.indexOf(term) === -1) {
          return false;
        }
        return Object.keys(activeFilters).every(function (field) {
          var value = activeFilters[field];
          if (!value || value === 'all') {
            return true;
          }
          var target = (card.getAttribute('data-' + field) || '').toLowerCase();
          return target.indexOf(value.toLowerCase()) !== -1;
        });
      }
      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      if (search) {
        var query = getParam('q');
        if (query) {
          search.value = query;
        }
        search.addEventListener('input', apply);
      }
      qsa('.filter-button', scope).forEach(function (button) {
        button.addEventListener('click', function () {
          var field = button.getAttribute('data-filter-field');
          var value = button.getAttribute('data-filter-value');
          if (field === 'all') {
            activeFilters = {};
            qsa('.filter-button', scope).forEach(function (btn) {
              btn.classList.remove('is-active');
            });
            qsa('[data-filter-field="all"]', scope).forEach(function (btn) {
              btn.classList.add('is-active');
            });
          } else {
            delete activeFilters.all;
            activeFilters[field] = value;
            qsa('[data-filter-field="all"]', scope).forEach(function (btn) {
              btn.classList.remove('is-active');
            });
            qsa('[data-filter-field="' + field + '"]', scope).forEach(function (btn) {
              btn.classList.remove('is-active');
            });
            button.classList.add('is-active');
          }
          apply();
        });
      });
      apply();
    });
  }

  function initPlayers() {
    qsa('.video-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('.play-mask', shell);
      var item = video ? qs('source', video) : null;
      var stream = item ? item.getAttribute('src') : '';
      var ready = false;
      var hlsInstance = null;
      if (!video || !button || !stream) {
        return;
      }
      function attach() {
        if (ready) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        button.classList.add('is-hidden');
        var task = video.play();
        if (task && typeof task.catch === 'function') {
          task.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFiltering();
    initPlayers();
  });
})();
