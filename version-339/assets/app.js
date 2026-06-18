(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const opened = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  const carousel = document.querySelector(".hero-carousel");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const prev = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const play = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.slide || 0));
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    play();
  }

  const filterForm = document.querySelector("[data-filter-form]");
  const filterInput = document.querySelector("[data-filter-input]");
  const cards = Array.from(document.querySelectorAll(".filter-grid .movie-card"));
  const emptyState = document.querySelector("[data-empty-state]");

  if (filterForm && filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    const normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    const applyFilter = function () {
      const query = normalize(filterInput.value);
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute("data-search"));
        const matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("visible", visible === 0);
      }
    };

    filterInput.addEventListener("input", applyFilter);
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }
})();

window.initMoviePlayer = function (videoId, buttonId, wrapperId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const wrapper = document.getElementById(wrapperId);

  if (!video || !button || !wrapper || !streamUrl) {
    return;
  }

  let ready = false;
  let hls = null;

  const attach = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  };

  const start = function () {
    attach();
    wrapper.classList.add("playing");
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        wrapper.classList.remove("playing");
      });
    }
  };

  button.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (!ready || video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    wrapper.classList.add("playing");
  });

  video.addEventListener("ended", function () {
    wrapper.classList.remove("playing");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
};
