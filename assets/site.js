(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    show(0);
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function matchCard(card) {
      var query = input ? textOf(input.value).trim() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].map(textOf).join(" ");

      if (query && haystack.indexOf(query) === -1) {
        return false;
      }

      if (year && card.getAttribute("data-year") !== year) {
        return false;
      }

      if (type && card.getAttribute("data-type") !== type) {
        return false;
      }

      return true;
    }

    function update() {
      var shown = 0;
      cards.forEach(function (card) {
        var visible = matchCard(card);
        card.classList.toggle("hidden-card", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  }

  window.setupMoviePlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }

    var box = video.closest(".player-box");
    var layer = box ? box.querySelector(".play-layer") : null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    function startPlayback() {
      if (layer) {
        layer.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("hidden");
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
