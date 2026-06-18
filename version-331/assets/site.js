(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing-image');
    });
  });

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterInput = document.querySelector('[data-filter-list]');
  var cardList = document.querySelector('[data-card-list]');

  if (filterInput && cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));

    filterInput.addEventListener('input', function () {
      var query = filterInput.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchable = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || searchable.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      var empty = cardList.querySelector('.empty-state');
      if (!visibleCount && !empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配的影片。';
        cardList.appendChild(empty);
      }
      if (empty) {
        empty.style.display = visibleCount ? 'none' : '';
      }
    });
  }

  function initializePlayer(shell) {
    var source = shell.getAttribute('data-video-src');
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-button');
    var message = shell.querySelector('[data-player-message]');

    if (!source || !video) {
      if (message) {
        message.textContent = '当前影片暂未绑定播放源。';
      }
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }
    if (message) {
      message.textContent = '正在加载播放源…';
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (message) {
          message.textContent = '播放源已加载。';
        }
        video.play().catch(function () {
          if (message) {
            message.textContent = '播放源已就绪，请点击播放器开始播放。';
          }
        });
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (message && data && data.fatal) {
          message.textContent = '播放源加载失败，请稍后重试。';
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        if (message) {
          message.textContent = '播放源已加载。';
        }
        video.play().catch(function () {
          if (message) {
            message.textContent = '播放源已就绪，请点击播放器开始播放。';
          }
        });
      }, { once: true });
    } else {
      video.src = source;
      if (message) {
        message.textContent = '浏览器未检测到 HLS 能力，已尝试直接加载播放源。';
      }
    }
  }

  document.querySelectorAll('[data-video-player]').forEach(function (shell) {
    var button = shell.querySelector('.play-button');
    if (button) {
      button.addEventListener('click', function () {
        initializePlayer(shell);
      });
    }
  });

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');

    if (input) {
      input.value = query;
    }

    function movieCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<a class="movie-card" href="videos/' + movie.id + '.html" data-card>',
        '  <figure class="poster-frame">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
        '    <figcaption>' + escapeHtml(movie.region) + '</figcaption>',
        '  </figure>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.categoryName) + '</span></div>',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    var normalizedQuery = query.toLowerCase();
    var results = window.MOVIES.filter(function (movie) {
      if (!normalizedQuery) {
        return true;
      }
      return movie.search.indexOf(normalizedQuery) !== -1;
    }).slice(0, 240);

    if (title) {
      title.textContent = query ? '“' + query + '”的搜索结果（' + results.length + '）' : '推荐影片';
    }

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到匹配的影片。</div>';
    } else {
      searchResults.innerHTML = results.map(movieCard).join('');
    }
  }
})();
