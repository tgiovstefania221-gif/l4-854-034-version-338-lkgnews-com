
(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function bindMenu() {
    var toggle = one('[data-menu-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function bindFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var input = one('[data-search-input]', scope);
      var kind = one('[data-kind-filter]', scope);
      var year = one('[data-year-filter]', scope);
      var count = one('[data-result-count]', scope);
      var cards = all('[data-movie-card]', scope.parentNode);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var kindValue = kind ? kind.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardKind = card.getAttribute('data-kind') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (kindValue && cardKind !== kindValue) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }

          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (kind) {
        kind.addEventListener('change', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      apply();
    });
  }

  function bindHero() {
    var hero = one('[data-hero-rotator]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var thumbs = all('[data-hero-thumb]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === active);
      });
    }

    function next() {
      show(active + 1);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        show(index);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(next, 5600);
      });
    });

    if (slides.length > 1) {
      timer = window.setInterval(next, 5600);
    }
  }

  function playVideo(video, source, cover) {
    if (!video || !source) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    function startPlayback() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (video.getAttribute('data-ready') !== '1') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-ready', '1');
        startPlayback();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startPlayback();
        });
        video.hlsPlayer = hls;
        video.setAttribute('data-ready', '1');
        startPlayback();
      } else {
        video.src = source;
        video.setAttribute('data-ready', '1');
        startPlayback();
      }
    } else {
      startPlayback();
    }
  }

  window.MovieSitePlayer = {
    bind: function (videoId, coverId, buttonId, source) {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      var button = document.getElementById(buttonId);

      if (cover) {
        cover.addEventListener('click', function () {
          playVideo(video, source, cover);
        });
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          playVideo(video, source, cover);
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindFilters();
    bindHero();
  });
})();
